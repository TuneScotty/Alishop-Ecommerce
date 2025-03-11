import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import Layout from '../../components/Layout';
import { useNotification } from '../../context/NotificationContext';
import { isAdmin } from '../../utils/auth';
import { authOptions } from '../api/auth/[...nextauth]';
import { serializeSession } from '../../utils/session';

export default function AliExpressOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showNotification } = useNotification();

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/aliexpress/orders?status=${status}&page=${page}`);
        setOrders(response.data.orders);
        setTotalPages(response.data.pages);
      } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [status, page, showNotification]);

  const handleRefreshStatus = async (orderId: string) => {
    try {
      const response = await axios.get(`/api/aliexpress/order?orderId=${orderId}`);
      
      if (response.data.success) {
        showNotification('Order status updated successfully', 'success');
        
        // Refresh orders list
        const ordersResponse = await axios.get(`/api/aliexpress/orders?status=${status}&page=${page}`);
        setOrders(ordersResponse.data.orders);
      }
    } catch (error) {
      console.error('Error refreshing order status:', error);
      showNotification('Failed to refresh order status', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Layout title="Admin - AliExpress Orders" description="Manage AliExpress orders">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">AliExpress Orders</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Manage and track your AliExpress orders
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="status" className="block text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="all">All Orders</option>
                <option value="Placed">Placed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loading-spinner"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400">No orders found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      AliExpress Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map((order: any) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.aliExpressData?.orderId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.aliExpressData?.orderStatus === 'Placed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          order.aliExpressData?.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          order.aliExpressData?.orderStatus === 'Shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                          order.aliExpressData?.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          order.aliExpressData?.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {order.aliExpressData?.orderStatus || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.user?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleRefreshStatus(order._id)}
                          className="text-primary-main hover:text-primary-dark dark:hover:text-primary-light mr-4"
                        >
                          Refresh Status
                        </button>
                        <a
                          href={`/admin/orders/${order._id}`}
                          className="text-secondary-main hover:text-secondary-dark dark:hover:text-secondary-light"
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-md ${
                    page === 1
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-primary-main hover:bg-primary-dark text-white'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-md ${
                    page === totalPages
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-primary-main hover:bg-primary-dark text-white'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
        destination: '/login?redirect=/admin/aliexpress-orders',
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