import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useNotification } from '../../context/NotificationContext';
import { isAdmin } from '../../utils/auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { serializeSession } from '../../utils/session';

export default function AliExpressSuccessPage() {
  const router = useRouter();
  const { access_token, refresh_token, expires_in } = router.query;
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const saveTokens = async () => {
      if (!access_token || !refresh_token || !expires_in) {
        return;
      }
      
      setIsSaving(true);
      
      try {
        // Calculate token expiry date
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + parseInt(expires_in as string, 10));
        
        // Save tokens to server
        await axios.post('/api/aliexpress/setup', {
          accessToken: access_token,
          refreshToken: refresh_token,
          tokenExpiry: expiryDate.toISOString(),
        });
        
        showNotification('AliExpress authentication successful', 'success');
      } catch (error: any) {
        console.error('Error saving tokens:', error);
        showNotification(error.response?.data?.message || 'Failed to save tokens', 'error');
      } finally {
        setIsSaving(false);
      }
    };
    
    saveTokens();
  }, [access_token, refresh_token, expires_in, showNotification]);

  return (
    <Layout title="AliExpress Authentication Success" description="AliExpress authentication successful">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Authentication Successful</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Your AliExpress account has been successfully connected
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            {isSaving ? (
              <div className="flex flex-col items-center justify-center">
                <div className="loading-spinner mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300">Saving authentication data...</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-10 w-10 text-green-600 dark:text-green-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Authentication Successful
                </h2>
                
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Your AliExpress account has been successfully connected to your store.
                  You can now import products and place orders automatically.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href="/admin/import-products"
                    className="px-6 py-2 bg-primary-main hover:bg-primary-dark text-white rounded-md transition duration-300"
                  >
                    Import Products
                  </a>
                  
                  <a
                    href="/admin"
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition duration-300"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || !isAdmin(session)) {
    return {
      redirect: {
        destination: '/login?redirect=/admin/aliexpress-success',
        permanent: false,
      },
    };
  }
  
  // Check if required query parameters are present
  const { access_token, refresh_token, expires_in } = context.query;
  if (!access_token || !refresh_token || !expires_in) {
    return {
      redirect: {
        destination: '/admin/aliexpress-setup',
        permanent: false,
      },
    };
  }
  
  // Serialize the session data to avoid undefined values
  const serializedSession = serializeSession(session);
  
  return {
    props: {
      session: serializedSession,
    },
  };
}; 