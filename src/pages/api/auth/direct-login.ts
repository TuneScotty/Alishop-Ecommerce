import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../config/database';
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
    
    // Connect to database
    await connectDB();
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
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
      sameSite: 'strict',
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
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
} 