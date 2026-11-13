import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  voiceProvider: {
    type: String,
    enum: ['mock', 'sarvam', 'exotel', 'cartesia', 'twilio'],
    default: 'exotel'
  },
  providerConfig: {
    sarvamApiKey: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
    telephonyNumber: { type: String, default: '+91 800-SAHARA-VOICE' }
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  callingHours: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '19:00' }
  },
  callingDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  settings: {
    defaultLanguage: { type: String, default: 'English' },
    concurrencyLimit: { type: Number, default: 10 },
    autoRetry: { type: Boolean, default: true }
  }
}, { timestamps: true });

export const Organization = mongoose.model('Organization', OrganizationSchema);
