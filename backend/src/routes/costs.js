import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Construction from '../models/Construction.js';
import CostWorkspace from '../models/CostWorkspace.js';
import Workspace from '../models/Workspace.js';
import { writeActivity } from '../services/activityService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

function normalizeRecords(records, constructionId) {
  return (records || []).map((record) => ({
    ...record,
    constructionId: record.constructionId || constructionId || null
  }));
}

async function getOrMigrateCostWorkspace(contractorId) {
  const existing = await CostWorkspace.findOne({ contractorId });
  if (existing) return existing;

  const [legacy, constructions] = await Promise.all([
    Workspace.findOne({ contractorId }),
    Construction.find({ contractorId }).select('_id').limit(2)
  ]);
  const constructionId = constructions.length === 1 ? constructions[0]._id : null;

  return CostWorkspace.findOneAndUpdate(
    { contractorId },
    {
      $setOnInsert: {
        contractorId,
        expenses: normalizeRecords(legacy?.expenses, constructionId),
        laborCosts: normalizeRecords(legacy?.laborCosts, constructionId),
        migratedFromWorkspaceAt: legacy ? new Date() : null
      }
    },
    { new: true, upsert: true, runValidators: true }
  );
}

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') {
      return res.status(403).json({ message: 'Chi phí chỉ dành cho tài khoản thầu' });
    }
    return res.json(await getOrMigrateCostWorkspace(req.user._id));
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') {
      return res.status(403).json({ message: 'Chi phí chỉ dành cho tài khoản thầu' });
    }

    await getOrMigrateCostWorkspace(req.user._id);
    const allowed = ['expenses', 'laborCosts'];
    const updates = Object.fromEntries(
      allowed.filter((key) => Array.isArray(req.body[key])).map((key) => [key, req.body[key]])
    );
    const costWorkspace = await CostWorkspace.findOneAndUpdate(
      { contractorId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    await writeActivity(
      req.user,
      'Cập nhật chi phí công trình',
      'costs',
      'Chi phí',
      `${costWorkspace.expenses.length} khoản phát sinh`
    );
    return res.json(costWorkspace);
  })
);

export default router;
