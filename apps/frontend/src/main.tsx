/**
 * PURPOSE: Frontend entrypoint. Mounts the React tree and wraps it in the
 * QueryClientProvider so data-fetching hooks work anywhere in the app.
 * DEPENDENCIES: react, react-dom, @tanstack/react-query, ./app/queryClient,
 * ./App, ./styles/index.css
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
