import Fisherfolk from '../models/Fisherfolk.js';
import Boat from '../models/Boat.js';
import Gear from '../models/Gear.js';
import Organization from '../models/Organization.js';
import Papa from 'papaparse';

// Export data as CSV
export const exportAsCSV = async (resource, filters = {}) => {
  try {
    let Model;
    let fields = [];

    switch (resource) {
      case 'fisherfolk':
        Model = Fisherfolk;
        fields = [
          '_id',
          'firstName',
          'lastName',
          'age',
          'email',
          'phone',
          'province',
          'cityMunicipality',
          'estimatedIncome',
          'registrationDate',
          'createdAt',
        ];
        break;
      case 'boats':
        Model = Boat;
        fields = ['_id', 'boatName', 'boatType', 'registrationNumber', 'owner', 'status', 'createdAt'];
        break;
      case 'gears':
        Model = Gear;
        fields = ['_id', 'gearType', 'quantity', 'condition', 'owner', 'createdAt'];
        break;
      case 'organization':
        Model = Organization;
        fields = ['_id', 'name', 'registrationNumber', 'category', 'members', 'createdAt'];
        break;
      default:
        throw new Error('Invalid resource type');
    }

    // Fetch data
    const data = await Model.find(filters).lean();

    // Create CSV
    const csv = Papa.unparse({
      fields,
      data: data.map(item => {
        const row = {};
        fields.forEach(field => {
          row[field] = item[field];
        });
        return row;
      }),
    });

    return csv;
  } catch (error) {
    console.error('[v0] Error exporting CSV:', error);
    throw error;
  }
};

// Import data from CSV
export const importFromCSV = async (resource, csvData, userId) => {
  try {
    const parsed = Papa.parse(csvData, { header: true });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parsing error: ${parsed.errors[0].message}`);
    }

    let Model;
    switch (resource) {
      case 'fisherfolk':
        Model = Fisherfolk;
        break;
      case 'boats':
        Model = Boat;
        break;
      case 'gears':
        Model = Gear;
        break;
      case 'organization':
        Model = Organization;
        break;
      default:
        throw new Error('Invalid resource type');
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: [],
    };

    // Import each row
    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i];

      // Skip empty rows
      if (Object.values(row).every(v => !v)) {
        continue;
      }

      try {
        // Validate required fields
        if (!row.firstName && resource === 'fisherfolk') {
          throw new Error('Missing firstName');
        }

        const doc = new Model(row);
        await doc.save();
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 2, // +2 for header and 0-index
          error: error.message,
          data: row,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('[v0] Error importing CSV:', error);
    throw error;
  }
};

// Export data as JSON
export const exportAsJSON = async (resource, filters = {}) => {
  try {
    let Model;
    switch (resource) {
      case 'fisherfolk':
        Model = Fisherfolk;
        break;
      case 'boats':
        Model = Boat;
        break;
      case 'gears':
        Model = Gear;
        break;
      case 'organization':
        Model = Organization;
        break;
      default:
        throw new Error('Invalid resource type');
    }

    const data = await Model.find(filters).lean();

    return JSON.stringify(
      {
        resource,
        exportDate: new Date(),
        totalRecords: data.length,
        data,
      },
      null,
      2
    );
  } catch (error) {
    console.error('[v0] Error exporting JSON:', error);
    throw error;
  }
};

// Batch import with validation
export const batchImport = async (resource, items, userId) => {
  try {
    let Model;
    switch (resource) {
      case 'fisherfolk':
        Model = Fisherfolk;
        break;
      case 'boats':
        Model = Boat;
        break;
      case 'gears':
        Model = Gear;
        break;
      case 'organization':
        Model = Organization;
        break;
      default:
        throw new Error('Invalid resource type');
    }

    const results = {
      imported: 0,
      failed: 0,
      errors: [],
    };

    // Use bulk operations for efficiency
    const bulkOps = items
      .filter(item => {
        // Basic validation
        return item && Object.keys(item).length > 0;
      })
      .map(item => ({
        insertOne: {
          document: item,
        },
      }));

    if (bulkOps.length > 0) {
      const bulkResult = await Model.collection.bulkWrite(bulkOps);
      results.imported = bulkResult.insertedCount;
    }

    return results;
  } catch (error) {
    console.error('[v0] Error in batch import:', error);
    throw error;
  }
};

export default {
  exportAsCSV,
  importFromCSV,
  exportAsJSON,
  batchImport,
};
