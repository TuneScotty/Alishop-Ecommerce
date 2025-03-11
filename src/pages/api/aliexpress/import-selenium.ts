import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Redirect to the new import endpoint
  return res.redirect(307, '/api/aliexpress/import');
} 