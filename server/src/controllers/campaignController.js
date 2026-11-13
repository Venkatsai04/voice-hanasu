import { Campaign } from '../models/Campaign.js';
import { Agent } from '../models/Agent.js';
import { Lead } from '../models/Lead.js';
import { Call } from '../models/Call.js';
import { launchCampaignLeads } from '../queues/campaignQueue.js';
import { getVoiceProvider } from '../providers/providerFactory.js';
import { emitToCampaign, emitToOrg } from '../config/socket.js';

export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ organizationId: req.orgId })
      .populate('agentId', 'name role languages')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
};

export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, organizationId: req.orgId })
      .populate('agentId', 'name role languages voiceSettings personality');

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    // Fetch associated leads count & sample
    const leads = await Lead.find({ campaignId: campaign._id }).limit(50).sort({ updatedAt: -1 });
    const recentCalls = await Call.find({ campaignId: campaign._id }).limit(20).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: {
        campaign,
        leads,
        recentCalls
      }
    });
  } catch (err) {
    next(err);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const {
      name,
      description,
      agentId,
      leadIds = [],
      schedule,
      retryConfig,
      concurrency = 3
    } = req.body;

    if (!name || !agentId) {
      return res.status(400).json({ success: false, message: 'Campaign name and AI Employee are required.' });
    }

    const agent = await Agent.findOne({ _id: agentId, organizationId: req.orgId });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Selected AI Employee not found.' });
    }

    const totalLeads = leadIds.length;

    const campaign = await Campaign.create({
      organizationId: req.orgId,
      agentId,
      name: name.trim(),
      description: description || '',
      status: 'draft',
      schedule: schedule || {},
      retryConfig: retryConfig || {},
      concurrency: Math.min(Math.max(1, concurrency), 10),
      leadCounts: {
        total: totalLeads,
        pending: totalLeads,
        active: 0,
        completed: 0
      },
      metrics: {
        total: totalLeads,
        completed: 0,
        active: 0,
        connected: 0,
        qualified: 0,
        interested: 0,
        callbacks: 0,
        notInterested: 0,
        noAnswer: 0,
        busy: 0,
        failed: 0
      }
    });

    // Associate leads with this campaign
    if (leadIds.length > 0) {
      await Lead.updateMany(
        { _id: { $in: leadIds }, organizationId: req.orgId },
        { $set: { campaignId: campaign._id, status: 'pending' } }
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (err) {
    next(err);
  }
};

export const launchCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const agent = await Agent.findById(campaign.agentId);
    if (!agent) {
      return res.status(400).json({ success: false, message: 'Assigned AI Employee not found.' });
    }

    // Find pending leads for this campaign
    const leads = await Lead.find({
      campaignId: campaign._id,
      status: { $in: ['pending', 'retrying'] }
    });

    if (leads.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending leads found in this campaign. Please upload or attach leads.'
      });
    }

    campaign.status = 'running';
    campaign.startedAt = campaign.startedAt || new Date();
    campaign.leadCounts.total = leads.length;
    campaign.leadCounts.pending = leads.length;
    await campaign.save();

    // Notify provider
    const provider = getVoiceProvider(req.org);
    await provider.startCampaign({ campaign, agent, leads });

    // Enqueue leads into background queue
    await launchCampaignLeads(campaign, agent, leads);

    emitToCampaign(campaign._id.toString(), 'campaign:status_change', {
      campaignId: campaign._id,
      status: 'running'
    });

    emitToOrg(req.orgId.toString(), 'dashboard:activity', {
      type: 'CAMPAIGN_LAUNCHED',
      campaignName: campaign.name,
      agentName: agent.name,
      totalLeads: leads.length,
      timestamp: new Date()
    });

    return res.json({
      success: true,
      message: `Campaign launched successfully with ${leads.length} leads.`,
      data: campaign
    });
  } catch (err) {
    next(err);
  }
};

export const pauseCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    campaign.status = 'paused';
    await campaign.save();

    const provider = getVoiceProvider(req.org);
    await provider.pauseCampaign(campaign._id.toString());

    emitToCampaign(campaign._id.toString(), 'campaign:status_change', {
      campaignId: campaign._id,
      status: 'paused'
    });

    return res.json({ success: true, message: 'Campaign paused.', data: campaign });
  } catch (err) {
    next(err);
  }
};

export const resumeCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    const agent = await Agent.findById(campaign.agentId);
    const leads = await Lead.find({
      campaignId: campaign._id,
      status: { $in: ['pending', 'retrying'] }
    });

    campaign.status = 'running';
    await campaign.save();

    const provider = getVoiceProvider(req.org);
    await provider.resumeCampaign(campaign._id.toString());

    if (leads.length > 0) {
      await launchCampaignLeads(campaign, agent, leads);
    }

    emitToCampaign(campaign._id.toString(), 'campaign:status_change', {
      campaignId: campaign._id,
      status: 'running'
    });

    return res.json({ success: true, message: 'Campaign resumed.', data: campaign });
  } catch (err) {
    next(err);
  }
};

export const stopCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' });
    }

    campaign.status = 'stopped';
    campaign.completedAt = new Date();
    await campaign.save();

    const provider = getVoiceProvider(req.org);
    await provider.stopCampaign(campaign._id.toString());

    emitToCampaign(campaign._id.toString(), 'campaign:status_change', {
      campaignId: campaign._id,
      status: 'stopped'
    });

    return res.json({ success: true, message: 'Campaign stopped.', data: campaign });
  } catch (err) {
    next(err);
  }
};
