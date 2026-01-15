import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context';
import Header from './components/Header';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Admin from './pages/Admin';
import Success from './pages/Success';
import Wishlist from './pages/Wishlist';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <ScrollToTop />
        <Header />
        <div className="min-h-[calc(100vh-80px)]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/success" element={<Success />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;