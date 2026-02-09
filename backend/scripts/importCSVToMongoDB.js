import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import csv from 'csv-parse/sync';
import Fisherfolk from '../models/Fisherfolk.js';
import Boat from '../models/Boat.js';
import Gear from '../models/Gear.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fisherfolk-management';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Parse CSV files
const parseCSVFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return csv.parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
};

// Import Fisherfolk data
const importFisherfolk = async () => {
  try {
    console.log('\n📥 Importing Fisherfolk data...');
    const filePath = path.join(process.cwd(), 'backend/data/fisherfolk.csv');
    const records = parseCSVFile(filePath);

    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      try {
        // Check if record already exists
        const existingRecord = await Fisherfolk.findOne({
          registrationNumber: record['Registration Number'],
        });

        if (existingRecord) {
          skipped++;
          continue;
        }

        // Parse birth date
        let birthDate = null;
        if (record['Birth Date']) {
          const dateParts = record['Birth Date'].split('-');
          if (dateParts.length === 3) {
            birthDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
          }
        }

        const fisherfolkData = {
          registrationNumber: record['Registration Number'] || '',
          rsbsaNumber: record['RSBSA Number'] || '',
          registrationDate: record['Registration Date'] ? new Date(record['Registration Date']) : null,
          firstName: record['First Name'] || '',
          middleName: record['Middle Name'] || '',
          lastName: record['Last Name'] || '',
          appellation: record['Appellation'] || '',
          birthDate: birthDate,
          birthPlace: record['Birth Place'] || '',
          contactNumber: record['Contact Number'] || '',
          gender: record['Gender'] || '',
          region: record['Region'] || '',
          province: record['Province'] || '',
          cityMunicipality: record['City/Municipality'] || '',
          barangay: record['Barangay'] || '',
          status: 'active',
        };

        const newFisherfolk = new Fisherfolk(fisherfolkData);
        await newFisherfolk.save();
        imported++;

        if (imported % 50 === 0) {
          console.log(`   ✓ Imported ${imported} fisherfolk records...`);
        }
      } catch (error) {
        console.error(`   ⚠️ Error importing record: ${record['First Name']} ${record['Last Name']}:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Fisherfolk import complete: ${imported} imported, ${skipped} skipped`);
    return imported;
  } catch (error) {
    console.error('❌ Error importing fisherfolk:', error);
    return 0;
  }
};

// Import Boat data
const importBoats = async () => {
  try {
    console.log('\n📥 Importing Boats data...');
    const filePath = path.join(process.cwd(), 'backend/data/boats_ncr.csv');
    const records = parseCSVFile(filePath);

    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      try {
        // Check if boat already exists
        const existingBoat = await Boat.findOne({
          mfbrNumber: record['MFBR NO.'],
        });

        if (existingBoat) {
          skipped++;
          continue;
        }

        const boatData = {
          mfbrNumber: record['MFBR NO.'] || '',
          frNumber: record['FR NO.'] || '',
          boatName: record['BOAT NAME'] || '',
          fisherfolk: record['FISHERFOLK'] || '',
          registrationDate: record['DATE OF REGISTRATION'] ? new Date(record['DATE OF REGISTRATION']) : null,
          fishingGears: record['FISHING GEARS'] || '',
          yearBuilt: record['YEAR BUILT'] ? parseInt(record['YEAR BUILT']) : null,
          materialUsed: record['MATERIAL USED'] || '',
          engineMake: record['ENGINE MAKE'] || '',
          secondEngineMake: record['SECOND ENGINE MAKE'] || '',
          grossTonnage: record['GROSS TONNAGE'] ? parseFloat(record['GROSS TONNAGE']) : null,
          netTonnage: record['NET TONNAGE'] ? parseFloat(record['NET TONNAGE']) : null,
          boatType: record['BOAT TYPE'] || '',
          province: record['PROVINCE'] || '',
          cityMunicipality: record['CITY/MUNICIPALITY'] || '',
          barangay: record['BARANGAY'] || '',
          status: record['STATUS'] || 'active',
        };

        const newBoat = new Boat(boatData);
        await newBoat.save();
        imported++;

        if (imported % 50 === 0) {
          console.log(`   ✓ Imported ${imported} boat records...`);
        }
      } catch (error) {
        console.error(`   ⚠️ Error importing boat: ${record['BOAT NAME']}:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Boats import complete: ${imported} imported, ${skipped} skipped`);
    return imported;
  } catch (error) {
    console.error('❌ Error importing boats:', error);
    return 0;
  }
};

// Import Gears data
const importGears = async () => {
  try {
    console.log('\n📥 Importing Gears data...');
    const filePath = path.join(process.cwd(), 'backend/data/gears.csv');
    const records = parseCSVFile(filePath);

    let imported = 0;
    let skipped = 0;

    for (const record of records) {
      try {
        // Check if gear already exists
        const existingGear = await Gear.findOne({
          mfbrNumber: record['MFBR NO.'],
        });

        if (existingGear) {
          skipped++;
          continue;
        }

        const gearData = {
          mfbrNumber: record['MFBR NO.'] || '',
          frNumber: record['FR NO.'] || '',
          fisherfolk: record['FISHERFOLK'] || '',
          gearClassification: record['GEAR CLASSIFICATION'] || '',
          registrationDate: record['DATE OF REGISTRATION'] ? new Date(record['DATE OF REGISTRATION']) : null,
          province: record['PROVINCE'] || '',
          cityMunicipality: record['CITY/MUNICIPALITY'] || '',
          status: 'active',
        };

        const newGear = new Gear(gearData);
        await newGear.save();
        imported++;

        if (imported % 50 === 0) {
          console.log(`   ✓ Imported ${imported} gear records...`);
        }
      } catch (error) {
        console.error(`   ⚠️ Error importing gear: ${record['FISHERFOLK']}:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ Gears import complete: ${imported} imported, ${skipped} skipped`);
    return imported;
  } catch (error) {
    console.error('❌ Error importing gears:', error);
    return 0;
  }
};

// Main import function
const importAllData = async () => {
  console.log('🚀 Starting CSV import to MongoDB...\n');

  await connectDB();

  const startTime = Date.now();

  try {
    const fisherfolkCount = await importFisherfolk();
    const boatsCount = await importBoats();
    const gearsCount = await importGears();

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Fisherfolk Records: ${fisherfolkCount}`);
    console.log(`✅ Boats Records: ${boatsCount}`);
    console.log(`✅ Gears Records: ${gearsCount}`);
    console.log(`⏱️  Total Time: ${totalTime}s`);
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Run import
importAllData().catch(console.error);
