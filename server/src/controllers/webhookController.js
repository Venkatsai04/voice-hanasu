import { WebhookEvent } from '../models/WebhookEvent.js';
import { Call } from '../models/Call.js';
import { Lead } from '../models/Lead.js';
import { Campaign } from '../models/Campaign.js';
import { getSarvamProvider } from '../providers/providerFactory.js';
import { emitToCampaign, emitToOrg } from '../config/socket.js';
import { v4 as uuidv4 } from 'uuid';

export const handleSarvamWebhook = async (req, res) => {
  const signature = req.headers['x-sarvam-signature'] || req.headers['x-webhook-signature'];
  const eventId = req.headers['x-event-id'] || req.body?.event_id || `evt_${uuidv4()}`;

  // 1. Idempotency Check
  const existingEvent = await WebhookEvent.findOne({ eventId });
  if (existingEvent) {
    return res.status(200).json({ received: true, message: 'Event already processed' });
  }

  // 2. Signature verification
  const sarvamProvider = getSarvamProvider();
  const isValid = sarvamProvider.verifyWebhookSignature(req.body, signature);
  if (!isValid) {
    console.warn(`[Webhook] Invalid Sarvam webhook signature for event ${eventId}`);
    return res.status(401).json({ success: false, message: 'Invalid signature' });
  }

  // 3. Store raw webhook record first
  const webhookRecord = await WebhookEvent.create({
    eventId,
    provider: 'sarvam',
    eventType: req.body?.event_type || 'unknown',
    payload: req.body,
    status: 'received'
  });

  // Acknowledge receipt promptly
  res.status(200).json({ received: true, eventId });

  // 4. Process event asynchronously
  try {
    const normalized = sarvamProvider.normalizeWebhookEvent(req.body);
    const callQuery = normalized.callId ? { _id: normalized.callId } : { providerCallId: normalized.providerCallId };
    const call = await Call.findOne(callQuery);

    if (call) {
      const orgId = call.organizationId?.toString();
      const campaignId = call.campaignId?.toString();

      // Update call fields based on event
      if (normalized.status) call.status = normalized.status;
      if (normalized.outcome) call.outcome = normalized.outcome;
      if (normalized.duration) call.duration = normalized.duration;
      if (normalized.recordingUrl) call.recordingUrl = normalized.recordingUrl;
      if (normalized.summary) call.summary = normalized.summary;
      if (normalized.transcript && normalized.transcript.length > 0) {
        call.transcript = normalized.transcript;
      }
      if (normalized.qualificationData?.score) {
        call.qualificationData = normalized.qualificationData;
      }

      await call.save();

      // Update Lead if associated
      if (call.leadId && ['completed', 'failed', 'no_answer', 'busy'].includes(normalized.status)) {
        await Lead.findByIdAndUpdate(call.leadId, {
          status: 'completed',
          outcome: normalized.outcome || call.outcome,
          qualificationScore: normalized.qualificationData?.score || call.qualificationData?.score || 0,
          summary: normalized.summary || call.summary,
          lastCallAt: new Date()
        });
      }

      // Update Campaign metrics
      if (campaignId && ['completed', 'failed', 'no_answer', 'busy'].includes(normalized.status)) {
        const incField = { 'metrics.completed': 1, 'leadCounts.completed': 1, 'leadCounts.active': -1 };
        if (normalized.outcome === 'qualified') incField['metrics.qualified'] = 1;
        if (normalized.outcome === 'interested') incField['metrics.interested'] = 1;

        await Campaign.findByIdAndUpdate(campaignId, { $inc: incField });
        emitToCampaign(campaignId, 'campaign:metrics_updated', { campaignId });
      }

      // Emit real-time socket events
      emitToCampaign(campaignId, 'call:update', { call });
      emitToOrg(orgId, 'call:update', { call });
    }

    webhookRecord.status = 'processed';
    webhookRecord.processedAt = new Date();
    await webhookRecord.save();
  } catch (err) {
    console.error(`[Webhook] Error processing event ${eventId}:`, err);
    webhookRecord.status = 'failed';
    webhookRecord.errorMessage = err.message;
    await webhookRecord.save();
  }
};

/**
 * Handle Exotel StatusCallback webhook
 */
export const handleExotelWebhook = async (req, res) => {
  const payload = { ...req.query, ...req.body };
  const callSid = payload.CallSid || payload.Sid;
  const status = (payload.Status || '').toLowerCase();
  const duration = payload.Duration ? parseInt(payload.Duration, 10) : 0;
  const recordingUrl = payload.RecordingUrl || '';

  console.log(`[ExotelWebhook] Received carrier update for ${callSid}: status=${status}, duration=${duration}`);

  try {
    let call = null;
    if (callSid) {
      call = await Call.findOne({ providerCallId: callSid });
    }

    if (!call && payload.CustomField) {
      try {
        const custom = JSON.parse(payload.CustomField);
        if (custom.callId) {
          call = await Call.findById(custom.callId);
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    if (call) {
      const orgId = call.organizationId?.toString();
      const campaignId = call.campaignId?.toString();

      if (['in-progress', 'in_progress'].includes(status)) {
        call.status = 'in_progress';
        if (!call.connectedAt) call.connectedAt = new Date();
      } else if (['completed', 'busy', 'no-answer', 'failed', 'canceled'].includes(status)) {
        call.status = status === 'completed' ? 'completed' : 'failed';
        call.outcome = status;
        call.duration = duration || call.duration;
        call.recordingUrl = recordingUrl || call.recordingUrl;
        call.endedAt = new Date();
        call.summary = `Exotel status update: ${status}. Duration: ${duration}s.`;
      }

      await call.save();

      emitToOrg(orgId, 'call:update', { call });
      if (campaignId) emitToCampaign(campaignId, 'call:update', { call });
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[ExotelWebhook] Error handling callback:', err);
    return res.status(200).send('ERROR');
  }
};

