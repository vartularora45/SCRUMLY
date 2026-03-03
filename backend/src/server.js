import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import boardRoutes from './routes/board.routes.js';
import teamRoutes from './routes/team.routes.js';
import taskRoutes from './routes/task.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import jiraRoutes from './routes/jira.routes.js';
import inviteRoutes from './routes/invite.routes.js';

dotenv.config();

const app = express();

// ✅ HTTP server + Socket.IO setup
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins a team room
  socket.on('join_team', (teamId) => {
    socket.join(teamId);
    console.log(`👥 Socket ${socket.id} joined team: ${teamId}`);
  });

  // User leaves a team room
  socket.on('leave_team', (teamId) => {
    socket.leave(teamId);
    console.log(`👋 Socket ${socket.id} left team: ${teamId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

app.use(cookieParser());

connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/jira', jiraRoutes);
app.use('/api/invites', inviteRoutes);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auto-Scrum Master API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// ✅ httpServer.listen — NOT app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`⚡ Socket.IO ready`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;