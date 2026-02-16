# MongoDB & CSV Import - Quick Start

## 🚀 Get Your Data into MongoDB in 3 Steps

### Step 1️⃣: Configure MongoDB Connection
Edit `/backend/.env`:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/fisherfolk-management?retryWrites=true&w=majority
```

### Step 2️⃣: Install Dependencies
```bash
cd backend
npm install csv-parse
```

### Step 3️⃣: Import Your CSV Data
```bash
node scripts/importCSVToMongoDB.js
```

## ✅ What Gets Imported

| Collection | Records | Source File |
|-----------|---------|------------|
| fisherfolks | 250+ | `fisherfolk.csv` |
| boats | 173+ | `boats_ncr.csv` |
| gears | 180+ | `gears.csv` |

## 📊 System Architecture

```
Frontend (React)
     ↓
API Service (Axios)
     ↓
Backend Server (Express)
     ↓
MongoDB Collections:
  ├── fisherfolks
  ├── boats
  └── gears
```

## 🔌 API Endpoints Available

### Fisherfolk Endpoints
```
GET    /api/fisherfolk           - Get all
POST   /api/fisherfolk           - Create
GET    /api/fisherfolk/:id       - Get one
PUT    /api/fisherfolk/:id       - Update
DELETE /api/fisherfolk/:id       - Delete
```

### Boats Endpoints
```
GET    /api/boats                - Get all
POST   /api/boats                - Create
GET    /api/boats/:id            - Get one
PUT    /api/boats/:id            - Update
DELETE /api/boats/:id            - Delete
```

### Gears Endpoints
```
GET    /api/gears                - Get all
POST   /api/gears                - Create
GET    /api/gears/:id            - Get one
PUT    /api/gears/:id            - Update
DELETE /api/gears/:id            - Delete
GET    /api/gears/stats/summary  - Statistics
```

## 📁 Files Modified/Created

### New Models
- `/backend/models/Gear.js` - Gear data model

### New Routes
- `/backend/routes/gears.js` - Gear API endpoints

### Scripts
- `/backend/scripts/importCSVToMongoDB.js` - CSV import script

### Documentation
- `/backend/CSV_MONGO_IMPORT_GUIDE.md` - Detailed import guide
- `/MONGODB_SETUP_QUICK_START.md` - This file

### Updated Files
- `/backend/models/Fisherfolk.js` - Enhanced with additional fields
- `/backend/models/Boat.js` - Updated to match CSV structure
- `/backend/server.js` - Added gears route
- `/frontend/src/services/api.js` - Added gears API calls

## 🔍 Verify Import Success

Check MongoDB:
```javascript
// Get counts
db.fisherfolks.countDocuments()  // ≥ 250
db.boats.countDocuments()        // ≥ 173
db.gears.countDocuments()        // ≥ 180

// View sample
db.fisherfolks.findOne()
```

## 📝 CSV File Locations

```
/backend/data/
├── fisherfolk.csv       (250+ records)
├── boats_ncr.csv        (173+ records)
└── gears.csv            (180+ records)
```

## 🎯 Next Steps

1. ✅ Configure MongoDB connection in `.env`
2. ✅ Run `npm install csv-parse` in backend
3. ✅ Execute import script
4. ✅ Start backend server: `npm start`
5. ✅ Access data via API or frontend

## 📚 Full Documentation

For detailed information, see: `/backend/CSV_MONGO_IMPORT_GUIDE.md`

## ❓ Common Issues

| Issue | Solution |
|-------|----------|
| `csv-parse not found` | Run `npm install csv-parse` |
| MongoDB connection error | Check `.env` MONGODB_URI |
| Duplicate key error | Script auto-skips duplicates |
| Dates not importing | Ensure CSV uses YYYY-MM-DD format |

## ✨ Features Now Available

✅ Store fisherfolk information (250+ records)
✅ Track boats and vessels (173+ records)
✅ Manage fishing gears (180+ records)
✅ Full CRUD operations on all entities
✅ Search and filter capabilities
✅ Statistics and reporting endpoints
✅ Persistent data storage in MongoDB
