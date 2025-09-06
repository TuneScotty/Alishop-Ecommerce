// Session serialization utilities for NextAuth session data handling
import { Session } from 'next-auth';

/**
 * Serializes session object to ensure JSON compatibility and prevent serialization errors
 * @param session - NextAuth session object or null
 * @returns Serialized session with null values replacing undefined properties
 * Purpose: Ensures session data can be safely serialized for client-side transmission
 * and prevents undefined value serialization issues in Next.js
 */
export const serializeSession = (session: Session | null) => {
  if (!session) return null;
  
  return {
    ...session,
    expires: session.expires ? session.expires.toString() : null,
  };
}; 