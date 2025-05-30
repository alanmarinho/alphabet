import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { InfoContext } from './contexts/user.tsx';
import { ApiContext } from './contexts/api.tsx';
import { NotificationContext } from './contexts/notifications.tsx';

createRoot(document.getElementById('root')!).render(
  <InfoContext>
    <NotificationContext>
      <ApiContext>
        <App />
      </ApiContext>
    </NotificationContext>
  </InfoContext>,
);
