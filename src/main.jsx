import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div
      style={{
        display: 'flex',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
      }}
    >
   
      <App />
    </div>
  </StrictMode>
);
