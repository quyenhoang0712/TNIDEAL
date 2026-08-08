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
    updateStatus: false,
    delete: false
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
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'contractor'],
      default: 'contractor'
    }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

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

    const user = await User.findById(decoded.id).select('username displayName role');
    if (!user) {
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

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
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

    if (!rolePermissions[user.role]) {
      return res.status(403).json({ message: 'This account role is no longer supported' });
    }

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
      passwordHash: hashPassword(password),
      role: 'contractor'
    });

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

app.post(
  '/api/projects',
  requireAuth,
  requirePermission('create'),
  asyncHandler(async (req, res) => {
    const project = await Project.create(req.body);
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

    return res.json({ message: 'Project deleted' });
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
