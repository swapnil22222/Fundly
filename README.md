# Fundly 🐾✿ — Invoice DeFi DApp

Kawaii invoice funding on Ethereum Sepolia testnet!

## Tech Stack
- React 18
- Ethers.js v6
- MetaMask
- jsPDF (invoice & receipt PDF generation)
- Framer Motion + CSS animations
- react-hot-toast

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and set your contract address:
```
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

```bash
npm start
```

## Features
- 🌸 Seller: Create invoices with step-by-step wizard
- ⬇️ Download cute PDF invoice template
- ✍️ Upload signed PDF (connects to IPFS via Pinata)
- 💜 Investor: Browse & fund open invoices
- ⏰ 1-hour refund window enforced on-chain
- 🧾 Auto-generated funding receipts (downloadable PDF)
- 💚 Seller repayment flow
- 🐾 Anime cat mascot with moods!

## Smart Contract
The `InvoiceContext.js` contains the ABI. Deploy `InvoiceFunding.sol` to Sepolia and set the address in `.env`.

## IPFS Integration
Replace the fake IPFS hash in `SellerDashboard.js` with actual Pinata or web3.storage upload:
```js
const formData = new FormData();
formData.append('file', signedFile);
const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
  method: 'POST',
  headers: { Authorization: `Bearer YOUR_PINATA_JWT` },
  body: formData,
});
const { IpfsHash } = await res.json();
setIpfsHash(IpfsHash);
```
