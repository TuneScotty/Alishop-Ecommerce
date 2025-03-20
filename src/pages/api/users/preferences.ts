import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../config/database';
import User from '../../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the session
    const session = await getServerSession(req, res, authOptions);
    
    // Only allow authenticated users
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return a fallback response for development without DB
      if (process.env.NODE_ENV === 'development') {
        if (req.method === 'GET') {
          return res.status(200).json({
            currency: 'USD',
            language: 'en',
            theme: 'system',
          });
        } else if (req.method === 'POST') {
          return res.status(200).json({
            message: 'Preferences updated successfully (development mode)',
            preferences: req.body,
          });
        }
      }
      return res.status(500).json({ message: 'Database connection failed' });
    }
    
    // Get user from database
    const user = await User.findOne({ email: session.user?.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (req.method === 'GET') {
      // Return user preferences
      return res.status(200).json({
        currency: user.preferences?.currency || 'USD',
        language: user.preferences?.language || 'en',
        theme: user.preferences?.theme || 'system',
      });
    } else if (req.method === 'POST') {
      // Update user preferences
      const { currency, language, theme } = req.body;
      
      // Validate input
      if (currency && !['USD', 'EUR', 'GBP', 'ILS', 'JPY', 'CAD', 'AUD'].includes(currency)) {
        return res.status(400).json({ message: 'Invalid currency' });
      }
      
      if (language && !['en', 'es', 'fr', 'de', 'he', 'ar'].includes(language)) {
        return res.status(400).json({ message: 'Invalid language' });
      }
      
      if (theme && !['light', 'dark', 'system'].includes(theme)) {
        return res.status(400).json({ message: 'Invalid theme' });
      }
      
      // Initialize preferences if they don't exist
      if (!user.preferences) {
        user.preferences = {
          currency: 'USD',
          language: 'en',
          theme: 'system'
        };
      }
      
      // Update user preferences
      if (currency) user.preferences.currency = currency;
      if (language) user.preferences.language = language;
      if (theme) user.preferences.theme = theme as 'light' | 'dark' | 'system';
      
      await user.save();
      
      return res.status(200).json({
        message: 'Preferences updated successfully',
        preferences: user.preferences,
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    console.error('Error in preferences API:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.toString() 
    });
  }
} 