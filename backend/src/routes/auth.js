import express from 'express';
import { connectDatabase } from '../config/database.js';
import { rolePermissions } from '../config/permissions.js';
import User from '../models/User.js';
import { writeActivity } from '../services/activityService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword, isStrongPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/token.js';

const router = express.Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    await connectDatabase();
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ username });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }
    if (user.active === false) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên' });
    }
    if (!rolePermissions[user.role]) {
      return res.status(403).json({ message: 'This account role is no longer supported' });
    }

    user.lastLoginAt = new Date();
    await user.save();
    await writeActivity(user, 'Đăng nhập hệ thống', 'account', user.username);

    return res.json({
      token: signToken(user),
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    });
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    await connectDatabase();
    const username = String(req.body.username || '').trim().toLowerCase();
    const displayName = String(req.body.displayName || '').trim();
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must have at least 3 characters' });
    }
    if (displayName.length < 2) {
      return res.status(400).json({ message: 'Display name must have at least 2 characters' });
    }
    if (password.length < 8 || !isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must have at least 8 characters, 1 uppercase letter, 1 number and 1 special character'
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password confirmation does not match' });
    }
    if (await User.findOne({ username })) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const user = await User.create({
      username,
      displayName,
      phone: String(req.body.phone || '').trim(),
      email: String(req.body.email || '').trim().toLowerCase(),
      passwordHash: hashPassword(password),
      role: 'contractor'
    });
    await writeActivity(user, 'Tạo tài khoản', 'account', username);

    return res.status(201).json({
      token: signToken(user),
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    });
  })
);

export default router;
