import mongoose from 'mongoose';

const UsageSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  billingPeriod: {
    type: String, // e.g. "2026-09"
    required: true,
    index: true
  },
  totalMinutes: {
    type: Number,
    default: 0
  },
  totalCalls: {
    type: Number,
    default: 0
  },
  successfulCalls: {
    type: Number,
    default: 0
  },
  qualifiedCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

UsageSchema.index({ organizationId: 1, billingPeriod: 1 }, { unique: true });

export const Usage = mongoose.model('Usage', UsageSchema);
