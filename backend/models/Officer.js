import mongoose from 'mongoose';

const officerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    appointmentDate: Date,
    contactNumber: String,
    email: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Officer', officerSchema);
