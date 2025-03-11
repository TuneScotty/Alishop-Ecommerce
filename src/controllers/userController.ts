import { NextApiRequest, NextApiResponse } from 'next';
import User, { IUser } from '../models/User';
import connectDB from '../config/database';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// Register a new user
export const registerUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const { name, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    
    const user = await User.create({
      name,
      email,
      password,
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticate user & get token
export const authUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (user && (await user.comparePassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
export const getUserProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const userId = req.body.user; // Assuming user ID is passed in the request
    
    const user = await User.findById(userId);
    
    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const userId = req.body.user; // Assuming user ID is passed in the request
    
    const user = await User.findById(userId);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      const updatedUser = await user.save();
      
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id.toString()),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin only)
export const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const user = await User.findById(req.query.id);
    
    if (user) {
      await user.deleteOne();
      res.status(200).json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const user = await User.findById(req.query.id).select('-password');
    
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin only)
export const updateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectDB();
    
    const user = await User.findById(req.query.id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
      
      const updatedUser = await user.save();
      
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 