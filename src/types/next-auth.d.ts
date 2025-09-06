// NextAuth.js type extensions for custom user properties and JWT token enhancements
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * NextAuth.js type extensions for custom user properties and JWT token enhancements
 * Purpose: Extends default NextAuth types to include custom user fields like admin status
 * and user ID for enhanced authentication and authorization capabilities
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User extends DefaultUser {
    id: string;
    isAdmin: boolean;
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isAdmin: boolean;
    accessToken: string;
  }
} 