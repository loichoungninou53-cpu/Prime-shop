import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import Lenis from 'lenis';

// Initialize Lenis smooth scroll safely
if (typeof window !== 'undefined') {
  try {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    (window as any).__primeLenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  } catch (err) {
    console.warn('Lenis smooth scroll initialized in fallback mode:', err);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
