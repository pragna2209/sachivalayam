const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.info('MongoDB connected', { host: mongoose.connection.host });
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: !env.IS_PRODUCTION, // in production, indexes are created explicitly via scripts/createIndexes.js
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000
  });

  return mongoose.connection;
}

async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = { connectDB, disconnectDB, mongoose };
