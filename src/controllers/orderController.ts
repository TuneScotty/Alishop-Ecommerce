import { NextApiRequest, NextApiResponse } from 'next';
import Order, { IOrder } from '../models/Order';
import Product from '../models/Product';
import connectDB from '../config/database';
import tranzilaService from '../services/tranzilaService';
import aliExpressOpenPlatformService from '../services/aliExpressOpenPlatformService';
import mongoose from 'mongoose';

// Create a new order
export const createOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentDetails,
    } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    
    if (!shippingAddress || !shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ message: 'Shipping address is incomplete' });
    }
    
    if (!paymentDetails || !paymentDetails.cardNumber || !paymentDetails.expMonth || 
        !paymentDetails.expYear || !paymentDetails.cvv || !paymentDetails.name || 
        !paymentDetails.email || !paymentDetails.phone) {
      return res.status(400).json({ message: 'Missing required payment information' });
    }
    
    // Process payment with Tranzila
    const paymentResult = await tranzilaService.processPayment({
      amount: totalPrice,
      currency: 'ILS', // Using ILS (Israeli Shekel) as default currency
      description: `Order payment for ${orderItems.map((item: any) => item.name).join(', ')}`,
      customer: {
        name: paymentDetails.name,
        email: paymentDetails.email,
        phone: paymentDetails.phone,
      },
      cardDetails: {
        cardNumber: paymentDetails.cardNumber,
        expMonth: paymentDetails.expMonth,
        expYear: paymentDetails.expYear,
        cvv: paymentDetails.cvv,
        holderId: paymentDetails.holderId,
      },
    });
    
    if (!paymentResult.success) {
      return res.status(400).json({ message: paymentResult.error });
    }
    
    // Create the order in the database
    const order = new Order({
      user: req.body.user, // Assuming user ID is passed in the request
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult: {
        id: paymentResult.paymentId,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: paymentDetails.email,
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
    });
    
    const createdOrder = await order.save();
    
    // Try to place order on AliExpress automatically
    try {
      // Check if we have AliExpress credentials and all items have AliExpress product IDs
      const hasAliExpressItems = orderItems.some((item: any) => item.aliExpressProductId);
      
      if (hasAliExpressItems) {
        const aliExpressResult = await aliExpressOpenPlatformService.placeOrder(createdOrder);
        
        if (aliExpressResult.success) {
          // Update order with AliExpress order ID
          createdOrder.aliExpressData = {
            orderId: aliExpressResult.order_id,
            orderStatus: 'Placed',
            createdAt: new Date()
          };
          
          await createdOrder.save();
        } else {
          // If automatic placement fails, mark for manual processing
          console.log('Automatic AliExpress order placement failed:', aliExpressResult.error);
          createdOrder.notes = createdOrder.notes || [];
          createdOrder.notes.push({
            text: `Automatic AliExpress order placement failed: ${aliExpressResult.error}`,
            createdAt: new Date(),
            createdBy: 'system'
          });
          
          await createdOrder.save();
        }
      }
    } catch (error: any) {
      console.error('Error placing AliExpress order:', error);
      // Don't fail the entire order creation if AliExpress placement fails
    }
    
    res.status(201).json(createdOrder);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const db = mongoose.connection;
    const ordersCollection = db.collection('orders');
    const usersCollection = db.collection('users');
    
    const orderId = req.query.id as string;
    const order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId(orderId) });
    
    if (order) {
      // Get user info
      const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(order.user) }, { projection: { name: 1, email: 1 } });
      
      // Add user info to order
      const orderWithUser = {
        ...order,
        user: {
          _id: order.user,
          name: user?.name,
          email: user?.email
        }
      };
      
      res.status(200).json(orderWithUser);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged in user orders
export const getMyOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const db = mongoose.connection;
    const ordersCollection = db.collection('orders');
    
    const userId = req.body.user;
    const orders = await ordersCollection.find({ user: new mongoose.Types.ObjectId(userId) }).toArray();
    
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
export const getOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const db = mongoose.connection;
    const ordersCollection = db.collection('orders');
    const usersCollection = db.collection('users');
    
    const orders = await ordersCollection.find({}).toArray();
    
    // Get user info for each order
    const ordersWithUsers = await Promise.all(orders.map(async (order) => {
      const user = await usersCollection.findOne({ _id: new mongoose.Types.ObjectId(order.user) }, { projection: { id: 1, name: 1 } });
      
      return {
        ...order,
        user: {
          _id: order.user,
          id: user?.id,
          name: user?.name
        }
      };
    }));
    
    res.status(200).json(ordersWithUsers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update order to delivered
export const updateOrderToDelivered = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const db = mongoose.connection;
    const ordersCollection = db.collection('orders');
    
    const orderId = req.query.id as string;
    const order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId(orderId) });
    
    if (order) {
      const result = await ordersCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(orderId) },
        { 
          $set: { 
            isDelivered: true,
            deliveredAt: new Date()
          }
        }
      );
      
      const updatedOrder = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId(orderId) });
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Check AliExpress order status
export const checkAliExpressOrderStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const db = mongoose.connection;
    const ordersCollection = db.collection('orders');
    
    const orderId = req.query.id as string;
    const order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId(orderId) });
    
    if (order) {
      // Order status checking functionality is temporarily unavailable
      // Return a message indicating manual checking is required
      res.status(200).json({
        message: 'Order status checking is temporarily unavailable. Please check the status manually on AliExpress.',
        orderId: order._id,
        status: order.status
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 