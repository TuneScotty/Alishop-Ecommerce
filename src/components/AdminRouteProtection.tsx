import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useNotification } from '../context/NotificationContext';

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