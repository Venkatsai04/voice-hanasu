import { VoiceProvider } from './VoiceProvider.js';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Call } from '../models/Call.js';
import { Lead } from '../models/Lead.js';
import { Campaign } from '../models/Campaign.js';
import { Agent } from '../models/Agent.js';
import { emitToOrg, emitToCampaign } from '../config/socket.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Production Sarvam Voice & Telephony Provider
 * Connected directly to official Sarvam AI API (Text-to-Speech bulbul:v3, Speech-to-Text, and Sarvam Vobiz Telephony).
 * Active Trunk Caller ID: +917971414044
 */
export class SarvamVoiceProvider extends VoiceProvider {
  constructor(apiKey, webhookSecret, phoneNumber, orgId, workspaceId, agentId, connectionId) {
    super('SarvamVoiceProvider');
    this.apiKey = apiKey || process.env.SARVAM_API_KEY || 'sk_samvaad_c127d2wx_IMA5fbtPqzmU59H0fdMoXCto';
    this.ttsApiKey = process.env.SARVAM_TTS_API_KEY || 'sk_6xa3lrhn_f1OB0SAE9pCNVDxtXN1Psmtk';
    this.webhookSecret = webhookSecret || process.env.WEBHOOK_SECRET;
    this.phoneNumber = phoneNumber || process.env.SARVAM_PHONE_NUMBER || '+917971414044';
    this.orgId = orgId || process.env.SARVAM_ORG_ID || '01a07018-e12e-793c-9cdb-f4d350937a8a';
    this.workspaceId = workspaceId || process.env.SARVAM_WORKSPACE_ID || '01a07018-e133-7c6f-9ea7-f97284e86143';
    this.agentId = agentId || process.env.SARVAM_AGENT_ID || 'Call-bot-ag-baceea75-c21e';
    this.connectionId = connectionId || process.env.SARVAM_CONNECTION_ID || '9eb5d4b7-60-df7af9c8-6801';
    this.baseUrl = 'https://api.sarvam.ai';
    this.outboundsUrl = `https://apps.sarvam.ai/api/outbounds/v1/orgs/${this.orgId}/workspaces/${this.workspaceId}/outbounds`;
  }

  /**
   * Generate real voice audio from Sarvam TTS (bulbul:v3)
   */
  async generateSpeech({ text, languageCode = 'te-IN', speaker = 'priya' }) {
    try {
      const payload = {
        inputs: [text],
        target_language_code: languageCode,
        speaker: speaker,
        model: 'bulbul:v3'
      };

      const res = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        headers: {
          'api-subscription-key': this.ttsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      // Returns array of base64 audio strings
      return data.audios?.[0] || null;
    } catch (err) {
      console.warn(`[SarvamVoiceProvider] TTS Generation notice: ${err.message}`);
      return null;
    }
  }

  async createAgent(agent) {
    return {
      providerAgentId: `sarvam_agent_${agent._id || uuidv4().slice(0, 8)}`,
      status: 'active',
      raw: { provider: 'sarvam', model: 'bulbul:v3', line: this.phoneNumber }
    };
  }

  async updateAgent(providerAgentId) {
    return { success: true, providerAgentId };
  }

  async deleteAgent() {
    return { success: true };
  }

  async startCampaign({ campaign }) {
    return {
      providerCampaignId: `sarvam_camp_${campaign._id}`,
      status: 'running'
    };
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
    const call = await Call.findOne({ providerCallId });
    return call;
  }

  /**
   * Real-Time Telephony Execution
   * Dispatches authentic cellular outbound call via Voice Trunk API
   */
  async initiateCall({ callId, agent, lead, task, orgId, campaignId, isTest = false }) {
    const rawDigits = (lead?.phone || '').replace(/[^0-9]/g, '');
    const clean10 = rawDigits.length === 12 && rawDigits.startsWith('91')
      ? rawDigits.slice(2)
      : rawDigits.length === 11 && rawDigits.startsWith('0')
      ? rawDigits.slice(1)
      : rawDigits;
    const targetE164 = `+91${clean10}`;

    const missionTask = task || lead?.task || agent?.objective || 'Follow up on property inquiry and qualify buyer';
    console.log(`[SarvamVoiceProvider] Dispatching REAL Telephony Call from ${this.phoneNumber} to ${targetE164} with Task: "${missionTask}"...`);

    let attemptId = `trunk_call_${uuidv4().slice(0, 8)}`;

    const payload = {
      app_config: {
        app_id: this.agentId,
        version_filter: 'latest',
        connection_config: {
          connection_id: this.connectionId,
          agent_phone_number: this.phoneNumber
        }
      },
      user_config: {
        user_phone_number: targetE164
      }
    };

    const response = await fetch(this.outboundsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    console.log(`[SarvamVoiceProvider] Outbound API response status ${response.status}:`, data);

    if (!response.ok || !data.attempt_id) {
      let errorDetail = data?.error?.data?.details || data?.error?.message || `Trunk rejected with status ${response.status}`;
      if (response.status === 402) {
        errorDetail = `Insufficient Balance on Sarvam Voice Trunk (HTTP 402). Outbound calls cannot reach cellular handsets until calling credits are topped up on apps.sarvam.ai.`;
      }
      console.error(`[SarvamVoiceProvider] Real Carrier Error (${response.status}): ${errorDetail}`);

      if (mongoose.Types.ObjectId.isValid(callId)) {
        await Call.findByIdAndUpdate(callId, {
          status: 'failed',
          outcome: 'failed',
          summary: `Carrier Outbound Error: ${errorDetail}`,
          endedAt: new Date()
        });
      }

      this._broadcast(orgId, campaignId, 'call:failed', {
        callId,
        status: 'failed',
        outcome: 'failed',
        error: errorDetail
      });

      const carrierErr = new Error(errorDetail);
      carrierErr.statusCode = response.status === 402 ? 402 : 400;
      throw carrierErr;
    }

    attemptId = data.attempt_id;
    console.log(`[SarvamVoiceProvider] Real carrier call successfully accepted! Attempt ID: ${attemptId}`);

    if (mongoose.Types.ObjectId.isValid(callId)) {
      await Call.findByIdAndUpdate(callId, {
        providerCallId: attemptId,
        status: 'initiated',
        task: missionTask,
        provider: 'sarvam',
        startedAt: new Date()
      });
    }

    this._broadcast(orgId, campaignId, 'call:initiated', {
      callId,
      providerCallId: attemptId,
      status: 'initiated',
      telecomLine: this.phoneNumber,
      targetE164,
      leadName: lead?.name || 'Customer'
    });

    return {
      providerCallId: attemptId,
      status: 'initiated',
      callerNumber: this.phoneNumber,
      provider: 'sarvam'
    };
  }

  _broadcast(orgId, campaignId, event, payload) {
    if (orgId) emitToOrg(orgId, event, payload);
    if (campaignId) emitToCampaign(campaignId, event, payload);
  }

  verifyWebhookSignature(rawBody, signature) {
    if (!this.webhookSecret || !signature) return true;
    try {
      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody))
        .digest('hex');
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }

  normalizeWebhookEvent(rawPayload) {
    return {
      eventType: rawPayload.event_type || 'CALL_UPDATE',
      providerCallId: rawPayload.call_id || rawPayload.attempt_id,
      status: rawPayload.status,
      outcome: rawPayload.outcome
    };
  }
}
