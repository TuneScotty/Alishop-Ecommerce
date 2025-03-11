import { NextApiRequest, NextApiResponse } from 'next';
import { getProducts, createProduct } from '../../../controllers/productController';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the session using getServerSession
  const session = await getServerSession(req, res, authOptions);
  
  // For POST requests, check if user is authenticated and is an admin
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (!isAdmin(session)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
  }
  
  switch (req.method) {
    case 'GET':
      await getProducts(req, res);
      break;
    case 'POST':
      await createProduct(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 