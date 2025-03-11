import { NextApiRequest, NextApiResponse } from 'next';
import {
  getOrderById,
  updateOrderToDelivered,
  checkAliExpressOrderStatus,
} from '../../../controllers/orderController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      await getOrderById(req, res);
      break;
    case 'PUT':
      await updateOrderToDelivered(req, res);
      break;
    case 'POST':
      await checkAliExpressOrderStatus(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 