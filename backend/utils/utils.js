/**
 * gcs.js — Google Cloud Storage helper
 *
 * Exports two functions:
 *   uploadToGCS(buffer, destination, mimeType) → gcsFileId (object name)
 *   deleteFromGCS(gcsFileId)
 *   getSignedUrl(gcsFileId, expiresInMs) → signed download URL
 *
 * Falls back gracefully if GCS_BUCKET_NAME is not set (local dev mode).
 */

import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GCS_BUCKET   = process.env.GCS_BUCKET_NAME;
const GCS_PROJECT  = process.env.GCS_PROJECT_ID;
const CREDENTIALS  = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let storage = null;
let bucket  = null;

if (GCS_BUCKET) {
  const opts = { projectId: GCS_PROJECT };

  // Accept either a file path OR the raw JSON string stored in an env var
  if (CREDENTIALS) {
    if (CREDENTIALS.trim().startsWith('{')) {
      // Inline JSON string — parse and pass directly
      opts.credentials = JSON.parse(CREDENTIALS);
    } else {
      // File path — resolve relative to backend root
      opts.keyFilename = path.resolve(__dirname, '..', CREDENTIALS);
    }
  }

  storage = new Storage(opts);
  bucket  = storage.bucket(GCS_BUCKET);
}

/**
 * Upload a buffer to GCS.
 * @param {Buffer} buffer
 * @param {string} destination   GCS object name, e.g. "documents/1714823400000-abc.pdf"
 * @param {string} mimeType
 * @returns {Promise<string>}    The GCS object name (stored in Document.gcsFileId)
 */
export const uploadToGCS = (buffer, destination, mimeType) => {
  if (!bucket) throw new Error('GCS is not configured. Set GCS_BUCKET_NAME in .env');

  return new Promise((resolve, reject) => {
    const blob   = bucket.file(destination);
    const stream = blob.createWriteStream({
      resumable: false,
      contentType: mimeType,
      metadata: { cacheControl: 'private, max-age=0' },
    });

    stream.on('error', reject);
    stream.on('finish', () => resolve(destination));
    stream.end(buffer);
  });
};

/**
 * Delete a GCS object by its object name.
 * Ignores "not found" errors silently.
 */
export const deleteFromGCS = async (gcsFileId) => {
  if (!bucket || !gcsFileId) return;
  try {
    await bucket.file(gcsFileId).delete();
  } catch (err) {
    if (err.code !== 404) throw err;
  }
};

/**
 * Generate a signed download URL valid for `expiresInMs` milliseconds.
 * @param {string} gcsFileId
 * @param {number} expiresInMs  defaults to 15 minutes
 * @returns {Promise<string>}   Signed URL
 */
export const getSignedUrl = async (gcsFileId, expiresInMs = 15 * 60 * 1000) => {
  if (!bucket) throw new Error('GCS is not configured');
  const [url] = await bucket.file(gcsFileId).getSignedUrl({
    version: 'v4',
    action:  'read',
    expires: Date.now() + expiresInMs,
  });
  return url;
};

/** True when GCS is configured and available. */
export const isGCSEnabled = () => Boolean(bucket);

// ─── Local disk fallback helpers (used when GCS_BUCKET_NAME is not set) ──────
const LOCAL_UPLOAD_DIR = path.resolve(__dirname, '../../uploads/documents');

export const getLocalUploadDir = () => {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
  return LOCAL_UPLOAD_DIR;
};

export const saveToLocalDisk = (buffer, filename) => {
  const dir = getLocalUploadDir();
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};
