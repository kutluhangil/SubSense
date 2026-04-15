
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// ─── Global Error Diagnostics ──────────────────────────────────────────────
// Catches module-level crashes that happen BEFORE React mounts.
// These would otherwise produce a silent white screen.
window.onerror = (msg, _src, line, _col, err) => {
  const container = document.getElementById('root');
  if (container && !container.children.length) {
    container.innerHTML = `
      <div style="font-family:monospace;padding:24px;background:#1a1a1a;color:#ff6b6b;min-height:100vh">
        <h2 style="color:#ff4444">⛔ SubSense Runtime Error</h2>
        <p><strong>${msg}</strong></p>
        <p>Line: ${line}</p>
        <pre style="white-space:pre-wrap;font-size:12px;color:#ffa">${err?.stack || 'No stack trace'}</pre>
      </div>`;
  }
  return false;
};

window.addEventListener('unhandledrejection', (event) => {
  const container = document.getElementById('root');
  if (container && !container.children.length) {
    container.innerHTML = `
      <div style="font-family:monospace;padding:24px;background:#1a1a1a;color:#ff6b6b;min-height:100vh">
        <h2 style="color:#ff4444">⛔ SubSense Unhandled Promise Rejection</h2>
        <pre style="white-space:pre-wrap;font-size:12px;color:#ffa">${String(event.reason?.stack || event.reason)}</pre>
      </div>`;
  }
});
// ───────────────────────────────────────────────────────────────────────────

const containerId = 'root';
const container = document.getElementById(containerId);

if (!container) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
