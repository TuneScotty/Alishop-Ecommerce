import mongoose from 'mongoose';

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache the mongoose connection to reuse it across API calls
const MONGODB_URI = process.env.MONGODB_URI;

// Check if MONGODB_URI is defined, but don't throw an error immediately
// This allows the application to start even if the environment variable is missing
if (!MONGODB_URI) {
  console.error('Warning: MONGODB_URI environment variable is not defined. Please add it to your .env.local file.');
  // Try to load from .env.local directly if running on server
  if (typeof window === 'undefined') {
    try {
      const dotenv = require('dotenv');
      dotenv.config({ path: '.env.local' });
    } catch (error) {
      console.error('Error loading .env.local file:', error);
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
  // Skip MongoDB connection on client side
  if (typeof window !== 'undefined') {
    console.log('Skipping MongoDB connection on client side');
    return null;
  }

  // If no MongoDB URI is provided, return early with a clear error
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MongoDB connection failed: MONGODB_URI environment variable is not defined. Please add it to your .env.local file.'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
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