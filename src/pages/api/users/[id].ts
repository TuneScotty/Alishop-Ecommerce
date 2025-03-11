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
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  switch (req.method) {
    case 'GET':
      try {
        await connectDB();
        
        const user = await User.findById(id).select('-password');
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json(user);
      } catch (error: any) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: error.message });
      }
      break;
      
    case 'PUT':
      try {
        await connectDB();
        
        const { isAdmin: isAdminUpdate } = req.body;
        
        // Only allow updating isAdmin field for now
        const updateData = {
          isAdmin: isAdminUpdate
        };
        
        const user = await User.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        ).select('-password');
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json(user);
      } catch (error: any) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 