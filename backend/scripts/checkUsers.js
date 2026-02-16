import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('[v0] Connecting to MongoDB...');
console.log('[v0] URI:', process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('[v0] Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('[v0] Collections found:', collections.map(c => c.name));

    // Check users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const allUsers = await usersCollection.find({}).toArray();

    console.log('[v0] Total users in collection:', allUsers.length);
    console.log('[v0] Users:', JSON.stringify(allUsers, null, 2));

    process.exit(0);
  })
  .catch(err => {
    console.error('[v0] Connection error:', err.message);
    process.exit(1);
  });
