import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../utils/auth';
import connectDB from '../../../config/database';
import Order from '../../../models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication and admin status
  const session = await getServerSession(req, res, authOptions);
  if (!session || !isAdmin(session)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    await connectDB();
    
    // Get query parameters
    const { status, page = '1', limit = '10' } = req.query;
    
    // Build query
    const query: any = {};
    
    // Only include orders with AliExpress data
    query['aliExpressData.orderId'] = { $exists: true };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query['aliExpressData.orderStatus'] = status;
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Get orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email');
    
    // Get total count
    const total = await Order.countDocuments(query);
    
    return res.status(200).json({
      orders,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error: any) {
    console.error('Error getting AliExpress orders:', error);
    return res.status(500).json({ message: error.message });
  }
} 