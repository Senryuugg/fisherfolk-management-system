# MongoDB CSV Import Guide

This guide explains how to import your CSV data (Fisherfolk, Boats, and Gears) into MongoDB for the Fisherfolk Management System.

## Prerequisites

1. **Node.js** installed (v14 or higher)
2. **MongoDB** running (local or MongoDB Atlas)
3. **Backend dependencies** installed (`npm install` in `/backend`)
4. **CSV files** in `/backend/data/`:
   - `fisherfolk.csv` - Active fisherfolk information
   - `boats_ncr.csv` - Boats data for NCR
   - `gears.csv` - Gears/fishing equipment data

## CSV File Structure

### Fisherfolk CSV
Headers required:
- `Registration Number` - Unique registration ID
- `RSBSA Number` - Bureau registration number
- `Registration Date` - Date of registration
- `First Name`, `Middle Name`, `Last Name` - Name fields
- `Appellation` - Additional name info
- `Birth Date`, `Birth Place` - Birth information
- `Contact Number` - Phone number
- `Gender` - M or F
- `Region`, `Province`, `City/Municipality`, `Barangay` - Location

### Boats CSV
Headers required:
- `MFBR NO.` - Unique boat registration
- `FR NO.` - Fisherfolk registration reference
- `BOAT NAME` - Name of the boat
- `FISHERFOLK` - Fisherfolk name
- `DATE OF REGISTRATION` - Registration date
- `FISHING GEARS` - Type of gears used
- `YEAR BUILT` - Year boat was built
- `MATERIAL USED` - Construction material
- `ENGINE MAKE`, `SECOND ENGINE MAKE` - Engine details
- `GROSS TONNAGE`, `NET TONNAGE` - Tonnage measurements
- `BOAT TYPE` - Motorized/Non-Motorized
- `PROVINCE`, `CITY/MUNICIPALITY`, `BARANGAY` - Location
- `STATUS` - Active/Inactive

### Gears CSV
Headers required:
- `NO.` - Row number
- `FISHERFOLK` - Fisherfolk name
- `FR NO.` - Fisherfolk registration
- `MFBR NO.` - Gear registration
- `GEAR CLASSIFICATION` - Type of fishing gear
- `DATE OF REGISTRATION` - Registration date
- `PROVINCE`, `CITY/MUNICIPALITY` - Location

## Setup Instructions

### Step 1: Set MongoDB Connection String

Update `/backend/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/fisherfolk-management
```

Or for MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fisherfolk-management?retryWrites=true&w=majority
```

### Step 2: Install csv-parse Package

The import script requires the `csv-parse` package:

```bash
cd backend
npm install csv-parse
```

### Step 3: Run the Import Script

From the backend directory, run:

```bash
node scripts/importCSVToMongoDB.js
```

**Expected Output:**
```
🚀 Starting CSV import to MongoDB...

✅ MongoDB connected successfully
📥 Importing Fisherfolk data...
   ✓ Imported 50 fisherfolk records...
   ✓ Imported 100 fisherfolk records...
✅ Fisherfolk import complete: 250 imported, 0 skipped

📥 Importing Boats data...
   ✓ Imported 50 boat records...
   ✓ Imported 100 boat records...
✅ Boats import complete: 173 imported, 0 skipped

📥 Importing Gears data...
   ✓ Imported 50 gear records...
   ✓ Imported 100 gear records...
✅ Gears import complete: 180 imported, 0 skipped

==================================================
📊 Import Summary:
==================================================
✅ Fisherfolk Records: 250
✅ Boats Records: 173
✅ Gears Records: 180
⏱️ Total Time: 12.45s
==================================================
```

## Database Schema

### Fisherfolk Collection
```javascript
{
  _id: ObjectId,
  registrationNumber: String (unique),
  rsbsaNumber: String,
  registrationDate: Date,
  firstName: String,
  middleName: String,
  lastName: String,
  appellation: String,
  birthDate: Date,
  birthPlace: String,
  contactNumber: String,
  gender: String,
  region: String,
  province: String,
  cityMunicipality: String,
  barangay: String,
  boats: [ObjectId],  // References to Boat documents
  gears: [String],    // List of gear types
  status: String,     // 'active' or 'inactive'
  createdAt: Date,
  updatedAt: Date
}
```

### Boats Collection
```javascript
{
  _id: ObjectId,
  mfbrNumber: String (unique),
  frNumber: String,
  boatName: String,
  fisherfolk: String,
  registrationDate: Date,
  fishingGears: String,
  yearBuilt: Number,
  materialUsed: String,
  engineMake: String,
  secondEngineMake: String,
  grossTonnage: Number,
  netTonnage: Number,
  boatType: String,
  province: String,
  cityMunicipality: String,
  barangay: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Gears Collection
```javascript
{
  _id: ObjectId,
  mfbrNumber: String (unique),
  frNumber: String,
  fisherfolk: String,
  gearClassification: String,
  registrationDate: Date,
  province: String,
  cityMunicipality: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Verification

After import, verify the data using MongoDB commands:

### Check Counts
```bash
# From MongoDB shell or Compass
db.fisherfolks.countDocuments()   // Should show 250
db.boats.countDocuments()         // Should show 173
db.gears.countDocuments()         // Should show 180
```

### Check Sample Records
```bash
db.fisherfolks.findOne()
db.boats.findOne()
db.gears.findOne()
```

## API Endpoints After Import

### Fisherfolk
- `GET /api/fisherfolk` - Get all fisherfolk
- `GET /api/fisherfolk/:id` - Get single fisherfolk
- `POST /api/fisherfolk` - Create new fisherfolk
- `PUT /api/fisherfolk/:id` - Update fisherfolk
- `DELETE /api/fisherfolk/:id` - Delete fisherfolk

### Boats
- `GET /api/boats` - Get all boats
- `GET /api/boats/:id` - Get single boat
- `POST /api/boats` - Create new boat
- `PUT /api/boats/:id` - Update boat
- `DELETE /api/boats/:id` - Delete boat

### Gears
- `GET /api/gears` - Get all gears
- `GET /api/gears/:id` - Get single gear
- `POST /api/gears` - Create new gear
- `PUT /api/gears/:id` - Update gear
- `DELETE /api/gears/:id` - Delete gear
- `GET /api/gears/stats/summary` - Get gear statistics

## Troubleshooting

### Import Fails with "csv-parse not found"
```bash
npm install csv-parse
```

### MongoDB Connection Error
- Check `.env` file has `MONGODB_URI` set
- Verify MongoDB is running
- Test connection string in MongoDB Compass

### Duplicate Key Error
The script automatically skips duplicate records. If you need to re-import:
- Drop the collections: `db.fisherfolks.deleteMany({})`, etc.
- Or use different collection names temporarily

### Date Format Issues
The script handles various date formats. If dates don't import correctly:
- Check date format in CSV (should be YYYY-MM-DD)
- Manually fix problematic records

## Notes

- Import is idempotent - running multiple times won't create duplicates
- Records are marked as 'active' by default
- Unique constraints are on: `registrationNumber` (Fisherfolk), `mfbrNumber` (Boats), `mfbrNumber` (Gears)
- All timestamp fields are automatically managed by MongoDB
