import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import CatMascot from './CatMascot';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/seller', label: 'Seller' },
  { path: '/investor', label: 'Investor' },
  { path: '/receipts', label: 'Receipts' },
];

const Navbar = () => {
  const { account, shortAddress, connect, disconnect, loading } = useWallet();
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <CatMascot size={38} mood="happy" className="float" />
          <div>
            <div style={styles.logoTitle}>Fundly</div>
            <div style={styles.logoSub}>Invoice DeFi</div>
          </div>
        </Link>

        <div style={styles.links}>
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                ...styles.link,
                ...(location.pathname === path ? styles.linkActive : {}),
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div style={styles.walletArea}>
          {account ? (
            <div style={styles.walletInfo}>
              <span style={styles.dot} />
              <span style={styles.addr}>{shortAddress}</span>
              <button
                onClick={disconnect}
                style={styles.disconnectBtn}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connect} disabled={loading} style={styles.connectBtn}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(255,249,240,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1.5px solid rgba(255,183,197,0.25)',
    boxShadow: '0 2px 20px rgba(180,140,200,0.1)',
  },
  inner: {
    maxWidth: 1200, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 24px', gap: 16,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none', flexShrink: 0,
  },
  logoTitle: {
    fontFamily: "'Klee One', cursive", fontSize: 22,
    fontWeight: 600, color: '#2d2438',
  },
  logoSub: { fontSize: 11, color: '#e8789a', fontWeight: 700 },
  links: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  link: {
    padding: '8px 14px', borderRadius: 50, textDecoration: 'none',
    fontSize: 14, fontWeight: 700, color: '#5a4e6e',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  },
  linkActive: {
    background: 'linear-gradient(135deg, rgba(255,183,197,0.3), rgba(201,184,245,0.3))',
    color: '#c05070',
  },
  walletArea: { flexShrink: 0 },
  walletInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#5cc99e', flexShrink: 0 },
  addr: { fontSize: 13, fontWeight: 700, color: '#5a4e6e', fontFamily: 'monospace' },
  disconnectBtn: {
    padding: '7px 14px', borderRadius: 50,
    background: 'rgba(255,183,197,0.2)', color: '#c05070',
    border: '1.5px solid rgba(255,183,197,0.5)',
    cursor: 'pointer', fontSize: 13, fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
  },
  connectBtn: {
    background: 'linear-gradient(135deg, #ffb7c5, #e8789a)',
    color: 'white', padding: '10px 20px', borderRadius: 50,
    border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
    boxShadow: '0 4px 16px rgba(232,120,154,0.35)',
    transition: 'all 0.2s',
  },
};

export default Navbar;