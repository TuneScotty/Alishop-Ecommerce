import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';

export default function SettingsPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Redirect to account page with preferences tab
    router.replace('/account?tab=preferences');
    showNotification('Settings have been moved to the Account page', 'info');
  }, [router, showNotification]);

  return (
    <Layout title="Settings" description="Redirecting to account settings">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to account settings...</p>
      </div>
    </Layout>
  );
} 