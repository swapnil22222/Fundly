import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useInvoices } from '../context/InvoiceContext';
import InvoiceCard from '../components/InvoiceCard';
import CatMascot from '../components/CatMascot';

const InvestorDashboard = () => {
  const { account, connect } = useWallet();
  const { invoices, myFunded, openInvoices, fetchAllInvoices, loading } = useInvoices();
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAllInvoices(); }, []);

  const filterMap = {
    open: openInvoices,
    all: invoices,
    mine: myFunded,
  };

  const displayed = (filterMap[filter] || []).filter(inv =>
    inv.description?.toLowerCase().includes(search.toLowerCase()) ||
    inv.seller?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <CatMascot size={60} mood="happy" style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }} />
        <div>
          <h1 className="page-title">Investor Dashboard</h1>
          <p style={{ color: '#5a4e6e', fontSize: 14 }}>Browse and fund invoices on-chain~ 💜</p>
        </div>
        {!account && (
          <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={connect}>
            🐾 Connect Wallet
          </button>
        )}
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: '🌸 Open', value: openInvoices.length, color: '#5cc99e' },
          { label: '💜 All', value: invoices.length, color: '#a891e8' },
          { label: '🎯 My Funded', value: myFunded.length, color: '#e8789a' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'Klee One', cursive", fontSize: 22, color: s.color, fontWeight: 600 }}>{s.value}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#5a4e6e' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['open', '🌸 Open'], ['all', '📋 All'], ['mine', '💜 My Funded']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13,
              background: filter === key
                ? 'linear-gradient(135deg, #ffb7c5, #e8789a)'
                : 'rgba(201,184,245,0.15)',
              color: filter === key ? 'white' : '#5a4e6e',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
        <input
          className="input-field"
          style={{ flex: 1, minWidth: 200, padding: '9px 16px' }}
          placeholder="🔍 Search by description or seller..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-outline" style={{ padding: '9px 18px', fontSize: 13 }} onClick={fetchAllInvoices}>
          🔄 Refresh
        </button>
      </div>

      {/* Invoice Grid */}
      {loading ? (
        <LoadingState />
      ) : displayed.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {displayed.map(inv => (
            <InvoiceCard key={inv.id} invoice={inv} showFund={filter !== 'mine'} />
          ))}
        </div>
      )}
    </div>
  );
};

const LoadingState = () => (
  <div style={{ textAlign: 'center', padding: 60 }}>
    <CatMascot size={80} mood="thinking" style={{ animation: 'wiggle 1s ease-in-out infinite', display: 'inline-block', marginBottom: 16 }} />
    <p style={{ color: '#c0aec8', fontWeight: 700 }}>Loading invoices... nyaa~</p>
  </div>
);

const EmptyState = ({ filter }) => (
  <div className="card" style={{ padding: 56, textAlign: 'center' }}>
    <CatMascot size={90} mood="sleeping" style={{ display: 'inline-block', marginBottom: 16 }} />
    <h3 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.3rem', marginBottom: 8 }}>
      {filter === 'mine' ? 'No funded invoices yet~' : 'No invoices found~'}
    </h3>
    <p style={{ color: '#c0aec8', fontSize: 14 }}>
      {filter === 'mine' ? 'Fund an invoice to see it here!' : 'Come back later or try a different filter!'}
    </p>
  </div>
);

export default InvestorDashboard;
