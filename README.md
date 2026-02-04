# FARMC Database System - MERN Stack

A comprehensive Fisheries and Aquatic Resources Management Councils (FARMC) Database System built with MongoDB, Express, React, and Node.js.

## Project Structure

```
farmc-system/
├── backend/          # Express server + MongoDB
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   ├── middleware/   # Auth & validation
│   └── server.js     # Main server file
├── frontend/         # React application
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   ├── context/  # React context (Auth)
│   │   ├── services/ # API service
│   │   ├── styles/   # CSS files
│   │   └── App.jsx   # Main app component
│   └── index.html    # HTML entry
└── README.md
```

## Features

### Authentication & Security
- User registration and login with JWT tokens
- Role-based access control (admin, officer, viewer)
- Password hashing with bcryptjs
- Protected routes

### Core Modules
- **Fisherfolk Management** - Register and track fisherfolk with search filters
- **Boat & Gears** - Manage registered vessels and fishing equipment
- **Organizations** - Handle fishing organizations and their members
- **Reports** - Livelihood and statistical reports with filters
- **Maps** - Geographical visualization of fishing areas
- **Help Desk** - Support section for users
- **FAQs** - Frequently asked questions
- **Account Management** - User profile and settings

### Dashboard
- Statistics cards with key metrics
- Data visualization with charts (ready for Chart.js integration)
- Quick access navigation

## Prerequisites

- **Node.js** (v16+)
- **MongoDB** (local or cloud service like MongoDB Atlas)
- **npm** or **yarn**

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
# MONGODB_URI=mongodb://localhost:27017/farmc
# JWT_SECRET=your_super_secret_key_here
# PORT=5000

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Fisherfolk
- `GET /api/fisherfolk` - Get all fisherfolk (with filters)
- `GET /api/fisherfolk/:id` - Get single fisherfolk
- `POST /api/fisherfolk` - Create fisherfolk
- `PUT /api/fisherfolk/:id` - Update fisherfolk
- `DELETE /api/fisherfolk/:id` - Delete fisherfolk

### Organizations
- `GET /api/organization` - Get all organizations
- `GET /api/organization/:id` - Get single organization
- `POST /api/organization` - Create organization
- `PUT /api/organization/:id` - Update organization
- `DELETE /api/organization/:id` - Delete organization

## Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  fullName: String,
  role: String (admin/officer/viewer),
  department: String,
  region: String,
  active: Boolean,
  timestamps
}
```

### Fisherfolk
```javascript
{
  rsbsaNumber: String (unique),
  firstName: String,
  lastName: String,
  middleName: String,
  registrationDate: Date,
  province: String,
  cityMunicipality: String,
  barangay: String,
  mainLivelihood: String,
  alternativeLivelihood: String,
  boats: [ObjectId],
  status: String (active/inactive),
  timestamps
}
```

### Organization
```javascript
{
  name: String (unique),
  region: String,
  address: String,
  contactNumber: String,
  contactPerson: String,
  status: String (active/inactive),
  members: [ObjectId],
  timestamps
}
```

## Default Test Credentials

Once you create a user via registration, use those credentials to login.

### Quick Registration Example
```javascript
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@farmc.gov.ph",
  "password": "password123",
  "fullName": "Administrator",
  "department": "BFAR",
  "region": "NCR",
  "role": "admin"
}
```

## Development Guide

### Adding New Pages

1. Create a new component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Update sidebar menu in `frontend/src/components/Sidebar.jsx`

### Adding New Features

1. Create API route in `backend/routes/`
2. Create corresponding Mongoose model in `backend/models/`
3. Build React components in `frontend/src/pages/` or `frontend/src/components/`
4. Add API calls using `frontend/src/services/api.js`

## Styling

The application uses CSS with a consistent color scheme:
- Primary Blue: `#1a3a4a`
- Light Blue: `#b3e5fc`, `#81d4fa`
- Accent Blue: `#4a9eff`
- Neutral: Grays from `#f9f9f9` to `#333`

## Next Steps

1. **Connect MongoDB** - Set up MongoDB locally or use MongoDB Atlas
2. **Create first user** - Register via the registration endpoint
3. **Test API** - Use Postman or similar tool to test endpoints
4. **Build remaining pages** - Report, Fisherfolk List, Maps, etc.
5. **Integrate charts** - Add Chart.js visualizations to dashboard
6. **Deploy** - Deploy backend to Heroku/Railway and frontend to Vercel/Netlify

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in backend `.env`
- For MongoDB Atlas, verify IP whitelist and connection string

### CORS Issues
- Backend CORS is configured for `localhost:3000`
- Update if frontend runs on different port

### Token Expiration
- Tokens expire after 7 days
- Users need to login again after expiration

## License

Government of the Philippines - Department of Agriculture

---

**Questions?** Contact BFAR for support.
