import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function hashExistingPasswords() {
  try {
    console.log('[v0] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[v0] Connected to MongoDB');

    // Find all users with plain text passwords
    const users = await User.find({});
    console.log(`[v0] Found ${users.length} users`);

    let hashedCount = 0;

    for (const user of users) {
      // Check if password is already hashed (starts with $2a or $2b)
      if (!user.password.startsWith('$2a') && !user.password.startsWith('$2b')) {
        console.log(`[v0] Hashing password for user: ${user.username}`);
        
        // Hash the plain text password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(user.password, salt);
        
        // Update user with hashed password
        user.password = hashedPassword;
        await user.save();
        hashedCount++;
        
        console.log(`[v0] ✓ Hashed password for: ${user.username}`);
      } else {
        console.log(`[v0] Password already hashed for: ${user.username}`);
      }
    }

    console.log(`[v0] Migration complete! Hashed ${hashedCount} passwords`);
    process.exit(0);
  } catch (error) {
    console.error('[v0] Error during password hashing:', error.message);
    process.exit(1);
  }
}

hashExistingPasswords();
