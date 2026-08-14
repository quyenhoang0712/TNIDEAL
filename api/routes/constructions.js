import express from 'express';

export default function createConstructionRouter({ Construction, requireAuth, writeActivity }) {
  const router = express.Router();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const query = req.user.role === 'admin' ? {} : { contractorId: req.user._id };
      res.json(await Construction.find(query).sort({ createdAt: -1 }));
    } catch (error) { next(error); }
  });

  router.post('/', requireAuth, async (req, res, next) => {
    try {
      if (req.user.role !== 'contractor') return res.status(403).json({ message: 'Chỉ tài khoản thầu được tạo công trình' });
      const name = String(req.body.name || '').trim();
      const existing = await Construction.findOne({ contractorId: req.user._id, name });
      if (existing) return res.json(existing);
      const count = await Construction.countDocuments();
      const construction = await Construction.create({ ...req.body, code: `CT${String(count + 1).padStart(3, '0')}`, contractorId: req.user._id, contractorName: req.user.displayName || req.user.username });
      await writeActivity(req.user, 'Tạo công trình', 'construction', construction.name, construction.code);
      return res.status(201).json(construction);
    } catch (error) { return next(error); }
  });

  return router;
}
