import { createContext, useContext, useState } from 'react';

export enum ENotificationType {
  error = 'error',
  success = 'success',
  warning = 'warning',
}

interface INewNotification {
  message: string;
  type: ENotificationType;
  id: string;
}

interface contextData {
  setNotifications: React.Dispatch<React.SetStateAction<INewNotification[]>>;
  generateId: () => string;
  notifications: () => INewNotification[];
}

export const notificationContext = createContext<contextData>({} as contextData);
export const useNotification = () => {
  return useContext(notificationContext);
};

export const NotificationContext = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<INewNotification[]>([]);
  const generateId = () => {
    return Math.random().toString(36).slice(2, 10);
  };

  const value = {
    setNotifications,
    generateId,
    notifications: () => notifications,
  };
  return <notificationContext.Provider value={value}>{children}</notificationContext.Provider>;
};
