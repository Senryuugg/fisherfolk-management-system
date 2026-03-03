import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmc_db';

async function updateRoles() {
  try {
    console.log('[v0] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[v0] Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Update any users with 'officer' role to 'lgu'
    const result = await usersCollection.updateMany(
      { role: 'officer' },
      { $set: { role: 'lgu' } }
    );

    console.log('[v0] Updated users with officer role:', result.modifiedCount);

    // Count users by role
    const adminCount = await usersCollection.countDocuments({ role: 'admin' });
    const lguCount = await usersCollection.countDocuments({ role: 'lgu' });
    const viewerCount = await usersCollection.countDocuments({ role: 'viewer' });

    console.log('[v0] Current user counts:');
    console.log('[v0] - Admin:', adminCount);
    console.log('[v0] - LGU:', lguCount);
    console.log('[v0] - Viewer:', viewerCount);

    await mongoose.connection.close();
    console.log('[v0] Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Migration error:', error);
    process.exit(1);
  }
}

updateRoles();
