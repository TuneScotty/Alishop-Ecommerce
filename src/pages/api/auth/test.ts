import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    // Get users for debugging
    const users = await User.find({}).select('email name isAdmin');

    return res.status(200).json({
      message: 'Database connection successful',
      userCount: users.length,
      users: users.map(u => ({ email: u.email, name: u.name }))
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      message: 'Error connecting to database',
      error: error.message
    });
  }
} 