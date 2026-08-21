import cors from 'cors';
import express from 'express';
import './config/env.js';
import { mountSwagger } from './docs/swagger.js';
import { errorHandler, notFound } from './middleware/errors.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import constructionRouter from './routes/constructions.js';
import costRouter from './routes/costs.js';
import materialRouter from './routes/materials.js';
import progressRouter from './routes/progress.js';
import workspaceRouter from './routes/workspace.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

mountSwagger(app);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'tnideal-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/constructions', constructionRouter);
app.use('/api/materials', materialRouter);
app.use('/api/costs', costRouter);
app.use('/api/progress', progressRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
