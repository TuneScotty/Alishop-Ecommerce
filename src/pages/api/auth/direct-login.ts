import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Direct login: Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    console.log('Direct login attempt for:', email);

    // Connect to database
    console.log('Direct login: Connecting to database');
    await dbConnect();
    console.log('Direct login: Database connected');

    // Find user
    console.log('Direct login: Finding user');
    const user = await User.findOne({ email }).lean();

    if (!user) {
      console.log('User not found in direct login:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('User found in direct login, checking password');

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password mismatch in direct login');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('Password match in direct login, creating token');

    // Convert MongoDB _id to string
    const userId = user._id.toString();
    console.log('User ID for token:', userId);

    // Create JWT token
    const token = jwt.sign(
      {
        id: userId,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin || false
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.setHeader('Set-Cookie', [
      cookie.serialize('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      }),
      cookie.serialize('logged-in', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    ]);

    console.log('Auth cookies set, returning success response');

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error: any) {
    console.error('Direct login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 