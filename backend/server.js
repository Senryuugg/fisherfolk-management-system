import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { isGCSEnabled } from './utils/gcs.js';
import { startRenewalCron } from './utils/renewalCron.js';
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
import auditLogsRoutes from './routes/auditLogs.js';
import approvalsRoutes from './routes/approvals.js';

// dotenv is loaded via --import ./env.js (see package.json scripts)
// No need to call dotenv.config() here — env vars are already populated.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Trigger GCS initialization at startup
isGCSEnabled();

// Start renewal expiry cron
startRenewalCron();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('ERROR: MONGODB_URI not set in .env file.');
  process.exit(1);
}

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

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
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/approvals', approvalsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
