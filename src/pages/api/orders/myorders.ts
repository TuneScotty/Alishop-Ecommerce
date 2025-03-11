import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/dbConnect';
import Order from '../../../models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  await dbConnect();
  
  // Get user email from session
  const userEmail = session.user?.email;
  
  if (!userEmail) {
    return res.status(400).json({ message: 'User email not found in session' });
  }
  
  try {
    if (req.method === 'GET') {
      // Find all orders for this user
      const orders = await Order.find({ 'user.email': userEmail })
        .sort({ createdAt: -1 }); // Sort by newest first
      
      return res.status(200).json(orders);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in my orders API:', error);
    return res.status(500).json({ message: 'Server error' });
  }
} 