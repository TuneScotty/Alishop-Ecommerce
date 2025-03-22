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
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    console.log('Direct login attempt for:', email);

    // Connect to database
    await dbConnect();

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found in direct login:', email);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    console.log('User found in direct login, checking password');

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password mismatch in direct login');
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    console.log('Password match in direct login, creating token');

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        isAdmin: user.isAdmin || false
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.setHeader('Set-Cookie', cookie.serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    }));

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user._id.toString(),
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