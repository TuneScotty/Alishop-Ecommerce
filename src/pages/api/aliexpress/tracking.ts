import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import Order from '../../../models/Order';
import connectDB from '../../../config/database';
import { authOptions } from '../auth/[...nextauth]';
import aliExpressOpenPlatformService from '../../../services/aliExpressOpenPlatformService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the session
  const session = await getServerSession(req, res, authOptions);
  
  // Only allow authenticated users
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  try {
    await connectDB();
    
    const { orderId } = req.query;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    // Get order from database
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (order.user.toString() !== session.user.id && !session.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    if (!order.aliExpressData?.orderId) {
      return res.status(400).json({ message: 'Order has not been placed on AliExpress yet' });
    }
    
    // Get tracking info from AliExpress
    const trackingInfo = await aliExpressOpenPlatformService.getTrackingInfo(order.aliExpressData.orderId);
    
    // Update order with latest tracking info
    if (trackingInfo) {
      order.aliExpressData.trackingInfo = trackingInfo.map((info: any) => ({
        trackingNumber: info.tracking_number,
        carrier: info.carrier,
        status: info.status,
        updatedAt: new Date()
      }));
      
      await order.save();
    }
    
    return res.status(200).json({ 
      success: true, 
      trackingInfo: order.aliExpressData.trackingInfo || []
    });
  } catch (error: any) {
    console.error('Error getting tracking info:', error);
    return res.status(500).json({ message: error.message });
  }
} 