const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Fisherfolk = require('../models/Fisherfolk');
const Boat = require('../models/Boat');
const Organization = require('../models/Organization');

async function importCSV() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import Users
    console.log('Importing users...');
    const users = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../data/users.csv'))
        .pipe(csv())
        .on('data', async (row) => {
          const hashedPassword = await bcrypt.hash(row.password, 10);
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
        })
        .on('end', resolve)
        .on('error', reject);
    });
    await User.insertMany(users);
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
    await Organization.insertMany(orgs);
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
    await Fisherfolk.insertMany(fisherfolks);
    console.log(`✓ Imported ${fisherfolks.length} fisherfolk`);

    // Import Boats
    console.log('Importing boats...');
    const boats = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, '../data/boats.csv'))
        .pipe(csv())
        .on('data', (row) => {
          boats.push({
            frsNumber: row.frsNumber,
            mfbrNumber: row.mfbrNumber,
            boatName: row.boatName,
            address: row.address,
            registrationDate: new Date(row.registrationDate),
            status: row.status,
            gears: row.gears.split('|')
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });
    await Boat.insertMany(boats);
    console.log(`✓ Imported ${boats.length} boats`);

    console.log('\n✅ All data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing CSV:', error);
    process.exit(1);
  }
}

importCSV();
