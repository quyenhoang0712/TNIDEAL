import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Construction from '../models/Construction.js';
import MaterialWorkspace, { DEFAULT_MATERIAL_DEFINITIONS } from '../models/MaterialWorkspace.js';
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

async function getOrMigrateMaterialWorkspace(contractorId) {
  const existing = await MaterialWorkspace.findOne({ contractorId });
  if (existing) return existing;

  const [legacy, constructions] = await Promise.all([
    Workspace.findOne({ contractorId }),
    Construction.find({ contractorId }).select('_id').limit(2)
  ]);
  const constructionId = constructions.length === 1 ? constructions[0]._id : null;

  return MaterialWorkspace.findOneAndUpdate(
    { contractorId },
    {
      $setOnInsert: {
        contractorId,
        materialDefinitions: DEFAULT_MATERIAL_DEFINITIONS,
        materialTransactions: normalizeRecords(legacy?.materialTransactions, constructionId),
        purchaseRequests: normalizeRecords(legacy?.purchaseRequests, constructionId),
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
      return res.status(403).json({ message: 'Kho vật tư chỉ dành cho tài khoản thầu' });
    }
    return res.json(await getOrMigrateMaterialWorkspace(req.user._id));
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') {
      return res.status(403).json({ message: 'Kho vật tư chỉ dành cho tài khoản thầu' });
    }

    await getOrMigrateMaterialWorkspace(req.user._id);
    const allowed = ['materialDefinitions', 'materialTransactions', 'purchaseRequests'];
    const updates = Object.fromEntries(
      allowed.filter((key) => Array.isArray(req.body[key])).map((key) => [key, req.body[key]])
    );
    const materialWorkspace = await MaterialWorkspace.findOneAndUpdate(
      { contractorId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    await writeActivity(
      req.user,
      'Cập nhật kho vật tư',
      'materials',
      'Kho vật tư',
      `${materialWorkspace.materialTransactions.length} giao dịch`
    );
    return res.json(materialWorkspace);
  })
);

export default router;
