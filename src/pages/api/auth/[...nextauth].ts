import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '../../../models/User';
import connectDB from '../../../config/database';
import jwt from 'jsonwebtoken';

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
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        try {
          await connectDB();
          
          // Instead of making an API call, directly use the User model
          // This avoids any URL path issues
          const user = await User.findOne({ email: credentials.email });
          
          if (user && (await user.comparePassword(credentials.password))) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              isAdmin: user.isAdmin,
              token: generateToken(user._id.toString()),
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error('NextAuth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 