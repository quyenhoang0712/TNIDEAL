import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const AUTH_SECRET = process.env.AUTH_SECRET || 'tnideal-local-secret';

app.use(cors());
app.use(express.json());

const rolePermissions = {
  admin: {
    create: false,
    updateStatus: true,
    delete: true
  },
  contractor: {
    create: true,
    updateStatus: true,
    delete: false
  }
};

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3
    },
    owner: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'done'],
      default: 'planning'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

const constructionSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true, trim: true },
  investorName: { type: String, required: true, trim: true },
  investorPhone: { type: String, default: '' },
  type: { type: String, default: 'house' },
  location: { type: String, default: '' },
  fullAddress: { type: String, default: '' },
  provinceCity: { type: String, default: '' },
  wardCommune: { type: String, default: '' },
  startDate: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  landLength: { type: Number, default: 0 },
  landWidth: { type: Number, default: 0 },
  upperFloors: { type: Number, default: 0 },
  hasBasement: { type: Boolean, default: false },
  status: { type: String, enum: ['planning', 'active', 'paused', 'done'], default: 'planning' },
  hidden: { type: Boolean, default: false },
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contractorName: { type: String, required: true }
}, { timestamps: true });

const Construction = mongoose.models.Construction || mongoose.model('Construction', constructionSchema);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minlength: 3
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'contractor'],
      default: 'contractor'
    },
    active: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

const activityLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorName: { type: String, required: true },
  actorRole: { type: String, enum: ['admin', 'contractor'], required: true },
  action: { type: String, required: true },
  targetType: { type: String, default: 'system' },
  targetName: { type: String, default: '' },
  details: { type: String, default: '' }
}, { timestamps: true });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

const workspaceSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  materialTransactions: { type: [mongoose.Schema.Types.Mixed], default: [] },
  purchaseRequests: { type: [mongoose.Schema.Types.Mixed], default: [] },
  expenses: { type: [mongoose.Schema.Types.Mixed], default: [] },
  diaries: { type: [mongoose.Schema.Types.Mixed], default: [] },
  constructionTeams: { type: [mongoose.Schema.Types.Mixed], default: [] },
  laborCosts: { type: [mongoose.Schema.Types.Mixed], default: [] },
  projectFiles: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true });
const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);

const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'general' },
  companyName: { type: String, default: 'TN Ideal' },
  supportEmail: { type: String, default: 'admin@tnideal.vn' },
  loginAlerts: { type: Boolean, default: true },
  logo: { type: String, default: '' }
}, { timestamps: true });
const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);

let cachedConnection = null;
let adminSeeded = false;

async function connectDatabase() {
  if (cachedConnection) {
    await seedAdminUser();
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined
  });

  await seedAdminUser();
  return cachedConnection;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(':');
  const hash = hashPassword(password, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

function isStrongPassword(password) {
  return /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function signToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      role: user.role
    })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const [payload, signature] = token.split('.');

  if (!payload || !signature) return null;

  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

async function seedAdminUser() {
  if (adminSeeded) return;

  const existingAdmin = await User.findOne({ username: 'admin' });
  if (!existingAdmin) {
    await User.create({
      username: 'admin',
      displayName: 'Admin',
      passwordHash: hashPassword('admin123'),
      role: 'admin'
    });
  } else if (!existingAdmin.displayName) {
    existingAdmin.displayName = 'Admin';
    await existingAdmin.save();
  }

  adminSeeded = true;
}

async function requireAuth(req, res, next) {
  try {
    await connectDatabase();

    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      return res.status(401).json({ message: 'Please login first' });
    }

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

function requirePermission(permission) {
  return (req, res, next) => {
    if (!rolePermissions[req.user.role]?.[permission]) {
      return res.status(403).json({ message: `${req.user.role} role cannot perform this action` });
    }

    return next();
  };
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ quản trị viên được thực hiện thao tác này' });
  }
  return next();
}

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

async function writeActivity(user, action, targetType, targetName, details = '') {
  await ActivityLog.create({ actorId: user?._id || null, actorName: user?.displayName || user?.username || 'Hệ thống', actorRole: user?.role || 'admin', action, targetType, targetName, details });
}

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'tnideal-api' });
});

app.post(
  '/api/auth/login',
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

app.post(
  '/api/auth/register',
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

    const existingUser = await User.findOne({ username });
    if (existingUser) {
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

app.get(
  '/api/projects',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  })
);

app.get(
  '/api/constructions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = req.user.role === 'admin' ? {} : { contractorId: req.user._id };
    res.json(await Construction.find(query).sort({ createdAt: -1 }));
  })
);

app.get(
  '/api/workspace',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') return res.status(403).json({ message: 'Workspace chỉ dành cho tài khoản thầu' });
    const workspace = await Workspace.findOne({ contractorId: req.user._id });
    res.json(workspace || { materialTransactions: [], purchaseRequests: [], expenses: [], diaries: [] });
  })
);

app.put(
  '/api/workspace',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') return res.status(403).json({ message: 'Workspace chỉ dành cho tài khoản thầu' });
    const allowed = ['materialTransactions', 'purchaseRequests', 'expenses', 'diaries', 'constructionTeams', 'laborCosts', 'projectFiles'];
    const updates = Object.fromEntries(allowed.filter((key) => Array.isArray(req.body[key])).map((key) => [key, req.body[key]]));
    const workspace = await Workspace.findOneAndUpdate({ contractorId: req.user._id }, { $set: updates }, { new: true, upsert: true, runValidators: true });
    res.json(workspace);
  })
);

app.post(
  '/api/constructions',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'contractor') return res.status(403).json({ message: 'Chỉ tài khoản thầu được tạo công trình' });
    const existing = await Construction.findOne({ contractorId: req.user._id, name: String(req.body.name || '').trim() });
    if (existing) return res.json(existing);
    const count = await Construction.countDocuments();
    const code = `CT${String(count + 1).padStart(3, '0')}`;
    const construction = await Construction.create({
      ...req.body,
      code,
      contractorId: req.user._id,
      contractorName: req.user.displayName || req.user.username
    });
    await writeActivity(req.user, 'Tạo công trình', 'construction', construction.name, construction.code);
    res.status(201).json(construction);
  })
);

app.get(
  '/api/admin/constructions',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const constructions = await Construction.find().sort({ createdAt: -1 });
    res.json(constructions);
  })
);

app.get(
  '/api/admin/contractors/:id/workspace',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [contractor, workspace, jobs] = await Promise.all([
      User.findById(req.params.id).select('-passwordHash'),
      Workspace.findOne({ contractorId: req.params.id }),
      Project.find().sort({ createdAt: -1 })
    ]);
    if (!contractor || contractor.role !== 'contractor') return res.status(404).json({ message: 'Không tìm thấy dữ liệu nhà thầu' });
    res.json({ contractor, workspace: workspace || { materialTransactions: [], purchaseRequests: [], expenses: [], diaries: [], constructionTeams: [], laborCosts: [], projectFiles: [] }, jobs });
  })
);

app.post(
  '/api/admin/constructions/import',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const contractor = await User.findById(req.body.contractorId).select('username displayName role');
    if (!contractor || contractor.role !== 'contractor') return res.status(400).json({ message: 'Không tìm thấy tài khoản thầu của công trình cũ' });
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
    res.status(201).json(construction);
  })
);

app.patch(
  '/api/admin/constructions/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const construction = await Construction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!construction) return res.status(404).json({ message: 'Không tìm thấy công trình' });
    await writeActivity(req.user, 'Cập nhật công trình', 'construction', construction.name, construction.status);
    res.json(construction);
  })
);

app.delete(
  '/api/admin/constructions/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const construction = await Construction.findByIdAndDelete(req.params.id);
    if (!construction) return res.status(404).json({ message: 'Không tìm thấy công trình' });
    await writeActivity(req.user, 'Xóa công trình lỗi', 'construction', construction.name, construction.code);
    res.json({ message: 'Đã xóa công trình' });
  })
);

app.post(
  '/api/projects',
  requireAuth,
  requirePermission('create'),
  asyncHandler(async (req, res) => {
    const project = await Project.create(req.body);
    await writeActivity(req.user, 'Tạo công việc', 'project', project.title, project.category);
    res.status(201).json(project);
  })
);

app.patch(
  '/api/projects/:id',
  requireAuth,
  requirePermission('updateStatus'),
  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await writeActivity(req.user, 'Cập nhật trạng thái', 'project', project.title, project.status);

    return res.json(project);
  })
);

app.delete(
  '/api/projects/:id',
  requireAuth,
  requirePermission('delete'),
  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await writeActivity(req.user, 'Xóa dữ liệu công việc', 'project', project.title);

    return res.json({ message: 'Project deleted' });
  })
);

app.get(
  '/api/admin/users',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  })
);

app.post(
  '/api/admin/users',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim().toLowerCase();
    const displayName = String(req.body.displayName || '').trim();
    const phone = String(req.body.phone || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = req.body.role === 'admin' ? 'admin' : 'contractor';
    if (username.length < 3 || displayName.length < 2) return res.status(400).json({ message: 'Thông tin tài khoản chưa hợp lệ' });
    if (password.length < 8 || !isStrongPassword(password)) return res.status(400).json({ message: 'Mật khẩu cần ít nhất 8 ký tự, chữ hoa, số và ký tự đặc biệt' });
    const user = await User.create({ username, displayName, phone, email, passwordHash: hashPassword(password), role, active: true });
    await writeActivity(req.user, 'Tạo tài khoản thầu', 'account', displayName, username);
    res.status(201).json({ id: user._id, username, displayName, phone, email, role, active: true, createdAt: user.createdAt });
  })
);

app.patch(
  '/api/admin/users/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString() && (req.body.active === false || (req.body.role && req.body.role !== 'admin'))) {
      return res.status(400).json({ message: 'Không thể khóa hoặc hạ quyền tài khoản đang đăng nhập' });
    }
    const updates = {};
    if (typeof req.body.displayName === 'string') updates.displayName = req.body.displayName.trim();
    if (typeof req.body.phone === 'string') updates.phone = req.body.phone.trim();
    if (typeof req.body.email === 'string') updates.email = req.body.email.trim().toLowerCase();
    if (['admin', 'contractor'].includes(req.body.role)) updates.role = req.body.role;
    if (typeof req.body.active === 'boolean') updates.active = req.body.active;
    if (req.body.password) {
      if (String(req.body.password).length < 8 || !isStrongPassword(String(req.body.password))) return res.status(400).json({ message: 'Mật khẩu mới chưa đủ mạnh' });
      updates.passwordHash = hashPassword(String(req.body.password));
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    await writeActivity(req.user, 'Cập nhật tài khoản thầu', 'account', user.displayName, Object.keys(updates).filter((key) => key !== 'passwordHash').join(', '));
    res.json(user);
  })
);

app.delete(
  '/api/admin/users/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    await writeActivity(req.user, 'Xóa tài khoản thầu', 'account', user.displayName, user.username);
    res.json({ message: 'Đã xóa tài khoản' });
  })
);

app.get(
  '/api/admin/activity',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const query = req.query.actorRole ? { actorRole: req.query.actorRole } : {};
    const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  })
);

app.get(
  '/api/admin/settings',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const settings = await SystemSettings.findOneAndUpdate({ key: 'general' }, { $setOnInsert: { key: 'general' } }, { new: true, upsert: true });
    res.json(settings);
  })
);

app.put(
  '/api/admin/settings',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const updates = { companyName: String(req.body.companyName || 'TN Ideal').trim(), supportEmail: String(req.body.supportEmail || '').trim(), loginAlerts: req.body.loginAlerts !== false };
    if (typeof req.body.logo === 'string') updates.logo = req.body.logo;
    const settings = await SystemSettings.findOneAndUpdate({ key: 'general' }, { $set: updates }, { new: true, upsert: true });
    await writeActivity(req.user, 'Cập nhật cài đặt hệ thống', 'settings', settings.companyName);
    res.json(settings);
  })
);

app.get(
  '/api/admin/system',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const startedAt = Date.now();
    await mongoose.connection.db.admin().ping();
    const [users, projects, constructions] = await Promise.all([User.countDocuments(), Project.countDocuments(), Construction.countDocuments()]);
    res.json({ api: 'online', database: 'connected', responseTime: Date.now() - startedAt, users, projects, constructions, environment: process.env.VERCEL ? 'Vercel' : 'Local', checkedAt: new Date() });
  })
);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, _next) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  if (error.message.includes('MONGODB_URI')) {
    return res.status(500).json({
      message: 'Server is missing MongoDB Atlas configuration'
    });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API running at http://127.0.0.1:${PORT}`);
  });
}

export default app;
