import mongoose from 'mongoose';

const PhoneConnectionSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  friendlyName: {
    type: String,
    default: 'Primary Outbound Line'
  },
  provider: {
    type: String,
    enum: ['sarvam', 'mock', 'twilio', 'custom_sip'],
    default: 'mock'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending_verification'],
    default: 'active'
  },
  isDefault: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const PhoneConnection = mongoose.model('PhoneConnection', PhoneConnectionSchema);
