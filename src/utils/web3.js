import { ethers } from 'ethers';
import contractConfig from './contractConfig';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
const CHAIN_ID = process.env.REACT_APP_CHAIN_ID;

// Thông tin mạng Hardhat local
export const SUPPORTED_CHAIN_ID = 31337;
export const REQUIRED_NETWORK = {
  chainId: `0x${SUPPORTED_CHAIN_ID.toString(16)}`,
  chainName: 'Hardhat Local',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['http://127.0.0.1:8545/'],
  blockExplorerUrls: [],
};

export const getContract = (provider) => {
  if (!provider) return null;
  return new ethers.Contract(
    contractConfig.VotingSystem.address,
    contractConfig.VotingSystem.abi,
    provider
  );
};

// Hàm kiểm tra và yêu cầu chuyển mạng nếu cần
export const checkNetwork = async (provider) => {
  if (!provider) return false;

  try {
    const chainId = await provider.request({ method: 'eth_chainId' });
    const desiredChainIdHex = `0x${SUPPORTED_CHAIN_ID.toString(16)}`;

    if (chainId !== desiredChainIdHex) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        });
        return true;
      } catch (switchError) {
        // Mã lỗi 4902 có nghĩa là mạng chưa được thêm vào MetaMask
        if (switchError.code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [REQUIRED_NETWORK],
            });
            return true;
          } catch (addError) {
            throw new Error('Không thể thêm mạng vào MetaMask');
          }
        }
        throw new Error('Không thể chuyển mạng trong MetaMask');
      }
    }
    return true;
  } catch (error) {
    console.error('Lỗi kiểm tra mạng:', error);
    throw error;
  }
};

export const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
}; 