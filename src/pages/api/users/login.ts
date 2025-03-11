import { NextApiRequest, NextApiResponse } from 'next';
import { authUser } from '../../../controllers/userController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      await authUser(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 