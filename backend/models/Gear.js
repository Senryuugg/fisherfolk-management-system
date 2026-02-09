import mongoose from 'mongoose';

const gearSchema = new mongoose.Schema(
  {
    mfbrNumber: {
      type: String,
      required: true,
      unique: true,
    },
    frNumber: String,
    fisherfolk: String,
    gearClassification: String,
    registrationDate: Date,
    province: String,
    cityMunicipality: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'Active', 'Inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Gear', gearSchema);
