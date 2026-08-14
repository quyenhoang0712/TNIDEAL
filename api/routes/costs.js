import express from 'express';

function normalizeRecords(records, constructionId) {
  return (records || []).map((record) => ({ ...record, constructionId: record.constructionId || constructionId || null }));
}

export async function getOrMigrateCostWorkspace({ contractorId, CostWorkspace, Workspace, Construction }) {
  const existing = await CostWorkspace.findOne({ contractorId });
  if (existing) return existing;

  const [legacy, constructions] = await Promise.all([
    Workspace.findOne({ contractorId }),
    Construction.find({ contractorId }).select('_id').limit(2)
  ]);
  const constructionId = constructions.length === 1 ? constructions[0]._id : null;
  return CostWorkspace.findOneAndUpdate(
    { contractorId },
    { $setOnInsert: {
      contractorId,
      expenses: normalizeRecords(legacy?.expenses, constructionId),
      laborCosts: normalizeRecords(legacy?.laborCosts, constructionId),
      migratedFromWorkspaceAt: legacy ? new Date() : null
    } },
    { new: true, upsert: true, runValidators: true }
  );
}

export default function createCostRouter({ CostWorkspace, Workspace, Construction, requireAuth, writeActivity }) {
  const router = express.Router();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      if (req.user.role !== 'contractor') return res.status(403).json({ message: 'Chi phí chỉ dành cho tài khoản thầu' });
      return res.json(await getOrMigrateCostWorkspace({ contractorId: req.user._id, CostWorkspace, Workspace, Construction }));
    } catch (error) { return next(error); }
  });

  router.put('/', requireAuth, async (req, res, next) => {
    try {
      if (req.user.role !== 'contractor') return res.status(403).json({ message: 'Chi phí chỉ dành cho tài khoản thầu' });
      await getOrMigrateCostWorkspace({ contractorId: req.user._id, CostWorkspace, Workspace, Construction });
      const allowed = ['expenses', 'laborCosts'];
      const updates = Object.fromEntries(allowed.filter((key) => Array.isArray(req.body[key])).map((key) => [key, req.body[key]]));
      const costWorkspace = await CostWorkspace.findOneAndUpdate(
        { contractorId: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
      );
      await writeActivity(req.user, 'Cập nhật chi phí công trình', 'costs', 'Chi phí', `${costWorkspace.expenses.length} khoản phát sinh`);
      return res.json(costWorkspace);
    } catch (error) { return next(error); }
  });

  return router;
}
