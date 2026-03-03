import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedByUsername: {
      type: String,
      required: true,
    },
    submittedByCity: String,
    resource: {
      type: String,
      enum: ['fisherfolk', 'boat', 'gear', 'organization', 'officer', 'committee'],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete'],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // For update/delete actions
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedByUsername: String,
    reviewNotes: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

approvalSchema.index({ status: 1, createdAt: -1 });
approvalSchema.index({ submittedBy: 1, createdAt: -1 });
approvalSchema.index({ resource: 1, status: 1 });

export default mongoose.model('Approval', approvalSchema);
