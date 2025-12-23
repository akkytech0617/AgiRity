import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { initRendererLogger } from './lib/logger';
import App from './App';
import './index.css';

// Initialize logger first
initRendererLogger();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
