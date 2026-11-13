import { VoiceProvider } from './VoiceProvider.js';
import { v4 as uuidv4 } from 'uuid';
import { Call } from '../models/Call.js';
import { Lead } from '../models/Lead.js';
import { Campaign } from '../models/Campaign.js';
import { Agent } from '../models/Agent.js';
import { emitToOrg, emitToCampaign } from '../config/socket.js';

export class MockVoiceProvider extends VoiceProvider {
  constructor() {
    super('MockVoiceProvider');
    this.activeSimulations = new Map();
  }

  async createAgent(agent) {
    const providerAgentId = `mock_agent_${agent._id || uuidv4().slice(0, 8)}`;
    return {
      providerAgentId,
      status: 'active',
      raw: { provider: 'mock', created: true }
    };
  }

  async updateAgent(providerAgentId, agent) {
    return {
      success: true,
      providerAgentId,
      raw: { provider: 'mock', updated: true }
    };
  }

  async deleteAgent(providerAgentId) {
    return { success: true };
  }

  async startCampaign({ campaign, agent, leads }) {
    const providerCampaignId = `mock_camp_${campaign._id}`;
    return {
      providerCampaignId,
      status: 'running'
    };
  }

  async pauseCampaign(providerCampaignId) {
    return { success: true };
  }

  async resumeCampaign(providerCampaignId) {
    return { success: true };
  }

  async stopCampaign(providerCampaignId) {
    return { success: true };
  }

  async getCallDetails(providerCallId) {
    const call = await Call.findOne({ providerCallId });
    if (!call) return null;
    return {
      status: call.status,
      outcome: call.outcome,
      duration: call.duration,
      transcript: call.transcript,
      summary: call.summary,
      qualificationData: call.qualificationData,
      recordingUrl: call.recordingUrl
    };
  }

  normalizeWebhookEvent(rawPayload) {
    return {
      eventType: rawPayload.event || 'CALL_UPDATE',
      providerCallId: rawPayload.callId,
      status: rawPayload.status,
      outcome: rawPayload.outcome,
      duration: rawPayload.duration || 0,
      timestamp: new Date()
    };
  }

  /**
   * Run realistic simulated call lifecycle with streaming dialog turns
   */
  async initiateCall({ callId, agent, lead, orgId, campaignId, isTest = false }) {
    const providerCallId = `mock_call_${uuidv4()}`;

    // Update initial call record
    await Call.findByIdAndUpdate(callId, {
      providerCallId,
      status: 'initiated',
      startedAt: new Date()
    });

    // Asynchronous lifecycle simulation
    this._runCallSimulation({ callId, providerCallId, agent, lead, orgId, campaignId, isTest });

    return {
      providerCallId,
      status: 'initiated'
    };
  }

  async _runCallSimulation({ callId, providerCallId, agent, lead, orgId, campaignId, isTest }) {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // Step 1: Initiated -> Ringing (1.2s)
      await sleep(1200);
      let call = await Call.findByIdAndUpdate(callId, {
        status: 'ringing'
      }, { new: true });

      this._broadcastCallEvent(orgId, campaignId, 'call:ringing', {
        callId,
        providerCallId,
        status: 'ringing',
        leadName: lead?.name || 'Prospect',
        leadPhone: lead?.phone || call.targetPhone
      });

      // Simulation random outcome branch
      // 10% chance of No Answer, 5% Busy (unless it's a test call which always connects)
      const randomSeed = Math.random();
      if (!isTest && randomSeed < 0.08) {
        await sleep(2000);
        await this._finalizeCall(callId, orgId, campaignId, lead?._id, {
          status: 'no_answer',
          outcome: 'no_answer',
          duration: 14,
          summary: 'Call rang for 14 seconds with no answer. Voicemail detection hung up.',
          qualificationScore: 0,
          reasons: ['No answer from prospect after repeated rings'],
          transcript: [
            { speaker: 'system', text: 'Call initiated to ' + call.targetPhone, timestamp: 0 },
            { speaker: 'system', text: 'Ringing... Ringing...', timestamp: 3 },
            { speaker: 'system', text: 'Call timed out with no response.', timestamp: 14 }
          ]
        });
        return;
      }

      if (!isTest && randomSeed >= 0.08 && randomSeed < 0.14) {
        await sleep(1500);
        await this._finalizeCall(callId, orgId, campaignId, lead?._id, {
          status: 'busy',
          outcome: 'busy',
          duration: 6,
          summary: 'Line was busy or rejected by user.',
          qualificationScore: 0,
          reasons: ['Line returned user busy signal'],
          transcript: [
            { speaker: 'system', text: 'Dialing target line...', timestamp: 0 },
            { speaker: 'system', text: 'Received Busy / Call Rejected tone.', timestamp: 6 }
          ]
        });
        return;
      }

      // Step 2: Connected! (1.5s later)
      await sleep(1500);
      const connectedAt = new Date();
      call = await Call.findByIdAndUpdate(callId, {
        status: 'connected',
        connectedAt
      }, { new: true });

      this._broadcastCallEvent(orgId, campaignId, 'call:connected', {
        callId,
        providerCallId,
        status: 'connected',
        leadName: lead?.name || 'Prospect',
        connectedAt
      });

      // Step 3: In Progress & Dialog Streaming
      await sleep(1000);
      await Call.findByIdAndUpdate(callId, { status: 'in_progress' });
      this._broadcastCallEvent(orgId, campaignId, 'call:in_progress', {
        callId,
        providerCallId,
        status: 'in_progress'
      });

      // Generate rich contextual dialog based on role & languages
      const dialogScenario = this._generateDialogScenario(agent, lead);

      const transcript = [];
      let currentTimestamp = 0;

      for (const turn of dialogScenario.turns) {
        await sleep(isTest ? 1800 : 1200); // Live cadence
        currentTimestamp += turn.duration;

        const transcriptTurn = {
          speaker: turn.speaker,
          text: turn.text,
          timestamp: currentTimestamp,
          language: turn.language || 'en'
        };
        transcript.push(transcriptTurn);

        // Stream transcript line live to frontend
        this._broadcastCallEvent(orgId, campaignId, 'call:transcript_turn', {
          callId,
          turn: transcriptTurn
        });
      }

      // Step 4: Finalize call with rich AI analysis & score
      await sleep(1000);
      await this._finalizeCall(callId, orgId, campaignId, lead?._id, {
        status: 'completed',
        outcome: dialogScenario.outcome,
        duration: currentTimestamp,
        summary: dialogScenario.summary,
        qualificationScore: dialogScenario.score,
        reasons: dialogScenario.reasons,
        extractedFields: dialogScenario.extractedFields,
        nextAction: dialogScenario.nextAction,
        sentiment: dialogScenario.sentiment,
        recordingUrl: 'https://cdn.rawsaharavoice.internal/recordings/' + providerCallId + '.wav',
        transcript
      });

    } catch (err) {
      console.error(`[MockVoiceProvider] Error in simulation for call ${callId}:`, err);
      await Call.findByIdAndUpdate(callId, {
        status: 'failed',
        outcome: 'failed',
        summary: 'Call simulation terminated unexpectedly: ' + err.message
      });
    }
  }

  async _finalizeCall(callId, orgId, campaignId, leadId, finalData) {
    const endedAt = new Date();

    const updatedCall = await Call.findByIdAndUpdate(callId, {
      status: finalData.status,
      outcome: finalData.outcome,
      duration: finalData.duration,
      summary: finalData.summary,
      qualificationData: {
        score: finalData.qualificationScore,
        reasons: finalData.reasons,
        extractedFields: finalData.extractedFields || {}
      },
      nextAction: finalData.nextAction || '',
      sentiment: finalData.sentiment || 'neutral',
      recordingUrl: finalData.recordingUrl || '',
      transcript: finalData.transcript || [],
      endedAt
    }, { new: true });

    // Update Lead if associated
    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, {
        status: 'completed',
        outcome: finalData.outcome,
        qualificationScore: finalData.qualificationScore,
        summary: finalData.summary,
        nextAction: finalData.nextAction,
        lastCallAt: endedAt,
        $inc: { callAttempts: 1 }
      });
    }

    // Update Campaign metrics
    if (campaignId) {
      const incField = {};
      incField['metrics.completed'] = 1;
      incField['leadCounts.completed'] = 1;
      incField['leadCounts.active'] = -1;

      if (['connected', 'in_progress', 'completed'].includes(finalData.status)) {
        incField['metrics.connected'] = 1;
      }
      if (finalData.outcome === 'qualified') incField['metrics.qualified'] = 1;
      if (finalData.outcome === 'interested') incField['metrics.interested'] = 1;
      if (finalData.outcome === 'callback') incField['metrics.callbacks'] = 1;
      if (finalData.outcome === 'not_interested') incField['metrics.notInterested'] = 1;
      if (finalData.outcome === 'no_answer') incField['metrics.noAnswer'] = 1;
      if (finalData.outcome === 'busy') incField['metrics.busy'] = 1;
      if (finalData.outcome === 'failed') incField['metrics.failed'] = 1;

      const campaign = await Campaign.findByIdAndUpdate(campaignId, {
        $inc: incField
      }, { new: true });

      // Check if all leads are completed
      if (campaign && campaign.leadCounts.completed >= campaign.leadCounts.total && campaign.status === 'running') {
        campaign.status = 'completed';
        campaign.completedAt = new Date();
        await campaign.save();
        this._broadcastCallEvent(orgId, campaignId, 'campaign:completed', { campaignId });
      }

      this._broadcastCallEvent(orgId, campaignId, 'campaign:metrics_updated', {
        campaignId,
        metrics: campaign?.metrics,
        leadCounts: campaign?.leadCounts,
        status: campaign?.status
      });
    }

    // Broadcast final completed event
    this._broadcastCallEvent(orgId, campaignId, 'call:completed', {
      call: updatedCall,
      callId,
      outcome: finalData.outcome,
      score: finalData.qualificationScore,
      summary: finalData.summary
    });

    // Update Agent aggregate stats
    if (updatedCall.agentId) {
      const incAgent = { 'stats.totalCalls': 1 };
      if (finalData.outcome === 'qualified') incAgent['stats.qualifiedLeads'] = 1;
      if (finalData.outcome === 'interested') incAgent['stats.interestedLeads'] = 1;
      if (['connected', 'completed'].includes(finalData.status)) incAgent['stats.connectedCalls'] = 1;
      await Agent.findByIdAndUpdate(updatedCall.agentId, { $inc: incAgent });
    }
  }

  _broadcastCallEvent(orgId, campaignId, event, payload) {
    if (orgId) emitToOrg(orgId, event, payload);
    if (campaignId) emitToCampaign(campaignId, event, payload);
  }

  _generateDialogScenario(agent, lead) {
    const leadName = lead?.name || 'Sir';
    const city = lead?.customData?.get ? (lead.customData.get('city') || lead.customData.get('location') || 'Hyderabad') : (lead?.customData?.city || lead?.customData?.location || 'Hyderabad');
    const budget = lead?.customData?.get ? (lead.customData.get('budget') || '₹1.5 Crores') : (lead?.customData?.budget || '₹1.5 Crores');
    const propertyType = lead?.customData?.get ? (lead.customData.get('propertyType') || '3BHK Luxury Apartment') : (lead?.customData?.propertyType || '3BHK Luxury Apartment');

    const agentName = agent?.name || 'Priya';
    const hasTelugu = agent?.languages?.includes('Telugu');
    const hasHindi = agent?.languages?.includes('Hindi');

    const roll = Math.random();

    // Scenario A: High-Intent Qualified Lead with Telugu / English code-switching
    if (hasTelugu && roll > 0.4) {
      return {
        outcome: 'qualified',
        score: 92,
        sentiment: 'positive',
        reasons: [
          'Budget matched target range (> 1.2 Cr)',
          'Clear purchase timeline within 60 days',
          'Confirmed interest in Financial District project',
          'Agreed to site visit this Saturday'
        ],
        extractedFields: {
          budget: budget,
          location: city,
          propertyType: propertyType,
          timeline: 'Immediate / 60 days',
          preferredDay: 'Saturday 11:30 AM'
        },
        nextAction: 'Schedule on-site VIP walkthrough with Lead Sales Director for Saturday',
        summary: `Spoke with ${leadName}. Customer confirmed their online enquiry regarding ${propertyType} in ${city}. They are actively searching for ready-to-move or nearing-possession options with a budget around ${budget}. Customer spoke in mixed Telugu-English and was very receptive. Site visit scheduled for this weekend.`,
        turns: [
          { speaker: 'agent', text: `Namaskaram ${leadName}! I am ${agentName} calling from Sahara Group regarding your inquiry for ${propertyType} in ${city}. Ela unnaru? Is now a convenient time to speak?`, duration: 4, language: 'te' },
          { speaker: 'user', text: `Ha cheppandi ${agentName} garu. Yes, I was checking flats online yesterday. I have 2 minutes.`, duration: 3, language: 'te' },
          { speaker: 'agent', text: `Great! Mee preferred configuration ${propertyType} gurinchi chustunnara, and budget range roughly entha plan chestunnaru?`, duration: 4, language: 'te' },
          { speaker: 'user', text: `Yes, we are looking for a 3BHK around ${budget}. Financial District or Gachibowli side aithe preferred.`, duration: 4, language: 'en' },
          { speaker: 'agent', text: `Perfect match andi! Our flagship gated community is right next to Financial District, with premium clubhouse amenities. Purchase timeline eppativaraku anukuntunnaru?`, duration: 4, language: 'te' },
          { speaker: 'user', text: `Within 2 to 3 months we want to register. Bank loan already pre-approved.`, duration: 3, language: 'en' },
          { speaker: 'agent', text: `Chala manchidi! Can I arrange a private site visit for you and your family this Saturday at 11:30 AM? Our project director will personally host you.`, duration: 4, language: 'te' },
          { speaker: 'user', text: `Saturday 11:30 AM works well for us. Please WhatsApp me the location pin and brochure.`, duration: 3, language: 'en' },
          { speaker: 'agent', text: `Dhanyavadalu ${leadName}! I am sending the details immediately on WhatsApp. Have a wonderful day ahead!`, duration: 3, language: 'te' }
        ]
      };
    }

    // Scenario B: Hindi / English Consultative Inquiry
    if (hasHindi && roll > 0.4) {
      return {
        outcome: 'qualified',
        score: 87,
        sentiment: 'positive',
        reasons: [
          'Strong commercial intent',
          'Budget flexibility confirmed',
          'Requested technical brochure and pricing sheet'
        ],
        extractedFields: {
          budget: budget,
          location: city,
          timeline: 'Next quarter'
        },
        nextAction: 'Send pricing breakdown & WhatsApp follow-up link',
        summary: `Spoke with ${leadName}. Client expressed strong interest in our offerings in ${city}. They confirmed their budget around ${budget} and requested the detailed commercial terms.`,
        turns: [
          { speaker: 'agent', text: `Namaste ${leadName} ji, main ${agentName} Sahara Group se baat kar rahi hoon. Aapne hamare project ke baare mein enquire kiya tha. Kya 2 minute baat ho sakti hai?`, duration: 4, language: 'hi' },
          { speaker: 'user', text: `Haan boliye, main sun raha hoon. Kya pricing structure hai aapka?`, duration: 3, language: 'hi' },
          { speaker: 'agent', text: `Sir, hamare paas ${propertyType} options available hain, starting from ${budget}. Location connectivity top-tier hai.`, duration: 4, language: 'hi' },
          { speaker: 'user', text: `Sounds promising. Mujhe project layout aur payment plan WhatsApp par bhej dijiye.`, duration: 3, language: 'hi' },
          { speaker: 'agent', text: `Zaroor sir, main turant aapko catalog aur payment plans forward kar rahi hoon. Thank you!`, duration: 3, language: 'hi' }
        ]
      };
    }

    // Scenario C: Callback Request
    if (roll > 0.2) {
      return {
        outcome: 'callback',
        score: 65,
        sentiment: 'neutral',
        reasons: ['Lead was driving or in a meeting', 'Requested callback in evening around 6 PM'],
        extractedFields: {
          preferredCallbackTime: 'Today at 6:00 PM'
        },
        nextAction: 'Automated retry queued for 6:00 PM today',
        summary: `Call connected with ${leadName}. Customer stated they are currently in a business meeting and requested a callback today evening at 6:00 PM.`,
        turns: [
          { speaker: 'agent', text: `Hello ${leadName}, this is ${agentName} calling from Sahara regarding your enquiry. Do you have a quick moment?`, duration: 3, language: 'en' },
          { speaker: 'user', text: `Hi, I am actually driving right now. Can someone call me back around 6:00 PM in the evening?`, duration: 3, language: 'en' },
          { speaker: 'agent', text: `Of course! I will set a reminder for 6:00 PM today. Thank you and drive safely!`, duration: 3, language: 'en' }
        ]
      };
    }

    // Scenario D: Not Interested
    return {
      outcome: 'not_interested',
      score: 22,
      sentiment: 'hesitant',
      reasons: ['Already purchased another property last month', 'Do not contact requested'],
      extractedFields: {
        reason: 'Already purchased alternate solution'
      },
      nextAction: 'Mark lead as not interested. No further calls.',
      summary: `Customer informed that they have already finalized another property recently and are no longer actively looking. Lead marked as not interested.`,
      turns: [
        { speaker: 'agent', text: `Hello ${leadName}, this is ${agentName} from Sahara regarding your recent inquiry.`, duration: 3, language: 'en' },
        { speaker: 'user', text: `Actually, we already booked an apartment last week, so we don't need any more calls. Thank you.`, duration: 3, language: 'en' },
        { speaker: 'agent', text: `Congratulations on your new home! I have updated our records so you won't be disturbed further. Wishing you all the best!`, duration: 3, language: 'en' }
      ]
    };
  }
}
