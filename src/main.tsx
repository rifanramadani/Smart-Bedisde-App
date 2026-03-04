import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { config } from './config';

// Demonstrating usage of Netlify environment variable
console.log('App initialized with API Key:', config.apiKey ? '***HIDDEN***' : 'Not Set');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
