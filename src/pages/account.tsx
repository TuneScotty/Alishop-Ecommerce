// User account management page with profile, orders, addresses, and preferences
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import AddressManager from '../components/AddressManager';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  phone?: string;
  createdAt: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  orderItems: Array<{
    name: string;
    qty: number;
    image: string;
    price: number;
  }>;
}

interface UserPreferences {
  currency: string;
  language: string;
}

/**
 * User account management page with profile, orders, addresses, and preferences
 * @returns JSX.Element - Complete account dashboard with tabbed interface
 * Purpose: Provides comprehensive user account management including profile editing,
 * order history viewing, address management, and user preferences configuration
 */
export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  const { theme } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Get tab from URL query or default to 'profile'
    return router.query.tab as string || 'profile';
  });
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  
  // Preferences states
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  
  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/account');
    }
  }, [status, router]);
  
  // Update active tab when URL query changes
  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab as string);
    }
  }, [router.query.tab]);
  
  // Add this to the useEffect section to handle tab from URL
  useEffect(() => {
    // Get tab from URL query parameter
    const { tab } = router.query;
    if (tab && typeof tab === 'string' && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [router.query]);
  
  // Fetch user data
  useEffect(() => {
    if (session) {
      fetchUserData();
      fetchOrders();
      fetchPreferences();
    }
  }, [session]);
  
  /**
   * Fetches user profile data and populates form fields
   * Purpose: Loads user information from API and initializes form state
   */
  const fetchUserData = async () => {
    try {
      const { data } = await axios.get('/api/users/profile');
      setProfile(data);
      
      // Set form values
      setName(data.name || '');
      setEmail(data.email || '');
      setStreet(data.address?.street || '');
      setCity(data.address?.city || '');
      setState(data.address?.state || '');
      setPostalCode(data.address?.postalCode || '');
      setCountry(data.address?.country || '');
      setPhone(data.phone || '');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetches user's order history from API
   * Purpose: Loads order data for display in orders tab
   */
  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/myorders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  /**
   * Fetches user preferences with localStorage fallback
   * Purpose: Loads currency and language preferences from API or localStorage
   */
  const fetchPreferences = async () => {
    try {
      const response = await axios.get('/api/users/preferences');
      if (response.data) {
        setCurrency(response.data.currency || 'USD');
        setLanguage(response.data.language || 'en');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Fallback to localStorage if API fails
      try {
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
          const parsedPreferences = JSON.parse(storedPreferences);
          setCurrency(parsedPreferences.currency || 'USD');
          setLanguage(parsedPreferences.language || 'en');
        }
      } catch (localError) {
        console.error('Error loading preferences from localStorage:', localError);
      }
    }
  };
  
  /**
   * Updates user profile information via API
   * @param e - Form submission event
   * Purpose: Saves profile changes including name, email, and phone
   */
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const { data } = await axios.put('/api/users/profile', {
        name,
        email,
        phone,
      });
      
      setProfile(data);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };
  
  /**
   * Saves user preferences to API and localStorage
   * Purpose: Persists currency and language preferences with fallback storage
   */
  const savePreferences = async () => {
    setUpdating(true);
    try {
      // Save to API
      await axios.post('/api/users/preferences', {
        currency,
        language,
      });
      
      // Also save to localStorage as fallback
      localStorage.setItem('userPreferences', JSON.stringify({
        currency,
        language,
      }));
      
      showNotification('Preferences saved successfully', 'success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      
      // Save to localStorage if API fails
      try {
        localStorage.setItem('userPreferences', JSON.stringify({
          currency,
          language,
        }));
        showNotification('Preferences saved locally', 'success');
      } catch (localError) {
        console.error('Error saving preferences to localStorage:', localError);
        showNotification('Failed to save preferences', 'error');
      }
    } finally {
      setUpdating(false);
    }
  };
  
  /**
   * Handles tab navigation with URL synchronization
   * @param tab - Target tab identifier
   * Purpose: Updates active tab and syncs with browser URL
   */
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab },
    }, undefined, { shallow: true });
  };
  
  // Update the tabs array to include an Addresses tab
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'orders', label: 'Orders' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'preferences', label: 'Preferences' },
  ];
  
  /**
   * Handles user logout with cart cleanup
   * Purpose: Clears cart data and signs out user with redirect to homepage
   */
  const handleLogout = () => {
    // Clear cart from localStorage
    localStorage.removeItem('cart');
    // Dispatch event to notify cart components
    window.dispatchEvent(new Event('cartUpdated'));
    // Sign out with callback URL
    signOut({ callbackUrl: '/' });
  };
  
  if (status === 'loading' || loading) {
    return (
      <Layout title="Account" description="Manage your account">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Account" description="Manage your account">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">My Account</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Manage your profile, view orders, and update preferences
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  {profile?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full text-left px-4 py-2 rounded-md ${
                          activeTab === tab.id
                            ? 'bg-primary-light/10 text-primary-main dark:text-primary-light font-medium'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => handleLogout()}
                      className="w-full text-left px-4 py-2 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Profile Information
                  </h2>
                  <div className="bg-primary-light/10 dark:bg-primary-dark/10 text-primary-main dark:text-primary-light px-3 py-1 rounded-full text-sm">
                    Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                
                <form onSubmit={updateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50 flex items-center"
                    >
                      {updating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Account Security</h3>
                  <Link 
                    href="/change-password" 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </Link>
                </div>
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Order History
                </h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't placed any orders yet.</p>
                    <a
                      href="/products"
                      className="inline-block px-6 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition duration-300"
                    >
                      Start Shopping
                    </a>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                              {order._id.substring(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                              ${order.totalPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.isPaid
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {order.isPaid ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <a
                                href={`/orders/${order._id}`}
                                className="text-primary-main dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-light/80"
                              >
                                View
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <AddressManager />
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                {/* Appearance Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                    Appearance
                  </h2>
                  <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <ThemeToggle />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {theme === 'light' && 'Using light theme'}
                      {theme === 'dark' && 'Using dark theme'}
                      {theme === 'system' && 'Using system theme preference'}
                    </p>
                  </div>
                </div>
                
                {/* Preferences Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                    Preferences
                  </h2>
                  <div className="mb-6">
                    <label htmlFor="currency" className="block text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="ILS">ILS - Israeli Shekel</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="language" className="block text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="he">עברית</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  <button
                    onClick={savePreferences}
                    disabled={updating}
                    className={`px-6 py-2 rounded-md text-white font-medium ${
                      updating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-main hover:bg-primary-dark transition duration-300'
                    }`}
                  >
                    {updating ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 