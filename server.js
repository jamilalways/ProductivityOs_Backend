const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');

const config         = require('./src/config/config');
const connectDB      = require('./src/config/db');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const errorHandler   = require('./src/middleware/errorHandler');
const { startScheduler } = require('./src/utils/scheduler');

// ── Route imports ──────────────────────────────────────────────────────────────
const authRoutes      = require('./src/routes/auth');
const taskRoutes      = require('./src/routes/tasks');
const goalRoutes      = require('./src/routes/goals');
const skillRoutes     = require('./src/routes/skills');
const habitRoutes     = require('./src/routes/habits');
const noteRoutes      = require('./src/routes/notes');
const analyticsRoutes = require('./src/routes/analytics');

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      config.clientUrl,
  credentials: true,
  methods:     ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(apiLimiter);

// ── Body parsing & logging ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== 'test') app.use(morgan('dev'));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/goals',     goalRoutes);
app.use('/api/skills',    skillRoutes);
app.use('/api/habits',    habitRoutes);
app.use('/api/notes',     noteRoutes);
app.use('/api/analytics', analyticsRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:  'OK',
    env:     config.nodeEnv,
    db:      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime:  `${Math.floor(process.uptime())}s`,
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ───────────────────────────────────────────────────────
app.use(errorHandler);

// ── Database + server start ────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();   // uses db.js with proper options

    app.listen(config.port, () => {
      console.log(`🚀  Server running  → http://localhost:${config.port}`);
      console.log(`📡  Environment     → ${config.nodeEnv}`);
      console.log(`🔗  Frontend URL    → ${config.clientUrl}`);
      startScheduler();
    });
  } catch (err) {
    console.error('❌  Startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;