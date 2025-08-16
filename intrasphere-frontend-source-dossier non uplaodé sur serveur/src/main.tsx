import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppression totale des erreurs ResizeObserver
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Override console.error pour ignorer ResizeObserver
const originalError = console.error;
console.error = debounce((...args: any[]) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
    return; // Ignore silently
  }
  originalError.apply(console, args);
}, 100);

// Global error handler
window.onerror = (msg) => {
  if (typeof msg === 'string' && msg.includes('ResizeObserver')) {
    return true; // Suppress error
  }
  return false;
};

// Handle unhandled promise rejections - suppress all to prevent DOMException
window.addEventListener('unhandledrejection', (event) => {
  // Completely suppress unhandled rejections during development
  event.preventDefault();
  return false;
});

createRoot(document.getElementById("root")!).render(<App />);
