import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { initRendererLogger } from './lib/logger';
import './index.css';

initRendererLogger();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <main className="dark text-foreground bg-background">
      <App />
    </main>
  </StrictMode>
);
