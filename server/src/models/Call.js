import mongoose from 'mongoose';

const TranscriptMessageSchema = new mongoose.Schema({
  speaker: {
    type: String,
    enum: ['agent', 'user', 'system'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    default: 0 // offset in milliseconds or seconds
  },
  language: {
    type: String,
    default: 'en'
  }
}, { _id: false });

const CallSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    index: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    index: true
  },
  isTestCall: {
    type: Boolean,
    default: false
  },
  targetPhone: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    default: 'Prospect'
  },
  task: {
    type: String,
    default: ''
  },
  provider: {
    type: String,
    enum: ['mock', 'sarvam', 'exotel', 'cartesia', 'twilio'],
    default: 'exotel'
  },
  providerCallId: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: ['queued', 'initiated', 'ringing', 'connected', 'in_progress', 'completed', 'failed', 'no_answer', 'busy'],
    default: 'queued',
    index: true
  },
  outcome: {
    type: String,
    enum: ['qualified', 'interested', 'callback', 'not_interested', 'no_answer', 'busy', 'failed', 'in_progress', 'unknown'],
    default: 'in_progress',
    index: true
  },
  duration: {
    type: Number,
    default: 0 // Duration in seconds
  },
  transcript: [TranscriptMessageSchema],
  summary: {
    type: String,
    default: ''
  },
  qualificationData: {
    score: { type: Number, default: 0 },
    reasons: { type: [String], default: [] },
    extractedFields: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
  },
  recordingUrl: {
    type: String,
    default: ''
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'hesitant', 'negative'],
    default: 'neutral'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  connectedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  rawProviderPayload: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

export const Call = mongoose.model('Call', CallSchema);
