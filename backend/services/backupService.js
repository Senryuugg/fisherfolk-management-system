import Fisherfolk from '../models/Fisherfolk.js';
import Boat from '../models/Boat.js';
import Gear from '../models/Gear.js';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import MapData from '../models/MapData.js';
import AuditLog from '../models/AuditLog.js';
import Document from '../models/Document.js';

/**
 * Backup Service
 * Creates, stores, and restores database backups
 */

export const createBackup = async () => {
  try {
    console.log('[v0] Creating database backup...');
    const timestamp = new Date().toISOString();

    const backup = {
      timestamp,
      fisherfolk: await Fisherfolk.find().lean(),
      boats: await Boat.find().lean(),
      gears: await Gear.find().lean(),
      organizations: await Organization.find().lean(),
      users: await User.find().select('-password').lean(),
      mapData: await MapData.find().lean(),
      auditLogs: await AuditLog.find().lean(),
      documents: await Document.find().lean(),
    };

    console.log('[v0] ✅ Backup created successfully');
    return backup;
  } catch (error) {
    console.error('[v0] Backup error:', error);
    throw new Error(`Backup failed: ${error.message}`);
  }
};

export const restoreBackup = async (backup) => {
  try {
    console.log('[v0] Restoring database from backup...');

    // Clear existing data
    await Promise.all([
      Fisherfolk.deleteMany({}),
      Boat.deleteMany({}),
      Gear.deleteMany({}),
      Organization.deleteMany({}),
      MapData.deleteMany({}),
      Document.deleteMany({}),
    ]);

    // Restore data
    if (backup.fisherfolk.length > 0) {
      await Fisherfolk.insertMany(backup.fisherfolk);
    }
    if (backup.boats.length > 0) {
      await Boat.insertMany(backup.boats);
    }
    if (backup.gears.length > 0) {
      await Gear.insertMany(backup.gears);
    }
    if (backup.organizations.length > 0) {
      await Organization.insertMany(backup.organizations);
    }
    if (backup.mapData.length > 0) {
      await MapData.insertMany(backup.mapData);
    }
    if (backup.documents.length > 0) {
      await Document.insertMany(backup.documents);
    }

    console.log('[v0] ✅ Backup restored successfully');
    return {
      success: true,
      message: 'Backup restored successfully',
      restoredAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[v0] Restore error:', error);
    throw new Error(`Restore failed: ${error.message}`);
  }
};

export const getBackupSize = async (backup) => {
  try {
    const size = JSON.stringify(backup).length;
    const sizeInMB = (size / 1024 / 1024).toFixed(2);
    return {
      bytes: size,
      mb: sizeInMB,
    };
  } catch (error) {
    console.error('[v0] Error calculating backup size:', error);
    return null;
  }
};

export const getBackupSummary = (backup) => {
  return {
    timestamp: backup.timestamp,
    collections: {
      fisherfolk: backup.fisherfolk.length,
      boats: backup.boats.length,
      gears: backup.gears.length,
      organizations: backup.organizations.length,
      users: backup.users.length,
      mapData: backup.mapData.length,
      auditLogs: backup.auditLogs.length,
      documents: backup.documents.length,
    },
    totalRecords:
      backup.fisherfolk.length +
      backup.boats.length +
      backup.gears.length +
      backup.organizations.length +
      backup.users.length +
      backup.mapData.length +
      backup.auditLogs.length +
      backup.documents.length,
  };
};
