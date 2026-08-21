import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Construction from '../models/Construction.js';
import { writeActivity } from '../services/activityService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = req.user.role === 'admin' ? {} : { contractorId: req.user._id };
    res.json(await Construction.find(query).sort({ createdAt: -1 }));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') {
      return res.status(403).json({ message: 'Chỉ tài khoản thầu được tạo công trình' });
    }

    const name = String(req.body.name || '').trim();
    const existing = await Construction.findOne({ contractorId: req.user._id, name });
    if (existing) return res.json(existing);

    const count = await Construction.countDocuments();
    const construction = await Construction.create({
      ...req.body,
      code: `CT${String(count + 1).padStart(3, '0')}`,
      contractorId: req.user._id,
      contractorName: req.user.displayName || req.user.username
    });
    await writeActivity(req.user, 'Tạo công trình', 'construction', construction.name, construction.code);
    return res.status(201).json(construction);
  })
);

export default router;
