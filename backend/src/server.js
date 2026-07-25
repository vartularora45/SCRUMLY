import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import { authLimiter, apiLimiter } from './middleware/rateLimit.middleware.js';

import authRoutes     from './routes/auth.routes.js';
import messageRoutes  from './routes/message.routes.js';
import boardRoutes    from './routes/board.routes.js';
import teamRoutes     from './routes/team.routes.js';
import taskRoutes     from './routes/task.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import jiraRoutes     from './routes/jira.routes.js';
import inviteRoutes   from './routes/invite.routes.js';
import intelligenceRoutes from './routes/intelligence.routes.js';
import moduleRoutes from './routes/module.routes.js';
import alertRoutes from './routes/alert.routes.js';
import { protect } from './middleware/auth.middleware.js';
import { getDashboardDirect } from './controllers/intelligence.controller.js';

dotenv.config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// FIX: Support multiple origins from env (was using broken || short-circuit logic)
// Deduplicate origins
const allowedOrigins = [...new Set(
  (process.env.FRONTEND_URL || process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    .concat(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173'] : [])
)];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── Security & Perf Middleware ───────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ─── HTTP Server + Socket.IO ──────────────────────────────────────────────────
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin:      allowedOrigins.length ? allowedOrigins : '*',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on('join_team', (teamId) => {
    socket.join(teamId);
    console.log(`👥 ${socket.id} joined team: ${teamId}`);
  });

  socket.on('leave_team', (teamId) => {
    socket.leave(teamId);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/auth/', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/auth',          authRoutes);
app.use('/api/messages',  messageRoutes);
app.use('/messages',      messageRoutes);
app.use('/api/board',     boardRoutes);
app.use('/board',         boardRoutes);
app.use('/api/teams',     teamRoutes);
app.use('/teams',         teamRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/tasks',         taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/analytics',     analyticsRoutes);
app.use('/api/jira',      jiraRoutes);
app.use('/jira',          jiraRoutes);
app.use('/api/invites',   inviteRoutes);
app.use('/invites',       inviteRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/intelligence',  intelligenceRoutes);
app.use('/api/modules',   moduleRoutes);
app.use('/modules',       moduleRoutes);
app.use('/api/alerts',    alertRoutes);
app.use('/alerts',        alertRoutes);

// Direct dashboard endpoints
app.get('/api/dashboard', protect, getDashboardDirect);
app.get('/dashboard',     protect, getDashboardDirect);

// ─── Health Check ─────────────────────────────────────────────────────────────
const healthHandler = (req, res) => {
  res.json({
    success:   true,
    message:   'Scrumlyn API is running',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  console.error('Global error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Scrumlyn API running on port ${PORT}`);
  console.log(`⚡ Socket.IO ready`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ') || 'all'}`);
});

export default app;
