import mongoose from 'mongoose';

const WebhookEventSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  },
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['sarvam', 'mock', 'generic'],
    default: 'mock'
  },
  eventType: {
    type: String,
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['received', 'processed', 'ignored', 'failed'],
    default: 'received'
  },
  errorMessage: {
    type: String
  },
  processedAt: {
    type: Date
  }
}, { timestamps: true });

export const WebhookEvent = mongoose.model('WebhookEvent', WebhookEventSchema);
