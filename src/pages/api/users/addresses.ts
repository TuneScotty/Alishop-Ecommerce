import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected successfully');
    
    // Get user session using getServerSession instead of getSession
    console.log('Getting user session...');
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user?.email) {
      console.log('No authenticated session found');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userEmail = session.user.email;
    console.log(`User email: ${userEmail}`);
    
    // Find user by email
    console.log('Finding user in database...');
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user._id);
    
    // Initialize shippingAddresses array if it doesn't exist
    if (!user.shippingAddresses) {
      console.log('Initializing empty shippingAddresses array');
      user.shippingAddresses = [];
    }
    
    // Handle different HTTP methods
    console.log(`Processing ${req.method} request`);
    
    switch (req.method) {
      case 'GET':
        // Return all addresses
        console.log(`Returning ${user.shippingAddresses.length} addresses`);
        return res.status(200).json({ addresses: user.shippingAddresses });
        
      case 'POST':
        // Add a new address
        console.log('Adding new address, request body:', req.body);
        const { address } = req.body;
        
        if (!address || !address.name || !address.addressLine1 || !address.city || 
            !address.state || !address.postalCode || !address.country) {
          console.log('Missing required address fields');
          return res.status(400).json({ message: 'Missing required address fields' });
        }
        
        // If this is set as default, unset default on other addresses
        if (address.isDefault) {
          console.log('Setting as default address, unsetting other defaults');
          user.shippingAddresses.forEach((addr: any) => {
            addr.isDefault = false;
          });
        }
        
        // Add the new address
        console.log('Adding address to user');
        user.shippingAddresses.push(address);
        
        console.log('Saving user with new address');
        await user.save();
        console.log('User saved successfully');
        
        return res.status(201).json({ 
          message: 'Address added successfully',
          addresses: user.shippingAddresses
        });
        
      case 'PUT':
        // Update an existing address
        console.log('Updating address, request body:', req.body);
        const { addressId, updatedAddress } = req.body;
        
        if (!addressId || !updatedAddress) {
          console.log('Missing address ID or updated data');
          return res.status(400).json({ message: 'Missing address ID or updated data' });
        }
        
        // Find the address index
        const addressIndex = user.shippingAddresses.findIndex(
          (addr: any) => addr._id.toString() === addressId
        );
        
        if (addressIndex === -1) {
          console.log(`Address with ID ${addressId} not found`);
          return res.status(404).json({ message: 'Address not found' });
        }
        
        // If setting as default, unset default on other addresses
        if (updatedAddress.isDefault) {
          console.log('Setting as default address, unsetting other defaults');
          user.shippingAddresses.forEach((addr: any) => {
            addr.isDefault = false;
          });
        }
        
        // Update the address
        console.log(`Updating address at index ${addressIndex}`);
        user.shippingAddresses[addressIndex] = {
          ...user.shippingAddresses[addressIndex],
          ...updatedAddress
        };
        
        console.log('Saving user with updated address');
        await user.save();
        console.log('User saved successfully');
        
        return res.status(200).json({ 
          message: 'Address updated successfully',
          addresses: user.shippingAddresses
        });
        
      case 'DELETE':
        // Delete an address
        console.log('Deleting address, query params:', req.query);
        const { id } = req.query;
        
        if (!id) {
          console.log('Missing address ID');
          return res.status(400).json({ message: 'Missing address ID' });
        }
        
        // Remove the address
        console.log(`Removing address with ID ${id}`);
        user.shippingAddresses = user.shippingAddresses.filter(
          (addr: any) => addr._id.toString() !== id
        );
        
        console.log('Saving user after address removal');
        await user.save();
        console.log('User saved successfully');
        
        return res.status(200).json({ 
          message: 'Address deleted successfully',
          addresses: user.shippingAddresses
        });
        
      default:
        console.log(`Method ${req.method} not allowed`);
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in addresses API:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.toString(),
      stack: error.stack
    });
  }
} 