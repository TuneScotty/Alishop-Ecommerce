import { Session } from 'next-auth';

/**
 * Serializes a session object to ensure all properties are JSON-serializable
 * Replaces undefined values with null to avoid serialization errors
 */
export const serializeSession = (session: Session | null) => {
  if (!session) return null;
  
  return {
    ...session,
    expires: session.expires ? session.expires.toString() : null,
  };
}; 