import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import User from '../../../models/User';
import connectDB from '../../../config/database';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the session using getServerSession
  const session = await getServerSession(req, res, authOptions);
  
  // Only allow authenticated admin users
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Check if user is admin
  if (!isAdmin(session)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  switch (req.method) {
    case 'GET':
      try {
        await connectDB();
        
        // Get all users, excluding password field
        const users = await User.find({}).select('-password');
        
        return res.status(200).json(users);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 