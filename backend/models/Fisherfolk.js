import mongoose from 'mongoose';

const fisherfolkSchema = new mongoose.Schema(
  {
    rsbsaNumber: {
      type: String,
      required: true,
      unique: true,
    },
    registrationNumber: String,
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    middleName: String,
    registrationDate: Date,
    province: String,
    cityMunicipality: String,
    barangay: String,
    mainLivelihood: String,
    alternativeLivelihood: String,
    boats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boat',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Fisherfolk', fisherfolkSchema);
