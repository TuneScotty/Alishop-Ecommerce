import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/dbConnect';
import User, { IUser } from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Use getServerSession for server-side authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    await dbConnect();
    
    // Get user email from session
    const userEmail = session.user?.email;
    
    if (!userEmail) {
      return res.status(400).json({ message: 'User email not found in session' });
    }
    
    if (req.method === 'GET') {
      // Find user by email
      const user = await User.findOne({ email: userEmail }).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json(user);
    } else if (req.method === 'PUT') {
      // Update user profile
      const { name, email, phone, password } = req.body;
      
      // Find user by email
      const user = await User.findOne({ email: userEmail });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone !== undefined) user.phone = phone;
      
      // Update password if provided
      if (password) {
        user.password = password; // Password will be hashed by the pre-save hook
      }
      
      // Save updated user
      const updatedUser = await user.save();
      
      // Return user without password
      return res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        shippingAddresses: updatedUser.shippingAddresses,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in user profile API:', error);
    return res.status(500).json({ message: 'Server error', error: error.toString() });
  }
} 