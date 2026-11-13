import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'stopped'],
    default: 'draft',
    index: true
  },
  schedule: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    callingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    callingHours: {
      start: { type: String, default: '09:30' },
      end: { type: String, default: '19:30' }
    }
  },
  retryConfig: {
    maxAttempts: { type: Number, default: 2 },
    delayMinutes: { type: Number, default: 30 },
    retryOn: {
      type: [String],
      default: ['no_answer', 'busy', 'failed']
    }
  },
  concurrency: {
    type: Number,
    default: 3,
    min: 1,
    max: 20
  },
  leadCounts: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    pending: { type: Number, default: 0 }
  },
  metrics: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    connected: { type: Number, default: 0 },
    qualified: { type: Number, default: 0 },
    interested: { type: Number, default: 0 },
    callbacks: { type: Number, default: 0 },
    notInterested: { type: Number, default: 0 },
    noAnswer: { type: Number, default: 0 },
    busy: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  providerCampaignId: {
    type: String,
    default: ''
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

export const Campaign = mongoose.model('Campaign', CampaignSchema);
