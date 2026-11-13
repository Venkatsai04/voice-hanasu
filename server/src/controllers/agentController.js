import { Agent } from '../models/Agent.js';
import { AgentVersion } from '../models/AgentVersion.js';
import { Call } from '../models/Call.js';
import { getVoiceProvider } from '../providers/providerFactory.js';
import { generateAgentConfigFromPrompt } from '../services/agentBuilderService.js';
import { handleVoiceConversation } from '../services/conversationService.js';


export const getAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find({ organizationId: req.orgId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: agents });
  } catch (err) {
    next(err);
  }
};

export const getAgentById = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'AI Employee not found.' });
    }
    return res.json({ success: true, data: agent });
  } catch (err) {
    next(err);
  }
};

export const generateConfigFromPrompt = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || prompt.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a descriptive plain-language prompt for the AI employee.'
    });
  }

  const generatedConfig = generateAgentConfigFromPrompt(prompt);
  return res.json({
    success: true,
    data: generatedConfig
  });
};

export const createAgent = async (req, res, next) => {
  try {
    const agentData = {
      ...req.body,
      organizationId: req.orgId
    };

    const agent = new Agent(agentData);

    // Synchronize with voice provider
    const provider = getVoiceProvider(req.org);
    const providerResult = await provider.createAgent(agent);

    agent.providerInformation = {
      provider: provider.name === 'SarvamVoiceProvider' ? 'sarvam' : 'mock',
      providerAgentId: providerResult.providerAgentId,
      syncedAt: new Date()
    };

    await agent.save();

    // Create initial version snapshot
    await AgentVersion.create({
      agentId: agent._id,
      versionNumber: 1,
      snapshot: agent.toObject(),
      changeSummary: 'Initial hire creation',
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: 'AI Employee hired and configured successfully',
      data: agent
    });
  } catch (err) {
    next(err);
  }
};

export const updateAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'AI Employee not found.' });
    }

    const previousSnapshot = agent.toObject();
    Object.assign(agent, req.body);
    agent.version = (agent.version || 1) + 1;

    // Sync updates with provider
    const provider = getVoiceProvider(req.org);
    if (agent.providerInformation?.providerAgentId) {
      await provider.updateAgent(agent.providerInformation.providerAgentId, agent);
    }

    await agent.save();

    // Audit version
    await AgentVersion.create({
      agentId: agent._id,
      versionNumber: agent.version,
      snapshot: previousSnapshot,
      changeSummary: req.body.changeSummary || 'Updated instructions and settings',
      createdBy: req.user._id
    });

    return res.json({
      success: true,
      message: 'AI Employee updated successfully',
      data: agent
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAgent = async (req, res, next) => {
  try {
    const agent = await Agent.findOneAndDelete({ _id: req.params.id, organizationId: req.orgId });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'AI Employee not found.' });
    }

    const provider = getVoiceProvider(req.org);
    if (agent.providerInformation?.providerAgentId) {
      await provider.deleteAgent(agent.providerInformation.providerAgentId);
    }

    return res.json({ success: true, message: 'AI Employee deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Launch an immediate Test Call for this AI Employee
 */
export const testCall = async (req, res, next) => {
  try {
    const { phoneNumber, targetName = 'Tester', task = '' } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required for call.' });
    }

    const agent = await Agent.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Voice Agent not found.' });
    }

    const requestedProvider = req.body.provider || req.org?.voiceProvider || 'sarvam';
    const missionTask = task || agent.objective || 'Follow up on property inquiry and qualify buyer';

    // Create call record
    const call = await Call.create({
      organizationId: req.orgId,
      agentId: agent._id,
      isTestCall: true,
      targetPhone: phoneNumber,
      targetName,
      task: missionTask,
      status: 'queued',
      provider: requestedProvider
    });

    // Invoke provider with real telephony trunk
    const provider = getVoiceProvider({ voiceProvider: requestedProvider });
    const mockLead = {
      name: targetName,
      phone: phoneNumber,
      task: missionTask,
      customData: {
        budget: '₹1.8 Crores',
        city: 'Hyderabad',
        propertyType: '3BHK Luxury Flat'
      }
    };

    const callResult = await provider.initiateCall({
      callId: call._id.toString(),
      agent,
      lead: mockLead,
      task: missionTask,
      orgId: req.orgId.toString(),
      isTest: true
    });

    return res.json({
      success: true,
      message: 'Test call initiated successfully',
      data: {
        callId: call._id,
        providerCallId: callResult.providerCallId,
        status: 'initiated'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Real-Time Two-Way Live Conversational Voice endpoint
 * Receives user's spoken words, invokes persona intelligence, and synthesizes Cartesia Sonic 3.5 audio
 */
export const converse = async (req, res, next) => {
  try {
    const { userMessage, history = [] } = req.body;
    const agent = await Agent.findOne({ _id: req.params.id, organizationId: req.orgId });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'AI Employee not found.' });
    }

    const conversationResult = await handleVoiceConversation({
      agent,
      userMessage,
      history
    });

    return res.json({
      success: true,
      data: conversationResult
    });
  } catch (err) {
    console.error('[agentController] Converse error:', err);
    next(err);
  }
};

