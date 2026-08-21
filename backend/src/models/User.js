import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minlength: 3
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'contractor'],
      default: 'contractor'
    },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
