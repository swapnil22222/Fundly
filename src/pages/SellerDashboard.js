import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useInvoices } from '../context/InvoiceContext';
import InvoiceCard from '../components/InvoiceCard';
import CatMascot from '../components/CatMascot';
import { generateInvoicePDF } from '../utils/generatePDF';
import toast from 'react-hot-toast';

const steps = ['Details', 'Download', 'Upload', 'Submit'];

const SellerDashboard = () => {
  const { account, connect } = useWallet();
  const { myInvoices, createInvoice, fetchAllInvoices, loading } = useInvoices();

  const [step, setStep]             = useState(0);
  const [form, setForm]             = useState({
    description: '', amount: '', sellerName: '', buyerName: '', repayDays: '',
  });
  const [signedFile, setSignedFile] = useState(null);
  const [ipfsHash, setIpfsHash]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [draftId] = useState(() => Math.floor(Math.random() * 9000) + 1000);

  useEffect(() => { if (account) fetchAllInvoices(); }, [account]);

  const handleField = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validateStep0 = () => {
    if (!form.description) { toast.error('Description is required!'); return false; }
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount!'); return false; }
    if (!form.repayDays || parseInt(form.repayDays) <= 0) { toast.error('Enter repayment duration!'); return false; }
    return true;
  };

  const handleDownload = () => {
    if (!validateStep0()) return;
    generateInvoicePDF({
      id:              draftId,
      sellerAddress:   account,
      sellerName:      form.sellerName || 'Your Name',
      buyerName:       form.buyerName  || 'Buyer Name',
      description:     form.description,
      amount:          form.amount,
      repayAmount:     (parseFloat(form.amount) * 1.05).toFixed(4),
      repayDays:       form.repayDays,
      investorAddress: null,
      date:            new Date().toLocaleDateString('en-IN'),
    });
    toast.success('Invoice template downloaded!');
    setStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file!'); return; }
    setSignedFile(file);
    const fakeHash = 'Qm' + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12);
    setIpfsHash(fakeHash);
    toast.success('Signed invoice uploaded!');
  };

  const handleSubmit = async () => {
    if (!account) { toast.error('Connect wallet first!'); return; }
    if (!validateStep0()) return;
    setSubmitting(true);
    const result = await createInvoice({
      amount:      form.amount,
      description: form.description,
      ipfsHash,
      sellerName:  form.sellerName,
      buyerName:   form.buyerName,
      repayDays:   form.repayDays,
    });
    if (result) {
      toast.success('Invoice created on-chain!');
      setStep(0);
      setForm({ description: '', amount: '', sellerName: '', buyerName: '', repayDays: '' });
      setSignedFile(null);
      setIpfsHash('');
    }
    setSubmitting(false);
  };

  if (!account) return <ConnectPrompt connect={connect} />;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <CatMascot size={60} mood="thinking" className="float" style={{ flexShrink: 0 }} />
        <div>
          <h1 className="page-title">Seller Dashboard</h1>
          <p style={{ color: '#5a4e6e', fontSize: 14 }}>Create and manage your invoices</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 24 }}>

        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.3rem', marginBottom: 20 }}>
            Create New Invoice
          </h2>

          <div style={{ display: 'flex', marginBottom: 28 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', margin: '0 auto 4px',
                  background: i <= step
                    ? 'linear-gradient(135deg, #ffb7c5, #e8789a)'
                    : 'rgba(201,184,245,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: i <= step ? 'white' : '#c0aec8',
                  fontWeight: 800, transition: 'all 0.3s',
                }}>{i + 1}</div>
                <div style={{ fontSize: 11, color: i === step ? '#e8789a' : '#c0aec8', fontWeight: 700 }}>{s}</div>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label">Description *</label>
                <textarea className="input-field" name="description" value={form.description}
                  onChange={handleField} placeholder="What services are you providing?" />
              </div>
              <div>
                <label className="label">Amount Requested (ETH) *</label>
                <input className="input-field" type="number" step="0.001" name="amount"
                  value={form.amount} onChange={handleField} placeholder="0.5" />
                {form.amount && parseFloat(form.amount) > 0 && (
                  <div style={{ fontSize: 12, color: '#a891e8', marginTop: 4, fontWeight: 700 }}>
                    You will repay: {(parseFloat(form.amount) * 1.05).toFixed(4)} ETH (incl. 5% fee)
                  </div>
                )}
              </div>
              <div>
                <label className="label">Repayment Duration (days) *</label>
                <input className="input-field" type="number" min="1" max="365" name="repayDays"
                  value={form.repayDays} onChange={handleField} placeholder="e.g. 30" />
                <div style={{ fontSize: 12, color: '#c0aec8', marginTop: 4 }}>
                  How many days you plan to repay from funding date
                </div>
              </div>
              <div>
                <label className="label">Your Name / Business</label>
                <input className="input-field" name="sellerName" value={form.sellerName}
                  onChange={handleField} placeholder="Your Name or Business Name" />
              </div>
              <div>
                <label className="label">Buyer / Client Name</label>
                <input className="input-field" name="buyerName" value={form.buyerName}
                  onChange={handleField} placeholder="Client or Company Name" />
              </div>
              <button className="btn btn-primary" onClick={() => { if (validateStep0()) setStep(1); }}>
                Next: Download Template
              </button>
            </div>
          )}

          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <CatMascot size={80} mood="happy" className="float"
                style={{ display: 'inline-block', marginBottom: 16 }} />
              <h3 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.2rem', marginBottom: 8 }}>
                Download Your Template
              </h3>
              <p style={{ fontSize: 13, color: '#5a4e6e', marginBottom: 20, lineHeight: 1.6 }}>
                Download the invoice PDF, sign it, then upload the signed version!
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-gold" onClick={handleDownload}>Download PDF Template</button>
                <button className="btn btn-outline" onClick={() => setStep(2)}>Already signed</button>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#c0aec8', cursor: 'pointer', fontSize: 13, marginTop: 12 }}
                onClick={() => setStep(0)}>Back</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <h3 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.2rem', marginBottom: 8 }}>
                Upload Signed Invoice
              </h3>
              <label style={{
                display: 'block',
                border: '2px dashed rgba(255,183,197,0.5)',
                borderRadius: 16, padding: '24px 20px', cursor: 'pointer',
                background: signedFile ? 'rgba(168,230,207,0.1)' : 'transparent',
                marginBottom: 16, transition: 'all 0.2s',
              }}>
                <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                {signedFile
                  ? <div style={{ color: '#5cc99e', fontWeight: 700, marginTop: 6 }}>{signedFile.name}</div>
                  : <div style={{ color: '#c0aec8', marginTop: 6, fontSize: 13 }}>Click to upload signed PDF</div>
                }
              </label>
              {ipfsHash && (
                <div style={{ fontSize: 11, color: '#c9b8f5', wordBreak: 'break-all', marginBottom: 12 }}>
                  IPFS: {ipfsHash}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: '#c0aec8', cursor: 'pointer', fontSize: 13 }}
                  onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!signedFile}>
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ padding: '10px 0' }}>
              <CatMascot size={70} mood="excited" className="wiggle"
                style={{ display: 'block', margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.2rem', marginBottom: 12, textAlign: 'center' }}>
                Ready to Submit!
              </h3>
              <div className="card" style={{ padding: 16, marginBottom: 16, background: 'rgba(255,249,240,0.8)' }}>
                <div style={{ fontSize: 13, color: '#5a4e6e', lineHeight: 2.2 }}>
                  <div><b>Description:</b> {form.description}</div>
                  <div><b>Amount:</b> {form.amount} ETH</div>
                  <div><b>You repay:</b> {(parseFloat(form.amount || 0) * 1.05).toFixed(4)} ETH</div>
                  <div><b>Repay within:</b> {form.repayDays} days</div>
                  {form.sellerName && <div><b>Seller:</b> {form.sellerName}</div>}
                  {form.buyerName  && <div><b>Buyer:</b> {form.buyerName}</div>}
                  {signedFile      && <div><b>PDF:</b> {signedFile.name}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button style={{ background: 'none', border: 'none', color: '#c0aec8', cursor: 'pointer', fontSize: 13 }}
                  onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || loading}>
                  {submitting ? 'Submitting...' : 'Submit to Blockchain'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.3rem', marginBottom: 16 }}>
            My Invoices ({myInvoices.length})
          </h2>
          {myInvoices.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <CatMascot size={70} mood="sleeping" style={{ display: 'inline-block', marginBottom: 12 }} />
              <p style={{ color: '#c0aec8', fontSize: 14, fontWeight: 700 }}>No invoices yet. Create your first one!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myInvoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} showRepay />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const ConnectPrompt = ({ connect }) => (
  <div style={{ maxWidth: 480, margin: '80px auto', padding: 20, textAlign: 'center' }}>
    <div className="card" style={{ padding: 48 }}>
      <CatMascot size={100} mood="love" className="float"
        style={{ display: 'inline-block', marginBottom: 20 }} />
      <h2 style={{ fontFamily: "'Klee One', cursive", fontSize: '1.5rem', marginBottom: 12 }}>
        Connect Your Wallet
      </h2>
      <p style={{ fontSize: 14, color: '#5a4e6e', marginBottom: 24 }}>
        Please connect MetaMask to access the Seller Dashboard
      </p>
      <button className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }} onClick={connect}>
        Connect MetaMask
      </button>
    </div>
  </div>
);

export default SellerDashboard;