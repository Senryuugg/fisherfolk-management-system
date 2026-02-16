import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
  try {
    console.log('[v0] Starting MongoDB diagnosis...\n');
    console.log('[v0] Connection string:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[v0] ✓ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('[v0] Collections in database:');
    console.log(collections.map(c => c.name));
    console.log();

    // Check users collection
    if (collections.some(c => c.name === 'users')) {
      console.log('[v0] Found users collection!');
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log('[v0] Number of users:', userCount);
      
      const users = await usersCollection.find({}).toArray();
      console.log('[v0] User documents:');
      users.forEach((user, i) => {
        console.log(`\nUser ${i + 1}:`);
        console.log('  username:', user.username);
        console.log('  email:', user.email);
        console.log('  password:', user.password ? user.password.substring(0, 20) + '...' : 'NO PASSWORD');
        console.log('  fields:', Object.keys(user));
      });
    } else {
      console.log('[v0] ❌ NO users collection found!');
      console.log('[v0] Available collections:', collections.map(c => c.name).join(', '));
    }

    await mongoose.disconnect();
    console.log('\n[v0] Diagnosis complete');
    
  } catch (error) {
    console.error('[v0] ❌ Error:', error.message);
    process.exit(1);
  }
}

diagnose();
