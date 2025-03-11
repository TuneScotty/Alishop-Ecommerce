import mongoose from 'mongoose';

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Check if MONGODB_URI is defined, but don't throw an error immediately
// This allows the application to start even if the environment variable is missing
if (!MONGODB_URI) {
  console.error('Warning: MONGODB_URI environment variable is not defined. Please add it to your .env file.');
  // Try to load from .env directly if running on server
  if (typeof window === 'undefined') {
    try {
      const dotenv = require('dotenv');
      dotenv.config({ path: '.env' });
    } catch (error) {
      console.error('Error loading .env file:', error);
    }
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached: ConnectionCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    if (!MONGODB_URI) {
      throw new Error(
        'MongoDB connection failed: No MongoDB URI defined. Please check your environment variables.'
      );
    }

    // Log which environment we're connecting to
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`Connecting to MongoDB (${isProduction ? 'production' : 'development'})...`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

// Handle disconnection on development hot reloads
const disconnectDB = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
    if (cached.conn) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      console.log('MongoDB Disconnected');
    }
  }
};

export { disconnectDB };
export default connectDB; 