import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { isAdmin } from '../../utils/auth';
import { serializeSession } from '../../utils/session';
import { authOptions } from '../api/auth/[...nextauth]';

export default function AdminDashboard() {
  const adminLinks = [
    {
      title: 'Product Management',
      links: [
        { name: 'All Products', href: '/admin/products', icon: 'box' },
        { name: 'Add Product', href: '/admin/products/add', icon: 'plus' },
        { name: 'Import from AliExpress', href: '/admin/import-products', icon: 'download' },
      ],
    },
    {
      title: 'Order Management',
      links: [
        { name: 'All Orders', href: '/admin/orders', icon: 'shopping-cart' },
        { name: 'AliExpress Orders', href: '/admin/aliexpress-orders', icon: 'globe' },
      ],
    },
    {
      title: 'User Management',
      links: [
        { name: 'All Users', href: '/admin/users', icon: 'users' },
      ],
    },
    {
      title: 'Settings',
      links: [
        { name: 'AliExpress Setup', href: '/admin/aliexpress-setup', icon: 'cog' },
        { name: 'Site Settings', href: '/settings', icon: 'settings' },
      ],
    },
  ];

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'box':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'plus':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'download':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        );
      case 'shopping-cart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'globe':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'cog':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Layout title="Admin Dashboard" description="Manage your store">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Manage your products, orders, and users from one central location.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminLinks.map((section) => (
            <div key={section.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{section.title}</h2>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="flex items-center p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
                      >
                        <span className="flex-shrink-0 text-primary-main dark:text-primary-light mr-3">
                          {renderIcon(link.icon)}
                        </span>
                        <span className="text-gray-800 dark:text-gray-200">{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          
          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">AliExpress Integration</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our AliExpress integration allows you to:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Import products directly from AliExpress</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatically apply customizable markup on prices</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automate order fulfillment on AliExpress</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Track shipments and order status automatically</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/admin/import-products"
                  className="px-4 py-2 bg-primary-main hover:bg-primary-dark text-white rounded-md transition duration-300"
                >
                  Import Products
                </Link>
                <Link
                  href="/admin/aliexpress-orders"
                  className="px-4 py-2 bg-secondary-main hover:bg-secondary-dark text-white rounded-md transition duration-300"
                >
                  Manage Orders
                </Link>
                <Link
                  href="/admin/aliexpress-setup"
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition duration-300"
                >
                  Setup Integration
                </Link>
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
        destination: '/login?redirect=/admin',
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