import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

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

let cachedConnection = null;

async function connectDatabase() {
  if (cachedConnection) return cachedConnection;

  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || undefined
  });

  return cachedConnection;
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

app.get(
  '/api/projects',
  asyncHandler(async (req, res) => {
    await connectDatabase();

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
  asyncHandler(async (req, res) => {
    await connectDatabase();

    const project = await Project.create(req.body);
    res.status(201).json(project);
  })
);

app.patch(
  '/api/projects/:id',
  asyncHandler(async (req, res) => {
    await connectDatabase();

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
  asyncHandler(async (req, res) => {
    await connectDatabase();

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
