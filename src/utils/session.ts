import { Session } from 'next-auth';

/**
 * Serializes a session object to ensure all properties are JSON-serializable
 * Replaces undefined values with null to avoid serialization errors
 */
export function serializeSession(session: Session): any {
  if (!session) return null;
  
  return {
    user: {
      id: session.user?.id || null,
      name: session.user?.name || null,
      email: session.user?.email || null,
      image: session.user?.image || null,
      isAdmin: session.user?.isAdmin || false
    },
    expires: session.expires
  };
} 