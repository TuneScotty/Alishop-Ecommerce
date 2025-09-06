/**
 * Admin AliExpress setup page for configuring AliExpress Open Platform API integration.
 * Provides credential management, authentication flow, markup configuration, and setup
 * instructions for enabling AliExpress product import and order fulfillment functionality.
 */

import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useNotification } from '../../context/NotificationContext';
import { isAdmin } from '../../utils/auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { serializeSession } from '../../utils/session';

/**
 * AliExpressSetupPage component renders the AliExpress API configuration interface.
 * Includes credential input forms, authentication URL generation, markup percentage settings,
 * and comprehensive setup instructions for AliExpress Open Platform integration.
 */
export default function AliExpressSetupPage() {
  const [appKey, setAppKey] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [markupPercentage, setMarkupPercentage] = useState(30);
  const [authUrl, setAuthUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();

  // Load auth URL
  useEffect(() => {
    const loadAuthUrl = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/aliexpress/setup');
        setAuthUrl(response.data.authUrl);
      } catch (error) {
        console.error('Error loading auth URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthUrl();
  }, []);

  /**
   * Handles saving AliExpress API credentials and markup settings with validation.
   * @param e - React form submission event
   */
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appKey || !appSecret) {
      showNotification('App key and app secret are required', 'error');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await axios.post('/api/aliexpress/setup', {
        appKey,
        appSecret,
        markupPercentage,
      });
      
      showNotification('AliExpress credentials saved successfully', 'success');
      
      // Reload auth URL
      const authResponse = await axios.get('/api/aliexpress/setup');
      setAuthUrl(authResponse.data.authUrl);
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      showNotification(error.response?.data?.message || 'Failed to save credentials', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout title="Admin - AliExpress Setup" description="Configure AliExpress API integration">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">AliExpress Setup</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Configure your AliExpress Open Platform API integration
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Credentials */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">API Credentials</h2>
            <form onSubmit={handleSaveCredentials}>
              <div className="mb-4">
                <label htmlFor="appKey" className="block text-gray-700 dark:text-gray-300 mb-2">
                  App Key
                </label>
                <input
                  type="text"
                  id="appKey"
                  value={appKey}
                  onChange={(e) => setAppKey(e.target.value)}
                  placeholder="Your AliExpress App Key"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="appSecret" className="block text-gray-700 dark:text-gray-300 mb-2">
                  App Secret
                </label>
                <input
                  type="password"
                  id="appSecret"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  placeholder="Your AliExpress App Secret"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="markupPercentage" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Default Markup Percentage
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="markupPercentage"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                    min="0"
                    max="1000"
                    className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">%</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This is the default markup percentage applied to AliExpress product prices.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-main hover:bg-primary-dark transition duration-300'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Credentials'}
              </button>
            </form>
          </div>
          
          {/* Authentication */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Authentication</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  After saving your API credentials, click the button below to authenticate with AliExpress.
                  You will be redirected to AliExpress to authorize your application.
                </p>
                
                <a
                  href={authUrl}
                  className={`block w-full px-4 py-2 text-center rounded-md text-white font-medium ${
                    !authUrl
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-main hover:bg-primary-dark transition duration-300'
                  }`}
                  onClick={(e) => {
                    if (!authUrl) {
                      e.preventDefault();
                      showNotification('Please save your API credentials first', 'error');
                    }
                  }}
                >
                  Authenticate with AliExpress
                </a>
              </>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Setup Instructions</h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p>Create an account on the <a href="https://openservice.aliexpress.com/" target="_blank" rel="noopener noreferrer" className="text-primary-main hover:underline">AliExpress Open Platform</a>.</p>
              </li>
              <li>
                <p>Create a new application and get your App Key and App Secret.</p>
              </li>
              <li>
                <p>Enter your App Key and App Secret in the form above and save.</p>
              </li>
              <li>
                <p>Click the "Authenticate with AliExpress" button to authorize your application.</p>
              </li>
              <li>
                <p>After successful authentication, you can start importing products and placing orders.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/**
 * Server-side props function that validates admin authentication for AliExpress setup access.
 * Ensures only authenticated admin users can configure AliExpress API integration settings.
 * @param context - Next.js server-side context containing request and response objects
 * @returns Props object with serialized session data or redirect for unauthorized users
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || !isAdmin(session)) {
    return {
      redirect: {
        destination: '/login?redirect=/admin/aliexpress-setup',
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