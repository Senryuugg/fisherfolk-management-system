/**
 * importFisherfolk.js
 *
 * Clears the fisherfolk collection and reimports from the three district CSVs.
 * Deduplicates by Registration Number before inserting.
 *
 * Usage (from backend/ folder):
 *   node --import ./env.js scripts/importFisherfolk.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import csv from 'csv-parser';
import Fisherfolk from '../models/Fisherfolk.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CSV files to import ──────────────────────────────────────────────────────
const CSV_FILES = [
  path.join(__dirname, '../data/fisherfolk-first-district.csv'),
  path.join(__dirname, '../data/fisherfolk-third-district.csv'),
  path.join(__dirname, '../data/fisherfolk-fourth-district.csv'),
];

// ─── Date parser ─────────────────────────────────────────────────────────────
// CSV dates are in YYYY-DD-MM format (e.g. 2026-06-02 means Feb 6 2026)
const parseCSVDate = (raw) => {
  if (!raw || !raw.trim()) return null;
  const parts = raw.trim().split('-');
  if (parts.length !== 3) return null;
  const [year, day, month] = parts;
  const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  return isNaN(d.getTime()) ? null : d;
};

// ─── Fix encoding issues (Ã±→ñ, Ã±→ñ, etc.) ──────────────────────────────────
const fixEncoding = (str) => {
  if (!str) return str;
  return str
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã\u0091/g, 'Ñ')
    .trim();
};

// ─── Read one CSV file into an array of records ───────────────────────────────
const readCSV = (filePath) =>
  new Promise((resolve, reject) => {
    const records = [];
    if (!fs.existsSync(filePath)) {
      console.warn(`  [WARN] File not found, skipping: ${filePath}`);
      return resolve([]);
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const regNum = (row['Registration Number'] || '').trim();
        if (!regNum) return; // skip blank rows

        records.push({
          rsbsaNumber:      regNum,
          registrationNumber: regNum,
          firstName:        fixEncoding((row['First Name'] || '').trim()),
          middleName:       fixEncoding((row['Middle Name'] || '').trim()),
          lastName:         fixEncoding((row['Last Name'] || '').trim()),
          registrationDate: parseCSVDate(row['Registration Date']),
          birthDate:        parseCSVDate(row['Birth Date']),
          gender:           (row['Gender'] || '').trim(),
          region:           fixEncoding((row['Region'] || '').trim()),
          province:         fixEncoding((row['Province'] || '').trim()),
          cityMunicipality: fixEncoding((row['City/Municipality'] || '').trim()),
          barangay:         fixEncoding((row['Barangay'] || '').trim()),
          mainLivelihood:   fixEncoding((row['Livelihood'] || '').trim()),
          alternativeLivelihood: fixEncoding((row['Livelihood Description'] || '').trim()),
          status: 'active',
        });
      })
      .on('end', () => resolve(records))
      .on('error', reject);
  });

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Read all three CSVs
  console.log('\nReading CSV files...');
  const allRecords = [];
  for (const file of CSV_FILES) {
    const records = await readCSV(file);
    console.log(`  ${path.basename(file)}: ${records.length} rows`);
    allRecords.push(...records);
  }
  console.log(`Total rows across all files: ${allRecords.length}`);

  // 2. Deduplicate by rsbsaNumber (Registration Number)
  const seen = new Set();
  const deduped = [];
  let dupCount = 0;
  for (const r of allRecords) {
    if (seen.has(r.rsbsaNumber)) {
      dupCount++;
    } else {
      seen.add(r.rsbsaNumber);
      deduped.push(r);
    }
  }
  console.log(`Duplicates removed: ${dupCount}`);
  console.log(`Unique records to insert: ${deduped.length}`);

  // 3. Clear existing fisherfolk collection only
  console.log('\nClearing fisherfolk collection...');
  try {
    await Fisherfolk.collection.drop();
    console.log('  Cleared.');
  } catch (err) {
    if (err.code === 26) console.log('  Collection did not exist yet, skipping drop.');
    else throw err;
  }

  // 4. Insert in batches of 500
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < deduped.length; i += BATCH) {
    const batch = deduped.slice(i, i + BATCH);
    await Fisherfolk.insertMany(batch, { ordered: false });
    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted} / ${deduped.length}...`);
  }

  console.log(`\n\nDone. ${inserted} fisherfolk records imported successfully.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
