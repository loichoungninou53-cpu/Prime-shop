import React, { useState, useEffect } from 'react';
import { Product, Order, StoreSettings, CartItem, CategoryId } from './types';
import { 
  getStoredProducts, 
  saveStoredProducts, 
  getStoredOrders, 
  saveStoredOrders, 
  getStoredSettings, 
  saveStoredSettings, 
  getWishlist, 
  toggleWishlist 
} from './utils/storage';
import { initFacebookPixel, trackPageView, trackAddToCart } from './utils/pixel';

// Components
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { VideoSection } from './components/VideoSection';
import { CategoriesSection } from './components/CategoriesSection';
import { ReassuranceSection } from './components/ReassuranceSection';
import { FinalCTA } from './components/FinalCTA';
import { CatalogView } from './components/CatalogView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AccountView } from './components/AccountView';
import { AdminView } from './components/AdminView';
import { FreeGuideModal } from './components/FreeGuideModal';
import { MobileGlassDock } from './components/MobileGlassDock';
import { Footer } from './components/Footer';
import { LiveSalesNotification } from './components/LiveSalesNotification';

export default function App() {
  const [route, setRoute] = useState<string>(() => window.location.hash || '#/');
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [settings, setSettings] = useState<StoreSettings>(getStoredSettings);
  const [wishlist, setWishlist] = useState<string[]>(getWishlist);

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('prime_shop_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [isFreeGuideOpen, setIsFreeGuideOpen] = useState(false);

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem('prime_shop_cart', JSON.stringify(cart));
  }, [cart]);

  // Route listener
  useEffect(() => {
    const handleHashChange = () => {
      const current = window.location.hash || '#/';
      setRoute(current);
      trackPageView(current);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Secret admin keyboard shortcut: Ctrl+Shift+A opens secret admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        const secretSlug = settings.adminSecretSlug || 'gestion-prime';
        window.location.hash = `#/${secretSlug}`;
        setRoute(`#/${secretSlug}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.adminSecretSlug]);

  // Initialize Facebook Meta Pixel
  useEffect(() => {
    initFacebookPixel(settings.facebookPixelId, settings.facebookPixelEnabled);
    trackPageView(route);
  }, [settings.facebookPixelId, settings.facebookPixelEnabled]);

  // Navigate helper
  const navigate = (newRoute: string) => {
    window.location.hash = newRoute;
    setRoute(newRoute);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });

    trackAddToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const handleToggleWishlist = (productId: string) => {
    const updated = toggleWishlist(productId);
    setWishlist(updated);
  };

  // Order placed
  const handleOrderCreated = (newOrder: Order) => {
    // 1. Decrement product stock in inventory
    const updatedProducts = products.map((p) => {
      const orderedItem = newOrder.items.find((i) => i.productId === p.id);
      if (orderedItem) {
        return {
          ...p,
          stock: Math.max(0, p.stock - orderedItem.quantity),
        };
      }
      return p;
    });

    // 2. Update products in state and storage
    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);

    // 3. Update orders in state and storage
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
  };

  // Admin updates
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveStoredProducts(newProducts);
  };

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveStoredOrders(newOrders);
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Category counts
  const productCounts = {
    electronique: products.filter((p) => p.category === 'electronique').length,
    accessoires: products.filter((p) => p.category === 'accessoires').length,
    quotidien: products.filter((p) => p.category === 'quotidien').length,
    nouveautes: products.filter((p) => p.isNew || p.category === 'nouveautes').length,
    populaires: products.filter((p) => p.isPopular).length,
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Check if current route is the secret admin route
  const secretAdminSlug = settings.adminSecretSlug || 'gestion-prime';
  const isAdminRoute = route === `#/${secretAdminSlug}` || route === '#/admin' || route.startsWith('#/gestion');

  // Parse category if in route: e.g. #/shop?cat=electronique
  let initialCategory = 'all';
  if (route.includes('cat=')) {
    initialCategory = route.split('cat=')[1].split('&')[0];
  }

  return (
    <div className="min-h-screen bg-[#f2f4f5] text-[#050508] flex flex-col justify-between selection:bg-[#5433eb] selection:text-white">
      
      {/* Top Header (Visible on public storefront, hidden on admin) */}
      {!isAdminRoute && (
        <Header
          currentRoute={route}
          setRoute={navigate}
          cartCount={totalCartCount}
          wishlistCount={wishlist.length}
          openCart={() => setIsCartOpen(true)}
          settings={settings}
          openSearch={() => navigate('#/shop')}
        />
      )}

      {/* Main Routing Views */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOMEPAGE */}
        {route === '#/' && (
          <div>
            {/* Hero with provided 3D image taking the full head section */}
            <Hero
              onDiscoverClick={() => navigate('#/shop')}
              onNewArrivalsClick={() => navigate('#/shop?cat=nouveautes')}
              onGuideClick={() => setIsFreeGuideOpen(true)}
              settings={settings}
            />

            {/* Section 2: WHITE / LUMINOUS BACKGROUND + VIDEO + SHOWCASE CAROUSEL */}
            <VideoSection
              settings={settings}
            />

            {/* Section 3: Categories with animated SVG icons */}
            <CategoriesSection
              onSelectCategory={(catId: CategoryId) => navigate(`#/shop?cat=${catId}`)}
              productCounts={productCounts}
            />

            {/* Section 4: Reassurance ("Pourquoi choisir Prime Shop ?") */}
            <ReassuranceSection />

            {/* Section 5: Final CTA */}
            <FinalCTA 
              onDiscoverClick={() => navigate('#/shop')} 
              whatsappNumber={settings.whatsappNumber}
            />
          </div>
        )}

        {/* VIEW 2: BOUTIQUE / CATALOGUE */}
        {route.startsWith('#/shop') && (
          <CatalogView
            products={products.filter((p) => p.status === 'published')}
            onSelectProduct={setSelectedProduct}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            initialCategory={initialCategory}
            currency={settings.currency}
          />
        )}

        {/* VIEW 3: CUSTOMER ACCOUNT */}
        {route.startsWith('#/account') && (
          <AccountView
            orders={orders}
            products={products}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            settings={settings}
            initialTab={route.includes('tab=wishlist') ? 'wishlist' : 'orders'}
          />
        )}

        {/* VIEW 4: HIDDEN ADMIN DASHBOARD (Accessed only via secret route) */}
        {isAdminRoute && (
          <AdminView
            products={products}
            orders={orders}
            settings={settings}
            onUpdateProducts={handleUpdateProducts}
            onUpdateOrders={handleUpdateOrders}
            onUpdateSettings={handleUpdateSettings}
            onExitAdmin={() => navigate('#/')}
            onOpenFreeGuide={() => setIsFreeGuideOpen(true)}
          />
        )}

      </main>

      {/* Footer (hidden on admin page) */}
      {!isAdminRoute && (
        <Footer
          settings={settings}
          setRoute={navigate}
          onOpenFreeGuide={() => setIsFreeGuideOpen(true)}
        />
      )}

      {/* Floating Glass Taskbar on Mobile (Strictly customer dock, no admin link) */}
      {!isAdminRoute && (
        <MobileGlassDock
          currentRoute={route}
          setRoute={navigate}
          cartCount={totalCartCount}
          wishlistCount={wishlist.length}
          openCart={() => setIsCartOpen(true)}
          openSearch={() => navigate('#/shop')}
        />
      )}

      {/* Product Detail Modal (Maketou-Style Sales Page Layout) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        settings={settings}
      />

      {/* Cart Slide-out Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onOpenCheckout={(disc) => {
          setCheckoutDiscount(disc);
          setIsCheckoutOpen(true);
        }}
        settings={settings}
      />

      {/* Checkout 2-Step Modal (Zéro Paperasse) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discount={checkoutDiscount}
        settings={settings}
        onOrderCreated={handleOrderCreated}
        onClearCart={handleClearCart}
      />

      {/* Free Hosting Guide Modal */}
      <FreeGuideModal
        isOpen={isFreeGuideOpen}
        onClose={() => setIsFreeGuideOpen(false)}
      />

      {/* Live Social Proof Sales Notification (Benin verified orders) */}
      {!isAdminRoute && (
        <LiveSalesNotification
          products={products}
          onSelectProduct={setSelectedProduct}
        />
      )}

    </div>
  );
}
