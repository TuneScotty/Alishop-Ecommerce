import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import connectDB from '../../../config/database';
import Order from '../../../models/Order';
import { authOptions } from '../auth/[...nextauth]';

interface AliExpressParams {
  app_key: string;
  session: string;
  timestamp: string;
  format: string;
  v: string;
  sign_method: string;
  method: string;
  sign?: string;
  [key: string]: string | undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  
  // Get user session
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Handle GET request - Get AliExpress orders
  if (req.method === 'GET') {
    try {
      const orders = await Order.find({ 
        user: session.user.id,
        'aliExpressData.orderId': { $exists: true }
      }).sort({ createdAt: -1 });
      
      return res.status(200).json(orders);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
  
  // Handle POST request - Create AliExpress order
  if (req.method === 'POST') {
    try {
      const { orderId, products, shippingAddress } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
      }
      
      // Check if order exists
      const existingOrder = await Order.findById(orderId);
      
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if user owns the order
      if (existingOrder.user.toString() !== session.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this order' });
      }
      
      // Get AliExpress API credentials
      const appKey = process.env.ALIEXPRESS_APP_KEY;
      const appSecret = process.env.ALIEXPRESS_APP_SECRET;
      const aliSession = process.env.ALIEXPRESS_SESSION;
      
      if (!appKey || !appSecret || !aliSession) {
        return res.status(500).json({ message: 'AliExpress API credentials not configured' });
      }
      
      // Prepare order data for AliExpress
      const aliExpressOrderData = {
        logistic_address: {
          contact_person: shippingAddress.name,
          country: shippingAddress.country,
          address: `${shippingAddress.addressLine1} ${shippingAddress.addressLine2 || ''}`,
          city: shippingAddress.city,
          province: shippingAddress.state,
          zip: shippingAddress.postalCode,
          phone_number: shippingAddress.phone || '',
        },
        product_items: products.map((product: any) => ({
          product_id: product.aliExpressProductId,
          product_count: product.quantity,
          sku_attr: product.variant || '',
          logistics_service_name: product.shippingMethod || '',
        })),
      };
      
      // Make request to AliExpress API to create order
      const timestamp = new Date().toISOString().split('.')[0];
      const apiUrl = 'https://api.aliexpress.com/v1/ds.order.place';
      
      const params: AliExpressParams = {
        app_key: appKey,
        session: aliSession,
        timestamp: timestamp,
        format: 'json',
        v: '2.0',
        sign_method: 'md5',
        method: 'aliexpress.ds.order.place',
      };
      
      // Generate signature (simplified for example)
      const signature = await generateSignature(params, appSecret);
      params.sign = signature;
      
      const response = await axios.post(apiUrl, aliExpressOrderData, { params });
      
      if (response.data.error_response) {
        return res.status(400).json({ 
          message: 'AliExpress API error', 
          error: response.data.error_response 
        });
      }
      
      const aliExpressOrderResult = response.data.aliexpress_ds_order_place_response.result;
      
      // Update order with AliExpress order information
      existingOrder.set({
        aliExpressData: {
          orderId: aliExpressOrderResult.order_id,
          orderStatus: 'PLACE_ORDER_SUCCESS',
          trackingInfo: [],
          createdAt: new Date(),
        }
      });
      
      await existingOrder.save();
      
      return res.status(200).json({ 
        message: 'AliExpress order created successfully', 
        order: existingOrder 
      });
      
    } catch (error: any) {
      console.error('Error creating AliExpress order:', error);
      return res.status(500).json({ 
        message: 'Error creating AliExpress order', 
        error: error.message 
      });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}

// Helper function to generate signature for AliExpress API
async function generateSignature(params: AliExpressParams, secret: string): Promise<string> {
  const crypto = require('crypto');
  
  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(params).sort();
  
  // Create string to sign
  let stringToSign = '';
  sortedKeys.forEach(key => {
    if (key !== 'sign' && params[key] !== undefined && params[key] !== null) {
      stringToSign += key + params[key];
    }
  });
  
  // Add secret at beginning and end
  stringToSign = secret + stringToSign + secret;
  
  // Generate MD5 hash and convert to uppercase
  return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
} 