import React, { createContext, useState, useContext } from 'react';

// Create the context
const NotificationContext = createContext();

// Custom hook to use the context
export const useNotification = () => {
  return useContext(NotificationContext);
};

// NotificationProvider component to wrap around your app
export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0); // Track unread notifications
  const [profilePhoto,setProfilePhoto]=useState('');
  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount ,profilePhoto,setProfilePhoto}}>
      {children}
    </NotificationContext.Provider>
  );
};
