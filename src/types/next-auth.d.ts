import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession['user'];
    accessToken: string;
  }

  interface User extends DefaultUser {
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