// Admin route protection component that restricts access to admin-only pages
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '../context/NotificationContext';

/**
 * Admin route protection component that restricts access to admin-only pages
 * @param children - React components to render if user has admin access
 * @returns JSX.Element - Protected content or redirects non-admin users
 * Purpose: Provides route-level security by checking user admin status and redirecting
 * unauthorized users away from admin pages with error notification
 */
export default function AdminRouteProtection({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { showNotification } = useNotification();
  
  // Check if the current route is an admin route
  const isAdminRoute = router.pathname.startsWith('/admin');
  
  // Check if the user is an admin
  const userIsAdmin = sessionData?.user && sessionData.user.isAdmin === true;

  // Redirect non-admin users trying to access admin routes
  useEffect(() => {
    if (isAdminRoute && !userIsAdmin) {
      showNotification('You do not have permission to access this page', 'error');
      router.push('/');
    }
  }, [isAdminRoute, userIsAdmin, router, showNotification]);

  return <>{children}</>;
} 