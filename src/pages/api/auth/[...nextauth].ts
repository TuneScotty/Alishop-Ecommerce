import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '../../../models/User';
import connectDB from '../../../config/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// Export the NextAuth options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }
        
        try {
          // Connect to the database
          await connectDB();
          
          // Find the user
          const user = await User.findOne({ email: credentials.email });
          
          // Log the authentication attempt
          console.log(`Auth attempt for ${credentials.email}: User found: ${!!user}`);
          
          if (!user) {
            console.log('User not found');
            return null;
          }
          
          // Check password
          const isMatch = await bcrypt.compare(credentials.password, user.password);
          console.log(`Password match: ${isMatch}`);
          
          if (!isMatch) {
            console.log('Password does not match');
            return null;
          }
          
          // Return the user object
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin || false
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Host-next-auth.csrf-token' 
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  debug: true,
  logger: {
    error(code, metadata) {
      console.error(`NextAuth error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`NextAuth warning: ${code}`);
    },
    debug(code, metadata) {
      if (process.env.DEBUG === 'true') {
        console.log(`NextAuth debug: ${code}`, metadata);
      }
    },
  },
};

export default NextAuth(authOptions); 