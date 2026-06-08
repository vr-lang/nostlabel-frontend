import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LenisProvider } from './components/LenisProvider';
import Navbar from './components/Navbar';
import Preloader from './components/Preloader';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import GrainOverlay from './components/GrainOverlay';
import CartDrawer from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import Footer from './sections/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import PageTransition from './components/layout/PageTransition';

// Pages
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import AboutPage from './pages/AboutPage';
import DirectorLogin from './pages/DirectorLogin';
import AdminDashboard from './pages/AdminDashboard';
import Overview from './pages/admin/Overview';
import Orders from './pages/admin/Orders';
import Inventory from './pages/admin/Inventory';
import Customers from './pages/admin/Customers';
import Analytics from './pages/admin/Analytics';
import AdminExchanges from './pages/admin/AdminExchanges';

// Customer Pages
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOTP from './pages/VerifyResetOTP';
import ResetPassword from './pages/ResetPassword';
import AccountPage from './pages/AccountPage';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import OrderDetails from './pages/OrderDetails';
import ExchangesPage from './pages/ExchangesPage';
import ExchangeDetailsPage from './pages/ExchangeDetailsPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Routes & Context
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';

import type { Product } from './data/products';
import { api } from './utils/api';

const CustomerProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#F8F5F0] flex items-center justify-center select-none animate-pulse">
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
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Determine if header and footer should render (show on all customer-facing routes)
  const showNavbarAndFooter = !location.pathname.startsWith('/admin') && location.pathname !== '/director-login';

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
              gsm: '280 GSM',
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
    if (!loading) {
      syncCart();
    }
  }, [loading, location.pathname]);

  // 1b. Refresh GSAP ScrollTrigger on navigation to ensure correct offsets
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, loading]);



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

    try {
      await api.addToCart(product.id, quantity, size, color);
    } catch {
      // Standalone fallback
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

    try {
      await api.updateCartItem(productId, quantity, size, color);
    } catch {
      // Fallback
    }
  };

  const handleRemoveItem = async (productId: string, size: string, color: string) => {
    const updatedCart = cartItems.filter(
      (item) => !(item.product.id === productId && item.size === size && item.color === color)
    );
    setCartItems(updatedCart);
    showNotification("ITEM REMOVED FROM BAG");

    try {
      await api.removeFromCart(productId, size, color);
    } catch {
      // Fallback
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
        {/* Cinematic preloader */}
        {loading && <Preloader onComplete={() => setLoading(false)} />}

        {!loading && (
          <div className="relative min-h-screen selection:bg-accent-gold/30 selection:text-text-dark">
            {/* Global Visual Overlays */}
            <GrainOverlay />


            {/* Toast Notification */}
            {notification && (
              <div className="fixed top-24 right-6 md:right-12 z-50 bg-bg-dark-1 border border-accent-gold/40 text-white text-[10px] uppercase font-bold tracking-widest px-6 py-4.5 shadow-2xl rounded-sm animate-bounce font-mono">
                {notification}
              </div>
            )}

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
                      <CollectionDetailPage onProductClick={handleProductDetails} />
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
                </Route>
              </Routes>
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
