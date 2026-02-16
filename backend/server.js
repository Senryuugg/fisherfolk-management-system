import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import fisherfolkRoutes from './routes/fisherfolk.js';
import organizationRoutes from './routes/organization.js';
import boatsRoutes from './routes/boats.js';
import gearsRoutes from './routes/gears.js';
import committeesRoutes from './routes/committees.js';
import officersRoutes from './routes/officers.js';
import ordinancesRoutes from './routes/ordinances.js';
import faqsRoutes from './routes/faqs.js';
import ticketsRoutes from './routes/tickets.js';
import developmentLevelsRoutes from './routes/developmentLevels.js';
import mapsRoutes from './routes/maps.js';
import reportsRoutes from './routes/reports.js';

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
app.use('/api/boats', boatsRoutes);
app.use('/api/gears', gearsRoutes);
app.use('/api/committees', committeesRoutes);
app.use('/api/officers', officersRoutes);
app.use('/api/ordinances', ordinancesRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/development-levels', developmentLevelsRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
