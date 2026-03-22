import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useInvoices } from '../context/InvoiceContext';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = {
    Open:     { cls: 'badge-open',     label: 'Open'     },
    Funded:   { cls: 'badge-funded',   label: 'Funded'   },
    Released: { cls: 'badge-funded',   label: 'Released' },
    Repaid:   { cls: 'badge-repaid',   label: 'Repaid'   },
    Refunded: { cls: 'badge-refunded', label: 'Refunded' },
  };
  const s = map[status] || map.Open;
  return <span className={'badge ' + s.cls}>{s.label}</span>;
};

const Detail = ({ label, value, mono }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#c0aec8', marginBottom: 2 }}>{label}</div>
    <div style={{
      fontSize: 13,
      fontWeight: 700,
      color: '#2d2438',
      fontFamily: mono ? 'monospace' : "'Nunito', sans-serif",
      wordBreak: 'break-all',
    }}>{value}</div>
  </div>
);

const shortAddr = (addr) => {
  if (!addr) return 'N/A';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
};

const InvoiceCard = ({ invoice, showFund, showRepay }) => {
  const { account } = useWallet();
  const { fundInvoice, repayInvoice, requestRefund, releaseFunds } = useInvoices();
  const [hovering, setHovering]           = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow]                     = useState(Date.now());

  // Tick every second so timer and button visibility stay live
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isInvestor = invoice.investor && account &&
    invoice.investor.toLowerCase() === account.toLowerCase();
  const isSeller = invoice.seller && account &&
    invoice.seller.toLowerCase() === account.toLowerCase();

  const isFunded   = invoice.status === 'Funded';
  const isReleased = invoice.status === 'Released';

  // Use live `now` so these recalculate every second
  const WINDOW_MS     = 2 * 60 * 1000; // must match contract — change to 3600000 for production
  const windowEndTime = invoice.fundedAt ? invoice.fundedAt + WINDOW_MS : null;
  const withinWindow  = isFunded && windowEndTime && now < windowEndTime;
  const windowClosed  = isFunded && windowEndTime && now >= windowEndTime;

  const canRefund  = isInvestor && withinWindow;
  const canRelease = isSeller   && windowClosed;
  const canRepay   = isSeller   && isReleased;

  const minsLeft = windowEndTime
    ? Math.max(0, Math.floor((windowEndTime - now) / 60000))
    : 0;
  const secsLeft = windowEndTime
    ? Math.max(0, Math.floor(((windowEndTime - now) % 60000) / 1000))
    : 0;

  const fee = invoice.amount
    ? (parseFloat(invoice.amount) * 0.05).toFixed(4)
    : '0.0000';

  const repayTotal = invoice.repayAmount
    ? invoice.repayAmount
    : (parseFloat(invoice.amount || 0) * 1.05).toFixed(4);

  const handleFund = async () => {
    if (!account) { toast.error('Connect wallet first!'); return; }
    setActionLoading(true);
    await fundInvoice(invoice.id, invoice.amount);
    setActionLoading(false);
  };

  const handleRepay = async () => {
    setActionLoading(true);
    await repayInvoice(invoice.id);
    setActionLoading(false);
  };

  const handleRefund = async () => {
    setActionLoading(true);
    await requestRefund(invoice.id);
    setActionLoading(false);
  };

  const handleRelease = async () => {
    setActionLoading(true);
    await releaseFunds(invoice.id);
    setActionLoading(false);
  };

  return (
    <div
      className="card"
      style={{
        padding: 20,
        transform: hovering ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9b8f5', letterSpacing: 1, marginBottom: 4 }}>
            INVOICE #{invoice.id}
          </div>
          <div style={{ fontFamily: "'Klee One', cursive", fontSize: 17, color: '#2d2438', lineHeight: 1.3 }}>
            {invoice.description}
          </div>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <hr className="divider" style={{ margin: '12px 0' }} />

      {/* Party details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <Detail label="Seller"        value={invoice.sellerName ? invoice.sellerName : shortAddr(invoice.seller)} />
        <Detail label="Buyer"         value={invoice.buyerName  ? invoice.buyerName  : 'Not specified'} />
        <Detail label="Seller Wallet" value={shortAddr(invoice.seller)} mono />
        <Detail label="Investor"      value={invoice.investor   ? shortAddr(invoice.investor) : 'Awaiting funding'} mono={!!invoice.investor} />
      </div>

      <hr className="divider" style={{ margin: '12px 0' }} />

      {/* Amount breakdown */}
      <div style={{
        background: 'rgba(255,249,240,0.8)',
        border: '1.5px solid rgba(255,183,197,0.25)',
        borderRadius: 12, padding: '12px 14px', marginBottom: 12,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#c9b8f5', letterSpacing: 1, marginBottom: 8 }}>
          AMOUNT DETAILS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#5a4e6e' }}>Invoice amount</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#2d2438' }}>{invoice.amount} ETH</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#5a4e6e' }}>Investor profit (5%)</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#e8789a' }}>{fee} ETH</span>
        </div>
        <div style={{
          borderTop: '1.5px dashed rgba(255,183,197,0.4)',
          paddingTop: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5a4e6e' }}>Seller repays</span>
          <span style={{ fontFamily: "'Klee One', cursive", fontSize: 20, color: '#a891e8', fontWeight: 600 }}>
            {repayTotal} ETH
          </span>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {invoice.repayDays && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c0aec8', marginBottom: 2 }}>Repay within</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2d2438' }}>{invoice.repayDays} days</div>
          </div>
        )}
        {invoice.fundedAt && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c0aec8', marginBottom: 2 }}>Funded on</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2d2438' }}>
              {new Date(invoice.fundedAt).toLocaleDateString('en-IN')}
            </div>
          </div>
        )}
      </div>

      {/* IPFS */}
      {invoice.ipfsHash && (
        <div style={{ fontSize: 12, marginBottom: 12 }}>
          <a
            href={'https://ipfs.io/ipfs/' + invoice.ipfsHash}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#a891e8', textDecoration: 'none', fontWeight: 700 }}
          >
            View signed invoice
          </a>
        </div>
      )}

      {/* Live countdown — visible to everyone on a funded invoice */}
      {isFunded && invoice.fundedAt && withinWindow && (
        <div style={{
          background: 'rgba(255,183,197,0.15)',
          border: '1.5px solid rgba(255,183,197,0.5)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#c05070' }}>
            Refund window closes in
          </span>
          <span style={{
            fontSize: 16, fontWeight: 900, color: '#e8789a',
            fontFamily: 'monospace', background: 'rgba(255,183,197,0.2)',
            padding: '2px 10px', borderRadius: 8,
          }}>
            {minsLeft}m {secsLeft}s
          </span>
        </div>
      )}

      {/* Window closed notice */}
      {isFunded && windowClosed && (
        <div style={{
          background: 'rgba(168,230,207,0.15)',
          border: '1.5px solid rgba(168,230,207,0.5)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 12,
          fontSize: 13, fontWeight: 700, color: '#2e9e6e',
        }}>
          {isSeller
            ? 'Refund window closed. Collect your funds!'
            : 'Refund window closed. Waiting for seller to collect and repay.'}
        </div>
      )}

      {/* Seller released notice */}
      {canRepay && (
        <div style={{
          background: 'rgba(201,184,245,0.15)',
          border: '1.5px solid rgba(201,184,245,0.4)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 12,
          fontSize: 13, fontWeight: 700, color: '#7c5cbf',
        }}>
          Funds collected. Now repay {repayTotal} ETH to close this invoice.
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

        {/* FUND — anyone except seller on Open invoices */}
        {invoice.status === 'Open' && !isSeller && (
          <button
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: 14, flex: 1 }}
            onClick={handleFund}
            disabled={actionLoading}
          >
            {actionLoading ? 'Loading...' : 'Fund ' + invoice.amount + ' ETH'}
          </button>
        )}

        {/* REFUND — investor only within window */}
        {canRefund && (
          <button
            className="btn btn-outline"
            style={{ padding: '10px 20px', fontSize: 14, flex: 1, borderColor: 'rgba(255,183,197,0.6)', color: '#c05070' }}
            onClick={handleRefund}
            disabled={actionLoading}
          >
            {actionLoading ? 'Loading...' : 'Request Refund'}
          </button>
        )}

        {/* COLLECT FUNDS — seller only after window closes */}
        {canRelease && (
          <button
            className="btn btn-mint"
            style={{ padding: '10px 20px', fontSize: 14, flex: 1 }}
            onClick={handleRelease}
            disabled={actionLoading}
          >
            {actionLoading ? 'Loading...' : 'Collect ' + invoice.amount + ' ETH'}
          </button>
        )}

        {/* REPAY — seller only after collecting */}
        {canRepay && (
          <button
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: 14, flex: 1 }}
            onClick={handleRepay}
            disabled={actionLoading}
          >
            {actionLoading ? 'Loading...' : 'Repay ' + repayTotal + ' ETH'}
          </button>
        )}

      </div>
    </div>
  );
};

export default InvoiceCard;