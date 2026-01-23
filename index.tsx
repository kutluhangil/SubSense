
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const containerId = 'root';
let container = document.getElementById(containerId);
if (!container) {
  throw new Error("Could not find root element to mount to");
}

// Key to store the React root instance on the DOM element for HMR
const ROOT_KEY = '__react_root_instance__';

// Try to retrieve existing root from the DOM node
let root = (container as any)[ROOT_KEY];

if (!root) {
  try {
    // Attempt to create a new root
    root = createRoot(container);
  } catch (e) {
    // If createRoot fails (e.g., Error #310), the container might already be a root
    // but we lost the reference. We must recover by replacing the container.
    const newContainer = document.createElement('div');
    newContainer.id = containerId;
    
    // Copy classes/attributes if needed, though usually root is clean
    if (container.className) newContainer.className = container.className;
    
    if (container.parentNode) {
      container.parentNode.replaceChild(newContainer, container);
      container = newContainer;
      root = createRoot(container);
    } else {
      // If we can't replace (detached), just rethrow
      throw e;
    }
  }

  // Save the root instance to the container for future usage
  if (root) {
    (container as any)[ROOT_KEY] = root;
  }
}

// Render the app
if (root) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
