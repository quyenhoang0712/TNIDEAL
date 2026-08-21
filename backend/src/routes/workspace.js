import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Workspace from '../models/Workspace.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
const PROJECT_FILE_GROUPS = new Set(['Bản vẽ', 'Hợp đồng', 'Pháp lý / tài liệu khác']);
const MAX_PDF_FILE_SIZE = 2 * 1024 * 1024;
const MAX_PDF_TOTAL_SIZE = 6 * 1024 * 1024;

function sanitizeProjectFiles(groups) {
  let totalSize = 0;
  const sanitizedGroups = [];

  for (const group of groups) {
    if (!PROJECT_FILE_GROUPS.has(group?.group) || !Array.isArray(group.files)) {
      return { error: 'Nhóm hồ sơ PDF không hợp lệ', status: 400 };
    }

    const files = [];
    for (const file of group.files) {
      const base64 = typeof file?.url === 'string'
        ? file.url.match(/^data:application\/pdf;base64,(.+)$/)?.[1]
        : null;
      const name = typeof file?.name === 'string' ? file.name.trim() : '';
      if (!base64 || !name.toLowerCase().endsWith('.pdf') || name.length > 180) {
        return { error: 'Chỉ chấp nhận hồ sơ PDF hợp lệ', status: 400 };
      }

      const size = Buffer.byteLength(base64, 'base64');
      if (size > MAX_PDF_FILE_SIZE) {
        return { error: `${name} vượt quá giới hạn 2 MB`, status: 413 };
      }

      totalSize += size;
      if (totalSize > MAX_PDF_TOTAL_SIZE) {
        return { error: 'Tổng dung lượng hồ sơ PDF vượt quá giới hạn 6 MB', status: 413 };
      }

      files.push({
        id: String(file.id || ''),
        name,
        type: 'application/pdf',
        size,
        url: file.url,
        uploadedAt: file.uploadedAt || new Date().toISOString()
      });
    }

    sanitizedGroups.push({ group: group.group, files });
  }

  return { data: sanitizedGroups };
}

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') {
      return res.status(403).json({ message: 'Workspace chỉ dành cho tài khoản thầu' });
    }
    const workspace = await Workspace.findOne({ contractorId: req.user._id });
    return res.json(workspace || {
      materialTransactions: [],
      purchaseRequests: [],
      expenses: [],
      diaries: [],
      constructionTeams: [],
      projectFiles: []
    });
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') {
      return res.status(403).json({ message: 'Workspace chỉ dành cho tài khoản thầu' });
    }
    const allowed = ['diaries', 'constructionTeams', 'projectFiles'];
    const invalidArray = allowed.find((key) => key in req.body && !Array.isArray(req.body[key]));
    if (invalidArray) {
      return res.status(400).json({ message: `${invalidArray} phải là một mảng` });
    }

    const updates = Object.fromEntries(
      allowed.filter((key) => Array.isArray(req.body[key])).map((key) => [key, req.body[key]])
    );
    if (updates.projectFiles) {
      const result = sanitizeProjectFiles(updates.projectFiles);
      if (result.error) return res.status(result.status).json({ message: result.error });
      updates.projectFiles = result.data;
    }

    const workspace = await Workspace.findOneAndUpdate(
      { contractorId: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    return res.json(workspace);
  })
);

export default router;
