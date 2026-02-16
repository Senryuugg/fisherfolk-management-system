import mongoose from 'mongoose';

const gearSchema = new mongoose.Schema(
  {
    frsNumber: String,
    gearType: {
      type: String,
      required: true,
    },
    gearClassification: String,
    quantity: {
      type: Number,
      default: 1,
    },
    condition: {
      type: String,
      enum: ['good', 'fair', 'poor'],
      default: 'good',
    },
    fisherfolkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fisherfolk',
      required: true,
    },
    registrationDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Gear', gearSchema);
