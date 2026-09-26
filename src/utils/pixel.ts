import { Product, CartItem, Order, PixelEventLog } from '../types';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

const PIXEL_LOG_KEY = 'prime_shop_pixel_logs';

export function getPixelLogs(): PixelEventLog[] {
  try {
    const raw = localStorage.getItem(PIXEL_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendPixelLog(eventName: string, payload: Record<string, any>) {
  try {
    const logs = getPixelLogs();
    const newLog: PixelEventLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eventName,
      payload,
    };
    logs.unshift(newLog);
    // keep max 50 recent logs
    localStorage.setItem(PIXEL_LOG_KEY, JSON.stringify(logs.slice(0, 50)));
    // Dispatch custom event for dashboard live listener
    window.dispatchEvent(new CustomEvent('prime_pixel_event', { detail: newLog }));
  } catch (e) {
    console.error('Failed to log pixel event', e);
  }
}

export function clearPixelLogs() {
  localStorage.removeItem(PIXEL_LOG_KEY);
}

export function initFacebookPixel(pixelId: string, enabled: boolean) {
  if (!enabled || !pixelId || !pixelId.trim()) return;

  // Check if already initialized
  if (window.fbq) {
    try {
      window.fbq('init', pixelId.trim());
      return;
    } catch (e) {
      console.warn('Facebook Pixel re-init error', e);
    }
  }

  // Meta Pixel Base Code
  /* eslint-disable */
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    }
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );
  /* eslint-enable */

  if (window.fbq) {
    window.fbq('init', pixelId.trim());
    window.fbq('track', 'PageView');
    appendPixelLog('PageView (Init)', { pixelId });
  }
}

export function trackPageView(pageName: string = 'Page') {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'PageView');
    } catch (e) {
      console.warn(e);
    }
  }
  appendPixelLog('PageView', { page: pageName, url: window.location.hash || '/' });
}

export function trackViewContent(product: Product) {
  const payload = {
    content_name: product.name,
    content_category: product.categoryLabel,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'XOF',
  };

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'ViewContent', payload);
    } catch (e) {
      console.warn(e);
    }
  }
  appendPixelLog('ViewContent', payload);
}

export function trackAddToCart(product: Product, quantity: number) {
  const payload = {
    content_name: product.name,
    content_category: product.categoryLabel,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price * quantity,
    currency: 'XOF',
    quantity,
  };

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'AddToCart', payload);
    } catch (e) {
      console.warn(e);
    }
  }
  appendPixelLog('AddToCart', payload);
}

export function trackInitiateCheckout(items: CartItem[], total: number) {
  const payload = {
    content_ids: items.map((i) => i.product.id),
    content_type: 'product',
    num_items: items.reduce((acc, cur) => acc + cur.quantity, 0),
    value: total,
    currency: 'XOF',
  };

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', payload);
    } catch (e) {
      console.warn(e);
    }
  }
  appendPixelLog('InitiateCheckout', payload);
}

export function trackPurchase(order: Order) {
  const payload = {
    content_ids: order.items.map((i) => i.productId),
    content_type: 'product',
    num_items: order.items.reduce((acc, cur) => acc + cur.quantity, 0),
    value: order.total,
    currency: 'XOF',
    order_id: order.id,
  };

  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Purchase', payload);
    } catch (e) {
      console.warn(e);
    }
  }
  appendPixelLog('Purchase', payload);
}
