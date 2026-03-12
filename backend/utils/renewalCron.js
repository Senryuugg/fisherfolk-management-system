/**
 * renewalCron.js
 * Runs on server startup and then every 24 hours.
 * Marks any fisherfolk whose registrationExpiry has passed as 'inactive'.
 */

import Fisherfolk from '../models/Fisherfolk.js';

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const runExpiryCheck = async () => {
  try {
    const now = new Date();
    const result = await Fisherfolk.updateMany(
      {
        status: 'active',
        registrationExpiry: { $lt: now },
      },
      { $set: { status: 'inactive' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Renewal] ${result.modifiedCount} fisherfolk marked inactive (registration expired).`);
    }
  } catch (err) {
    console.error('[Renewal] Expiry check failed:', err.message);
  }
};

export const startRenewalCron = () => {
  // Run once immediately on startup, then every 24 h
  runExpiryCheck();
  setInterval(runExpiryCheck, INTERVAL_MS);
  console.log('[Renewal] Auto-expiry cron started (runs every 24 h).');
};
