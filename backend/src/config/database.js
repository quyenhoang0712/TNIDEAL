import mongoose from 'mongoose';
import './env.js';
import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';

let cachedConnection = null;
let adminSeeded = false;

async function seedAdminUser() {
  if (adminSeeded) return;

  const existingAdmin = await User.findOne({ username: 'admin' });
  if (!existingAdmin) {
    await User.create({
      username: 'admin',
      displayName: 'Admin',
      passwordHash: hashPassword('admin123'),
      role: 'admin'
    });
  } else if (!existingAdmin.displayName) {
    existingAdmin.displayName = 'Admin';
    await existingAdmin.save();
  }

  adminSeeded = true;
}

export async function connectDatabase() {
  if (cachedConnection) {
    await seedAdminUser();
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined
  });

  await seedAdminUser();
  return cachedConnection;
}
