import { useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { checkNetwork } from '../utils/web3';
import contractConfig from '../utils/contractConfig';

const injected = new InjectedConnector({
  supportedChainIds: [31337], // Hardhat localhost
});

export const useWeb3Connection = () => {
  const { account, activate, deactivate } = useWeb3React();

  const connect = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Vui lòng cài đặt Coinbase Wallet hoặc MetaMask');
      }

      // Kiểm tra xem có phải là địa chỉ ví được cho phép không
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts[0].toLowerCase() !== contractConfig.voterWallet.toLowerCase()) {
        throw new Error('Địa chỉ ví không được phép truy cập. Vui lòng sử dụng ví đã đăng ký.');
      }

      await activate(injected);
      const provider = window.ethereum;
      await checkNetwork(provider);
    } catch (error) {
      console.error('Error connecting:', error);
      throw error;
    }
  }, [activate]);

  const disconnect = useCallback(() => {
    try {
      deactivate();
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  }, [deactivate]);

  return {
    account,
    connect,
    disconnect,
    isConnected: !!account,
  };
}; 