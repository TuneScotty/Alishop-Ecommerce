// CORS middleware for enabling cross-origin requests in API routes
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * CORS middleware that enables cross-origin requests for API routes
 * @param handler - API route handler function to wrap with CORS headers
 * @returns Wrapped handler with CORS headers and OPTIONS method handling
 * Purpose: Provides cross-origin resource sharing support for API endpoints with
 * proper preflight request handling and security headers
 */
export const corsMiddleware = (handler: Function) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
