import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function LoginTestPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      // Direct API call to test authentication
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      setResult(data);
      
      if (response.ok && data.success) {
        // Successful login
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Test Login">
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-100">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Test Login</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Sign In'}
                </button>
              </div>
            </form>
            
            {result && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-bold mb-2">Response:</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 