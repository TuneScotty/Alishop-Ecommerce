import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import Order from '../../../models/Order';
import connectDB from '../../../config/database';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../utils/auth';
import aliExpressOpenPlatformService from '../../../services/aliExpressOpenPlatformService';

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
    case 'POST':
      try {
        await connectDB();
        
        const { orderId } = req.body;
        
        if (!orderId) {
          return res.status(400).json({ message: 'Order ID is required' });
        }
        
        // Get order from database
        const order = await Order.findById(orderId);
        
        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }
        
        // Place order on AliExpress
        const result = await aliExpressOpenPlatformService.placeOrder(order);
        
        if (!result.success) {
          return res.status(400).json({ 
            message: 'Failed to place order on AliExpress', 
            error: result.error 
          });
        }
        
        // Update order with AliExpress order ID
        order.aliExpressData = {
          orderId: result.order_id,
          orderStatus: 'Placed',
          createdAt: new Date()
        };
        
        await order.save();
        
        return res.status(200).json({ 
          success: true, 
          message: 'Order placed successfully on AliExpress',
          aliExpressOrderId: result.order_id
        });
      } catch (error: any) {
        console.error('Error processing order:', error);
        return res.status(500).json({ message: error.message });
      }
      break;
      
    case 'GET':
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
        
        if (!order.aliExpressData?.orderId) {
          return res.status(400).json({ message: 'Order has not been placed on AliExpress yet' });
        }
        
        // Get order status from AliExpress
        const status = await aliExpressOpenPlatformService.getOrderStatus(order.aliExpressData.orderId);
        
        // Get tracking info from AliExpress
        const trackingInfo = await aliExpressOpenPlatformService.getTrackingInfo(order.aliExpressData.orderId);
        
        // Update order with latest status and tracking info
        order.aliExpressData.orderStatus = status?.status || order.aliExpressData.orderStatus;
        
        if (trackingInfo) {
          order.aliExpressData.trackingInfo = trackingInfo.map((info: any) => ({
            trackingNumber: info.tracking_number,
            carrier: info.carrier,
            status: info.status,
            updatedAt: new Date()
          }));
        }
        
        await order.save();
        
        return res.status(200).json({ 
          success: true, 
          status: status,
          trackingInfo: trackingInfo
        });
      } catch (error: any) {
        console.error('Error getting order status:', error);
        return res.status(500).json({ message: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 