import { NextApiRequest, NextApiResponse } from 'next';
import { getProducts, createProduct } from '../../../controllers/productController';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../utils/auth';
import connectDB from '../../../config/database';
import Product from '../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the session using getServerSession
  const session = await getServerSession(req, res, authOptions);
  
  switch (req.method) {
    case 'GET':
      try {
        await connectDB();
        
        const { featured, limit = 10 } = req.query;
        const query = featured ? { featured: true } : {};
        
        const products = await Product.find(query)
          .limit(Number(limit))
          .sort({ createdAt: -1 });

        res.status(200).json({ products });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'POST':
      // Check if user is authenticated and is an admin
      if (!session) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      if (!isAdmin(session)) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await createProduct(req, res);
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
} 