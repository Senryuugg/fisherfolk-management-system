import mongoose from 'mongoose';

const ordinanceResolutionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    ordinanceNumber: String,
    resolutionNumber: String,
    dateAdopted: Date,
    documentFile: {
      filename: String,
      path: String,
      fileType: String,
      size: Number,
    },
    type: {
      type: String,
      enum: ['ordinance', 'resolution'],
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'archived'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export default mongoose.model('OrdinanceResolution', ordinanceResolutionSchema);
