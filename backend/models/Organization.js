import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    region: {
      type: String,
      required: true,
    },
    address: String,
    contactNumber: String,
    contactPerson: String,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fisherfolk',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Organization', organizationSchema);
