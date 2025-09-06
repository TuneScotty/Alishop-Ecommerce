// Custom 404 error page with navigation back to homepage
import { NextPage } from 'next';
import Link from 'next/link';

/**
 * Custom 404 error page with navigation back to homepage
 * @returns JSX.Element - 404 error page with styled message and home link
 * Purpose: Provides user-friendly error page when requested routes are not found
 */
const NotFoundPage: NextPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8">The page you're looking for doesn't exist.</p>
      <Link 
        href="/"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage; 