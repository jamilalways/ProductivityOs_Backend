const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  port:        process.env.PORT        || 5000,
  nodeEnv:     process.env.NODE_ENV    || 'development',
  mongoUri:    process.env.MONGODB_URI || 'mongodb://localhost:27017/productivity-os',
  jwtSecret:   process.env.JWT_SECRET  || 'dev_secret_change_in_production',
  jwtExpires:  process.env.JWT_EXPIRES_IN || '30d',
  clientUrl:   process.env.CLIENT_URL  || 'http://localhost:5173',

  // XP rewards for each action
  xp: {
    taskHigh:     30,
    taskMedium:   15,
    taskLow:       5,
    goalComplete: 100,
    habitCheckIn:  10,
    topicComplete: 20,
    noteCreated:    5,
  },
};

module.exports = config;
