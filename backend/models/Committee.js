import mongoose from 'mongoose';

const committeeSchema = new mongoose.Schema(
  {
    committeeName: {
      type: String,
      required: true,
    },
    chairman: {
      type: String,
      required: true,
    },
    members: [
      {
        name: String,
        position: String,
      },
    ],
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    dateFormed: Date,
    functions: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Committee', committeeSchema);
