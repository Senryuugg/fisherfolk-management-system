import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function hashAllPasswords() {
  try {
    console.log('[v0] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmc');
    console.log('[v0] Connected!');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users
    const users = await usersCollection.find({}).toArray();
    console.log(`[v0] Found ${users.length} users`);

    for (const user of users) {
      // Skip if already hashed
      if (user.password && user.password.startsWith('$2')) {
        console.log(`[v0] User "${user.username}" already hashed, skipping`);
        continue;
      }

      // Hash the plain text password
      const plainPassword = user.password;
      const hashedPassword = await bcryptjs.hash(plainPassword, 10);

      // Update in database
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );

      console.log(`[v0] ✓ Hashed password for "${user.username}"`);
    }

    console.log('[v0] All passwords hashed successfully!');
    console.log('[v0] Try logging in now');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  }
}

hashAllPasswords();
