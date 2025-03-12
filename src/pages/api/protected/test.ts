import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get token from cookies
    const token = req.cookies['auth-token'];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
  } catch (error) {
    console.error('Error in protected API:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
} 