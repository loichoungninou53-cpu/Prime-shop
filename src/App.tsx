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
import { TrackingView } from './components/TrackingView';
import {
  saveOrderToSupabase,
  fetchProductsFromSupabase,
  fetchOrdersFromSupabase,
  fetchSettingsFromSupabase,
  syncSettingsToSupabase,
  replaceProductsInSupabase,
  syncOrdersToSupabase,
} from './utils/supabase';

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

  // ☁️ CLOUD FIRST : au démarrage, la boutique se charge depuis Supabase.
  // Ainsi le propriétaire (téléphone A) et le client (téléphone B) voient la même chose.
  const [cloudReady, setCloudReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cloudProducts, cloudOrders, cloudSettings] = await Promise.all([
        fetchProductsFromSupabase(),
        fetchOrdersFromSupabase(),
        fetchSettingsFromSupabase(),
      ]);
      if (cancelled) return;
      // Produits : le cloud fait foi ; mais s'il est vide et que cet appareil a
      // déjà un catalogue (ancien propriétaire hors-ligne), on le migre vers le cloud
      // au lieu de l'effacer.
      const localProducts = getStoredProducts();
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
        saveStoredProducts(cloudProducts);
      } else if (cloudProducts && cloudProducts.length === 0 && localProducts.length > 0) {
        replaceProductsInSupabase(localProducts).catch(() => {});
      }
      // Commandes : fusion cloud + local (aucune commande n'est perdue)
      if (cloudOrders) {
        const localOrders = getStoredOrders();
        const seen = new Set(cloudOrders.map((o) => o.id));
        const onlyLocal = localOrders.filter((o) => !seen.has(o.id));
        const merged = [...cloudOrders, ...onlyLocal].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setOrders(merged);
        saveStoredOrders(merged);
        if (onlyLocal.length) syncOrdersToSupabase(merged).catch(() => {});
      }
      if (cloudSettings) {
        setSettings((prev) => {
          const merged = { ...prev, ...cloudSettings } as StoreSettings;
          saveStoredSettings(merged);
          return merged;
        });
      }
      setCloudReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    replaceProductsInSupabase(updatedProducts).catch(() => {});

    // 3. Update orders in state and storage
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    // 4. Automatically save to Supabase cloud in background
    saveOrderToSupabase(newOrder).catch((err) => console.log('Supabase sync background:', err));
  };

  // Admin updates
  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveStoredProducts(newProducts);
    replaceProductsInSupabase(newProducts).catch(() => {});
  };

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveStoredOrders(newOrders);
    syncOrdersToSupabase(newOrders).catch(() => {});
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    syncSettingsToSupabase(newSettings).catch(() => {});
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

  // Parse tracking id if in route: e.g. #/suivi?id=PS-1234
  let trackingOrderId = '';
  if (route.includes('id=')) {
    trackingOrderId = route.split('id=')[1].split('&')[0];
  }

  // Parse direct product link if in route: e.g. #/shop?product=prod_01 or #/product/prod_01
  const linkedProductId = (() => {
    if (route.includes('product=')) return decodeURIComponent(route.split('product=')[1].split('&')[0]);
    if (route.startsWith('#/product/')) return decodeURIComponent(route.replace('#/product/', '').split('?')[0]);
    if (route.startsWith('#/produit/')) return decodeURIComponent(route.replace('#/produit/', '').split('?')[0]);
    return '';
  })();
  const isProductLinkRoute = route.startsWith('#/product/') || route.startsWith('#/produit/');
  const linkedProductFound = linkedProductId
    ? products.find((p) => p.id === linkedProductId || p.slug === linkedProductId) || null
    : null;

  useEffect(() => {
    if (linkedProductFound) {
      setSelectedProduct(linkedProductFound);
    }
  }, [linkedProductId, linkedProductFound?.id, cloudReady]);

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

        {/* VIEW 2: BOUTIQUE / CATALOGUE (aussi derrière un lien produit partagé) */}
        {(route.startsWith('#/shop') || (isProductLinkRoute && (linkedProductFound || !cloudReady))) && (
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

        {/* VIEW 3.5: PACKAGE TRACKING PORTAL */}
        {route.startsWith('#/suivi') && (
          <TrackingView
            orders={orders}
            settings={settings}
            initialOrderId={trackingOrderId}
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

        {/* VIEW 5: UNKNOWN ROUTE / DEMO PAGE FALLBACK (ZÉRO PAGE BLANCHE) */}
        {route !== '#/' &&
          !route.startsWith('#/shop') &&
          !(isProductLinkRoute && (linkedProductFound || !cloudReady)) &&
          !route.startsWith('#/account') &&
          !route.startsWith('#/suivi') &&
          !isAdminRoute && (
            <div className="py-24 px-4 text-center max-w-lg mx-auto space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-[#ece7ff] text-[#5433eb] mx-auto flex items-center justify-center font-black text-2xl shadow-sm">
                📦
              </div>
              <h2 className="text-2xl font-black text-[#050508]">
                Exemple de Présentation
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cet article ou cette page était <strong>un exemple pour la vitrine</strong>. Vous pouvez revenir en arrière ou découvrir l'ensemble de notre catalogue disponible en stock !
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate('#/')}
                  className="px-6 py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  ← Revenir en arrière (Accueil)
                </button>
                <button
                  onClick={() => navigate('#/shop')}
                  className="px-6 py-3 rounded-full bg-[#5433eb] hover:bg-[#4323d8] text-white text-xs font-black shadow-md shadow-[#5433eb]/20 transition cursor-pointer"
                >
                  Voir les produits en stock
                </button>
              </div>
            </div>
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
        onOrderCreated={handleOrderCreated}
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

      {/* Chargement cloud discret lors de l'ouverture d'un lien produit partagé */}
      {!!linkedProductId && !cloudReady && !linkedProductFound && (
        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#5433eb] animate-spin" />
          <p className="text-xs font-bold text-slate-600">Ouverture du produit…</p>
        </div>
      )}

    </div>
  );
}
