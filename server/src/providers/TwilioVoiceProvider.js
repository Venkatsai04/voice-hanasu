import { VoiceProvider } from './VoiceProvider.js';
import twilio from 'twilio';
import { Call } from '../models/Call.js';
import { emitToOrg, emitToCampaign } from '../config/socket.js';

export class TwilioVoiceProvider extends VoiceProvider {
  constructor(accountSid, authToken, fromNumber) {
    super('TwilioVoiceProvider');
    this.accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID;
    this.authToken = authToken || process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = fromNumber || process.env.TWILIO_PHONE_NUMBER;

    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    }
  }

  async createAgent(agent) {
    return { providerAgentId: `twilio_agent_${agent._id}`, status: 'active' };
  }

  async updateAgent(providerAgentId) {
    return { success: true, providerAgentId };
  }

  async deleteAgent() {
    return { success: true };
  }

  async startCampaign() {
    return { success: true };
  }

  async pauseCampaign() {
    return { success: true };
  }

  async resumeCampaign() {
    return { success: true };
  }

  async stopCampaign() {
    return { success: true };
  }

  async getCallDetails(providerCallId) {
    return Call.findOne({ providerCallId });
  }

  /**
   * Real Telephony: Makes your physical cell phone ring!
   */
  async initiateCall({ callId, agent, lead, orgId, campaignId }) {
    if (!this.client || !this.fromNumber) {
      throw new Error(
        'Twilio telephony credentials missing. Please provide TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to place real calls to cell phones.'
      );
    }

    const targetPhone = lead.phone.startsWith('+') ? lead.phone : `+91${lead.phone.replace(/[^0-9]/g, '')}`;
    const leadName = lead.name || 'Prospect';
    const agentName = agent.name || 'Priya';

    console.log(`[TwilioVoiceProvider] Placing REAL phone call to ${targetPhone} from ${this.fromNumber}...`);

    // In English, professional consultative pitch
    const englishSpeech = `Hello ${leadName}. I am ${agentName} calling from Sahara Living regarding your inquiry for our luxury residential project in Hyderabad. We noticed you are looking for a three B H K apartment with a budget around one point eight crores. Are you planning to finalize within the next sixty days? Please let us know if we can schedule an exclusive site visit for you this Saturday. Thank you!`;

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'Polly.Aditi',
      language: 'en-IN'
    }, englishSpeech);

    try {
      const twilioCall = await this.client.calls.create({
        twiml: twiml.toString(),
        to: targetPhone,
        from: this.fromNumber,
        statusCallback: `${process.env.API_URL || 'http://localhost:5000'}/api/webhooks/twilio`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
      });

      console.log(`[TwilioVoiceProvider] Real Call dispatched! SID: ${twilioCall.sid}, Status: ${twilioCall.status}`);

      await Call.findByIdAndUpdate(callId, {
        providerCallId: twilioCall.sid,
        provider: 'twilio',
        status: 'initiated',
        startedAt: new Date()
      });

      this._broadcast(orgId, campaignId, 'call:ringing', {
        callId,
        providerCallId: twilioCall.sid,
        status: 'ringing',
        leadName,
        leadPhone: targetPhone
      });

      return {
        providerCallId: twilioCall.sid,
        status: twilioCall.status,
        raw: twilioCall
      };
    } catch (err) {
      console.error('[TwilioVoiceProvider] Real call failed:', err);
      await Call.findByIdAndUpdate(callId, {
        status: 'failed',
        outcome: 'failed',
        summary: `Carrier error: ${err.message}`
      });
      throw err;
    }
  }

  _broadcast(orgId, campaignId, event, payload) {
    if (orgId) emitToOrg(orgId, event, payload);
    if (campaignId) emitToCampaign(campaignId, event, payload);
  }
}
