// MongoDB connection utility with caching, detailed logging, and error handling
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: ConnectionCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Connects to MongoDB with detailed logging and connection reuse for development hot reloads
 * @returns Promise<typeof mongoose> - Returns mongoose instance with established connection
 * Purpose: Manages MongoDB connection with comprehensive error logging, connection caching to prevent
 * exponential connection growth during development, and detailed connection status reporting
 */
async function dbConnect() {
  console.log('Creating new MongoDB connection...');
  console.log('MongoDB URI:', MONGODB_URI?.replace(/:[^:]*@/, ':***@'));

  if (cached.conn) {
    console.log('Using existing database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true
    };

    console.log('Attempting MongoDB connection with options:', JSON.stringify(opts, null, 2));

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error details:', {
          name: error.name,
          message: error.message,
          code: error.code,
          codeName: error.codeName,
          stack: error.stack
        });
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;