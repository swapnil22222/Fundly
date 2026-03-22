import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import { InvoiceProvider } from './context/InvoiceContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SellerDashboard from './pages/SellerDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import Receipts from './pages/Receipts';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const FloatingPetals = () => {
  const petals = ['+', 'x', '+', 'x', '+', 'x', '+', 'x'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {petals.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: ((i * 12 + 5) % 95) + '%',
          top: ((i * 13 + 8) % 90) + '%',
          fontSize: (12 + (i % 3) * 4) + 'px',
          opacity: 0.06,
          color: ['#ffb7c5', '#c9b8f5', '#a8e6cf'][i % 3],
        }}>{p}</div>
      ))}
    </div>
  );
};

const App = () => (
  <WalletProvider>
    <InvoiceProvider>
      <BrowserRouter>
        <ScrollToTop />
        <FloatingPetals />
        <Navbar />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/investor" element={<InvestorDashboard />} />
            <Route path="/receipts" element={<Receipts />} />
          </Routes>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,183,197,0.3)',
              boxShadow: '0 8px 32px rgba(180,140,200,0.2)',
              color: '#2d2438',
            },
            success: { iconTheme: { primary: '#5cc99e', secondary: 'white' } },
            error:   { iconTheme: { primary: '#e8789a', secondary: 'white' } },
          }}
        />
      </BrowserRouter>
    </InvoiceProvider>
  </WalletProvider>
);

export default App;