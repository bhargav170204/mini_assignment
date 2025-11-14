// src/config/database.ts
const dotenv = require('dotenv');

dotenv.config();

const mongoUri = process.env.MONGODB_URI ?? process.env.DATABASE_URL;

if (!mongoUri) {
  console.warn('No MONGODB_URI or DATABASE_URL provided. Mongoose will not connect automatically.');
}

let isConnected = false;
let mongooseConn: any = null;

exports.connectDatabase = async (): Promise<void> => {
  if (isConnected) return;
  if (!mongoUri) {
    throw new Error('MONGODB_URI (or DATABASE_URL) is not configured');
  }

  mongooseConn = require('mongoose');
  await mongooseConn.connect(mongoUri);
  isConnected = true;
  console.log('✅ Mongoose connected');
};

// For convenience, export mongoose instance accessor
exports.default = () => mongooseConn;

