import React from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Web3Provider } from '@ethersproject/providers';

// Cấu hình connector cho MetaMask
export const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 1337], // Mainnet, Ropsten, Rinkeby, Goerli, Kovan, Local
});

// Hàm lấy thư viện Web3
function getLibrary(provider) {
    const library = new Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
}

// Component Web3Provider
const Web3ProviderWrapper = ({ children }) => {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            {children}
        </Web3ReactProvider>
    );
};

export default Web3ProviderWrapper; 