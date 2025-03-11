import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import connectDB from '../../../config/database';
import Product, { IProduct } from '../../../models/Product';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../auth/[...nextauth]';
import aliExpressOpenPlatformService from '../../../services/aliExpressOpenPlatformService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log the request for debugging
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  console.log('Request query:', req.query);
  
  if (req.method !== 'POST') {
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

    // Extract productUrl or productId from request body
    let productUrl = req.body.productUrl || req.body.url || req.body.product_url || '';
    let productId = req.body.productId || req.body.id || '';
    
    // If we have a URL but no ID, extract the ID from the URL
    if (productUrl && !productId) {
      try {
        productId = extractProductIdFromUrl(productUrl);
      } catch (error: any) {
        return res.status(400).json({ 
          message: 'Invalid product URL', 
          error: error.message 
        });
      }
    }

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
      // Import product using our service
      const productData = await aliExpressOpenPlatformService.importProduct(productId);
      
      // Create new product in database
      const product = new Product(productData);
      const savedProduct = await product.save();
      
      return res.status(201).json({
        message: 'Product imported successfully',
        product: savedProduct
      });
    } catch (error: any) {
      console.error('Error importing AliExpress product:', error);
      return res.status(500).json({ 
        message: 'Error importing product', 
        error: error.message || 'Unknown error'
      });
    }
  } catch (error: any) {
    console.error('Error in API route:', error);
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