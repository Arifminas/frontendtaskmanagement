// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'leaflet/dist/leaflet.css';


// Global styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/variables.css';

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

// Redux
import { Provider } from 'react-redux';
import store from './app/store';

// React Router
import { BrowserRouter } from 'react-router-dom';

// Context Providers (adjust as per your app)
import ThemeContextProvider from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';



// Main App component
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeContextProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeContextProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
