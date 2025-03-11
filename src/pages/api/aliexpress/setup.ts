import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../utils/auth';
import aliExpressOpenPlatformService from '../../../services/aliExpressOpenPlatformService';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication and admin status
  const session = await getServerSession(req, res, authOptions);
  if (!session || !isAdmin(session)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      // Get the auth URL for AliExpress
      const redirectUri = `${process.env.NEXTAUTH_URL || req.headers.origin}/api/aliexpress/auth/callback`;
      const authUrl = aliExpressOpenPlatformService.getAuthUrl(redirectUri);
      
      return res.status(200).json({ authUrl });
    } catch (error: any) {
      console.error('Error getting AliExpress auth URL:', error);
      return res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { appKey, appSecret, accessToken, refreshToken, tokenExpiry, markupPercentage } = req.body;
      
      if (!appKey || !appSecret) {
        return res.status(400).json({ message: 'App key and app secret are required' });
      }
      
      // Update .env.local file with new credentials
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      try {
        // Read existing .env.local file if it exists
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch (error) {
        // File doesn't exist, create it
        envContent = '';
      }
      
      // Update or add environment variables
      const envVars: Record<string, string> = {
        ALIEXPRESS_APP_KEY: appKey,
        ALIEXPRESS_APP_SECRET: appSecret,
      };
      
      if (accessToken) {
        envVars.ALIEXPRESS_ACCESS_TOKEN = accessToken;
      }
      
      if (refreshToken) {
        envVars.ALIEXPRESS_REFRESH_TOKEN = refreshToken;
      }
      
      if (tokenExpiry) {
        envVars.ALIEXPRESS_TOKEN_EXPIRY = tokenExpiry;
      }
      
      if (markupPercentage) {
        envVars.ALIEXPRESS_MARKUP_PERCENTAGE = markupPercentage.toString();
      }
      
      // Update each environment variable in the file
      for (const [key, value] of Object.entries(envVars)) {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (envContent.match(regex)) {
          // Update existing variable
          envContent = envContent.replace(regex, `${key}=${value}`);
        } else {
          // Add new variable
          envContent += `\n${key}=${value}`;
        }
      }
      
      // Write updated content back to file
      fs.writeFileSync(envPath, envContent);
      
      return res.status(200).json({ message: 'AliExpress credentials updated successfully' });
    } catch (error: any) {
      console.error('Error updating AliExpress credentials:', error);
      return res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 