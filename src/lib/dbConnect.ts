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
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      ssl: false, // Explicitly disable SSL
      tls: false, // Explicitly disable TLS
      tlsAllowInvalidCertificates: false
    };

    console.log('Creating new database connection');

    // Create a clean connection string without SSL parameters
    let connectionString = MONGODB_URI as string;
    if (connectionString.includes('ssl=true')) {
      connectionString = connectionString.replace('ssl=true', 'ssl=false');
    } else if (!connectionString.includes('ssl=false')) {
      connectionString += connectionString.includes('?') ? '&ssl=false' : '?ssl=false';
    }

    console.log('Connecting to MongoDB...');
    cached.promise = mongoose.connect(connectionString, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        console.log('Failed to connect to MongoDB:', error);
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