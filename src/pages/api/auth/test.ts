import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';
import connectDB from '../../../config/database';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
      
      // Check password (assuming you're using bcrypt)
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }
      
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
    } catch (error) {
      console.error('Auth test error:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    // GET request to check session
    const session = await getServerSession(req, res, authOptions);
    return res.status(200).json({ 
      authenticated: !!session,
      session
    });
  }
} 