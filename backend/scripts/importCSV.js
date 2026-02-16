import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import csv from 'csv-parser';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Fisherfolk from '../models/Fisherfolk.js';
import Boat from '../models/Boat.js';
import Organization from '../models/Organization.js';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importCSV() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data to avoid duplicates
    console.log('Clearing existing data...');
    try {
      await User.collection.drop();
    } catch (err) {
      if (err.code !== 26) throw err; // 26 = namespace not found (collection doesn't exist yet)
    }
    try {
      await Organization.collection.drop();
    } catch (err) {
      if (err.code !== 26) throw err;
    }
    try {
      await Fisherfolk.collection.drop();
    } catch (err) {
      if (err.code !== 26) throw err;
    }
    try {
      await Boat.collection.drop();
    } catch (err) {
      if (err.code !== 26) throw err;
    }
    console.log('✓ Cleared existing data');

    // Import Users
    console.log('Importing users...');
    const users = [];
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(path.join(__dirname, '../data/users.csv'))
        .pipe(csv());
      
      stream.on('data', (row) => {
        stream.pause();
        bcrypt.hash(row.password, 10).then((hashedPassword) => {
          users.push({
            username: row.username,
            email: row.email,
            password: hashedPassword,
            role: row.role,
            fullName: row.fullName,
            department: row.department,
            region: row.region,
            active: row.active === 'true'
          });
          stream.resume();
        }).catch(reject);
      })
      .on('end', resolve)
      .on('error', reject);
    });
    
    if (users.length > 0) {
      await User.insertMany(users);
    }
    console.log(`✓ Imported ${users.length} users`);

    // Import Organizations
    console.log('Importing organizations...');
    const orgs = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../data/organizations.csv'))
        .pipe(csv())
        .on('data', (row) => {
          orgs.push({
            name: row.name,
            region: row.region,
            address: row.address,
            contactNumber: row.contactNumber,
            contactPerson: row.contactPerson,
            status: row.status
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    if (orgs.length > 0) {
      await Organization.insertMany(orgs);
    }
    console.log(`✓ Imported ${orgs.length} organizations`);

    // Import Fisherfolk
    console.log('Importing fisherfolk...');
    const fisherfolks = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../data/fisherfolks.csv'))
        .pipe(csv())
        .on('data', (row) => {
          fisherfolks.push({
            rsbsaNumber: row.rsbsaNumber,
            registrationNumber: row.registrationNumber,
            firstName: row.firstName,
            lastName: row.lastName,
            middleName: row.middleName,
            registrationDate: new Date(row.registrationDate),
            province: row.province,
            cityMunicipality: row.cityMunicipality,
            barangay: row.barangay,
            mainLivelihood: row.mainLivelihood,
            alternativeLivelihood: row.alternativeLivelihood,
            status: row.status
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    if (fisherfolks.length > 0) {
      await Fisherfolk.insertMany(fisherfolks);
    }
    console.log(`✓ Imported ${fisherfolks.length} fisherfolk`);

    // Import Boats
    console.log('Importing boats...');
    
    // Get all fisherfolk to associate with boats
    const allFisherfolk = await Fisherfolk.find().select('_id');
    const fisherfolkIds = allFisherfolk.map(f => f._id);
    
    console.log(`[v0] Found ${fisherfolkIds.length} fisherfolk to associate with boats`);
    
    if (fisherfolkIds.length === 0) {
      console.log('⚠ No fisherfolk found. Skipping boat import.');
      console.log(`✓ Imported 0 boats`);
    } else {
      const boats = [];
      let boatIndex = 0;
      await new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '../data/boats.csv'))
          .pipe(csv())
          .on('data', (row) => {
            // Cycle through fisherfolk to associate each boat with a fisherfolk
            const fisherfolkId = fisherfolkIds[boatIndex % fisherfolkIds.length];
            
            if (!fisherfolkId) {
              console.log(`[v0] ERROR: fisherfolkId is undefined for boat ${boatIndex}`);
            }
            
            boats.push({
              frsNumber: row.frsNumber,
              mfbrNumber: row.mfbrNumber,
              boatName: row.boatName,
              fisherfolkId: fisherfolkId,
              address: row.address,
              registrationDate: new Date(row.registrationDate),
              status: row.status,
              gears: row.gears ? row.gears.split('|').filter(g => g.trim()) : []
            });
            boatIndex++;
          })
          .on('end', () => {
            console.log(`[v0] Finished reading ${boatIndex} boats from CSV`);
            resolve();
          })
          .on('error', reject);
      });
      if (boats.length > 0) {
        console.log(`[v0] Inserting ${boats.length} boats`);
        await Boat.insertMany(boats);
      }
      console.log(`✓ Imported ${boats.length} boats`);
    }

    console.log('\n✅ All data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing CSV:', error);
    process.exit(1);
  }
}

importCSV().catch(console.error);
