import express from 'express';
import Document from '../models/Document.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { paginationValidation, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get documents for a specific resource
router.get(
  '/:resource/:resourceId',
  authenticateToken,
  paginationValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { resource, resourceId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Validate resource type
      const validResources = ['fisherfolk', 'boat', 'organization', 'ordinance', 'report'];
      if (!validResources.includes(resource)) {
        return res.status(400).json({ message: 'Invalid resource type' });
      }

      const [documents, total] = await Promise.all([
        Document.find({
          relatedResource: resource,
          relatedResourceId: resourceId,
        })
          .populate('uploadedBy', 'username fullName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Document.countDocuments({
          relatedResource: resource,
          relatedResourceId: resourceId,
        }),
      ]);

      res.json({
        documents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('[v0] Error fetching documents:', error);
      res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
  }
);

// Upload document metadata (actual file upload would use a service like AWS S3, Vercel Blob, etc)
router.post('/', authenticateToken, authorize('documents', 'create'), async (req, res) => {
  try {
    const {
      fileName,
      fileType,
      fileSize,
      mimeType,
      relatedResource,
      relatedResourceId,
      description,
      tags,
      isPublic,
      filePath,
      checksum,
    } = req.body;

    // Validate required fields
    if (!fileName || !fileType || !relatedResource || !relatedResourceId || !filePath) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if document already exists (duplicate check)
    if (checksum) {
      const existingDoc = await Document.findOne({
        checksum,
        relatedResource,
        relatedResourceId,
      });

      if (existingDoc) {
        return res.status(409).json({
          message: 'Document already exists',
          documentId: existingDoc._id,
        });
      }
    }

    const document = new Document({
      fileName,
      fileType,
      fileSize,
      mimeType,
      relatedResource,
      relatedResourceId,
      uploadedBy: req.user._id,
      uploader: req.user.username,
      description,
      tags: tags || [],
      isPublic: isPublic || false,
      filePath,
      checksum,
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    console.error('[v0] Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// Get single document
router.get('/file/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('uploadedBy', 'username fullName');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access control
    if (document.accessControl?.restrictedTo && !document.accessControl.restrictedTo.includes(req.user._id.toString())) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Increment download count
    document.downloadCount = (document.downloadCount || 0) + 1;
    await document.save();

    res.json(document);
  } catch (error) {
    console.error('[v0] Error fetching document:', error);
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
});

// Delete document
router.delete('/:id', authenticateToken, authorize('documents', 'delete'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check ownership or admin role
    if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[v0] Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

// Search documents
router.get('/search', authenticateToken, paginationValidation, handleValidationErrors, async (req, res) => {
  try {
    const { fileName, fileType, tags, relatedResource } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (fileName) {
      query.fileName = { $regex: fileName, $options: 'i' };
    }

    if (fileType) {
      query.fileType = fileType;
    }

    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    if (relatedResource) {
      query.relatedResource = relatedResource;
    }

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('uploadedBy', 'username fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Document.countDocuments(query),
    ]);

    res.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[v0] Error searching documents:', error);
    res.status(500).json({ message: 'Error searching documents', error: error.message });
  }
});

export default router;
