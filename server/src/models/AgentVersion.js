import mongoose from 'mongoose';

const AgentVersionSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    index: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  snapshot: {
    type: Object,
    required: true
  },
  changeSummary: {
    type: String,
    default: 'Updated configuration'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export const AgentVersion = mongoose.model('AgentVersion', AgentVersionSchema);
