import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('main.tsx loaded');

const rootElement = document.getElementById('root');

if (rootElement) {
  console.log('Root element found, creating React root...');
  try {
    const root = createRoot(rootElement);
    console.log('React root created, rendering App...');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: monospace;">
      <h1>Error Loading Dashboard</h1>
      <pre>${error}</pre>
    </div>`;
  }
} else {
  console.error('Root element not found!');
}
