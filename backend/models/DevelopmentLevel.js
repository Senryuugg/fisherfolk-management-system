import mongoose from 'mongoose';

const developmentLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    level: {
      type: Number,
      required: true,
    },
    criteria: [String],
    indicators: [
      {
        name: String,
        description: String,
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

export default mongoose.model('DevelopmentLevel', developmentLevelSchema);
