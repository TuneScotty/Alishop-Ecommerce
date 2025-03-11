import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import connectDB from '../../../config/database';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../auth/[...nextauth]';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log the request for debugging
  console.log('Mobile API - Request method:', req.method);
  console.log('Mobile API - Request headers:', req.headers);
  console.log('Mobile API - Request body:', req.body);
  console.log('Mobile API - Request query:', req.query);
  
  // Allow both GET and POST for mobile
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication and admin status
    const session = await getServerSession(req, res, authOptions);
    if (!session || !isAdmin(session)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Connect to database
    await connectDB();

    // Extract productUrl from request - handle different possible sources and parameter names
    let productUrl = '';
    
    // Check body parameters (for POST)
    if (req.method === 'POST') {
      if (typeof req.body === 'string') {
        try {
          // Try to parse as JSON
          const parsedBody = JSON.parse(req.body);
          productUrl = parsedBody.productUrl || parsedBody.url || '';
        } catch (e) {
          // If it's not JSON, it might be URL encoded
          const params = new URLSearchParams(req.body);
          productUrl = params.get('productUrl') || params.get('url') || '';
        }
      } else {
        productUrl = req.body.productUrl || req.body.url || '';
      }
    }
    
    // Check query parameters (for both GET and POST as fallback)
    if (!productUrl && req.query) {
      productUrl = (req.query.productUrl || req.query.url) as string || '';
    }
    
    console.log('Mobile API - Extracted productUrl:', productUrl);

    if (!productUrl) {
      console.log('Mobile API - productUrl is missing or empty');
      return res.status(400).json({ message: 'Product URL is required' });
    }

    console.log('Mobile API - Importing product from URL:', productUrl);

    try {
      // Extract product ID from URL
      const productId = extractProductIdFromUrl(productUrl);
      console.log(`Mobile API - Extracted product ID: ${productId}`);
      
      // Temporary response until new scraping method is implemented
      return res.status(503).json({ 
        message: 'Product import functionality is temporarily unavailable. A new implementation will be available soon.' 
      });
      
    } catch (error: any) {
      console.error('Mobile API - Error importing AliExpress product:', error);
      return res.status(500).json({ 
        message: 'Error importing product', 
        error: error.message || 'Unknown error'
      });
    }
  } catch (error: any) {
    console.error('Mobile API - Error in API route:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message || 'Unknown error'
    });
  }
}

// Helper function to extract product ID from AliExpress URL
function extractProductIdFromUrl(url: string): string {
  // Try different patterns to extract product ID
  const patterns = [
    /\/(\d+)\.html/,
    /item\/(\d+)/,
    /product\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  throw new Error('Could not extract product ID from URL');
} 