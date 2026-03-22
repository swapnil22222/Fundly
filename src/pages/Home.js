import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useInvoices } from '../context/InvoiceContext';
import CatMascot from '../components/CatMascot';

const StatCard = ({ label, value, color }) => (
  <div className="card" style={{ padding: '20px 24px', textAlign: 'center', flex: 1, minWidth: 140 }}>
    <div style={{ fontFamily: "'Klee One', cursive", fontSize: 28, fontWeight: 600, color }}>{value}</div>
    <div style={{ fontSize: 13, color: '#5a4e6e', fontWeight: 700, marginTop: 4 }}>{label}</div>
  </div>
);

const FeatureCard = ({ emoji, title, desc, color }) => (
  <div className="card" style={{ padding: 24, flex: 1, minWidth: 200 }}>
    <div style={{
      width: 52, height: 52, borderRadius: 16,
      background: color + '30',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 26, marginBottom: 14,
    }}>{emoji}</div>
    <div style={{ fontFamily: "'Klee One', cursive", fontSize: 17, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: '#5a4e6e', lineHeight: 1.6 }}>{desc}</div>
  </div>
);

const Home = () => {
  const { account, connect, loading } = useWallet();
  const { invoices, fetchAllInvoices } = useInvoices();

  useEffect(() => { fetchAllInvoices(); }, []);

  const stats = {
    total:  invoices.length,
    open:   invoices.filter(i => i.status === 'Open').length,
    funded: invoices.filter(i => i.status === 'Funded' || i.status === 'Released').length,
    repaid: invoices.filter(i => i.status === 'Repaid').length,
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

      <div className="card" style={{
        padding: '60px 40px',
        textAlign: 'center',
        marginBottom: 32,
        background: 'linear-gradient(135deg, rgba(255,183,197,0.2), rgba(201,184,245,0.2), rgba(168,230,207,0.15))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <CatMascot size={110} mood="excited" className="float" />
        </div>

        <h1 style={{
          fontFamily: "'Klee One', cursive",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          color: '#2d2438', marginBottom: 12, lineHeight: 1.2,
        }}>
          Fundly
        </h1>

        <p style={{ fontSize: 18, color: '#5a4e6e', maxWidth: 540, margin: '0 auto 8px', lineHeight: 1.7 }}>
          Invoice funding on Ethereum Sepolia
        </p>
        <p style={{ fontSize: 14, color: '#c9b8f5', maxWidth: 540, margin: '0 auto 28px', lineHeight: 1.7, fontWeight: 700 }}>
          Sellers create invoices. Investors fund them. Everyone wins.
        </p>

        {!account ? (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: 16, padding: '14px 32px' }}
              onClick={connect}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <Link to="/investor">
              <button className="btn btn-outline" style={{ fontSize: 16, padding: '14px 32px' }}>
                Browse Invoices
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/seller">
              <button className="btn btn-primary" style={{ fontSize: 16, padding: '14px 28px' }}>
                Seller Dashboard
              </button>
            </Link>
            <Link to="/investor">
              <button className="btn btn-secondary" style={{ fontSize: 16, padding: '14px 28px' }}>
                Fund Invoices
              </button>
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard label="Total Invoices" value={stats.total}  color="#e8789a" />
        <StatCard label="Open"           value={stats.open}   color="#5cc99e" />
        <StatCard label="Funded"         value={stats.funded} color="#a891e8" />
        <StatCard label="Repaid"         value={stats.repaid} color="#f5b800" />
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{
          fontFamily: "'Klee One', cursive", fontSize: '1.6rem',
          textAlign: 'center', marginBottom: 20, color: '#2d2438',
        }}>
          How it works
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <FeatureCard emoji="📝" title="Create Invoice"
            desc="Sellers create invoices, download the template, sign it, and upload the signed PDF."
            color="#ffb7c5" />
          <FeatureCard emoji="💰" title="Get Funded"
            desc="Investors browse all open invoices and fund the ones they like with ETH."
            color="#c9b8f5" />
          <FeatureCard emoji="⏰" title="Refund Window"
            desc="Changed your mind? Investors can request a full refund within the refund window."
            color="#a8e6cf" />
          <FeatureCard emoji="🧾" title="Get Receipt"
            desc="Every funding generates an on-chain receipt with invoice details attached."
            color="#ffd86e" />
          <FeatureCard emoji="💚" title="Repay"
            desc="Sellers repay investors through the contract — principal plus 5% profit."
            color="#b8e0f7" />
        </div>
      </div>

      <div style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 40 }}>
        <CatMascot size={60} mood="love" className="float" style={{ display: 'inline-block' }} />
        <p style={{ fontSize: 13, color: '#c0aec8', marginTop: 8 }}>
          Fundly — Built on Ethereum Sepolia Testnet
        </p>
      </div>

    </div>
  );
};

export default Home;