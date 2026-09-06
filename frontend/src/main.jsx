import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent iOS elastic pull-down at top of document that triggers Telegram swipe-to-close
if (typeof window !== 'undefined') {
  let touchStartY = 0;
  window.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - touchStartY;

        // If user is pulling downwards while already at the top of the window
        if (window.scrollY <= 0 && deltaY > 0) {
          // Check if the target is an internal scrollable element not at top
          let el = e.target;
          let isInsideScrollable = false;
          while (el && el !== document.body && el !== document.documentElement) {
            if (el.scrollHeight > el.clientHeight) {
              const overflowY = window.getComputedStyle(el).overflowY;
              if (overflowY === 'auto' || overflowY === 'scroll') {
                if (el.scrollTop > 0) {
                  isInsideScrollable = true;
                  break;
                }
              }
            }
            el = el.parentElement;
          }

          // If not inside an element scrolled down, prevent the document rubber-band drag
          if (!isInsideScrollable) {
            e.preventDefault();
          }
        }
      }
    },
    { passive: false }
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

