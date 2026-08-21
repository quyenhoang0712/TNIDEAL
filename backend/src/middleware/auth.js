import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

export async function requireAuth(req, res, next) {
  try {
    await connectDatabase();

    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) return res.status(401).json({ message: 'Please login first' });

    const user = await User.findById(decoded.id).select('username displayName role active');
    if (!user || user.active === false) {
      return res.status(401).json({ message: 'Invalid login session' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ quản trị viên được thực hiện thao tác này' });
  }
  return next();
}
