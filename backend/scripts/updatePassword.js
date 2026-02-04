import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  fullName: String,
  department: String,
  region: String,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model('User', userSchema);

async function updatePassword() {
  try {
    console.log('[v0] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmc');
    console.log('[v0] Connected!');

    const plainPassword = 'admin123';
    const hashedPassword = await bcryptjs.hash(plainPassword, 10);

    console.log('[v0] Plain password:', plainPassword);
    console.log('[v0] Hashed password:', hashedPassword);

    const result = await User.updateOne(
      { username: 'admin' },
      { password: hashedPassword }
    );

    console.log('[v0] Update result:', result);
    console.log('[v0] ✓ Password updated successfully!');
    console.log('[v0] Now try logging in with:');
    console.log('[v0]   Username: admin');
    console.log('[v0]   Password: admin123');

    await mongoose.connection.close();
  } catch (error) {
    console.error('[v0] Error:', error.message);
    process.exit(1);
  }
}

updatePassword();
