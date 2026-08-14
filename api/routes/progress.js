import express from 'express';

export default function createProgressRouter({ ProgressTask, Construction, requireAuth, writeActivity }) {
  const router = express.Router();

  async function contractorConstruction(req, constructionId) {
    if (!constructionId) return null;
    return Construction.findOne({ _id: constructionId, contractorId: req.user._id });
  }

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const query = req.user.role === 'admin' ? {} : { contractorId: req.user._id };
      if (req.query.constructionId) query.constructionId = req.query.constructionId;
      if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
      return res.json(await ProgressTask.find(query).sort({ createdAt: -1 }));
    } catch (error) { return next(error); }
  });

  router.post('/', requireAuth, async (req, res, next) => {
    try {
      if (req.user.role !== 'contractor') return res.status(403).json({ message: 'Chỉ tài khoản thầu được tạo công việc tiến độ' });
      const construction = await contractorConstruction(req, req.body.constructionId);
      if (!construction) return res.status(400).json({ message: 'Công trình không hợp lệ hoặc không thuộc tài khoản này' });
      const task = await ProgressTask.create({
        title: req.body.title,
        owner: req.body.owner,
        category: req.body.category,
        status: req.body.status,
        priority: req.body.priority,
        description: req.body.description,
        contractorId: req.user._id,
        constructionId: construction._id
      });
      await writeActivity(req.user, 'Tạo công việc tiến độ', 'progress', task.title, construction.code);
      return res.status(201).json(task);
    } catch (error) { return next(error); }
  });

  router.patch('/:id/status', requireAuth, async (req, res, next) => {
    try {
      if (req.user.role !== 'contractor') return res.status(403).json({ message: 'Chỉ tài khoản thầu phụ trách được cập nhật tiến độ' });
      if (!['planning', 'active', 'done'].includes(req.body.status)) return res.status(400).json({ message: 'Trạng thái tiến độ không hợp lệ' });
      const task = await ProgressTask.findOneAndUpdate(
        { _id: req.params.id, contractorId: req.user._id },
        { $set: { status: req.body.status } },
        { new: true, runValidators: true }
      );
      if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc tiến độ' });
      await writeActivity(req.user, 'Cập nhật tiến độ', 'progress', task.title, task.status);
      return res.json(task);
    } catch (error) { return next(error); }
  });

  router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ quản trị viên được xóa công việc tiến độ' });
      const task = await ProgressTask.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc tiến độ' });
      await writeActivity(req.user, 'Xóa công việc tiến độ', 'progress', task.title);
      return res.json({ message: 'Đã xóa công việc tiến độ' });
    } catch (error) { return next(error); }
  });

  return router;
}
