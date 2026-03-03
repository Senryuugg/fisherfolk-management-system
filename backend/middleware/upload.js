import multer from 'multer';

/**
 * Upload middleware — uses memory storage so the route handler
 * can choose to stream the buffer to GCS (production) or write
 * to local disk (development), based on GCS_BUCKET_NAME env var.
 */

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const ALLOWED_EXT = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx']);

const fileFilter = (_req, file, cb) => {
  const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
  if (ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word (.doc/.docx), and Excel (.xls/.xlsx) are allowed.'), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});
