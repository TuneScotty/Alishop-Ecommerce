import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: ConnectionCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Using existing database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    // Force non-SSL connection with simplified options
    const opts = {
      ssl: false,
      tls: false,
      directConnection: true, // Use direct connection to avoid srv resolution
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    };

    // Strip any existing options and rebuild connection string
    let uri = MONGODB_URI as string;
    // Remove any query parameters
    if (uri.includes('?')) {
      uri = uri.substring(0, uri.indexOf('?'));
    }
    // Add our safe parameters
    uri += '?ssl=false&directConnection=true';

    console.log('Connecting to MongoDB with URI structure:', uri.replace(/:[^:]*@/, ':***@'));
    cached.promise = mongoose.connect(uri, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  } else {
    console.log('Using existing database connection promise');
  }

  try {
    console.log('Waiting for database connection to resolve');
    cached.conn = await cached.promise;
    console.log('Database connection resolved successfully');
  } catch (e) {
    cached.promise = null;
    console.error('Error resolving database connection:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;