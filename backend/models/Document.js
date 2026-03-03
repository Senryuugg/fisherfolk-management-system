import mongoose from 'mongoose';

/**
 * Document model — hybrid MongoDB + GCS architecture.
 *
 * MongoDB stores metadata (filename, uploader, tags, versions, etc.)
 * Google Cloud Storage stores the actual binary file data.
 * The `gcsFileId` field is the GCS object name / blob path.
 * For local development, `localPath` is used instead until GCS is integrated.
 */

const versionSchema = new mongoose.Schema({
  versionNumber: { type: Number, required: true },
  gcsFileId:     String,   // GCS object path (populated after GCS integration)
  localPath:     String,   // fallback for local dev
  originalName:  String,
  size:          Number,
  mimeType:      String,
  uploadedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt:    { type: Date, default: Date.now },
  note:          String,   // optional change note
});

const documentSchema = new mongoose.Schema(
  {
    // Core identity
    title:            { type: String, required: true, trim: true },
    documentNumber:   { type: String, trim: true },
    type:             { type: String, enum: ['ordinance', 'resolution'], required: true },
    status:           { type: String, enum: ['Active', 'Pending', 'Inactive', 'Archived'], default: 'Active' },
    approvedDate:     Date,

    // Linked org
    organizationId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },

    // Tags / categories
    tags:             [{ type: String, trim: true }],
    category:         String,

    // Current (latest) file
    gcsFileId:        String,   // GCS object name — populated after GCS integration
    localPath:        String,   // relative path under uploads/ for local dev
    originalName:     String,
    mimeType:         String,
    size:             Number,

    // Version history — newest first
    versions:         [versionSchema],
    currentVersion:   { type: Number, default: 1 },

    // Metadata
    uploadedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description:      String,

    // Shareable link token (random UUID stored here)
    shareToken:       { type: String, index: true },
    shareTokenExpiry: Date,
  },
  { timestamps: true }
);

// Full-text search index on title, documentNumber, tags, category
documentSchema.index({ title: 'text', documentNumber: 'text', tags: 'text', category: 'text' });

export default mongoose.model('Document', documentSchema);
