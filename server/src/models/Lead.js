import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  // Flexible customData object for variables {{budget}}, {{city}}, {{property}}, etc.
  customData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'calling', 'completed', 'failed', 'retrying'],
    default: 'pending',
    index: true
  },
  outcome: {
    type: String,
    enum: ['qualified', 'interested', 'callback', 'not_interested', 'no_answer', 'busy', 'failed', 'pending'],
    default: 'pending',
    index: true
  },
  qualificationScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  summary: {
    type: String,
    default: ''
  },
  nextAction: {
    type: String,
    default: ''
  },
  callAttempts: {
    type: Number,
    default: 0
  },
  lastCallAt: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

LeadSchema.index({ organizationId: 1, phone: 1 });

export const Lead = mongoose.model('Lead', LeadSchema);
