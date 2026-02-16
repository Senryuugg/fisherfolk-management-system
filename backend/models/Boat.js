import mongoose from 'mongoose';

const boatSchema = new mongoose.Schema(
  {
    frsNumber: String,
    mfbrNumber: {
      type: String,
      required: true,
      unique: true,
    },
    boatName: {
      type: String,
      required: true,
    },
    fisherfolkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fisherfolk',
      required: true,
    },
    address: String,
    registrationDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    gears: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Boat', boatSchema);
