// Admin sidebar navigation with hierarchical menu structure and active state management
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Admin sidebar navigation with hierarchical menu structure and active state management
 * @returns JSX.Element - Sidebar navigation with categorized admin links and active highlighting
 * Purpose: Provides navigation interface for admin dashboard with organized sections for
 * products, orders, users, and settings with visual active state indicators
 */
export default function AdminSidebar() {
  const router = useRouter();
  
  /**
   * Determines if navigation link should be highlighted as active
   * @param path - Route path to check against current router pathname
   * Purpose: Provides visual feedback for current page location in admin navigation
   */
  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-primary-dark to-secondary-dark">
        <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          <li>
            <Link 
              href="/admin/dashboard" 
              className={`block px-4 py-2 rounded-md ${
                isActive('/admin/dashboard') 
                  ? 'bg-primary-main text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
          </li>
          
          <li className="pt-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Products
            </div>
            <ul className="mt-1 space-y-1">
              <li>
                <Link 
                  href="/admin/products" 
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/admin/products') && !router.pathname.includes('/add') && !router.pathname.includes('/import')
                      ? 'bg-primary-main text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/products/add" 
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/admin/products/add') 
                      ? 'bg-primary-main text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Add Product
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/products/import" 
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/admin/products/import') 
                      ? 'bg-primary-main text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Import from AliExpress
                </Link>
              </li>
            </ul>
          </li>
          
          <li className="pt-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Orders
            </div>
            <ul className="mt-1 space-y-1">
              <li>
                <Link 
                  href="/admin/orders" 
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/admin/orders') && !router.pathname.includes('/aliexpress')
                      ? 'bg-primary-main text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Orders
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/orders/aliexpress" 
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/admin/orders/aliexpress') 
                      ? 'bg-primary-main text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  AliExpress Orders
                </Link>
              </li>
            </ul>
          </li>
          
          <li className="pt-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Users
            </div>
            <ul className="mt-1 space-y-1">
              <li>
                <Link 
                  href="/admin/users" 
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/admin/users') 
                      ? 'bg-primary-main text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Manage Users
                </Link>
              </li>
            </ul>
          </li>
          
          <li className="pt-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Settings
            </div>
            <ul className="mt-1 space-y-1">
              <li>
                <Link 
                  href="/admin/aliexpress-setup" 
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/admin/aliexpress-setup') 
                      ? 'bg-primary-main text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  AliExpress Setup
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/settings" 
                  className={`block px-4 py-2 rounded-md ${
                    isActive('/admin/settings') 
                      ? 'bg-primary-main text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Store Settings
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
} 