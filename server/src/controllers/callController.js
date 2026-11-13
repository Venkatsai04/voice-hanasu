import { Call } from '../models/Call.js';
import { Lead } from '../models/Lead.js';
import { Agent } from '../models/Agent.js';
import { getVoiceProvider } from '../providers/providerFactory.js';

export const getCalls = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 25,
      campaignId,
      agentId,
      outcome,
      status,
      search
    } = req.query;

    const query = { organizationId: req.orgId };

    if (campaignId && campaignId !== 'undefined') query.campaignId = campaignId;
    if (agentId && agentId !== 'undefined') query.agentId = agentId;
    if (outcome && outcome !== 'all' && outcome !== 'undefined') query.outcome = outcome;
    if (status && status !== 'all' && status !== 'undefined') query.status = status;
    if (search && search !== 'undefined') {
      query.$or = [
        { targetPhone: { $regex: search, $options: 'i' } },
        { targetName: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [calls, total] = await Promise.all([
      Call.find(query)
        .populate('agentId', 'name role languages')
        .populate('campaignId', 'name')
        .populate('leadId', 'name phone customData')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Call.countDocuments(query)
    ]);

    return res.json({
      success: true,
      data: calls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getCallById = async (req, res, next) => {
  try {
    const call = await Call.findOne({ _id: req.params.id, organizationId: req.orgId })
      .populate('agentId', 'name role languages voiceSettings personality')
      .populate('campaignId', 'name')
      .populate('leadId');

    if (!call) {
      return res.status(404).json({ success: false, message: 'Call not found.' });
    }

    return res.json({ success: true, data: call });
  } catch (err) {
    next(err);
  }
};

export const dialCall = async (req, res, next) => {
  try {
    const { phoneNumber, targetName = 'Prospect', task = '', agentId } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    let agent = null;
    if (agentId) {
      agent = await Agent.findOne({ _id: agentId, organizationId: req.orgId });
    }
    if (!agent) {
      agent = await Agent.findOne({ organizationId: req.orgId, status: 'active' }) || await Agent.findOne({ organizationId: req.orgId });
    }
    if (!agent) {
      return res.status(404).json({ success: false, message: 'No active Voice Agent found to place the call.' });
    }

    const missionTask = task || agent.objective || 'Connect with customer and qualify requirements';

    const call = await Call.create({
      organizationId: req.orgId,
      agentId: agent._id,
      isTestCall: true,
      targetPhone: phoneNumber,
      targetName,
      task: missionTask,
      status: 'queued',
      provider: req.org?.voiceProvider || 'sarvam'
    });

    const provider = getVoiceProvider(req.org || { voiceProvider: 'sarvam' });
    const leadData = {
      name: targetName,
      phone: phoneNumber,
      task: missionTask
    };

    const callResult = await provider.initiateCall({
      callId: call._id.toString(),
      agent,
      lead: leadData,
      task: missionTask,
      orgId: req.orgId.toString(),
      isTest: true
    });

    return res.json({
      success: true,
      message: 'Call initiated successfully on live trunk',
      data: {
        callId: call._id,
        providerCallId: callResult.providerCallId,
        status: 'initiated',
        targetPhone: phoneNumber,
        task: missionTask
      }
    });
  } catch (err) {
    next(err);
  }
};

export const redialCall = async (req, res, next) => {
  try {
    const originalCall = await Call.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!originalCall) {
      return res.status(404).json({ success: false, message: 'Original call not found.' });
    }

    const agent = await Agent.findById(originalCall.agentId);
    let lead = null;
    if (originalCall.leadId) {
      lead = await Lead.findById(originalCall.leadId);
    }

    const missionTask = req.body.task || originalCall.task || agent?.objective || '';

    const newCall = await Call.create({
      organizationId: req.orgId,
      campaignId: originalCall.campaignId,
      agentId: originalCall.agentId,
      leadId: originalCall.leadId,
      targetPhone: originalCall.targetPhone,
      targetName: originalCall.targetName,
      task: missionTask,
      status: 'queued',
      provider: req.org?.voiceProvider || 'sarvam'
    });

    const provider = getVoiceProvider(req.org);
    await provider.initiateCall({
      callId: newCall._id.toString(),
      agent,
      lead: lead || { name: originalCall.targetName, phone: originalCall.targetPhone },
      task: missionTask,
      orgId: req.orgId.toString(),
      campaignId: originalCall.campaignId?.toString()
    });

    return res.json({
      success: true,
      message: 'Redial initiated successfully',
      data: newCall
    });
  } catch (err) {
    next(err);
  }
};
