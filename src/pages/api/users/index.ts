import { NextApiRequest, NextApiResponse } from 'next';
import User from '../../../models/User';
import connectDB from '../../../config/database';
import { withAuth } from '../../../utils/apiAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
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

// Export with authentication and admin requirement
export default withAuth(handler, { requireAuth: true, requireAdmin: true }); 