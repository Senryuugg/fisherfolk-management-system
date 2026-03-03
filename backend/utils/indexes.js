/**
 * Database indexing utility for performance optimization
 * Creates indexes on frequently queried fields
 */

import Fisherfolk from '../models/Fisherfolk.js';
import Boat from '../models/Boat.js';
import Gear from '../models/Gear.js';
import Organization from '../models/Organization.js';
import MapData from '../models/MapData.js';
import AuditLog from '../models/AuditLog.js';
import Document from '../models/Document.js';

export const createIndexes = async () => {
  try {
    console.log('[v0] Creating database indexes for performance...');

    // Fisherfolk indexes
    await Fisherfolk.collection.createIndex({ email: 1 });
    await Fisherfolk.collection.createIndex({ province: 1, cityMunicipality: 1 });
    await Fisherfolk.collection.createIndex({ registrationDate: -1 });
    await Fisherfolk.collection.createIndex({ status: 1 });

    // Boat indexes
    await Boat.collection.createIndex({ owner: 1 });
    await Boat.collection.createIndex({ boatType: 1 });
    await Boat.collection.createIndex({ registrationNumber: 1 }, { unique: true });
    await Boat.collection.createIndex({ status: 1 });

    // Gear indexes
    await Gear.collection.createIndex({ owner: 1 });
    await Gear.collection.createIndex({ gearType: 1 });
    await Gear.collection.createIndex({ condition: 1 });

    // Organization indexes
    await Organization.collection.createIndex({ registrationNumber: 1 }, { unique: true });
    await Organization.collection.createIndex({ category: 1 });
    await Organization.collection.createIndex({ lguCode: 1 });

    // MapData geospatial indexes
    await MapData.collection.createIndex({ 'coordinates.0': 1, 'coordinates.1': 1 });
    await MapData.collection.createIndex({ layerType: 1 });

    // AuditLog indexes for efficient queries
    await AuditLog.collection.createIndex({ userId: 1, createdAt: -1 });
    await AuditLog.collection.createIndex({ action: 1 });
    await AuditLog.collection.createIndex({ resource: 1 });
    await AuditLog.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

    // Document indexes
    await Document.collection.createIndex({ createdBy: 1, createdAt: -1 });
    await Document.collection.createIndex({ resourceType: 1, resourceId: 1 });
    await Document.collection.createIndex({ fileName: 'text', description: 'text' }); // Full-text search

    console.log('[v0] ✅ All database indexes created successfully');
  } catch (error) {
    if (error.code === 85) {
      // Index already exists
      console.log('[v0] Indexes already exist, skipping creation');
    } else {
      console.error('[v0] Error creating indexes:', error.message);
    }
  }
};

export const dropAllIndexes = async () => {
  try {
    console.log('[v0] Dropping all indexes...');
    await Fisherfolk.collection.dropAllIndexes();
    await Boat.collection.dropAllIndexes();
    await Gear.collection.dropAllIndexes();
    await Organization.collection.dropAllIndexes();
    await MapData.collection.dropAllIndexes();
    await AuditLog.collection.dropAllIndexes();
    await Document.collection.dropAllIndexes();
    console.log('[v0] All indexes dropped');
  } catch (error) {
    console.error('[v0] Error dropping indexes:', error.message);
  }
};
