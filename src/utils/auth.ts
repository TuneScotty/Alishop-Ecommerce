// Authentication utility functions and type definitions for user session management
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

/**
 * Checks if user has admin privileges based on session data
 * @param session - NextAuth session object containing user information
 * @returns Boolean indicating whether user has admin access rights
 * Purpose: Provides centralized admin role verification for authorization checks
 */
export const isAdmin = (session: Session | null): boolean => {
  return !!session?.user?.isAdmin;
};

/**
 * Verifies if user is authenticated based on session presence
 * @param session - NextAuth session object
 * @returns Boolean indicating authentication status
 * Purpose: Provides simple authentication check for protected routes and components
 */
export const isAuthenticated = (session: Session | null): boolean => {
  return !!session?.user;
};

/**
 * Extracts user ID from authenticated session
 * @param session - NextAuth session object
 * @returns User ID string or null if not available
 * Purpose: Provides safe access to user ID for database operations and user-specific actions
 */
export const getUserId = (session: Session | null): string | null => {
  return session?.user?.id || null;
};

// Extend the JWT with custom fields
export interface ExtendedJWT extends JWT {
  id: string;
  isAdmin: boolean;
  accessToken: string;
}

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