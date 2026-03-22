import jsPDF from 'jspdf';

export const generateInvoicePDF = (invoiceData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const {
    id, sellerAddress, description, amount, repayAmount,
    date, buyerName, sellerName, investorAddress, repayDays,
  } = invoiceData;

  const W = 210;
  const H = 297;

  const fee = amount ? (parseFloat(amount) * 0.05).toFixed(4) : '0.0000';
  const totalRepay = repayAmount
    ? repayAmount
    : (parseFloat(amount || 0) * 1.05).toFixed(4);

  const setFill = (r, g, b) => doc.setFillColor(r, g, b);
  const setDraw = (r, g, b) => doc.setDrawColor(r, g, b);
  const setTxt  = (r, g, b) => doc.setTextColor(r, g, b);

  // Background
  setFill(255, 249, 240);
  doc.rect(0, 0, W, H, 'F');

  // Top bar
  setFill(255, 183, 197);
  doc.rect(0, 0, W, 18, 'F');
  setFill(201, 184, 245);
  doc.rect(0, 18, W, 3, 'F');

  // Bottom bar
  setFill(255, 183, 197);
  doc.rect(0, H - 12, W, 12, 'F');

  // Header
  setTxt(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Fundly - Invoice DeFi', W / 2, 12, { align: 'center' });

  // Invoice ID badge
  setFill(201, 184, 245);
  doc.roundedRect(14, 26, 55, 11, 3, 3, 'F');
  setTxt(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice #' + (id || '----'), 41, 33, { align: 'center' });

  // Date
  setTxt(90, 78, 110);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Date: ' + (date || new Date().toLocaleDateString('en-IN')), W - 14, 33, { align: 'right' });

  // Seller box
  setFill(255, 255, 255);
  setDraw(255, 183, 197);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 44, 85, 50, 5, 5, 'FD');
  setTxt(255, 130, 160);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM - SELLER', 22, 52);
  setTxt(45, 36, 56);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(sellerName || 'Seller Name', 22, 61);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setTxt(90, 78, 110);
  doc.text('Wallet address:', 22, 69);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  var sellerAddrShort = sellerAddress
    ? sellerAddress.slice(0, 12) + '...' + sellerAddress.slice(-6)
    : '0x...not connected';
  doc.text(sellerAddrShort, 22, 75);
  doc.setFont('helvetica', 'normal');
  setTxt(90, 78, 110);
  doc.setFontSize(8);
  doc.text('Repay within: ' + (repayDays || '--') + ' days from funding', 22, 83);
  doc.text('Total repayable: ' + totalRepay + ' ETH', 22, 89);

  // Buyer box
  setFill(255, 255, 255);
  setDraw(201, 184, 245);
  doc.roundedRect(111, 44, 85, 50, 5, 5, 'FD');
  setTxt(170, 150, 230);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('TO - BUYER / CLIENT', 119, 52);
  setTxt(45, 36, 56);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(buyerName || 'Buyer Name', 119, 61);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setTxt(90, 78, 110);
  doc.text('Client / Organization', 119, 69);

  // Investor box
  setFill(255, 255, 255);
  setDraw(168, 230, 207);
  doc.roundedRect(14, 100, 182, 20, 4, 4, 'FD');
  setTxt(80, 160, 120);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('FUNDED BY - INVESTOR', 22, 108);
  setTxt(45, 36, 56);
  doc.setFontSize(9);
  doc.setFont(investorAddress ? 'helvetica' : 'helvetica', investorAddress ? 'bold' : 'normal');
  doc.text(
    investorAddress || 'Not yet funded - investor address will appear here after funding',
    22, 115
  );

  // Description box
  setFill(255, 255, 255);
  setDraw(255, 183, 197);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 127, 182, 30, 5, 5, 'FD');
  setTxt(201, 184, 245);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICES / DESCRIPTION', 22, 135);
  setTxt(45, 36, 56);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  var lines = doc.splitTextToSize(description || 'Service description here', 168);
  doc.text(lines.slice(0, 2), 22, 143);

  // Amount table
  var tY = 164;

  setFill(201, 184, 245);
  doc.roundedRect(14, tY, 182, 11, 3, 3, 'F');
  setTxt(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Item', 22, tY + 7.5);
  doc.text('Amount (ETH)', W - 22, tY + 7.5, { align: 'right' });

  // Row 1
  setFill(255, 255, 255);
  doc.rect(14, tY + 11, 182, 11, 'F');
  setTxt(45, 36, 56);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice Amount (funded by investor)', 22, tY + 18);
  doc.setFont('helvetica', 'bold');
  doc.text('' + (amount || '0.000'), W - 22, tY + 18, { align: 'right' });

  // Row 2
  setFill(255, 249, 240);
  doc.rect(14, tY + 22, 182, 11, 'F');
  setTxt(90, 78, 110);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Investor Profit (5%)', 22, tY + 29);
  doc.setFont('helvetica', 'bold');
  setTxt(200, 80, 120);
  doc.text('' + fee, W - 22, tY + 29, { align: 'right' });

  // Total row
  setFill(201, 184, 245);
  doc.roundedRect(14, tY + 33, 182, 14, 3, 3, 'F');
  setTxt(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TO REPAY', 22, tY + 43);
  doc.text(totalRepay + ' ETH', W - 22, tY + 43, { align: 'right' });

  // Repay note
  var noteY = tY + 53;
  setFill(255, 240, 248);
  setDraw(255, 183, 197);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, noteY, 182, 12, 3, 3, 'FD');
  setTxt(90, 78, 110);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Repayment due within ' + (repayDays || '--') + ' days from the date investor funds this invoice.',
    22, noteY + 8
  );

  // Terms
  var termsY = noteY + 18;
  setFill(255, 255, 255);
  setDraw(201, 184, 245);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, termsY, 182, 30, 5, 5, 'FD');
  setTxt(201, 184, 245);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS AND CONDITIONS', 22, termsY + 7);
  setTxt(90, 78, 110);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Investor has a 1-hour refund window after funding this invoice.', 22, termsY + 14);
  doc.text('2. Seller must repay the Invoice Amount + 5% investor profit in full.', 22, termsY + 20);
  doc.text('3. All transactions are enforced on-chain via the Fundly smart contract.', 22, termsY + 26);

  // Signatures
  var sigY = termsY + 36;

  setFill(255, 255, 255);
  setDraw(255, 183, 197);
  doc.setLineDash([2, 2]);
  doc.roundedRect(14, sigY, 84, 28, 4, 4, 'FD');
  doc.setLineDash([]);
  setTxt(90, 78, 110);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('SELLER SIGNATURE', 22, sigY + 7);
  setTxt(255, 130, 160);
  doc.setFontSize(9);
  doc.text('Sign here', 56, sigY + 18, { align: 'center' });

  setFill(255, 255, 255);
  setDraw(201, 184, 245);
  doc.setLineDash([2, 2]);
  doc.roundedRect(112, sigY, 84, 28, 4, 4, 'FD');
  doc.setLineDash([]);
  setTxt(90, 78, 110);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('BUYER SIGNATURE', 120, sigY + 7);
  setTxt(170, 150, 230);
  doc.setFontSize(9);
  doc.text('Sign here', 154, sigY + 18, { align: 'center' });

  // Footer
  setTxt(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Fundly | Invoice DeFi | Ethereum Sepolia | fundly.app',
    W / 2, H - 5, { align: 'center' }
  );

  doc.save('Fundly_Invoice_' + (id || 'draft') + '.pdf');
};