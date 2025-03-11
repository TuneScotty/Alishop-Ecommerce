import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder, getOrders } from '../../../controllers/orderController';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the session using getServerSession
  const session = await getServerSession(req, res, authOptions);
  
  // Only allow authenticated users
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // For GET requests, check if user is admin
  if (req.method === 'GET' && !isAdmin(session)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  switch (req.method) {
    case 'POST':
      await createOrder(req, res);
      break;
    case 'GET':
      await getOrders(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 