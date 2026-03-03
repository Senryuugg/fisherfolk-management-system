import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * ROLES — ABAC + PBAC Hybrid
 *
 * admin          : Full system access, all resources, all operations.
 * bfar_supervisor: BFAR dept — full data CRUD, manage users, approve/reject, audit log.
 * bfar_viewer    : BFAR dept — read-only across all data; cannot write or manage users.
 * lgu_supervisor : LGU dept  — CRUD within their city, approve/reject LGU editors, manage LGU users.
 * lgu_editor     : LGU dept  — create/edit within their city (submissions go to approval queue).
 */
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'bfar_supervisor', 'bfar_viewer', 'lgu_supervisor', 'lgu_editor'],
      default: 'lgu_editor',
    },
    fullName: { type: String, required: true },
    department: { type: String, enum: ['bfar', 'lgu', 'admin'] },
    city: String,
    region: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
