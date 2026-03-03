/**
 * gcs.js — Google Cloud Storage helper
 *
 * Uses lazy initialization so env vars are read after dotenv.config() runs.
 */

import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Lazy singleton — built on first use, not at import time ─────────────────
let _storage = null;
let _bucket  = null;
let _initialized = false;

const init = () => {
  if (_initialized) return;
  _initialized = true;

  const GCS_BUCKET  = process.env.GCS_BUCKET_NAME;
  const GCS_PROJECT = process.env.GCS_PROJECT_ID;
  const CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  console.log('[GCS] GCS_BUCKET_NAME  =', GCS_BUCKET  || '(not set — using local disk)');
  console.log('[GCS] GCS_PROJECT_ID   =', GCS_PROJECT || '(not set)');
  console.log('[GCS] CREDENTIALS PATH =', CREDENTIALS || '(not set)');

  if (!GCS_BUCKET) return; // local disk mode

  const opts = { projectId: GCS_PROJECT };

  if (CREDENTIALS) {
    if (CREDENTIALS.trim().startsWith('{')) {
      opts.credentials = JSON.parse(CREDENTIALS);
    } else {
      opts.keyFilename = path.resolve(__dirname, '..', CREDENTIALS);
    }
  }

  _storage = new Storage(opts);
  _bucket  = _storage.bucket(GCS_BUCKET);
  console.log('[GCS] Storage client initialized — uploads will go to GCS.');
};

/** True when GCS is configured and available. */
export const isGCSEnabled = () => {
  init();
  return Boolean(_bucket);
};

/**
 * Upload a buffer to GCS.
 */
export const uploadToGCS = (buffer, destination, mimeType) => {
  init();
  if (!_bucket) throw new Error('GCS is not configured. Set GCS_BUCKET_NAME in .env');

  return new Promise((resolve, reject) => {
    const blob   = _bucket.file(destination);
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
 * Delete a GCS object. Ignores 404 silently.
 */
export const deleteFromGCS = async (gcsFileId) => {
  init();
  if (!_bucket || !gcsFileId) return;
  try {
    await _bucket.file(gcsFileId).delete();
  } catch (err) {
    if (err.code !== 404) throw err;
  }
};

/**
 * Generate a signed download URL valid for `expiresInMs` milliseconds.
 */
export const getSignedUrl = async (gcsFileId, expiresInMs = 15 * 60 * 1000) => {
  init();
  if (!_bucket) throw new Error('GCS is not configured');
  const [url] = await _bucket.file(gcsFileId).getSignedUrl({
    version: 'v4',
    action:  'read',
    expires: Date.now() + expiresInMs,
  });
  return url;
};

// ─── Local disk fallback ──────────────────────────────────────────────────────
const LOCAL_UPLOAD_DIR = path.resolve(__dirname, '../../uploads/documents');

export const getLocalUploadDir = () => {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
    fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  }
  return LOCAL_UPLOAD_DIR;
};

export const saveToLocalDisk = (buffer, filename) => {
  const dir      = getLocalUploadDir();
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
};
