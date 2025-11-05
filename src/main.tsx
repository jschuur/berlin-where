import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '@/App';

import { useRegisterSW } from '@/hooks/useRegisterSW';

import '@/index.css';

function RegisterSW(): React.JSX.Element | null {
  useRegisterSW();
  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <RegisterSW />
  </React.StrictMode>
);
