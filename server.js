require('dotenv').config();

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

const authRoutes      = require('./src/routes/auth');
const taskRoutes      = require('./src/routes/tasks');
const goalRoutes      = require('./src/routes/goals');
const skillRoutes     = require('./src/routes/skills');
const habitRoutes     = require('./src/routes/habits');
const noteRoutes      = require('./src/routes/notes');
const analyticsRoutes = require('./src/routes/analytics');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────────
app.use(helmet());

const ALLOWED_ORIGINS = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origin ' + origin + ' not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
    uptime:  Math.floor(process.uptime()) + 's',
  });
});

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log('🚀  Server running  → http://localhost:' + config.port);
      console.log('📡  Environment     → ' + config.nodeEnv);
      console.log('🔗  Frontend URL    → ' + config.clientUrl);
      startScheduler();
    });
  } catch (err) {
    console.error('❌  Startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;