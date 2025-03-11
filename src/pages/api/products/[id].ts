import { NextApiRequest, NextApiResponse } from 'next';
import {
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
} from '../../../controllers/productController';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      await getProductById(req, res);
      break;
      
    case 'PUT':
      // Check if user is authenticated and is an admin
      const session = await getServerSession(req, res, authOptions);
      if (!session || !isAdmin(session)) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      await updateProduct(req, res);
      break;
      
    case 'DELETE':
      // Check if user is authenticated and is an admin
      const deleteSession = await getServerSession(req, res, authOptions);
      if (!deleteSession || !isAdmin(deleteSession)) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      await deleteProduct(req, res);
      break;
      
    case 'POST':
      await createProductReview(req, res);
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'POST']);
      res.status(405).json({ message: `Method ${method} not allowed` });
  }
} 