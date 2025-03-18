import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load different env files based on environment
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Log environment state for debugging
console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
console.log(`MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
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
    };

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
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