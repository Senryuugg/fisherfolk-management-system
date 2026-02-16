import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function testLogin() {
  try {
    console.log('[v0] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmc');
    console.log('[v0] Connected!');

    const testUsername = 'admin';
    const testPassword = 'admin123';

    console.log('\n[v0] === Testing Login ===');
    console.log(`[v0] Username: ${testUsername}`);
    console.log(`[v0] Password: ${testPassword}`);

    // Find user
    const user = await User.findOne({ username: testUsername });
    console.log(`\n[v0] User found: ${user ? 'YES' : 'NO'}`);

    if (user) {
      console.log(`[v0] User ID: ${user._id}`);
      console.log(`[v0] Stored password (first 30 chars): ${user.password.substring(0, 30)}...`);
      console.log(`[v0] Is hashed (starts with $2): ${user.password.startsWith('$2') ? 'YES' : 'NO'}`);

      // Test password comparison
      console.log(`\n[v0] === Testing Password Comparison ===`);
      const isValid = await bcryptjs.compare(testPassword, user.password);
      console.log(`[v0] Password "${testPassword}" matches: ${isValid ? 'YES' : 'NO'}`);

      if (!isValid) {
        console.log('[v0] Password does NOT match!');
        console.log('[v0] Password hash in DB does not match the plain text password provided');
      }
    } else {
      console.log('[v0] User not found in database');
      console.log('[v0] Available users:');
      const allUsers = await User.find({});
      allUsers.forEach(u => {
        console.log(`  - ${u.username}`);
      });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  }
}

testLogin();
