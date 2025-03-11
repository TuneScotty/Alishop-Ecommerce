import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/dbConnect';
import Product from '../../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { slug } = req.query;

  await connectDB();

  switch (method) {
    case 'GET':
      try {
        if (!slug || slug === 'undefined') {
          return res.status(400).json({ message: 'Invalid product slug' });
        }

        const product = await Product.findOne({ slug });

        if (product) {
          res.status(200).json(product);
        } else {
          res.status(404).json({ message: 'Product not found' });
        }
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${method} not allowed` });
  }
} 