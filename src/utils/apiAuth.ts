import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { isAdmin } from './auth';
import { corsMiddleware } from '../pages/api/_middleware';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>;

interface AuthOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  applyCors?: boolean;
}

export function withAuth(handler: ApiHandler, options: AuthOptions = {}) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const { requireAuth = true, requireAdmin = false, applyCors = true } = options;
    
    try {
      // Apply CORS middleware if enabled
      if (applyCors) {
        await new Promise<void>((resolve) => {
          corsMiddleware(req, res, () => resolve());
        });
      }
      
      // Skip authentication if not required
      if (!requireAuth) {
        return handler(req, res);
      }
      
      // Get the session
      const session = await getServerSession(req, res, authOptions);
      
      // Check if authenticated
      if (!session) {
        console.log(`API access denied: No session found for ${req.url}`);
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Check if admin when required
      if (requireAdmin && !isAdmin(session)) {
        console.log(`API access denied: User ${session.user?.email} is not an admin`);
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Authentication passed, proceed to handler
      return handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
} 