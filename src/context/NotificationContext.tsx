import React, { createContext, useContext, useState, useEffect } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (message: string, type: NotificationType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (duration !== Infinity) {
      setTimeout(() => {
        hideNotification(id);
      }, duration);
    }
    
    return id;
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      
      if (notification) {
        const updatedNotifications = prev.map(n => 
          n.id === id ? { ...n, exiting: true } : n
        );
        
        setTimeout(() => {
          setNotifications(current => current.filter(n => n.id !== id));
        }, 300);
        
        return updatedNotifications;
      }
      
      return prev.filter(n => n.id !== id);
    });
  };

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg flex items-center justify-between
            transform transition-all duration-300 ease-in-out
            ${notification.type === 'success' ? 'bg-green-600 text-white' : ''}
            ${notification.type === 'error' ? 'bg-red-600 text-white' : ''}
            ${notification.type === 'warning' ? 'bg-amber-600 text-white' : ''}
            ${notification.type === 'info' ? 'bg-blue-600 text-white' : ''}
            ${(notification as any).exiting ? 'opacity-0 translate-x-full' : 'opacity-100'}
          `}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center">
            {notification.type === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {notification.type === 'warning' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {notification.type === 'info' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => hideNotification(notification.id)}
            className="ml-4 text-white opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationProvider; 