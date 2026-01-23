
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Cast to any to attach the root instance to the DOM node.
// This prevents "Minified React error #310" (createRoot called on container that is already a root)
// which can happen in development/HMR environments if this file is re-executed.
const container = rootElement as any;

if (!container._reactRoot) {
  container._reactRoot = ReactDOM.createRoot(rootElement);
}

container._reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
