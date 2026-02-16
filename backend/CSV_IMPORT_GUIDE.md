# CSV Data Import Guide

This guide explains how to import sample data from CSV files into your MongoDB database.

## CSV Files Available

The following CSV files are in the `/backend/data/` folder:

### 1. **users.csv** - User Accounts
Columns: `username`, `email`, `password`, `role`, `fullName`, `department`, `region`, `active`

**Example:**
```csv
username,email,password,role,fullName,department,region,active
admin,admin@farmc.gov.ph,Admin123!,admin,John Doe,BFAR-NCR,NCR,true
officer1,officer1@farmc.gov.ph,Officer123!,officer,Maria Santos,BFAR-NCR,NCR,true
```

**Roles:** `admin`, `officer`, `viewer`

---

### 2. **fisherfolks.csv** - Fisherfolk Registration Data
Columns: `rsbsaNumber`, `registrationNumber`, `firstName`, `lastName`, `middleName`, `registrationDate`, `province`, `cityMunicipality`, `barangay`, `mainLivelihood`, `alternativeLivelihood`, `status`

**Example:**
```csv
rsbsaNumber,registrationNumber,firstName,lastName,middleName,registrationDate,province,cityMunicipality,barangay,mainLivelihood,alternativeLivelihood,status
i26-1339013000-004,REG-001-2026,Pabie,Manahon,Casañares,2026-01-23,NCR,City of Manila,Port Area,Marine Capture,Trading,active
```

---

### 3. **boats.csv** - Boats and Fishing Gears
Columns: `frsNumber`, `mfbrNumber`, `boatName`, `address`, `registrationDate`, `status`, `gears`

**Note:** Gears are pipe-separated (|)

**Example:**
```csv
frsNumber,mfbrNumber,boatName,address,registrationDate,status,gears
FRS-001,MFBR-2024-001,Lucky Catch,Manila Harbor NCR,2026-01-23,active,Hook and Line|Net|Trap
```

---

### 4. **organizations.csv** - Fishing Organizations
Columns: `name`, `region`, `address`, `contactNumber`, `contactPerson`, `status`

**Example:**
```csv
name,region,address,contactNumber,contactPerson,status
Wakat Community-based Resource Management People's Organization,NCR,Manila NCR,02-8234-5678,Juan dela Cruz,active
```

---

## How to Import Data

### Step 1: Install CSV Parser
```bash
cd backend
npm install csv-parser
```

### Step 2: Run the Import Script
```bash
npm run import
```

You should see output like:
```
Connected to MongoDB
Importing users...
✓ Imported 4 users
Importing organizations...
✓ Imported 8 organizations
Importing fisherfolk...
✓ Imported 6 fisherfolk
Importing boats...
✓ Imported 6 boats

✅ All data imported successfully!
```

---

## Adding Your Own Data

### To Add More Users:
Edit `/backend/data/users.csv` and add new rows:
```csv
username,email,password,role,fullName,department,region,active
newuser,newuser@farmc.gov.ph,Password123!,officer,New Officer,BFAR-Region,Region 2,true
```

### To Add More Fisherfolk:
Edit `/backend/data/fisherfolks.csv`:
```csv
rsbsaNumber,registrationNumber,firstName,lastName,middleName,registrationDate,province,cityMunicipality,barangay,mainLivelihood,alternativeLivelihood,status
i26-NEW-001,REG-NEW-001,Juan,Dela Cruz,Santos,2026-02-01,Region 1,Dagupan,Peñarubia,Marine Capture,Aquaculture,active
```

### To Add More Boats:
Edit `/backend/data/boats.csv`:
```csv
frsNumber,mfbrNumber,boatName,address,registrationDate,status,gears
FRS-NEW,MFBR-NEW-001,New Boat,New Port,2026-02-01,active,Hook and Line|Gillnet
```

### To Add More Organizations:
Edit `/backend/data/organizations.csv`:
```csv
name,region,address,contactNumber,contactPerson,status
New Organization,NCR,New Address,02-XXXX-XXXX,Contact Name,active
```

---

## Verify Import in MongoDB Compass

After running the import script:

1. Open **MongoDB Compass**
2. Connect to your database
3. Navigate to the `farmc` database
4. You should see 4 collections:
   - `users` (with your imported accounts)
   - `fisherfolks` (with fisher records)
   - `boats` (with boat/gear data)
   - `organizations` (with organization data)

---

## Reset Database (Delete All Data)

If you need to start fresh:

```bash
# Delete all collections manually in MongoDB Compass
# Right-click on collection → Delete Collection

# Or connect to your database and run:
db.users.deleteMany({})
db.fisherfolks.deleteMany({})
db.boats.deleteMany({})
db.organizations.deleteMany({})
```

Then run the import again.

---

## Password Notes

- Passwords in CSV are in plain text
- The import script automatically hashes them using bcrypt
- Passwords are never stored as plain text in the database
- Minimum password: 6 characters

---

## Date Format

Use ISO format for dates: `YYYY-MM-DD`

Example: `2026-01-23`

---

## Questions?

Refer to the main README.md for complete API documentation and system setup.
