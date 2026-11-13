import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true // e.g., "Real Estate Qualification Specialist"
  },
  description: {
    type: String,
    default: ''
  },
  plainLanguageJobPrompt: {
    type: String,
    default: '' // The original plain text description provided by the user
  },
  objective: {
    type: String,
    required: true
  },
  systemPrompt: {
    type: String,
    required: true // Structured conversation instructions
  },
  languages: {
    type: [String],
    default: ['English', 'Telugu']
  },
  primaryLanguage: {
    type: String,
    default: 'English'
  },
  allowCodeSwitching: {
    type: Boolean,
    default: true
  },
  conversationStyle: {
    type: String,
    enum: ['professional', 'friendly', 'consultative', 'sales-focused', 'supportive'],
    default: 'consultative'
  },
  personality: {
    type: String,
    default: 'Polite, proactive, patient, attentive, and confident'
  },
  infoToCollect: [{
    fieldName: { type: String, required: true },
    description: { type: String, required: true },
    required: { type: Boolean, default: true }
  }],
  qualificationCriteria: [{
    criterion: { type: String, required: true },
    weight: { type: Number, default: 1 } // Weight or threshold
  }],
  possibleOutcomes: {
    type: [String],
    default: ['qualified', 'interested', 'callback', 'not_interested', 'no_answer', 'busy', 'failed']
  },
  voiceSettings: {
    voiceId: { type: String, default: 'sarvam-ananya-warm' },
    gender: { type: String, enum: ['female', 'male'], default: 'female' },
    speed: { type: Number, default: 1.0 },
    pitch: { type: Number, default: 1.0 },
    naturalPauses: { type: Boolean, default: true },
    silenceHandlingSeconds: { type: Number, default: 3.5 },
    interruptionHandling: { type: Boolean, default: true },
    voicemailHandling: {
      type: String,
      enum: ['hangup', 'leave_message', 'detect_and_hangup'],
      default: 'detect_and_hangup'
    },
    backgroundAmbience: {
      type: String,
      enum: ['none', 'quiet_office', 'gentle_room'],
      default: 'none'
    }
  },
  providerInformation: {
    provider: { type: String, default: 'mock' },
    providerAgentId: { type: String, default: '' },
    syncedAt: { type: Date }
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'draft'],
    default: 'active'
  },
  stats: {
    totalCalls: { type: Number, default: 0 },
    qualifiedLeads: { type: Number, default: 0 },
    interestedLeads: { type: Number, default: 0 },
    connectedCalls: { type: Number, default: 0 }
  },
  version: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

export const Agent = mongoose.model('Agent', AgentSchema);
