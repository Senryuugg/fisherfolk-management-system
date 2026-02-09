# MongoDB Setup Guide

Your fisherfolk management system is fully configured to use MongoDB with Mongoose ODM.

## Prerequisites

1. **MongoDB Atlas Account** (Cloud) or **MongoDB Local Installation**
2. **Node.js 14+** installed
3. **npm** or **yarn**

## Setup Instructions

### Option 1: MongoDB Atlas (Recommended - Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project and cluster
4. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Drivers"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)

5. Update `.env` file in `/backend`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fisherfolk?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=production
   ```

### Option 2: MongoDB Local Installation

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use the local connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/fisherfolk
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   NODE_ENV=development
   ```

## Starting the Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

   The server will connect to MongoDB and start on port 5000.

## Database Collections

The system automatically creates these collections:

- **users** - Stores user accounts with authentication
- **fisherfolks** - Stores fisherfolk records
- **boats** - Stores boat information linked to fisherfolk
- **organizations** - Stores organization data

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user

### Fisherfolk Management
- `GET /api/fisherfolk` - Get all fisherfolk (with filters)
- `GET /api/fisherfolk/:id` - Get single fisherfolk
- `POST /api/fisherfolk` - Create new fisherfolk
- `PUT /api/fisherfolk/:id` - Update fisherfolk
- `DELETE /api/fisherfolk/:id` - Delete fisherfolk

### Organization Management
- `GET /api/organization` - Get all organizations
- `GET /api/organization/:id` - Get single organization
- `POST /api/organization` - Create new organization
- `PUT /api/organization/:id` - Update organization
- `DELETE /api/organization/:id` - Delete organization

### Boats Management
- `GET /api/boats` - Get all boats
- `GET /api/boats/:id` - Get single boat
- `POST /api/boats` - Create new boat
- `PUT /api/boats/:id` - Update boat
- `DELETE /api/boats/:id` - Delete boat

## Data Models

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  role: String (admin, officer, viewer),
  department: String,
  region: String,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Fisherfolk Schema
```javascript
{
  rsbsaNumber: String (unique, required),
  registrationNumber: String,
  firstName: String (required),
  lastName: String (required),
  middleName: String,
  registrationDate: Date,
  province: String,
  cityMunicipality: String,
  barangay: String,
  mainLivelihood: String,
  alternativeLivelihood: String,
  boats: [ObjectId] (references to Boat),
  status: String (active, inactive),
  createdAt: Date,
  updatedAt: Date
}
```

### Boat Schema
```javascript
{
  frsNumber: String,
  mfbrNumber: String (unique, required),
  boatName: String (required),
  fisherfolkId: ObjectId (references Fisherfolk, required),
  address: String,
  registrationDate: Date,
  status: String (active, inactive),
  gears: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Organization Schema
```javascript
{
  name: String (unique, required),
  region: String (required),
  address: String,
  contactNumber: String,
  contactPerson: String,
  status: String (active, inactive),
  members: [ObjectId] (references to Fisherfolk),
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### MongoDB Connection Errors
- Check if MongoDB is running
- Verify connection string in `.env`
- Check MongoDB Atlas whitelist IP address

### Authentication Issues
- Ensure JWT_SECRET is set in `.env`
- Check if user exists in database
- Verify token is being sent in request headers

### Data Not Persisting
- Confirm MongoDB is connected (check server logs)
- Verify data is being sent correctly from frontend
- Check for validation errors in request

For more details, see the server logs when starting the backend.
