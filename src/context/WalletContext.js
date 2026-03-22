import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const WalletContext = createContext(null);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(false);

  const SEPOLIA_CHAIN_ID = '0xaa36a7';

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('🐱 MetaMask not found! Please install it~');
      return;
    }
    setLoading(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              }],
            });
          }
        }
      }
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);
      setChainId(network.chainId.toString());
      toast.success('🐾 Wallet connected! Nyaa~');

      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length === 0) { setAccount(null); setSigner(null); }
        else {
          const newSigner = await web3Provider.getSigner();
          setSigner(newSigner);
          setAccount(accounts[0]);
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (err) {
      toast.error('😿 Connection failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null); setProvider(null); setSigner(null); setChainId(null);
    toast('🐱 Wallet disconnected~', { icon: '👋' });
  }, []);

  const shortAddress = account ? `${account.slice(0,6)}...${account.slice(-4)}` : null;

  return (
    <WalletContext.Provider value={{ account, provider, signer, chainId, loading, connect, disconnect, shortAddress }}>
      {children}
    </WalletContext.Provider>
  );
};
