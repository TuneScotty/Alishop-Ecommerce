/**
 * Admin users management page displaying all registered users in a comprehensive table.
 * Provides user account management, admin privilege control, and user information overview
 * with the ability to promote or demote users to/from admin status for system administration.
 */

import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { useNotification } from '../../../context/NotificationContext';
import { isAdmin } from '../../../utils/auth';
import { authOptions } from '../../api/auth/[...nextauth]';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

/**
 * AdminUsersPage component renders the user management interface for administrators.
 * Displays all users in a table format with names, emails, admin status, join dates,
 * and action buttons for managing admin privileges and user account control.
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Fetches all users from the API and updates the users state.
   * Handles loading states and error notifications for failed requests.
   */
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/users');
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showNotification(error.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Formats ISO date string into readable date format for user join dates.
   * @param dateString - ISO date string to format
   * @returns Formatted date string in MMM DD, YYYY format
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Toggles admin status for a specific user with optimistic UI updates.
   * @param userId - The unique identifier of the user to update
   * @param currentStatus - Current admin status of the user to toggle
   */
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await axios.put(`/api/users/${userId}`, {
        isAdmin: !currentStatus
      });
      
      if (response.status === 200) {
        showNotification(`User admin status updated successfully`, 'success');
        
        // Update the user in the state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isAdmin: !currentStatus } : user
        ));
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      showNotification(error.response?.data?.message || 'Failed to update user', 'error');
    }
  };

  return (
    <Layout title="Admin - Users" description="Manage your users">
      <div className="bg-gradient-to-r from-primary-dark to-secondary-dark text-white py-12 mb-8">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Users</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Manage user accounts and permissions.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">All Users</h2>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark transition duration-300"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-main border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user._id.substring(user._id.length - 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isAdmin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                          className={`px-3 py-1 rounded text-white text-xs ${
                            user.isAdmin ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

/**
 * Server-side props function that validates admin authentication for users page access.
 * Ensures only authenticated admin users can view and manage user accounts and privileges.
 * @param context - Next.js server-side context containing request and response objects
 * @returns Empty props object for authenticated admins or redirect for unauthorized users
 */
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