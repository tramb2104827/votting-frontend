import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../components/Web3Provider';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const { active, account, library, activate, deactivate } = useWeb3React();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Tự động kết nối nếu đã có kết nối trước đó
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (localStorage.getItem('previouslyConnected') === 'true') {
        try {
          await activate(injected);
        } catch (error) {
          console.error('Error on auto connect:', error);
        }
      }
    };
    connectWalletOnPageLoad();
  }, [activate]);

  // Lưu trạng thái kết nối
  useEffect(() => {
    if (active) {
      localStorage.setItem('previouslyConnected', 'true');
    } else {
      localStorage.removeItem('previouslyConnected');
    }
  }, [active]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await activate(injected);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Không thể kết nối với MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await deactivate();
      localStorage.removeItem('previouslyConnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        active,
        account,
        library,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context; 