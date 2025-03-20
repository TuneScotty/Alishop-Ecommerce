import { Session } from 'next-auth';

/**
 * Check if the user is an admin
 * @param session Next Auth session
 * @returns boolean indicating if the user is an admin
 */
export const isAdmin = (session: Session | null): boolean => {
  return !!session?.user?.isAdmin;
};

// Check if user is authenticated
export const isAuthenticated = (session: Session | null): boolean => {
  return !!session?.user;
};

// Get user ID from session
export const getUserId = (session: Session | null): string | null => {
  return session?.user?.id || null;
};

// Extend the Session with custom fields
export interface ExtendedSession extends Session {
  user: {
    id: string;
    isAdmin: boolean;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
} 