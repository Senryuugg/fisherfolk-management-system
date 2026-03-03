// env.js — ESM preload file: runs before server.js loads any module
// Called via: node --import ./env.js server.js
// dotenv must be loaded here so process.env is populated before any import side-effects run.

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from the backend root directory explicitly
config({ path: resolve(__dirname, '.env') });
