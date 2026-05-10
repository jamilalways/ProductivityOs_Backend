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

// CORS
app.use(helmet({ crossOriginResourcePolicy: false }));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    if (origin.startsWith('http://127.0.0.1:')) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (config.clientUrl && origin === config.clientUrl) return callback(null, true);
    console.log('CORS blocked:', origin);
    callback(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== 'test') app.use(morgan('dev'));

app.use('/api/auth',      authRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/goals',     goalRoutes);
app.use('/api/skills',    skillRoutes);
app.use('/api/habits',    habitRoutes);
app.use('/api/notes',     noteRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    env:    config.nodeEnv,
    db:     mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()) + 's',
    port:   config.port,
  });
});

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

// Start with clear EADDRINUSE handling
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log('');
      console.log('🚀  Server running  → http://localhost:' + config.port);
      console.log('📡  Environment     → ' + config.nodeEnv);
      console.log('🔗  Frontend URL    → ' + config.clientUrl);
      console.log('🏥  Health check    → http://localhost:' + config.port + '/api/health');
      console.log('');
      startScheduler();
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('');
        console.error('❌  Port ' + config.port + ' is already in use!');
        console.error('   Run this to fix it:');
        console.error('   > taskkill /IM node.exe /F');
        console.error('   Then run npm run dev again.');
        console.error('');
        process.exit(1);
      } else {
        console.error('❌  Server error:', err.message);
        process.exit(1);
      }
    });

  } catch (err) {
    console.error('❌  Startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;