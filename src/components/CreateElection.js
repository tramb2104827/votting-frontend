import React, { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected, switchNetwork } from './Web3Provider';
import { ethers } from 'ethers';
import { VOTING_SYSTEM_ABI, VOTING_SYSTEM_ADDRESS } from '../utils/contractConfig';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CreateElection = () => {
  const { active, account, library, activate } = useWeb3React();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [electionInfo, setElectionInfo] = useState(null);
  const navigate = useNavigate();

  // Tự động kết nối ví khi component mount
  useEffect(() => {
    const connectWallet = async () => {
      try {
        await activate(injected);
      } catch (err) {
        console.error('Failed to connect wallet:', err);
      }
    };
    connectWallet();
  }, [activate]);
//xử lý tạo cuộc bầu cử 
  const handleCreate = async () => {
    if (!active || !account) {
      setError('Vui lòng kết nối ví MetaMask');
      return;
    }

    if (!title || !description || !startTime || !endTime) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

    if (startTimestamp >= endTimestamp) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    if (startTimestamp < Math.floor(Date.now() / 1000)) {
      setError('Thời gian bắt đầu phải trong tương lai');
      return;
    }

    // Lưu thông tin cuộc bầu cử
    setElectionInfo({
      title,
      description,
      startTime: startTimestamp,
      endTime: endTimestamp,
      creator: account,
      timestamp: new Date().toISOString()
    });

    setConfirmDialog(true);
  };
//thực hiện giao dịch với blockchain
  const confirmCreate = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      if (!library || !account) {
        throw new Error('Vui lòng kết nối ví MetaMask');
      }

      // Kiểm tra và chuyển đổi mạng nếu cần
      const network = await library.getNetwork();
      if (network.chainId !== 1) {
        if (window.ethereum) {
          await switchNetwork(window.ethereum);
        } else {
          throw new Error('Vui lòng chuyển sang mạng Ethereum Mainnet');
        }
      }

      // Tạo contract instance với gas settings tối ưu
      const contract = new ethers.Contract(
        VOTING_SYSTEM_ADDRESS,
        VOTING_SYSTEM_ABI,
        library.getSigner()
      );

      // Ước tính gas limit
      const gasLimit = await contract.estimateGas.createElection(
        electionInfo.title,
        electionInfo.description,
        electionInfo.startTime,
        electionInfo.endTime
      );

      // Lấy giá gas hiện tại và giảm 10%
      const gasPrice = await library.getGasPrice();
      const optimizedGasPrice = gasPrice.mul(90).div(100);

      // Gửi giao dịch với gas tối ưu
      const tx = await contract.createElection(
        electionInfo.title,
        electionInfo.description,
        electionInfo.startTime,
        electionInfo.endTime,
        {
          gasLimit: gasLimit.mul(120).div(100), // Thêm 20% buffer
          gasPrice: optimizedGasPrice,
        }
      );

      console.log('Transaction sent:', tx.hash);
      setTransactionHash(tx.hash);

      // Đợi giao dịch được xác nhận
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      
      if (receipt.status === 1) {
        setSuccess(true);
        
        // Lưu thông tin cuộc bầu cử vào localStorage
        const savedElectionInfo = {
          ...electionInfo,
          transactionHash: receipt.transactionHash,
          electionId: receipt.events[0].args.electionId.toString()
        };
        localStorage.setItem(`election_${savedElectionInfo.electionId}`, JSON.stringify(savedElectionInfo));

        // Chuyển hướng đến trang quản lý cuộc bầu cử
        navigate(`/admin/elections/${savedElectionInfo.electionId}`);
      } else {
        throw new Error('Giao dịch thất bại');
      }
    } catch (err) {
      console.error('Error creating election:', err);
      if (err.code === 4001) {
        setError('Bạn đã từ chối giao dịch');
      } else if (err.message.includes('insufficient funds')) {
        setError('Không đủ ETH để thanh toán phí giao dịch');
      } else if (err.message.includes('execution reverted')) {
        setError('Giao dịch bị từ chối. Vui lòng kiểm tra lại thông tin.');
      } else {
        setError('Có lỗi xảy ra khi tạo cuộc bầu cử: ' + err.message);
      }
    } finally {
      setLoading(false);
      setConfirmDialog(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tạo cuộc bầu cử mới
      </Typography>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={4}
          />
          <TextField
            fullWidth
            label="Thời gian bắt đầu"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            fullWidth
            label="Thời gian kết thúc"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Tạo cuộc bầu cử thành công!{' '}
              <a
                href={`https://etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem giao dịch
              </a>
            </Alert>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Tạo cuộc bầu cử'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận thông tin cuộc bầu cử</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vui lòng kiểm tra kỹ thông tin cuộc bầu cử trước khi xác nhận:
          </DialogContentText>
          
          {electionInfo && (
            <List>
              <ListItem>
                <ListItemText 
                  primary="Tiêu đề" 
                  secondary={electionInfo.title}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Mô tả" 
                  secondary={electionInfo.description}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Thời gian bắt đầu" 
                  secondary={new Date(electionInfo.startTime * 1000).toLocaleString()}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Thời gian kết thúc" 
                  secondary={new Date(electionInfo.endTime * 1000).toLocaleString()}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Người tạo" 
                  secondary={electionInfo.creator}
                />
              </ListItem>
            </List>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            Sau khi xác nhận, cuộc bầu cử sẽ được tạo trên blockchain và không thể thay đổi.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Hủy</Button>
          <Button 
            onClick={confirmCreate} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Xác nhận tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateElection; 