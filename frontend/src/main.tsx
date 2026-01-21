import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Настройки для Firefox и других браузеров
// Отключаем кеширование для dev режима
if (import.meta.env.DEV) {
  // Отключаем кеш для Firefox
  if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    window.addEventListener('beforeunload', () => {
      // Очищаем кеш при перезагрузке в dev режиме
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
















