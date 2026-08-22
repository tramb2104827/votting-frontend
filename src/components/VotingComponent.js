import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Avatar,
  Divider,
  FormControlLabel,
  FormGroup,
  Stepper,
  Step,
  StepLabel,
  styled,
  Paper,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';

// Styled components cho dialog đẹp mắt
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    background: '#ffffff',
    boxShadow: '0 20px 60px rgba(22, 147, 133, 0.15)',
    border: '2px solid #e0f2f1',
    overflow: 'hidden',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
  color: '#fff',
  padding: theme.spacing(3, 4),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
    zIndex: 1,
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  background: '#ffffff',
  color: '#169385',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  background: '#f8f9fa',
  borderTop: '1px solid #e0f2f1',
}));

const ModernButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontSize: '1rem',
  fontWeight: 700,
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'contained' && {
    background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
    color: '#fff',
    boxShadow: '0 6px 20px rgba(22, 147, 133, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #0f6b5f 0%, #169385 100%)',
      boxShadow: '0 10px 30px rgba(22, 147, 133, 0.4)',
      transform: 'translateY(-2px)',
    },
  }),
  ...(variant === 'outlined' && {
    color: '#169385',
    border: '2px solid #169385',
    '&:hover': {
      background: '#169385',
      color: '#fff',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(22, 147, 133, 0.3)',
    },
  }),
}));

const CandidateCard = styled(Card)(({ theme, selected }) => ({
  background: selected ? 'linear-gradient(135deg, rgba(22, 147, 133, 0.1) 0%, rgba(22, 147, 133, 0.05) 100%)' : '#ffffff',
  borderRadius: 20,
  border: selected ? '2px solid #169385' : '2px solid #e0f2f1',
  boxShadow: selected ? '0 12px 40px rgba(22, 147, 133, 0.2)' : '0 8px 32px rgba(22, 147, 133, 0.12)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(22, 147, 133, 0.25)',
    border: '2px solid #169385',
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: 16,
  border: '2px solid #e0f2f1',
  boxShadow: '0 8px 32px rgba(22, 147, 133, 0.12)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(22, 147, 133, 0.2)',
    border: '2px solid #169385',
  },
}));

const StepIcon = styled(Box)(({ theme, active, completed }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: completed ? 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)' : 
              active ? 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)' : '#e0f2f1',
  color: completed || active ? '#fff' : '#169385',
  fontWeight: 700,
  boxShadow: completed || active ? '0 4px 16px rgba(22, 147, 133, 0.3)' : 'none',
}));

const ReceiptCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
  borderRadius: 20,
  border: '2px solid #e0f2f1',
  boxShadow: '0 12px 40px rgba(22, 147, 133, 0.15)',
  overflow: 'hidden',
}));

// Contract ABI và địa chỉ
const CONTRACT_ABI = [
  "function submitVote(uint256 electionId, uint256[] candidateIds, bytes32 voteHash) public",
  "function hasVoted(address voter, uint256 electionId) public view returns (bool)",
  "event VoteSubmitted(address indexed voter, uint256 indexed electionId, bytes32 voteHash)"
];
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Helper chuyển ObjectId string sang uint256 (BigNumber) bằng cách lấy 12 ký tự cuối và parseInt, hoặc hash nếu cần
function objectIdToUint256(id) {
  if (/^[a-fA-F0-9]{24}$/.test(id)) {
    // Lấy 12 ký tự cuối, parseInt base 16 (có thể hash nếu cần an toàn hơn)
    return ethers.BigNumber.from('0x' + id.slice(-12));
  }
  // Nếu là số, trả về luôn
  if (/^\d+$/.test(id)) return ethers.BigNumber.from(id);
  throw new Error('ID không hợp lệ để chuyển sang uint256');
}

function VotingComponent({ 
  electionId, 
  onVoteSubmitted,
  openDialog: propOpenDialog,
  onCloseDialog,
  candidates: propCandidates // Thêm prop candidates
}) {
  const { active, account, library, connectWallet } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  // Thay confirmStep bằng activeStep cho stepper
  // 0: xác nhận cá nhân, 1: chọn ứng cử viên, 2: xác nhận & gửi phiếu, 3: xem biên lai
  const [activeStep, setActiveStep] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [receiptData, setReceiptData] = useState(null); // Thông tin biên lai
  const [showReceipt, setShowReceipt] = useState(false);

  // Đồng bộ trạng thái dialog với prop
  useEffect(() => {
    // Chỉ đồng bộ openDialog, không reset showReceipt/receiptData
    setOpenDialog(propOpenDialog);
    // DEBUG: log khi mount
    console.log('VotingComponent mounted');
    return () => {
      console.log('VotingComponent unmounted');
    };
  }, [propOpenDialog]);

  // Kiểm tra xem cử tri đã bầu chưa khi component mount
  useEffect(() => {
    const checkVotingStatus = async () => {
      const jwt = localStorage.getItem('jwt');
      // Lấy _id (ObjectId) nếu electionId là object
      const electionObjectId = typeof electionId === 'object' && electionId._id ? electionId._id : electionId;
      if (!jwt || !electionObjectId) return setHasVoted(false);
      try {
        const res = await axios.get(`https://votting-backend-a9d7.onrender.com/api/votes/mine?electionId=${electionObjectId}`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        setHasVoted(res.data && res.data.length > 0);
      } catch (err) {
        setHasVoted(false);
      }
    };
    checkVotingStatus();
  }, [electionId]);

  // Load danh sách ứng cử viên
  useEffect(() => {
    const loadCandidates = async () => {
      // Lấy _id (ObjectId) nếu electionId là object
      const electionObjectId = typeof electionId === 'object' && electionId._id ? electionId._id : electionId;
      try {
        const res = await axios.get(`https://votting-backend-a9d7.onrender.com/api/candidates?electionId=${electionObjectId}`);
        setCandidates(res.data);
      } catch (error) {
        console.error('Error loading candidates:', error);
        setError('Không thể tải danh sách ứng cử viên');
      }
    };
    if (electionId) {
      loadCandidates();
    }
  }, [electionId]);

  // Tạo hash cho phiếu bầu
  const createVoteHash = (electionId, candidateIds, cccd, account) => {
    if (!electionId || !candidateIds.length || !cccd || !account) {
      throw new Error('Thiếu thông tin cần thiết để tạo hash phiếu bầu');
    }
    const safeIds = candidateIds.filter(Boolean);
    const voteData = {
      electionId: electionId.toString(),
      candidateIds: safeIds.map(id => id.toString()),
      cccd: cccd,
      voter: account,
      timestamp: Date.now()
    };
    return ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(JSON.stringify(voteData))
    );
  };

  // Sửa logic mapping: chỉ dùng _id làm key
  const handleVote = async () => {
    try {
      setLoading(true);
      setError('');
      if (!active) {
        await connectWallet();
        return;
      }
      if (selectedCandidates.length === 0) {
        setError('Vui lòng chọn ít nhất một ứng cử viên để bỏ phiếu');
        return;
      }
      const cccd = localStorage.getItem('voterCCCD');
      const voterName = localStorage.getItem('voterName');
      if (!cccd) {
        setError('Vui lòng đăng nhập để bỏ phiếu');
        return;
      }
      const jwt = localStorage.getItem('jwt');
      const electionObjectId = typeof electionId === 'object' && electionId._id ? electionId._id : electionId;
      const checkRes = await axios.get(`https://votting-backend-a9d7.onrender.com/api/votes/mine?electionId=${electionObjectId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (checkRes.data && checkRes.data.length > 0) {
        setError('Bạn đã bỏ phiếu cho cuộc bầu cử này');
        return;
      }
      const sourceCandidates = Array.isArray(propCandidates) && propCandidates.length > 0 ? propCandidates : candidates;
      const candidateMap = {};
      sourceCandidates.forEach(c => {
        if (c._id && typeof c.blockchainCandidateId === 'number') {
          candidateMap[c._id.toString()] = c.blockchainCandidateId;
        }
      });
      let onChainElectionId = (typeof electionId === 'object' && electionId.onChainId)
        ? electionId.onChainId
        : (typeof electionId === 'number' ? electionId : undefined);
      if (!onChainElectionId) {
        setError('Không tìm thấy onChainId của cuộc bầu cử');
        setLoading(false);
        return;
      }
      const onChainCandidateIds = selectedCandidates.map(id => candidateMap[id.toString()]);
      if (onChainCandidateIds.some(id => typeof id !== 'number')) {
        setError('Không tìm thấy blockchainCandidateId của ứng cử viên');
        setLoading(false);
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const voteHash = createVoteHash(electionId, selectedCandidates, cccd, account);
      const tx = await contract.submitVote(onChainElectionId, onChainCandidateIds, voteHash);
      const receipt = await tx.wait();
      await axios.post('https://votting-backend-a9d7.onrender.com/api/votes', {
        electionId: electionObjectId, // _id (ObjectId)
        candidateIds: selectedCandidates, // mảng _id (ObjectId)
        voteHash: voteHash, // thêm voteHash
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setSuccess(true);
      setHasVoted(true);
      setSnackbar({
        open: true,
        message: `Bỏ phiếu thành công! Transaction hash: ${tx.hash}`
      });
      // Lấy tên cuộc bầu cử
      let electionName = '';
      if (typeof electionId === 'object' && electionId.title) {
        electionName = electionId.title;
      } else if (window && window.localStorage) {
        // Thử lấy từ localStorage nếu có
        const elections = JSON.parse(localStorage.getItem('elections') || '[]');
        const found = elections.find(e => e._id === electionObjectId || e.id === electionObjectId);
        if (found) electionName = found.title;
      }
      // Lấy thời gian hiện tại
      const voteTime = new Date().toLocaleString();
      setReceiptData({
        blockNumber: receipt.blockNumber,
        voterName: voterName || account,
        electionName: electionName || electionObjectId,
        voteTime,
        txHash: tx.hash
      });
    } catch (err) {
      console.error('Error submitting vote:', err);
      if (err.code === 4001) {
        setError('Bạn đã từ chối giao dịch');
      } else if (err.message && err.message.includes('insufficient funds')) {
        setError('Không đủ ETH để thanh toán phí giao dịch');
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Có lỗi xảy ra khi gửi phiếu bầu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Khi receiptData được set sau khi bỏ phiếu thành công, tự động chuyển sang bước 4
  useEffect(() => {
    if (receiptData && activeStep === 2) {
      setActiveStep(3);
    }
  }, [receiptData, activeStep]);

  // Hàm lấy biên lai từ backend nếu đã bỏ phiếu
  const fetchReceiptFromBackend = useCallback(async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      let objectId = null;
      if (typeof electionId === 'object' && electionId._id && /^[a-fA-F0-9]{24}$/.test(electionId._id)) {
        objectId = electionId._id;
      } else if (typeof electionId === 'string' && /^[a-fA-F0-9]{24}$/.test(electionId)) {
        objectId = electionId;
      } else {
        setError('Không xác định được electionId hợp lệ để lấy thông tin.');
        return;
      }
      const res = await axios.get(`https://votting-backend-a9d7.onrender.com/api/votes/receipt?electionId=${objectId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (res.data) {
        setReceiptData({
          voterName: res.data.voterName,
          cccd: res.data.cccd,
          walletAddress: res.data.walletAddress,
          electionName: res.data.electionName,
          voteTime: new Date(res.data.voteTime).toLocaleString(),
          blockNumber: res.data.blockNumber,
          txHash: res.data.txHash
        });
        setError('');
        setActiveStep(3);
      } else {
        setError('Không tìm thấy thông tin bỏ phiếu. Vui lòng bỏ phiếu lại hoặc liên hệ hỗ trợ.');
      }
    } catch (err) {
      setError('Không tìm thấy thông tin bỏ phiếu. Vui lòng bỏ phiếu lại hoặc liên hệ hỗ trợ.');
    }
  }, [electionId]);

  // Sửa toggle: chỉ dùng _id
  const handleToggleCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        if (prev.length < candidates.length) {
          return [...prev, candidateId];
        } else {
          return prev;
        }
      }
    });
  };

  // Thay đổi các hàm điều hướng bước
  const handleNext = () => {
    if (activeStep === 0) {
      // Kiểm tra thông tin cá nhân
      const cccd = localStorage.getItem('voterCCCD');
      if (!cccd) {
        setError('Vui lòng đăng nhập để xác thực thông tin cá nhân');
        return;
      }
      setError('');
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (selectedCandidates.length === 0) {
        setError('Vui lòng chọn ít nhất một ứng cử viên');
        return;
      }
      setError('');
      setActiveStep(2);
    }
  };
  const handleBack = () => {
    setError('');
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };
  // Khi gửi phiếu thành công, reset về bước đầu
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveStep(0);
    setSelectedCandidates([]);
    setError('');
    setShowReceipt(false);
    setReceiptData(null);
    if (onCloseDialog) {
      onCloseDialog();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Sửa getSelectedCandidatesNames: chỉ dùng _id
  const getSelectedCandidatesNames = () => {
    return selectedCandidates
      .map(id => candidates.find(c => c._id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Hàm in phiếu biên lai
  const handlePrintReceipt = () => {
    if (!receiptData) return;
    
    // Tạo nội dung in
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="text-align: center; color: #169385; margin-bottom: 30px;">thông tin BỎ PHIẾU</h1>
        
        <div style="border: 2px solid #169385; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #169385; margin-bottom: 20px;">Thông tin cử tri</h2>
          <p><strong>Tên cử tri:</strong> ${receiptData.voterName}</p>
          <p><strong>CCCD:</strong> ${receiptData.cccd || 'N/A'}</p>
          <p><strong>Địa chỉ ví:</strong> ${receiptData.walletAddress || 'N/A'}</p>
        </div>
        
        <div style="border: 2px solid #169385; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #169385; margin-bottom: 20px;">Thông tin bầu cử</h2>
          <p><strong>Tên cuộc bầu cử:</strong> ${receiptData.electionName}</p>
          <p><strong>Thời gian bỏ phiếu:</strong> ${receiptData.voteTime}</p>
        </div>
        
        <div style="border: 2px solid #169385; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #169385; margin-bottom: 20px;">Thông tin blockchain</h2>
          <p><strong>Block number:</strong> ${receiptData.blockNumber}</p>
          <p><strong>Transaction Hash:</strong> ${receiptData.txHash}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #4caf50; font-weight: bold; font-size: 18px;">✓ BẠN ĐÃ BỎ PHIẾU THÀNH CÔNG!</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
          <p>thông tin này được tạo tự động bởi hệ thống bầu cử trực tuyến</p>
          <p>Thời gian in: ${new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>
    `;
    
    // Tạo cửa sổ in mới
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>thông tin bỏ phiếu</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
            @media screen {
              body { font-family: Arial, sans-serif; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #169385; color: white; border: none; border-radius: 5px; cursor: pointer;">
              In
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
              Đóng
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
             <StyledDialog 
         open={openDialog} 
         onClose={handleCloseDialog}
         maxWidth={false}
         fullWidth
         PaperProps={{
           sx: {
             width: '900px',
             maxWidth: '95vw',
             height: 'auto',
             maxHeight: '90vh'
           }
         }}
       >
        <StyledDialogTitle>
          {!active ? 'Kết nối ví MetaMask' : 'Bỏ phiếu xác thực từng bước'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <StyledDialogContent>
          {/* Stepper hiển thị tiến trình */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: '#169385', 
              mb: 3, 
              textAlign: 'center' 
            }}>
              Quy trình bỏ phiếu
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              {[
                { icon: <PersonIcon />, label: 'Xác thực cá nhân' },
                { icon: <HowToVoteIcon />, label: 'Chọn ứng cử viên' },
                { icon: <CheckCircleIcon />, label: 'Xác nhận & gửi phiếu' },
                { icon: <ReceiptIcon />, label: 'Xem thông tin' }
              ].map((step, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <StepIcon 
                    active={activeStep === index} 
                    completed={activeStep > index}
                    sx={{ mb: 1 }}
                  >
                    {activeStep > index ? <CheckCircleIcon /> : step.icon}
                  </StepIcon>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: activeStep >= index ? 700 : 500,
                      color: activeStep >= index ? '#169385' : '#546e7a',
                      textAlign: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          {hasVoted && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="warning" sx={{ mb: 1 }}>
                Bạn đã bỏ phiếu cho cuộc bầu cử này
              </Alert>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 1, fontWeight: 600, borderRadius: 3 }}
                onClick={() => {
                  if (receiptData) {
                    setActiveStep(3);
                  } else {
                    fetchReceiptFromBackend();
                  }
                }}
              >
                Xem thông tin bỏ phiếu
              </Button>
            </Box>
          )}
          {!active ? (
            <Button
              fullWidth
              variant="contained"
              onClick={connectWallet}
              disabled={loading}
            >
              Kết nối MetaMask
            </Button>
          ) : (
            <>
              {activeStep === 0 && (
                <InfoCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 2rem',
                      boxShadow: '0 8px 32px rgba(22, 147, 133, 0.3)'
                    }}>
                      <PersonIcon sx={{ color: '#fff', fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: '#169385' 
                    }}>
                      Xác thực thông tin cá nhân
                    </Typography>
                    <Box sx={{ 
                      background: 'rgba(22, 147, 133, 0.08)', 
                      borderRadius: 16, 
                      p: 3, 
                      mb: 3,
                      border: '1px solid rgba(22, 147, 133, 0.2)'
                    }}>
                      <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: '#169385' }}>
                        <strong>Tên cử tri:</strong> {localStorage.getItem('voterName') || account}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#546e7a' }}>
                        <strong>Địa chỉ ví:</strong> {account}
                      </Typography>
                    </Box>
                    <Alert severity="info" sx={{ 
                      borderRadius: 12,
                      '& .MuiAlert-icon': { color: '#169385' }
                    }}>
                      Vui lòng kiểm tra kỹ thông tin cá nhân trước khi tiếp tục bỏ phiếu.
                    </Alert>
                  </CardContent>
                </InfoCard>
              )}
              {activeStep === 1 && (
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: '#169385', 
                    mb: 3, 
                    textAlign: 'center' 
                  }}>
                    Chọn ứng cử viên bạn muốn bầu
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#546e7a', 
                    mb: 4, 
                    textAlign: 'center' 
                  }}>
                    Bạn có thể chọn một hoặc nhiều ứng cử viên
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: 3 
                  }}>
                    {candidates.length === 0 ? (
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 4, 
                        background: 'rgba(22, 147, 133, 0.05)', 
                        borderRadius: 16,
                        border: '2px dashed #e0f2f1'
                      }}>
                        <Typography variant="body1" sx={{ color: '#546e7a' }}>
                          Không có ứng cử viên nào cho cuộc bầu cử này
                        </Typography>
                      </Box>
                    ) : (
                      candidates.map((candidate) => (
                        <CandidateCard
                          key={candidate._id}
                          selected={selectedCandidates.includes(candidate._id)}
                          onClick={() => handleToggleCandidate(candidate._id)}
                        >
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Box sx={{ position: 'relative', mb: 2 }}>
                              <Avatar
                                src={candidate.imageUrl}
                                sx={{ 
                                  width: 120, 
                                  height: 160, 
                                  margin: '0 auto', 
                                  boxShadow: '0 8px 32px rgba(22, 147, 133, 0.2)', 
                                  borderRadius: 3 
                                }}
                                variant="rounded"
                              >
                                {candidate.name.charAt(0)}
                              </Avatar>
                              {selectedCandidates.includes(candidate._id) && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 4px 16px rgba(22, 147, 133, 0.4)',
                                  border: '2px solid #fff'
                                }}>
                                  <CheckCircleIcon sx={{ color: '#fff', fontSize: 20 }} />
                                </Box>
                              )}
                            </Box>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              color: '#169385', 
                              mb: 1 
                            }}>
                              {candidate.name}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: '#546e7a', 
                              mb: 2,
                              fontStyle: 'italic'
                            }}>
                              {candidate.position}
                            </Typography>
                            {candidate.motto && (
                              <Typography variant="caption" sx={{ 
                                color: '#546e7a', 
                                fontStyle: 'italic',
                                display: 'block',
                                mb: 2
                              }}>
                                "{candidate.motto}"
                              </Typography>
                            )}
                            <Chip
                              label={selectedCandidates.includes(candidate._id) ? 'Đã chọn' : 'Chọn'}
                              color={selectedCandidates.includes(candidate._id) ? 'primary' : 'default'}
                              sx={{
                                background: selectedCandidates.includes(candidate._id) 
                                  ? 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)' 
                                  : 'rgba(22, 147, 133, 0.1)',
                                color: selectedCandidates.includes(candidate._id) ? '#fff' : '#169385',
                                fontWeight: 600,
                                borderRadius: 12
                              }}
                            />
                          </CardContent>
                        </CandidateCard>
                      ))
                    )}
                  </Box>
                </Box>
              )}
              {activeStep === 2 && (
                <InfoCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 2rem',
                      boxShadow: '0 8px 32px rgba(22, 147, 133, 0.3)'
                    }}>
                      <CheckCircleIcon sx={{ color: '#fff', fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: '#169385' 
                    }}>
                      Xác nhận bỏ phiếu
                    </Typography>
                    <Box sx={{ 
                      background: 'rgba(22, 147, 133, 0.08)', 
                      borderRadius: 16, 
                      p: 3, 
                      mb: 3,
                      border: '1px solid rgba(22, 147, 133, 0.2)'
                    }}>
                      <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: '#169385' }}>
                        <strong>Ứng cử viên đã chọn:</strong>
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700, 
                        color: '#169385',
                        fontStyle: 'italic'
                      }}>
                        {getSelectedCandidatesNames()}
                      </Typography>
                    </Box>
                    <Alert severity="warning" sx={{ 
                      borderRadius: 12,
                      '& .MuiAlert-icon': { color: '#ff9800' }
                    }}>
                      ⚠️ Lưu ý: Bạn chỉ có thể bỏ phiếu một lần và không thể thay đổi sau khi đã xác nhận!
                    </Alert>
                  </CardContent>
                </InfoCard>
              )}
              {activeStep === 3 && receiptData && (
                <ReceiptCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 2rem',
                      boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
                    }}>
                      <CheckCircleIcon sx={{ color: '#fff', fontSize: 40 }} />
                    </Box>
                    <Typography variant="h5" sx={{ 
                      mb: 3, 
                      fontWeight: 700, 
                      color: '#169385' 
                    }}>
                      Bỏ phiếu thành công!
                    </Typography>
                    <Box sx={{ 
                      background: 'rgba(22, 147, 133, 0.08)', 
                      borderRadius: 16, 
                      p: 3, 
                      mb: 3,
                      border: '1px solid rgba(22, 147, 133, 0.2)'
                    }}>
                      <Typography gutterBottom sx={{ fontWeight: 600, color: '#169385' }}>
                        <strong>Tên cử tri:</strong> {receiptData.voterName}
                      </Typography>
                      <Typography gutterBottom sx={{ color: '#546e7a' }}>
                        <strong>CCCD:</strong> {receiptData.cccd}
                      </Typography>
                      <Typography gutterBottom sx={{ color: '#546e7a' }}>
                        <strong>Địa chỉ ví:</strong> {receiptData.walletAddress}
                      </Typography>
                      <Typography gutterBottom sx={{ color: '#546e7a' }}>
                        <strong>Tên cuộc bầu cử:</strong> {receiptData.electionName}
                      </Typography>
                      <Typography gutterBottom sx={{ color: '#546e7a' }}>
                        <strong>Thời gian bỏ phiếu:</strong> {receiptData.voteTime}
                      </Typography>
                      <Typography gutterBottom sx={{ color: '#546e7a' }}>
                        <strong>Block number:</strong> {receiptData.blockNumber}
                      </Typography>
                      <Typography gutterBottom sx={{ wordBreak: 'break-all', color: '#546e7a' }}>
                        <strong>Tx Hash:</strong> {receiptData.txHash}
                      </Typography>
                    </Box>
                    <Alert severity="success" sx={{ 
                      borderRadius: 12,
                      '& .MuiAlert-icon': { color: '#4caf50' }
                    }}>
                      ✅ Bạn đã bỏ phiếu thành công và được ghi nhận trên blockchain!
                    </Alert>
                  </CardContent>
                </ReceiptCard>
              )}
            </>
          )}
        </StyledDialogContent>
        <StyledDialogActions>
          {activeStep > 0 && activeStep < 3 && (
            <ModernButton
              variant="outlined"
              onClick={handleBack}
              startIcon={<CloseIcon />}
            >
              Quay lại
            </ModernButton>
          )}
          {activeStep < 2 && (
            <ModernButton
              variant="contained"
              onClick={handleNext}
              disabled={loading || hasVoted || (activeStep === 1 && candidates.length === 0)}
              fullWidth={activeStep === 1}
            >
              Tiếp tục
            </ModernButton>
          )}
          {activeStep === 2 && (
            <ModernButton
              variant="contained"
              onClick={handleVote}
              disabled={loading || hasVoted}
              startIcon={loading ? <CircularProgress size={20} /> : <HowToVoteIcon />}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận bỏ phiếu'}
            </ModernButton>
          )}
          {activeStep === 3 && receiptData && (
            <>
              <ModernButton
                variant="outlined"
                onClick={handlePrintReceipt}
                startIcon={<PrintIcon />}
              >
                In thông tin
              </ModernButton>
              <ModernButton 
                variant="contained" 
                onClick={handleCloseDialog}
                startIcon={<CheckCircleIcon />}
              >
                Hoàn thành
              </ModernButton>
            </>
          )}
        </StyledDialogActions>
      </StyledDialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
}

export default VotingComponent;
