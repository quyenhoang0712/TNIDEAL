import express from 'express';
import mongoose from 'mongoose';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';
import Construction from '../models/Construction.js';
import CostWorkspace from '../models/CostWorkspace.js';
import MaterialWorkspace from '../models/MaterialWorkspace.js';
import ProgressTask from '../models/ProgressTask.js';
import SystemSettings from '../models/SystemSettings.js';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import { writeActivity } from '../services/activityService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashPassword, isStrongPassword } from '../utils/password.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get(
  '/constructions',
  asyncHandler(async (_req, res) => {
    const constructions = await Construction.find().sort({ createdAt: -1 });
    res.json(constructions);
  })
);

router.get(
  '/contractors/:id/workspace',
  asyncHandler(async (req, res) => {
    const progressQuery = { contractorId: req.params.id };
    if (req.query.constructionId) progressQuery.constructionId = req.query.constructionId;

    const [contractor, workspace, materialWorkspace, costWorkspace, jobs] = await Promise.all([
      User.findById(req.params.id).select('-passwordHash'),
      Workspace.findOne({ contractorId: req.params.id }),
      MaterialWorkspace.findOne({ contractorId: req.params.id }),
      CostWorkspace.findOne({ contractorId: req.params.id }),
      ProgressTask.find(progressQuery).sort({ createdAt: -1 })
    ]);

    if (!contractor || contractor.role !== 'contractor') {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu nhà thầu' });
    }

    const workspaceData = workspace?.toObject() || {
      expenses: [],
      diaries: [],
      constructionTeams: [],
      laborCosts: [],
      projectFiles: []
    };
    workspaceData.materialTransactions = materialWorkspace?.materialTransactions || workspaceData.materialTransactions || [];
    workspaceData.purchaseRequests = materialWorkspace?.purchaseRequests || workspaceData.purchaseRequests || [];
    workspaceData.expenses = costWorkspace?.expenses || workspaceData.expenses || [];
    workspaceData.laborCosts = costWorkspace?.laborCosts || workspaceData.laborCosts || [];

    return res.json({ contractor, workspace: workspaceData, jobs });
  })
);

router.post(
  '/constructions/import',
  asyncHandler(async (req, res) => {
    const contractor = await User.findById(req.body.contractorId).select('username displayName role');
    if (!contractor || contractor.role !== 'contractor') {
      return res.status(400).json({ message: 'Không tìm thấy tài khoản thầu của công trình cũ' });
    }

    const name = String(req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Công trình cũ thiếu tên' });

    const existing = await Construction.findOne({ contractorId: contractor._id, name });
    if (existing) return res.json(existing);

    const count = await Construction.countDocuments();
    const construction = await Construction.create({
      ...req.body,
      code: `CT${String(count + 1).padStart(3, '0')}`,
      contractorId: contractor._id,
      contractorName: contractor.displayName || contractor.username,
      status: 'planning'
    });
    await writeActivity(req.user, 'Khôi phục công trình cũ', 'construction', construction.name, construction.code);
    return res.status(201).json(construction);
  })
);

router.patch(
  '/constructions/:id',
  asyncHandler(async (req, res) => {
    const construction = await Construction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!construction) return res.status(404).json({ message: 'Không tìm thấy công trình' });

    await writeActivity(req.user, 'Cập nhật công trình', 'construction', construction.name, construction.status);
    return res.json(construction);
  })
);

router.delete(
  '/constructions/:id',
  asyncHandler(async (req, res) => {
    const construction = await Construction.findByIdAndDelete(req.params.id);
    if (!construction) return res.status(404).json({ message: 'Không tìm thấy công trình' });

    await writeActivity(req.user, 'Xóa công trình lỗi', 'construction', construction.name, construction.code);
    return res.json({ message: 'Đã xóa công trình' });
  })
);

router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  })
);

router.post(
  '/users',
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim().toLowerCase();
    const displayName = String(req.body.displayName || '').trim();
    const phone = String(req.body.phone || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = req.body.role === 'admin' ? 'admin' : 'contractor';

    if (username.length < 3 || displayName.length < 2) {
      return res.status(400).json({ message: 'Thông tin tài khoản chưa hợp lệ' });
    }
    if (password.length < 8 || !isStrongPassword(password)) {
      return res.status(400).json({ message: 'Mật khẩu cần ít nhất 8 ký tự, chữ hoa, số và ký tự đặc biệt' });
    }

    const user = await User.create({
      username,
      displayName,
      phone,
      email,
      passwordHash: hashPassword(password),
      role,
      active: true
    });
    await writeActivity(req.user, 'Tạo tài khoản thầu', 'account', displayName, username);

    return res.status(201).json({
      id: user._id,
      username,
      displayName,
      phone,
      email,
      role,
      active: true,
      createdAt: user.createdAt
    });
  })
);

router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (
      req.params.id === req.user._id.toString() &&
      (req.body.active === false || (req.body.role && req.body.role !== 'admin'))
    ) {
      return res.status(400).json({ message: 'Không thể khóa hoặc hạ quyền tài khoản đang đăng nhập' });
    }

    const updates = {};
    if (typeof req.body.displayName === 'string') updates.displayName = req.body.displayName.trim();
    if (typeof req.body.phone === 'string') updates.phone = req.body.phone.trim();
    if (typeof req.body.email === 'string') updates.email = req.body.email.trim().toLowerCase();
    if (['admin', 'contractor'].includes(req.body.role)) updates.role = req.body.role;
    if (typeof req.body.active === 'boolean') updates.active = req.body.active;
    if (req.body.password) {
      if (String(req.body.password).length < 8 || !isStrongPassword(String(req.body.password))) {
        return res.status(400).json({ message: 'Mật khẩu mới chưa đủ mạnh' });
      }
      updates.passwordHash = hashPassword(String(req.body.password));
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    await writeActivity(
      req.user,
      'Cập nhật tài khoản thầu',
      'account',
      user.displayName,
      Object.keys(updates)
        .filter((key) => key !== 'passwordHash')
        .join(', ')
    );
    return res.json(user);
  })
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    await writeActivity(req.user, 'Xóa tài khoản thầu', 'account', user.displayName, user.username);
    return res.json({ message: 'Đã xóa tài khoản' });
  })
);

router.get(
  '/activity',
  asyncHandler(async (req, res) => {
    const query = req.query.actorRole ? { actorRole: req.query.actorRole } : {};
    const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  })
);

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const settings = await SystemSettings.findOneAndUpdate(
      { key: 'general' },
      { $setOnInsert: { key: 'general' } },
      { new: true, upsert: true }
    );
    res.json(settings);
  })
);

router.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const updates = {
      companyName: String(req.body.companyName || 'TN Ideal').trim(),
      supportEmail: String(req.body.supportEmail || '').trim(),
      loginAlerts: req.body.loginAlerts !== false
    };
    if (typeof req.body.logo === 'string') updates.logo = req.body.logo;

    const settings = await SystemSettings.findOneAndUpdate(
      { key: 'general' },
      { $set: updates },
      { new: true, upsert: true }
    );
    await writeActivity(req.user, 'Cập nhật cài đặt hệ thống', 'settings', settings.companyName);
    return res.json(settings);
  })
);

router.get(
  '/system',
  asyncHandler(async (_req, res) => {
    const startedAt = Date.now();
    await mongoose.connection.db.admin().ping();
    const [users, projects, constructions] = await Promise.all([
      User.countDocuments(),
      ProgressTask.countDocuments(),
      Construction.countDocuments()
    ]);
    res.json({
      api: 'online',
      database: 'connected',
      responseTime: Date.now() - startedAt,
      users,
      projects,
      constructions,
      environment: process.env.VERCEL ? 'Vercel' : 'Local',
      checkedAt: new Date()
    });
  })
);

export default router;
