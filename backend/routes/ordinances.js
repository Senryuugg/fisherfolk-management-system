import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import archiver from 'archiver';
import Document from '../models/Document.js';
import { authenticateToken, canCreate, canUpdate, canDelete, canRead } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  isGCSEnabled,
  uploadToGCS,
  deleteFromGCS,
  getSignedUrl,
  getLocalUploadDir,
  saveToLocalDisk,
} from '../utils/gcs.js';

const router = express.Router();

// ─── Helper: generate a unique storage object name ───────────────────────────
const makeObjectName = (originalname) => {
  const ext    = originalname.slice(originalname.lastIndexOf('.')).toLowerCase();
  const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  return `documents/${unique}${ext}`;
};

// ─── Helper: build download URL or signed URL for a gcsFileId / localPath ────
const resolveDownloadSource = async (doc) => {
  if (isGCSEnabled() && doc.gcsFileId) {
    const signedUrl = await getSignedUrl(doc.gcsFileId, 15 * 60 * 1000);
    return { type: 'redirect', url: signedUrl };
  }
  if (doc.localPath) {
    const filePath = path.join(getLocalUploadDir(), doc.localPath);
    return { type: 'sendfile', filePath, originalName: doc.originalName, mimeType: doc.mimeType };
  }
  return null;
};

// ─── Helper: delete stored file (GCS or local) ───────────────────────────────
const deleteStoredFile = async (gcsFileId, localPath) => {
  if (isGCSEnabled() && gcsFileId) {
    await deleteFromGCS(gcsFileId);
  } else if (localPath) {
    const filePath = path.join(getLocalUploadDir(), localPath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};

// ─── Helper: store uploaded buffer (GCS or local) ────────────────────────────
const storeUploadedFile = async (file) => {
  const objectName = makeObjectName(file.originalname);

  if (isGCSEnabled()) {
    await uploadToGCS(file.buffer, objectName, file.mimetype);
    console.log(`[UPLOAD] GCS -> gs://${process.env.GCS_BUCKET_NAME}/${objectName}`);
    return { gcsFileId: objectName, localPath: null, storageType: 'gcs' };
  } else {
    const filename = objectName.replace('documents/', '');
    saveToLocalDisk(file.buffer, filename);
    console.log(`[UPLOAD] Local disk -> uploads/documents/${filename}`);
    return { gcsFileId: null, localPath: filename, storageType: 'local' };
  }
};

// ─── GET /  List documents (search, type, status, tags, category) ────────────
router.get('/', authenticateToken, canRead, async (req, res) => {
  try {
    const { type, status, search, tags, category, page = 1, limit = 50 } = req.query;
    const query = {};

    if (type)     query.type     = type;
    if (status)   query.status   = status;
    if (category) query.category = category;
    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagArray.length) query.tags = { $in: tagArray };
    }
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('uploadedBy', 'fullName username')
        .populate('organizationId', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Document.countDocuments(query),
    ]);

    res.json({ documents, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// ─── GET /:id  Single document ───────────────────────────────────────────────
router.get('/:id', authenticateToken, canRead, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('uploadedBy', 'fullName username')
      .populate('organizationId', 'name')
      .populate('versions.uploadedBy', 'fullName username');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
});

// ─── POST /  Create document record (metadata only, no file yet) ─────────────
router.post('/', authenticateToken, canCreate, async (req, res) => {
  try {
    const { title, type, documentNumber, approvedDate, status, tags, category, description, organizationId } = req.body;
    const doc = new Document({
      title, type,
      documentNumber,
      approvedDate: approvedDate ? new Date(approvedDate) : undefined,
      status: status || 'Active',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      category, description,
      organizationId: organizationId || undefined,
      uploadedBy: req.user.id,
    });
    await doc.save();
    await doc.populate('uploadedBy', 'fullName username');
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ message: 'Error creating document', error: error.message });
  }
});

// ─── POST /:id/upload  Upload / replace file — streams to GCS or local disk ──
router.post('/:id/upload', authenticateToken, canCreate, upload.single('file'), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc)      return res.status(404).json({ message: 'Document not found' });
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    // Archive current file into version history
    if (doc.localPath || doc.gcsFileId) {
      doc.versions.unshift({
        versionNumber: doc.currentVersion,
        gcsFileId:    doc.gcsFileId,
        localPath:    doc.localPath,
        originalName: doc.originalName,
        mimeType:     doc.mimeType,
        size:         doc.size,
        uploadedBy:   req.user.id,
        note:         req.body.note || '',
      });
    }

    // Store the new file
    const stored = await storeUploadedFile(req.file);

    const hadFile = !!(doc.gcsFileId || doc.localPath);

    doc.gcsFileId      = stored.gcsFileId;
    doc.localPath      = stored.localPath;
    doc.originalName   = req.file.originalname;
    doc.mimeType       = req.file.mimetype;
    doc.size           = req.file.size;
    doc.currentVersion = hadFile ? doc.currentVersion + 1 : 1;
    doc.uploadedBy     = req.user.id;

    await doc.save();
    await doc.populate('uploadedBy', 'fullName username');
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// ─── GET /:id/download  Download current file ────────────────────────────────
router.get('/:id/download', authenticateToken, canRead, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const source = await resolveDownloadSource(doc);
    if (!source) return res.status(404).json({ message: 'No file attached to this document' });

    if (source.type === 'redirect') return res.redirect(source.url);

    if (!fs.existsSync(source.filePath)) {
      return res.status(404).json({ message: 'File missing on disk' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${source.originalName}"`);
    res.setHeader('Content-Type', source.mimeType);
    res.sendFile(source.filePath);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});

// ─── GET /:id/versions/:versionNumber/download  Download a specific version ──
router.get('/:id/versions/:versionNumber/download', authenticateToken, canRead, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const version = doc.versions.find((v) => v.versionNumber === Number(req.params.versionNumber));
    if (!version) return res.status(404).json({ message: 'Version not found' });

    const source = await resolveDownloadSource(version);
    if (!source) return res.status(404).json({ message: 'Version file not found' });

    if (source.type === 'redirect') return res.redirect(source.url);

    if (!fs.existsSync(source.filePath)) {
      return res.status(404).json({ message: 'Version file missing on disk' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${source.originalName}"`);
    res.setHeader('Content-Type', source.mimeType);
    res.sendFile(source.filePath);
  } catch (error) {
    res.status(500).json({ message: 'Error downloading version', error: error.message });
  }
});

// ─── POST /:id/versions/:versionNumber/restore  Restore an old version ───────
router.post('/:id/versions/:versionNumber/restore', authenticateToken, canUpdate, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const versionNum = Number(req.params.versionNumber);
    const versionIdx = doc.versions.findIndex((v) => v.versionNumber === versionNum);
    if (versionIdx === -1) return res.status(404).json({ message: 'Version not found' });

    const version = doc.versions[versionIdx];

    // Archive current file
    if (doc.localPath || doc.gcsFileId) {
      doc.versions.unshift({
        versionNumber: doc.currentVersion,
        gcsFileId:    doc.gcsFileId,
        localPath:    doc.localPath,
        originalName: doc.originalName,
        mimeType:     doc.mimeType,
        size:         doc.size,
        uploadedBy:   req.user.id,
        note:         `Archived — restored v${versionNum}`,
      });
    }

    // Promote old version to current
    doc.gcsFileId      = version.gcsFileId;
    doc.localPath      = version.localPath;
    doc.originalName   = version.originalName;
    doc.mimeType       = version.mimeType;
    doc.size           = version.size;
    doc.currentVersion = doc.currentVersion + 1;
    doc.uploadedBy     = req.user.id;

    doc.versions.splice(versionIdx + 1, 1);
    await doc.save();
    await doc.populate('uploadedBy', 'fullName username');
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Error restoring version', error: error.message });
  }
});

// ─── POST /batch-download  Download multiple files as ZIP ────────────────────
router.post('/batch-download', authenticateToken, canRead, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ message: 'No IDs provided' });

    const docs = await Document.find({
      _id: { $in: ids },
      $or: [{ localPath: { $exists: true, $ne: null } }, { gcsFileId: { $exists: true, $ne: null } }],
    });
    if (!docs.length) return res.status(404).json({ message: 'No downloadable files found' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="documents.zip"');

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    for (const doc of docs) {
      if (isGCSEnabled() && doc.gcsFileId) {
        // Stream GCS file into zip
        const [fileStream] = await bucket.file(doc.gcsFileId).createReadStream
          ? [doc.gcsFileId]
          : [null];
        // Use signed URL redirect is not possible inside a zip — skip GCS files
        // in batch download (they would need to be proxied). Log and skip.
      } else if (doc.localPath) {
        const filePath = path.join(getLocalUploadDir(), doc.localPath);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: doc.originalName || doc.localPath });
        }
      }
    }

    await archive.finalize();
  } catch (error) {
    res.status(500).json({ message: 'Error creating ZIP', error: error.message });
  }
});

// ─── POST /:id/share  Generate shareable link (7-day token) ─────────────────
router.post('/:id/share', authenticateToken, canRead, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    doc.shareToken       = token;
    doc.shareTokenExpiry = expiry;
    await doc.save();

    const shareUrl = `${req.protocol}://${req.get('host')}/api/ordinances/shared/${token}`;
    res.json({ shareUrl, expiresAt: expiry });
  } catch (error) {
    res.status(500).json({ message: 'Error generating share link', error: error.message });
  }
});

// ─── GET /shared/:token  Public download via token (no auth) ─────────────────
router.get('/shared/:token', async (req, res) => {
  try {
    const doc = await Document.findOne({
      shareToken:       req.params.token,
      shareTokenExpiry: { $gt: new Date() },
    });
    if (!doc) return res.status(404).json({ message: 'Link invalid or expired' });

    const source = await resolveDownloadSource(doc);
    if (!source) return res.status(404).json({ message: 'File not found' });

    if (source.type === 'redirect') return res.redirect(source.url);

    if (!fs.existsSync(source.filePath)) {
      return res.status(404).json({ message: 'File missing on disk' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${source.originalName}"`);
    res.setHeader('Content-Type', source.mimeType);
    res.sendFile(source.filePath);
  } catch (error) {
    res.status(500).json({ message: 'Error accessing shared file', error: error.message });
  }
});

// ─── PUT /:id  Update metadata ───────────────────────────────────────────────
router.put('/:id', authenticateToken, canUpdate, async (req, res) => {
  try {
    const { title, documentNumber, approvedDate, status, tags, category, description, organizationId } = req.body;
    const update = {
      ...(title          !== undefined && { title }),
      ...(documentNumber !== undefined && { documentNumber }),
      ...(approvedDate   !== undefined && { approvedDate: new Date(approvedDate) }),
      ...(status         !== undefined && { status }),
      ...(tags           !== undefined && { tags: Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()) }),
      ...(category       !== undefined && { category }),
      ...(description    !== undefined && { description }),
      ...(organizationId !== undefined && { organizationId }),
    };
    const doc = await Document.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('uploadedBy', 'fullName username')
      .populate('organizationId', 'name');
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (error) {
    res.status(400).json({ message: 'Error updating document', error: error.message });
  }
});

// ─── DELETE /:id  Delete document + stored file ──────────────────────────────
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    await deleteStoredFile(doc.gcsFileId, doc.localPath);
    for (const v of doc.versions) {
      await deleteStoredFile(v.gcsFileId, v.localPath);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

export default router;
