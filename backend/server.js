import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import fisherfolkRoutes from './routes/fisherfolk.js';
import organizationRoutes from './routes/organization.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
console.log('[v0] Checking MongoDB URI...');
console.log('[v0] MONGODB_URI is', mongoURI ? 'SET ✓' : 'NOT SET ✗');

if (!mongoURI) {
  console.error('❌ MONGODB_URI not found in .env file!');
  console.log('[v0] Make sure .env file exists in /backend folder with MONGODB_URI set');
  process.exit(1);
}

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('[v0] Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('[v0] Connection string:', mongoURI.substring(0, 30) + '...');
    console.log('[v0] Check if your MongoDB Atlas is running and connection string is correct');
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/fisherfolk', fisherfolkRoutes);
app.use('/api/organization', organizationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
