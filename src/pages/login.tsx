import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      const redirect = router.query.redirect as string || '/';
      router.push(redirect);
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      
      // Successful login is handled by the useEffect above
    } catch (error: any) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // If checking session status, show loading
  if (status === 'loading') {
    return (
      <Layout title="AliShop - Login" description="Login to your account">
        <div className="min-h-[70vh] flex justify-center items-center">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="AliShop - Login" description="Login to your account">
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 duration-300">
            <div className="relative h-32 bg-gradient-to-r from-primary-main to-secondary-main">
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold bg-gradient-to-r from-primary-main to-secondary-main text-transparent bg-clip-text">AS</span>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white blur-xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-white blur-xl"></div>
              </div>
            </div>
            
            <div className="pt-16 pb-8 px-8">
              <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Welcome Back</h1>
              
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      required
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary-main to-secondary-main text-white font-medium rounded-lg hover:opacity-90 transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-opacity-50 shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-primary-main hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-light/80 transition duration-300 font-medium">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 