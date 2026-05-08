const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/productivity-os';
  const isLocal = !process.env.MONGODB_URI;

  if (isLocal) {
    console.warn('⚠️  MONGODB_URI not found in environment. Falling back to local MongoDB.');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  });

  const { host, name } = mongoose.connection;
  console.log(`✅  MongoDB connected: ${host}/${name}`);
};

module.exports = connectDB;