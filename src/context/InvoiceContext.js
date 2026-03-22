import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import toast from 'react-hot-toast';

const InvoiceContext = createContext(null);
export const useInvoices = () => useContext(InvoiceContext);

const CONTRACT_ABI = [
  "event InvoiceCreated(uint256 indexed id, address indexed seller, uint256 amount, uint256 repayAmount)",
  "event InvoiceFunded(uint256 indexed id, address indexed investor, uint256 amount, uint256 timestamp)",
  "event InvoiceRepaid(uint256 indexed id, uint256 repayAmount)",
  "event InvoiceRefunded(uint256 indexed id, address indexed investor)",
  "event FundsReleasedToSeller(uint256 indexed id, address indexed seller, uint256 amount)",

  "function createInvoice(uint256 amount, string calldata description, string calldata ipfsHash, string calldata sellerName, string calldata buyerName, uint256 repayDays) external returns (uint256)",
  "function fundInvoice(uint256 invoiceId) external payable",
  "function repayInvoice(uint256 invoiceId) external payable",
  "function requestRefund(uint256 invoiceId) external",
  "function releaseFundsToSeller(uint256 invoiceId) external",

  "function getInvoiceMain(uint256 invoiceId) external view returns (uint256 id, address seller, address investor, uint256 amount, uint256 repayAmount, uint8 status, uint256 fundedAt)",
  "function getInvoiceMeta(uint256 invoiceId) external view returns (string memory description, string memory ipfsHash, string memory sellerName, string memory buyerName, uint256 repayDays)",
  "function getInvoiceCount() external view returns (uint256)",
  "function getSellerInvoices(address seller) external view returns (uint256[] memory)",
  "function getInvestorInvoices(address investor) external view returns (uint256[] memory)",
  "function calcRepayAmount(uint256 amount) external pure returns (uint256)",
  "function isRefundable(uint256 invoiceId) external view returns (bool)",
  "function canRelease(uint256 invoiceId) external view returns (bool)",
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

const STATUS_MAP = { 0: 'Open', 1: 'Funded', 2: 'Released', 3: 'Repaid', 4: 'Refunded' };

const isValidAddress = (addr) => {
  return addr &&
    addr !== '0x0000000000000000000000000000000000000000' &&
    addr !== '0xYourContractAddressHere' &&
    addr.startsWith('0x') &&
    addr.length === 42;
};

export const InvoiceProvider = ({ children }) => {
  const { signer, provider, account } = useWallet();
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const getContract = useCallback((withSigner = false) => {
    if (!isValidAddress(CONTRACT_ADDRESS)) return null;
    if (!provider && !signer) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, withSigner ? signer : provider);
  }, [provider, signer]);

  const fetchAllInvoices = useCallback(async () => {
    const contract = getContract();
    if (!contract) {
      setInvoices([
        {
          id: 1,
          seller: '0xABCD1234ABCD1234ABCD1234ABCD1234ABCD1234',
          investor: null,
          amount: '0.5',
          repayAmount: '0.525',
          description: 'Web design services for 3 pages',
          ipfsHash: '',
          sellerName: 'Aiko Studio',
          buyerName: 'TechCorp Inc.',
          repayDays: 30,
          status: 'Open',
          fundedAt: null,
        },
        {
          id: 2,
          seller: '0xDEF05678DEF05678DEF05678DEF05678DEF05678',
          investor: '0x1234ABCD1234ABCD1234ABCD1234ABCD1234ABCD',
          amount: '1.2',
          repayAmount: '1.26',
          description: 'Smart contract audit report',
          ipfsHash: '',
          sellerName: 'CryptoAudit',
          buyerName: 'DeFi Protocol',
          repayDays: 45,
          status: 'Funded',
          fundedAt: Date.now() - 1800000,
        },
        {
          id: 3,
          seller: '0x9876FEDC9876FEDC9876FEDC9876FEDC9876FEDC',
          investor: '0xAAAABBBBAAAABBBBAAAABBBBAAAABBBBAAAABBBB',
          amount: '0.8',
          repayAmount: '0.84',
          description: 'Logo design and branding kit',
          ipfsHash: '',
          sellerName: 'NyaaDesigns',
          buyerName: 'StartupXYZ',
          repayDays: 20,
          status: 'Repaid',
          fundedAt: null,
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const count = await contract.getInvoiceCount();
      const all = [];
      for (let i = 1; i <= Number(count); i++) {
        const [main, meta] = await Promise.all([
          contract.getInvoiceMain(i),
          contract.getInvoiceMeta(i),
        ]);
        all.push({
          id:          Number(main.id),
          seller:      main.seller,
          investor:    main.investor === ethers.ZeroAddress ? null : main.investor,
          amount:      ethers.formatEther(main.amount),
          repayAmount: ethers.formatEther(main.repayAmount),
          status:      STATUS_MAP[main.status],
          fundedAt:    Number(main.fundedAt) > 0 ? Number(main.fundedAt) * 1000 : null,
          description: meta.description,
          ipfsHash:    meta.ipfsHash,
          sellerName:  meta.sellerName,
          buyerName:   meta.buyerName,
          repayDays:   Number(meta.repayDays),
        });
      }
      setInvoices(all);
    } catch (err) {
      console.error(err);
      toast.error('Could not load invoices');
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  const createInvoice = useCallback(async ({ amount, description, ipfsHash, sellerName, buyerName, repayDays }) => {
    const contract = getContract(true);
    if (!contract || !signer) { toast.error('Connect wallet first!'); return null; }
    setLoading(true);
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.createInvoice(
        amountWei,
        description,
        ipfsHash || '',
        sellerName || '',
        buyerName || '',
        Number(repayDays) || 30
      );
      toast.loading('Creating invoice on-chain...', { id: 'tx' });
      await tx.wait();
      toast.success('Invoice created!', { id: 'tx' });
      await fetchAllInvoices();
      return tx.hash;
    } catch (err) {
      toast.error(err.reason || err.message || 'Transaction failed', { id: 'tx' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [getContract, signer, fetchAllInvoices]);

  const fundInvoice = useCallback(async (invoiceId, amount) => {
    const contract = getContract(true);
    if (!contract || !signer) { toast.error('Connect wallet first!'); return null; }
    setLoading(true);
    try {
      const tx = await contract.fundInvoice(invoiceId, { value: ethers.parseEther(amount) });
      toast.loading('Funding invoice...', { id: 'fund' });
      const receipt = await tx.wait();
      toast.success('Funded! Receipt generated', { id: 'fund' });
      const newReceipt = {
        id: Date.now(),
        invoiceId,
        investor: account,
        amount,
        txHash: tx.hash,
        timestamp: Date.now(),
        blockNumber: receipt.blockNumber,
      };
      setReceipts(prev => [...prev, newReceipt]);
      await fetchAllInvoices();
      return newReceipt;
    } catch (err) {
      toast.error(err.reason || err.message || 'Funding failed', { id: 'fund' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [getContract, signer, account, fetchAllInvoices]);

const repayInvoice = useCallback(async (invoiceId) => {
    const contract = getContract(true);
    if (!contract || !signer) { toast.error('Connect wallet first!'); return null; }
    setLoading(true);
    try {
      // Fetch exact repayAmount in wei directly from contract
      // Never calculate it in frontend — floating point causes mismatch
      const main = await contract.getInvoiceMain(invoiceId);
      const exactWei = main.repayAmount;

      const tx = await contract.repayInvoice(invoiceId, { value: exactWei });
      toast.loading('Processing repayment...', { id: 'repay' });
      await tx.wait();
      toast.success('Invoice repaid! Investor has been paid.', { id: 'repay' });
      await fetchAllInvoices();
      return tx.hash;
    } catch (err) {
      toast.error(err.reason || err.message || 'Repayment failed', { id: 'repay' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [getContract, signer, fetchAllInvoices]);

  const requestRefund = useCallback(async (invoiceId) => {
    const contract = getContract(true);
    if (!contract || !signer) { toast.error('Connect wallet first!'); return null; }
    setLoading(true);
    try {
      const tx = await contract.requestRefund(invoiceId);
      toast.loading('Requesting refund...', { id: 'refund' });
      await tx.wait();
      toast.success('Refund successful! Invoice is open again.', { id: 'refund' });
      await fetchAllInvoices();
      return tx.hash;
    } catch (err) {
      toast.error(err.reason || err.message || 'Refund failed', { id: 'refund' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [getContract, signer, fetchAllInvoices]);

  const releaseFunds = useCallback(async (invoiceId) => {
    const contract = getContract(true);
    if (!contract || !signer) { toast.error('Connect wallet first!'); return null; }
    setLoading(true);
    try {
      const tx = await contract.releaseFundsToSeller(invoiceId);
      toast.loading('Releasing funds...', { id: 'release' });
      await tx.wait();
      toast.success('Funds released to your wallet!', { id: 'release' });
      await fetchAllInvoices();
      return tx.hash;
    } catch (err) {
      toast.error(err.reason || err.message || 'Release failed', { id: 'release' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [getContract, signer, fetchAllInvoices]);

  const myInvoices   = invoices.filter(inv => inv.seller?.toLowerCase()   === account?.toLowerCase());
  const myFunded     = invoices.filter(inv => inv.investor?.toLowerCase() === account?.toLowerCase());
  const openInvoices = invoices.filter(inv => inv.status === 'Open');

  return (
    <InvoiceContext.Provider value={{
      invoices, myInvoices, myFunded, openInvoices, receipts,
      loading, fetchAllInvoices, createInvoice, fundInvoice,
      repayInvoice, requestRefund, releaseFunds,
      contractAddress: CONTRACT_ADDRESS,
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};