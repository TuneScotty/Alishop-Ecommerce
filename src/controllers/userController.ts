// User authentication and management controller with JWT token generation
import { NextApiRequest, NextApiResponse } from 'next';
import User, { IUser } from '../models/User';
import dbConnect from '../lib/dbConnect';
import jwt from 'jsonwebtoken';

/**
 * Generates JWT token with 30-day expiration for user authentication
 * @param id - User ID to encode in the JWT token
 * @returns string - Signed JWT token containing user ID with 30-day expiration
 * Purpose: Creates secure authentication token for maintaining user sessions across requests
 */
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

/**
 * Creates new user account with hashed password and returns JWT token
 * @param req - NextApiRequest containing user registration data (name, email, password)
 * @param res - NextApiResponse for sending registration result or error
 * Purpose: Handles user registration by validating unique email, creating user with hashed password,
 * and returning user data with authentication token
 */
export const registerUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

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

/**
 * Authenticates user credentials and returns JWT token with user data
 * @param req - NextApiRequest containing login credentials (email, password)
 * @param res - NextApiResponse for sending authentication result or error
 * Purpose: Validates user login credentials against database, compares hashed passwords,
 * and returns user information with JWT token for session management
 */
export const authUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

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

/**
 * Retrieves user profile data by user ID from request body
 * @param req - NextApiRequest containing user ID in request body
 * @param res - NextApiResponse for sending user profile data or error
 * Purpose: Fetches authenticated user's profile information excluding sensitive data
 * for account management and profile display
 */
export const getUserProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

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

/**
 * Updates user profile information including password with optional fields
 * @param req - NextApiRequest containing user ID and updated profile data (name, email, password)
 * @param res - NextApiResponse for sending updated user data with new JWT token or error
 * Purpose: Allows users to modify their profile information with automatic password hashing
 * and returns refreshed authentication token
 */
export const updateUserProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

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

/**
 * Fetches all users from database for admin dashboard display
 * @param req - NextApiRequest (admin authentication required)
 * @param res - NextApiResponse for sending array of all users or error
 * Purpose: Provides admin interface with complete user list for user management operations
 */
export const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

    const users = await User.find({});
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Removes user account from database by ID for admin management
 * @param req - NextApiRequest containing user ID in query parameters
 * @param res - NextApiResponse for sending deletion confirmation or error
 * Purpose: Allows admin to permanently delete user accounts from the system
 */
export const deleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

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

/**
 * Retrieves specific user data by ID excluding password for admin view
 * @param req - NextApiRequest containing user ID in query parameters
 * @param res - NextApiResponse for sending user data without password or error
 * Purpose: Provides admin interface with detailed user information for management purposes
 * while maintaining security by excluding sensitive password data
 */
export const getUserById = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

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

/**
 * Updates user data including admin status for admin user management
 * @param req - NextApiRequest containing user ID in query and update data (name, email, isAdmin)
 * @param res - NextApiResponse for sending updated user data or error
 * Purpose: Allows admin to modify user accounts including granting/revoking admin privileges
 */
export const updateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

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