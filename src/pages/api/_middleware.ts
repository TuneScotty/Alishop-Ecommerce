import { NextApiRequest, NextApiResponse } from 'next';

export function corsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Use NEXTAUTH_URL from environment or fallback
  const origin = process.env.NEXTAUTH_URL || 
                (process.env.NODE_ENV === 'production' 
                  ? 'http://145.223.99.251' 
                  : 'http://localhost:3000');
  
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Continue to the next middleware or handler
  return next();
} 