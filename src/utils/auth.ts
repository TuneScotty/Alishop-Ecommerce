import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import connectDB from '../config/database';
import { Session } from 'next-auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

      await connectDB();
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

export const admin = (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
    return;
  }
};

/**
 * Check if the user is an admin
 * @param session Next Auth session
 * @returns boolean indicating if the user is an admin
 */
export const isAdmin = (session: Session | null): boolean => {
  if (!session || !session.user) {
    return false;
  }
  
  const user = session.user as any;
  
  // Check for both role === 'admin' and isAdmin === true
  return user.role === 'admin' || user.isAdmin === true;
}; 