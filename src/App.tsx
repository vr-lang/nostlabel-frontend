import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LenisProvider } from './components/LenisProvider';
import Navbar from './components/Navbar';
import PageLoader from './components/PageLoader';
import { useStartupLoading } from './context/StartupLoadingContext';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import GrainOverlay from './components/GrainOverlay';
import CartDrawer from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import Footer from './sections/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import PageTransition from './components/layout/PageTransition';

// Pages (Lazy Loaded)
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const CollectionDetailPage = lazy(() => import('./pages/CollectionDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const DirectorLogin = lazy(() => import('./pages/DirectorLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Overview = lazy(() => import('./pages/admin/Overview'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Inventory = lazy(() => import('./pages/admin/Inventory'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const AdminExchanges = lazy(() => import('./pages/admin/AdminExchanges'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const Offers = lazy(() => import('./pages/admin/Offers'));
const HomepageOfferAdmin = lazy(() => import('./pages/admin/HomepageOffer'));
const Reviews = lazy(() => import('./pages/admin/Reviews'));

// Customer Pages (Lazy Loaded)
const Register = lazy(() => import('./pages/Register'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyResetOTP = lazy(() => import('./pages/VerifyResetOTP'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const ExchangesPage = lazy(() => import('./pages/ExchangesPage'));
const ExchangeDetailsPage = lazy(() => import('./pages/ExchangeDetailsPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));

// Routes & Context
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

import type { Product } from './data/products';
import { api } from './utils/api';

const CustomerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#F5F3EF] flex items-center justify-center select-none animate-pulse">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full border border-text-dark border-t-transparent animate-spin" />
          <span className="text-[10px] font-mono text-text-dark/40 tracking-widest uppercase">
            VERIFYING DECRYPTION KEY...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { isAppLoading, error: startupError } = useStartupLoading();
  const showInitialLoader = isAppLoading || !!startupError;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [pageTransitionActive, setPageTransitionActive] = useState(false);
  const prevPathRef = useRef(location.pathname);

  // Determine if header and footer should render (show on all customer-facing routes)
  const showNavbarAndFooter = !location.pathname.startsWith('/admin') && location.pathname !== '/director-login';

  // Dynamic header height measurement to compensate for fixed position spacing
  useEffect(() => {
    if (!showNavbarAndFooter) return;
    
    // Set a timeout to allow the header to render in the DOM first
    const timer = setTimeout(() => {
      const header = document.querySelector('header');
      if (!header) return;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          document.documentElement.style.setProperty(
            '--header-height',
            `${entry.target.getBoundingClientRect().height}px`
          );
        }
      });

      observer.observe(header);
      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, showNavbarAndFooter]);

  // 1. Fetch Cart from Backend on Startup
  useEffect(() => {
    const syncCart = async () => {
      try {
        const res = await api.getCart();
        if (res && res.success && res.data) {
          const mappedItems: CartItem[] = (res.data.cart || res.data.items || []).map((item: any) => ({
            product: {
              id: item.product._id,
              name: item.product.name,
              slug: item.product.slug,
              description: item.product.description,
              material: '100% Organic Cotton',
              gsm: '220 GSM',
              price: item.price,
              images: (item.product.images || []).map((img: any) => typeof img === 'string' ? img : (img.url || '')),
              colors: item.product.colors || [],
              sizes: item.product.sizes || [],
              variants: item.product.variants || [],
              category: item.product.category?.name || 'T-Shirts'
            },
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }));
          setCartItems(mappedItems);
        }
      } catch {
        console.warn("Backend offline or client unauthorized. Operating cart in standalone mode.");
      }
    };
    if (!showInitialLoader) {
      const token = localStorage.getItem('nostlabel_admin_token');
      if (token) {
        syncCart();
      } else {
        setCartItems([]);
      }
    }
  }, [showInitialLoader, location.pathname]);

  // 1b. Refresh GSAP ScrollTrigger on navigation to ensure correct offsets
  useEffect(() => {
    if (showInitialLoader) return;
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, showInitialLoader]);

  // 1c. Trigger full-screen loader on route changes
  useEffect(() => {
    if (showInitialLoader) return;

    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      setPageTransitionActive(true);
      const timer = setTimeout(() => {
        setPageTransitionActive(false);
      }, 650); // Luxury fade overlay timing
      return () => clearTimeout(timer);
    }
  }, [location.pathname, showInitialLoader]);



  // Toast notifications helper
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 3. Cart Actions
  const handleAddToCart = async (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string, quantity: number = 1) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.product.id === product.id && item.size === size && item.color === color
    );

    let updatedCart = [...cartItems];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({ product, quantity, size, color });
    }
    setCartItems(updatedCart);
    showNotification(`ADDED ${product.name} (${size}) TO BAG`);

    const token = localStorage.getItem('nostlabel_admin_token');
    if (token) {
      try {
        await api.addToCart(product.id, quantity, size, color);
      } catch {
        // Standalone fallback
      }
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number, size: string, color: string) => {
    const updatedCart = cartItems.map((item) => {
      if (item.product.id === productId && item.size === size && item.color === color) {
        return { ...item, quantity };
      }
      return item;
    });
    setCartItems(updatedCart);

    const token = localStorage.getItem('nostlabel_admin_token');
    if (token) {
      try {
        await api.updateCartItem(productId, quantity, size, color);
      } catch {
        // Fallback
      }
    }
  };

  const handleRemoveItem = async (productId: string, size: string, color: string) => {
    const updatedCart = cartItems.filter(
      (item) => !(item.product.id === productId && item.size === size && item.color === color)
    );
    setCartItems(updatedCart);
    showNotification("ITEM REMOVED FROM BAG");

    const token = localStorage.getItem('nostlabel_admin_token');
    if (token) {
      try {
        await api.removeFromCart(productId, size, color);
      } catch {
        // Fallback
      }
    }
  };

  // 4. Redirect to Checkout Page
  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const handleNavigateToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollToSection: sectionId } });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleProductDetails = (product: Product) => {
    navigate(`/product/${product.slug}`);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AuthProvider>
      <LenisProvider>
        <ScrollToTop />
          {/* Startup loader (backend-aware) */}
          {showInitialLoader && <PageLoader />}

          {!showInitialLoader && (
            <div className="relative min-h-screen selection:bg-accent-gold/30 selection:text-text-dark">
              {/* Global Visual Overlays */}
              <GrainOverlay />


              {/* Toast Notification */}
              {notification && (
                <div className="fixed top-24 right-6 md:right-12 z-50 bg-bg-dark-1 border border-accent-gold/40 text-white text-[10px] uppercase font-bold tracking-widest px-6 py-4.5 shadow-2xl rounded-sm animate-bounce font-mono">
                  {notification}
                </div>
              )}

              {/* Route Transition Overlay */}
              <AnimatePresence>
                {pageTransitionActive && <PageLoader />}
              </AnimatePresence>

              {/* Navigation (Only show on homepage) */}
              {showNavbarAndFooter && (
                <Navbar
                  cartCount={totalCartCount}
                  onCartClick={() => setCartOpen(true)}
                  onSearchClick={() => setSearchOpen(true)}
                  onNavigateToSection={handleNavigateToSection}
                />
              )}

              {/* Layout Modals */}
              <CartDrawer
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
              />

              <SearchModal
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                onProductClick={handleProductDetails}
              />



              {/* Main Routing Gateway */}
              <AnimatePresence mode="wait">
                <Suspense fallback={<PageLoader />}>
                  <Routes location={location} key={location.pathname}>
                  <Route
                    path="/"
                    element={
                      <PageTransition>
                        <HomePage
                          onAddToCart={handleAddToCart}
                          onProductClick={handleProductDetails}
                        />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/product/:slug"
                    element={
                      <PageTransition>
                        <ProductDetailPage
                          onAddToCart={handleAddToCart}
                        />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/collections"
                    element={
                      <PageTransition>
                        <CollectionsPage onProductClick={handleProductDetails} />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/collections/:slug"
                    element={
                      <PageTransition>
                        <CollectionDetailPage 
                          onProductClick={handleProductDetails} 
                          onAddToCart={handleAddToCart}
                        />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <PageTransition>
                        <AboutPage />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/privacy-policy"
                    element={
                      <PageTransition>
                        <PrivacyPolicy />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/terms-of-service"
                    element={
                      <PageTransition>
                        <TermsOfService />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/director-login"
                    element={
                      <PageTransition>
                        <DirectorLogin />
                      </PageTransition>
                    }
                  />
                  
                  {/* Customer Authentication & Dashboard Routes */}
                  <Route
                    path="/register"
                    element={
                      <PageTransition>
                        <Register />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PageTransition>
                        <Login />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/verify-otp"
                    element={
                      <PageTransition>
                        <VerifyOTP />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PageTransition>
                        <ForgotPassword />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/verify-reset-otp"
                    element={
                      <PageTransition>
                        <VerifyResetOTP />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <PageTransition>
                        <ResetPassword />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <CustomerProtectedRoute>
                        <PageTransition>
                          <AccountPage />
                        </PageTransition>
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <CustomerProtectedRoute>
                        <PageTransition>
                          <AccountPage />
                        </PageTransition>
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <CustomerProtectedRoute>
                        <PageTransition>
                          <Checkout clearCartLocal={() => setCartItems([])} cartItems={cartItems} />
                        </PageTransition>
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-success/:orderId"
                    element={
                      <CustomerProtectedRoute>
                        <PageTransition>
                          <OrderSuccess />
                        </PageTransition>
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/track-order/:orderId"
                    element={
                      <CustomerProtectedRoute>
                        <PageTransition>
                          <TrackOrder />
                        </PageTransition>
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders/:id"
                    element={
                      <CustomerProtectedRoute>
                        <PageTransition>
                          <OrderDetails />
                        </PageTransition>
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/exchanges"
                    element={
                      <CustomerProtectedRoute>
                        <PageTransition>
                          <ExchangesPage />
                        </PageTransition>
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/exchanges/:id"
                    element={
                      <CustomerProtectedRoute>
                        <PageTransition>
                          <ExchangeDetailsPage />
                        </PageTransition>
                      </CustomerProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<Overview />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="exchanges" element={<AdminExchanges />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="coupons" element={<Coupons />} />
                    <Route path="offers" element={<Offers />} />
                    <Route path="homepage-offer" element={<HomepageOfferAdmin />} />
                    <Route path="reviews" element={<Reviews />} />
                  </Route>
                  </Routes>
                </Suspense>
              </AnimatePresence>

              {/* Footer (Only show on homepage) */}
              {showNavbarAndFooter && (
                <Footer
                  onNavigateToSection={handleNavigateToSection}
                  onDirectorClick={() => navigate('/director-login')}
                  onCartClick={() => setCartOpen(true)}
                />
              )}
            </div>
          )}
        </LenisProvider>
      </AuthProvider>
  );
};

export default App;
