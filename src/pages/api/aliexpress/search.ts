import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../utils/auth';
import aliExpressOpenPlatformService from '../../../services/aliExpressOpenPlatformService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Check authentication and admin status
    const session = await getServerSession(req, res, authOptions);
    if (!session || !isAdmin(session)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { keyword, page = '1', pageSize = '20', sort, categoryId, currency, language, country } = req.query;

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    // Search products using our service
    const products = await aliExpressOpenPlatformService.searchProducts(keyword as string, {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
      sort,
      categoryId,
      currency,
      language,
      country
    });

    return res.status(200).json({
      products,
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
      total: products.length // This is not accurate, but we don't have total count from the API
    });
  } catch (error: any) {
    console.error('Error searching AliExpress products:', error);
    return res.status(500).json({ 
      message: 'Error searching products', 
      error: error.message || 'Unknown error'
    });
  }
} 