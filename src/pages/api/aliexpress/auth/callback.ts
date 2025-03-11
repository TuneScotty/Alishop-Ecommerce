import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { isAdmin } from '../../../../utils/auth';
import aliExpressOpenPlatformService from '../../../../services/aliExpressOpenPlatformService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(req, res, authOptions);
    if (!session || !isAdmin(session)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is missing' });
    }

    if (state !== 'aliexpress') {
      return res.status(400).json({ message: 'Invalid state parameter' });
    }

    // Get redirect URI
    const redirectUri = `${process.env.NEXTAUTH_URL || req.headers.origin}/api/aliexpress/auth/callback`;

    try {
      // Exchange code for token using our service
      const tokenData = await aliExpressOpenPlatformService.exchangeCodeForToken(code as string, redirectUri);
      
      // Redirect to success page with the tokens
      res.redirect(
        `/admin/aliexpress-success?access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token}&expires_in=${tokenData.expires_in}`
      );
    } catch (error: any) {
      console.error('Error exchanging code for token:', error);
      return res.status(400).json({ 
        message: 'Failed to exchange authorization code for token', 
        error: error.message 
      });
    }
  } catch (error: any) {
    console.error('AliExpress callback error:', error);
    res.status(500).json({ message: 'Error processing callback', error: error.message });
  }
} 