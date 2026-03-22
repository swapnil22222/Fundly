import React from 'react';
import { useWallet } from '../context/WalletContext';
import { useInvoices } from '../context/InvoiceContext';
import CatMascot from '../components/CatMascot';
import jsPDF from 'jspdf';

const generateReceiptPDF = (receipt, invoice) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [148, 210] });
  const W = 148; const H = 210;
  const pink = [255, 183, 197]; const lav = [201, 184, 245]; const ink = [45, 36, 56];

  doc.setFillColor(255, 249, 240); doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...pink); doc.rect(0, 0, W, 14, 'F');
  doc.setFillColor(...lav); doc.rect(0, 14, W, 3, 'F');
  doc.setFillColor(...pink); doc.rect(0, H - 10, W, 10, 'F');

  doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.text('NyaaPay ✿ Funding Receipt', W/2, 10, { align: 'center' });

  doc.setFillColor(...lav); doc.roundedRect(10, 22, W-20, 10, 3, 3, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text('OFFICIAL FUNDING RECEIPT', W/2, 29, { align: 'center' });

  const row = (label, val, y) => {
    doc.setFillColor(255,255,255); doc.roundedRect(10, y, W-20, 12, 2, 2, 'F');
    doc.setTextColor(...lav); doc.setFontSize(7); doc.setFont('helvetica','bold');
    doc.text(label, 15, y+5);
    doc.setTextColor(...ink); doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text(String(val || '—'), 15, y+10);
  };

  row('RECEIPT ID', `#REC-${receipt.id || Date.now()}`, 38);
  row('INVESTOR ADDRESS', receipt.investor || '—', 55);
  row('INVOICE ID', `#${receipt.invoiceId}`, 72);
  row('AMOUNT FUNDED', `${receipt.amount} ETH`, 89);
  row('TRANSACTION HASH', receipt.txHash ? `${receipt.txHash.slice(0,20)}...` : 'Pending', 106);
  row('TIMESTAMP', new Date(receipt.timestamp).toLocaleString('en-IN'), 123);
  row('BLOCK NUMBER', receipt.blockNumber || '—', 140);
  if (invoice) row('DESCRIPTION', invoice.description?.slice(0,60) || '—', 157);

  doc.setFillColor(255,249,240); doc.setDrawColor(...pink); doc.roundedRect(10, 174, W-20, 22, 4, 4, 'FD');
  doc.setTextColor(...lav); doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.text('REFUND POLICY', 15, 181);
  doc.setTextColor(...ink); doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text('1-hour refund window from funding time.', 15, 187);
  doc.text('Request via NyaaPay DApp before window closes.', 15, 193);

  doc.setTextColor(255,255,255); doc.setFontSize(7); doc.text('NyaaPay · Ethereum Sepolia · Generated with ♡', W/2, H-4, { align: 'center' });

  doc.save(`NyaaPay_Receipt_${receipt.invoiceId}.pdf`);
};

const ReceiptCard = ({ receipt, invoice }) => {
  const isRefundable = invoice?.status === 'Funded' &&
    invoice?.fundedAt && (Date.now() - invoice.fundedAt) < 3600000;

  return (
    <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 60, height: 60,
        background: 'linear-gradient(135deg, rgba(201,184,245,0.3), transparent)',
        borderBottomLeftRadius: 40,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9b8f5', letterSpacing: 1, marginBottom: 4 }}>
            RECEIPT #{receipt.id}
          </div>
          <div style={{ fontFamily: "'Klee One', cursive", fontSize: 18 }}>
            Invoice #{receipt.invoiceId}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Klee One', cursive", fontSize: 22, color: '#e8789a', fontWeight: 600 }}>
            {receipt.amount} ETH
          </div>
          <div style={{ fontSize: 11, color: '#c0aec8', fontWeight: 700 }}>Funded</div>
        </div>
      </div>

      <hr className="divider" style={{ margin: '12px 0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <MiniDetail label="💰 Investor" value={shortAddr(receipt.investor)} mono />
        <MiniDetail label="📅 Date" value={new Date(receipt.timestamp).toLocaleDateString('en-IN')} />
        {receipt.txHash && (
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#c0aec8', marginBottom: 2 }}>🔗 Tx Hash</div>
            <a
              href={`https://sepolia.etherscan.io/tx/${receipt.txHash}`}
              target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: '#a891e8', fontWeight: 700, textDecoration: 'none', wordBreak: 'break-all' }}
            >
              {receipt.txHash.slice(0,24)}... ↗
            </a>
          </div>
        )}
        {invoice && <MiniDetail label="📋 Description" value={invoice.description?.slice(0,40) + '...'} />}
      </div>

      {isRefundable && (
        <div style={{
          background: 'rgba(168,230,207,0.15)', border: '1.5px solid rgba(168,230,207,0.4)',
          borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 12, fontWeight: 700, color: '#2e9e6e',
        }}>
          ✅ Refund window active!
        </div>
      )}

      <button
        className="btn btn-secondary"
        style={{ padding: '8px 18px', fontSize: 13, width: '100%' }}
        onClick={() => generateReceiptPDF(receipt, invoice)}
      >
        ⬇️ Download Receipt PDF
      </button>
    </div>
  );
};

const MiniDetail = ({ label, value, mono }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#c0aec8', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 700, color: '#2d2438', fontFamily: mono ? 'monospace' : "'Nunito',sans-serif" }}>{value}</div>
  </div>
);

const shortAddr = (addr) => addr ? `${addr.slice(0,6)}...${addr.slice(-4)}` : '—';

const Receipts = () => {
  const { account, connect } = useWallet();
  const { receipts, invoices } = useInvoices();

  if (!account) {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', padding: 20, textAlign: 'center' }}>
        <div className="card" style={{ padding: 48 }}>
          <CatMascot size={100} mood="love" style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block', marginBottom: 20 }} />
          <h2 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.5rem', marginBottom: 12 }}>Connect to see receipts~</h2>
          <button className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }} onClick={connect}>
            🐾 Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <CatMascot size={60} mood="love" style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }} />
        <div>
          <h1 className="page-title">My Receipts</h1>
          <p style={{ color: '#5a4e6e', fontSize: 14 }}>Your funding history & receipts~ 🧾</p>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <CatMascot size={90} mood="sleeping" style={{ display: 'inline-block', marginBottom: 16 }} />
          <h3 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.3rem', marginBottom: 8 }}>No receipts yet~</h3>
          <p style={{ color: '#c0aec8', fontSize: 14 }}>Fund an invoice to get your first receipt!</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16, fontWeight: 700, color: '#5a4e6e' }}>
            {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} found ✨
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
            {receipts.map(receipt => {
              const invoice = invoices.find(inv => inv.id === receipt.invoiceId);
              return <ReceiptCard key={receipt.id} receipt={receipt} invoice={invoice} />;
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Receipts;
