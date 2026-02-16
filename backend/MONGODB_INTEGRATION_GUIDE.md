# MongoDB Integration Guide - Fisherfolk Management System

Your system is fully integrated with MongoDB for data persistence. This guide explains how to use it.

## System Architecture

```
Frontend (React/Vite)
    ↓ (HTTP Requests with JWT)
Express Backend (Node.js)
    ↓ (Mongoose ODM)
MongoDB Database
```

## Data Flow Examples

### Example 1: Creating a New Fisherfolk Record

**Frontend (FisherfolkList.jsx):**
```javascript
import { fisherfolkAPI } from '../services/api.js';

const createFisherfolk = async (data) => {
  try {
    const response = await fisherfolkAPI.create({
      rsbsaNumber: 'RSBSA-2024-001',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      province: 'Manila',
      cityMunicipality: 'Manila City',
      barangay: 'Tondo',
      mainLivelihood: 'Fishing',
      status: 'active'
    });
    console.log('Fisherfolk created:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

**What happens in the backend:**
1. Request arrives at `/api/fisherfolk` POST endpoint
2. Authentication middleware verifies JWT token
3. Mongoose creates new document in `fisherfolks` collection
4. MongoDB stores the data with auto-generated `_id` and timestamps
5. Response returns with MongoDB ObjectId

**MongoDB storage:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  rsbsaNumber: 'RSBSA-2024-001',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  province: 'Manila',
  cityMunicipality: 'Manila City',
  barangay: 'Tondo',
  mainLivelihood: 'Fishing',
  status: 'active',
  boats: [],
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

### Example 2: Retrieving Filtered Fisherfolk

**Frontend:**
```javascript
const getFisherfolk = async () => {
  try {
    // Get all active fisherfolk in Manila
    const response = await fisherfolkAPI.getAll({
      province: 'Manila',
      status: 'active'
    });
    console.log('Results:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

**Backend Query (routes/fisherfolk.js):**
```javascript
// Constructs MongoDB query
let query = {};
if (province) query.province = province;
if (status) query.status = status;

// Executes: db.fisherfolks.find({ province: 'Manila', status: 'active' })
const fisherfolk = await Fisherfolk.find(query).populate('boats');
```

**Response:**
```json
[
  {
    _id: "507f1f77bcf86cd799439011",
    rsbsaNumber: "RSBSA-2024-001",
    firstName: "Juan",
    lastName: "Dela Cruz",
    boats: [],
    status: "active"
  }
]
```

### Example 3: Creating a Boat for a Fisherfolk

**Frontend (BoatsGears.jsx):**
```javascript
import { boatsAPI } from '../services/api.js';

const createBoat = async (fisherfolkId) => {
  try {
    const response = await boatsAPI.create({
      boatName: 'Mary Jane',
      mfbrNumber: 'MFBR-2024-001',
      fisherfolkId: fisherfolkId, // Link to fisherfolk
      registrationDate: new Date(),
      status: 'active',
      gears: ['Net', 'Fishing Rod']
    });
    console.log('Boat created:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

**What happens in the backend (routes/boats.js):**
1. Creates new boat document in `boats` collection
2. Automatically adds boat ObjectId to the fisherfolk's `boats` array
3. Maintains referential integrity between collections

**MongoDB storage after boat creation:**

Boats collection:
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  boatName: 'Mary Jane',
  mfbrNumber: 'MFBR-2024-001',
  fisherfolkId: ObjectId("507f1f77bcf86cd799439011"),
  gears: ['Net', 'Fishing Rod'],
  status: 'active',
  createdAt: ISODate("2024-01-15T10:35:00Z"),
  updatedAt: ISODate("2024-01-15T10:35:00Z")
}
```

Fisherfolks collection (updated):
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  firstName: 'Juan',
  boats: [ObjectId("507f1f77bcf86cd799439012")],
  // ... other fields
}
```

### Example 4: Retrieving Fisherfolk with Boats (Population)

**Frontend:**
```javascript
const getFisherfolkWithBoats = async (fisherfolkId) => {
  try {
    const response = await fisherfolkAPI.getById(fisherfolkId);
    // boats array is populated with full boat objects
    console.log('Boats:', response.data.boats);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

**Backend (using Mongoose .populate()):**
```javascript
// This joins the boats data
const fisherfolk = await Fisherfolk.findById(fisherfolkId).populate('boats');
```

**Response:**
```json
{
  _id: "507f1f77bcf86cd799439011",
  firstName: "Juan",
  boats: [
    {
      _id: "507f1f77bcf86cd799439012",
      boatName: "Mary Jane",
      mfbrNumber: "MFBR-2024-001",
      gears: ["Net", "Fishing Rod"],
      status: "active"
    }
  ]
}
```

## Common MongoDB Operations in the Code

### Read Operations
```javascript
// Get all documents
Fisherfolk.find({})

// Get with filters
Fisherfolk.find({ province: 'Manila', status: 'active' })

// Get single document
Fisherfolk.findById(id)

// Search with regex (case-insensitive)
Fisherfolk.find({ 
  firstName: { $regex: 'juan', $options: 'i' } 
})
```

### Write Operations
```javascript
// Create
const fisherfolk = new Fisherfolk(data);
await fisherfolk.save();

// Update
await Fisherfolk.findByIdAndUpdate(id, data, { new: true })

// Delete
await Fisherfolk.findByIdAndDelete(id)
```

### Array Operations
```javascript
// Add to array
await Fisherfolk.findByIdAndUpdate(
  fisherfolkId,
  { $push: { boats: boatId } }
)

// Remove from array
await Fisherfolk.findByIdAndUpdate(
  fisherfolkId,
  { $pull: { boats: boatId } }
)
```

### Relationship Operations
```javascript
// Populate references (JOIN)
await Fisherfolk.findById(id).populate('boats')

// Populate with field selection
await Boat.findById(id).populate('fisherfolkId', 'firstName lastName')
```

## Authentication Flow with MongoDB

1. **Register User:**
   - Frontend sends username, password, email
   - Backend hashes password with bcrypt
   - Stores user in MongoDB `users` collection
   - Returns JWT token

2. **Login User:**
   - Frontend sends username and password
   - Backend finds user in MongoDB
   - Compares hashed password
   - Returns JWT token on success

3. **Authenticated Requests:**
   - Frontend includes JWT token in Authorization header
   - Backend middleware verifies token
   - Request proceeds to protected routes

## Error Handling

The system includes error handling for:

**Unique Constraint Violations:**
```javascript
// Trying to create duplicate username
try {
  await User.save(); // Will fail if username exists
} catch (error) {
  res.status(400).json({ message: 'User already exists' });
}
```

**Reference Errors:**
```javascript
// Invalid fisherfolkId when creating boat
try {
  const boat = new Boat({ fisherfolkId: 'invalid-id' });
  // MongoDB will catch this during validation
} catch (error) {
  res.status(400).json({ message: 'Invalid fisherfolk ID' });
}
```

## Performance Tips

1. **Use Indexes:** MongoDB auto-indexes `_id` and unique fields
2. **Limit Results:** Use `.limit()` to prevent large responses
3. **Select Fields:** Only fetch needed fields when possible
4. **Batch Operations:** For bulk updates, consider batch operations
5. **Monitor Queries:** Check MongoDB Atlas for slow queries

## Monitoring

Monitor your database through:
- **MongoDB Atlas Dashboard:** Real-time metrics and analytics
- **Server Logs:** Check console.log statements for query timing
- **Browser DevTools:** Network tab shows API response times

## Backing Up Your Data

**MongoDB Atlas Automatic Backups:**
- Enable in cluster settings
- Snapshots taken every 6 hours
- Retained for 35 days

**Manual Export:**
```bash
mongoexport --uri "mongodb+srv://user:pass@cluster.mongodb.net/fisherfolk" \
  --collection fisherfolks --out fisherfolks.json
```

## Troubleshooting Common Issues

### Issue: "MongoServerError: E11000 duplicate key error"
**Cause:** Trying to insert duplicate unique field
**Solution:** Check if record exists before creating

### Issue: "Cast to ObjectId failed"
**Cause:** Invalid ObjectId format in request
**Solution:** Validate ID format before using

### Issue: "Cannot read property 'populate' of null"
**Cause:** Referenced document doesn't exist
**Solution:** Ensure parent document exists before linking

## Next Steps

1. Set up MongoDB Atlas cluster with proper security
2. Configure environment variables with connection string
3. Test all API endpoints with Postman or similar tool
4. Set up automated backups
5. Monitor database performance

For more information, visit:
- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
