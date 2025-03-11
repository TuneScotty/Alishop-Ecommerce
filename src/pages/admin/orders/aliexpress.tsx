import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { useNotification } from '../../../context/NotificationContext';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../../api/auth/[...nextauth]';

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  updatedAt: string;
}

interface AliExpressData {
  orderId: string;
  orderStatus: string;
  trackingInfo: TrackingInfo[];
  createdAt: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
  aliExpressProductId?: string;
}

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: string;
  aliExpressData: AliExpressData;
  createdAt: string;
}

export default function AliExpressOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get('/api/orders/aliexpress');
      setOrders(data);
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Failed to fetch orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAliExpressStatusBadgeClass = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toUpperCase()) {
      case 'PLACE_ORDER_SUCCESS':
        return 'bg-blue-100 text-blue-800';
      case 'IN_CANCEL':
        return 'bg-red-100 text-red-800';
      case 'WAIT_BUYER_ACCEPT_GOODS':
        return 'bg-yellow-100 text-yellow-800';
      case 'FINISH':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="AliExpress Orders" description="Manage your AliExpress orders">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">AliExpress Orders</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            View and manage orders placed through AliExpress.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Orders List</h2>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition duration-300"
            >
              Refresh
            </button>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No AliExpress orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AliExpress ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AliExpress Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order._id.substring(order._id.length - 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.aliExpressData?.orderId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAliExpressStatusBadgeClass(order.aliExpressData?.orderStatus)}`}>
                          {order.aliExpressData?.orderStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/orders/${order._id}`} className="text-primary-main hover:text-primary-dark mr-4">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">AliExpress Order Status Guide</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Order Statuses</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                      PLACE_ORDER_SUCCESS
                    </span>
                    <span className="text-sm text-gray-600">Order has been successfully placed with AliExpress</span>
                  </li>
                  <li className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">
                      WAIT_BUYER_ACCEPT_GOODS
                    </span>
                    <span className="text-sm text-gray-600">Order has been shipped and awaiting delivery confirmation</span>
                  </li>
                  <li className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                      FINISH
                    </span>
                    <span className="text-sm text-gray-600">Order has been completed successfully</span>
                  </li>
                  <li className="flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 mr-2">
                      IN_CANCEL
                    </span>
                    <span className="text-sm text-gray-600">Order is in the process of being cancelled</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Tips for Managing AliExpress Orders</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Regularly check for tracking updates to keep your customers informed</li>
                  <li>Allow 1-3 business days for AliExpress to process new orders</li>
                  <li>Shipping times vary by destination and shipping method</li>
                  <li>Contact AliExpress support directly for issues with specific orders</li>
                </ul>
              </div>
            </div>
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
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}; 