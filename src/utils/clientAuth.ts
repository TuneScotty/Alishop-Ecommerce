// Client-side authentication utility functions for browser-based session management
import { Session } from 'next-auth';

/**
 * Checks if user has admin privileges in client-side components
 * @param session - NextAuth session object from useSession hook
 * @returns Boolean indicating whether user has admin access rights
 * Purpose: Provides client-side admin role verification for UI conditional rendering
 */
export const isAdmin = (session: Session | null): boolean => {
  return !!session?.user?.isAdmin;
};

/**
 * Verifies user authentication status in client components
 * @param session - NextAuth session object from useSession hook
 * @returns Boolean indicating authentication status
 * Purpose: Enables conditional rendering based on authentication state in React components
 */
export const isAuthenticated = (session: Session | null): boolean => {
  return !!session?.user;
};

/**
 * Extracts user ID from session for client-side operations
 * @param session - NextAuth session object from useSession hook
 * @returns User ID string or null if not available
 * Purpose: Provides safe access to user ID for client-side user-specific functionality
 */
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