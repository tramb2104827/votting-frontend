import Web3 from 'web3';
import VotingSystem from '../contracts/VotingSystem.json';

class Web3Service {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.account = null;
    }

    // Khởi tạo Web3 và kết nối với MetaMask
    async initWeb3() {
        if (window.ethereum) {
            try {
                // Yêu cầu quyền truy cập vào MetaMask
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                // Khởi tạo Web3
                this.web3 = new Web3(window.ethereum);
                
                // Lấy địa chỉ ví hiện tại
                const accounts = await this.web3.eth.getAccounts();
                this.account = accounts[0];

                // Khởi tạo contract
                const networkId = await this.web3.eth.net.getId();
                const deployedNetwork = VotingSystem.networks[networkId];
                
                this.contract = new this.web3.eth.Contract(
                    VotingSystem.abi,
                    deployedNetwork && deployedNetwork.address
                );

                // Lắng nghe sự kiện thay đổi tài khoản
                window.ethereum.on('accountsChanged', (accounts) => {
                    this.account = accounts[0];
                });

                return true;
            } catch (error) {
                console.error('Error initializing Web3:', error);
                throw error;
            }
        } else {
            throw new Error('MetaMask is not installed');
        }
    }

    // Xác thực ví MetaMask
    async verifyWallet() {
        try {
            if (!this.contract || !this.account) {
                throw new Error('Web3 or Contract not initialized');
            }

            const result = await this.contract.methods.verifyWallet().send({
                from: this.account
            });

            return result;
        } catch (error) {
            console.error('Error verifying wallet:', error);
            throw error;
        }
    }

    // Kiểm tra trạng thái xác thực của ví
    async isWalletVerified(address) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const isVerified = await this.contract.methods.isWalletVerified(address).call();
            return isVerified;
        } catch (error) {
            console.error('Error checking wallet verification:', error);
            throw error;
        }
    }

    // Gửi mã hash phiếu bầu lên blockchain
    async submitVote(electionId, voteHash) {
        try {
            if (!this.contract || !this.account) {
                throw new Error('Web3 or Contract not initialized');
            }

            const result = await this.contract.methods.submitVote(electionId, voteHash).send({
                from: this.account
            });

            return result;
        } catch (error) {
            console.error('Error submitting vote:', error);
            throw error;
        }
    }

    // Kiểm tra xem ví đã bỏ phiếu trong cuộc bầu cử chưa
    async hasVoted(electionId, voterAddress) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const hasVoted = await this.contract.methods.hasVoted(electionId, voterAddress).call();
            return hasVoted;
        } catch (error) {
            console.error('Error checking if wallet has voted:', error);
            throw error;
        }
    }

    // Tạo mã hash cho phiếu bầu
    createVoteHash(electionId, candidateId, voterAddress) {
        try {
            if (!this.web3) {
                throw new Error('Web3 not initialized');
            }

            // Tạo mã hash từ thông tin phiếu bầu
            const hash = this.web3.utils.soliditySha3(
                { type: 'uint256', value: electionId },
                { type: 'uint256', value: candidateId },
                { type: 'address', value: voterAddress }
            );

            return hash;
        } catch (error) {
            console.error('Error creating vote hash:', error);
            throw error;
        }
    }

    // Lấy địa chỉ ví hiện tại
    getCurrentAccount() {
        return this.account;
    }
}

export default new Web3Service(); 