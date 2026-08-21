import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  styled
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate, formatDateNoTime } from '../utils/helpers';
import { getElectionStatus, getStatusColor, getStatusText, getRemainingTime } from '../utils/electionHelpers';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import VotingComponent from '../components/VotingComponent';
import { useWeb3React } from '@web3-react/core';
import web3Service from '../services/web3Service';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerIcon from '@mui/icons-material/Timer';
import axios from 'axios';
import { differenceInSeconds } from 'date-fns';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedIcon from '@mui/icons-material/Verified';
import SpeedIcon from '@mui/icons-material/Speed';

// Styled components với thiết kế hiện đại và nổi bật
const CleanContainer = styled(Container)(({ theme }) => ({
  background: '#ffffff',
  minHeight: '100vh',
  padding: theme.spacing(4),
  color: '#169385',
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: 24,
  boxShadow: '0 12px 40px rgba(22, 147, 133, 0.15)',
  color: '#169385',
  marginBottom: theme.spacing(4),
  overflow: 'hidden',
  position: 'relative',
  border: '2px solid #e0f2f1',
  '&:hover': {
    boxShadow: '0 16px 48px rgba(22, 147, 133, 0.2)',
    border: '2px solid #169385',
  },
}));

const CandidateCard = styled(Card)(({ theme }) => ({
  background: '#fff',
  borderRadius: 24,
  border: '2px solid #e0f2f1',
  boxShadow: '0 8px 32px rgba(22, 147, 133, 0.12)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 20px 60px rgba(22, 147, 133, 0.25)',
    border: '2px solid #169385',
    '& .candidate-image': {
      transform: 'scale(1.05)',
    },
    '& .candidate-info': {
      background: 'linear-gradient(135deg, rgba(22, 147, 133, 0.05) 0%, rgba(22, 147, 133, 0.02) 100%)',
    },
  },
}));

const CandidateImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '20px 20px 0 0',
  '& img': {
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

const ModernButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
  borderRadius: 16,
  padding: '14px 28px',
  fontSize: '1rem',
  fontWeight: 700,
  textTransform: 'none',
  color: '#fff',
  boxShadow: '0 6px 20px rgba(22, 147, 133, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #0f6b5f 0%, #169385 100%)',
    boxShadow: '0 10px 30px rgba(22, 147, 133, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  borderRadius: 16,
  padding: '14px 28px',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  color: '#169385',
  border: '2px solid #169385',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: '#169385',
    color: '#fff',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(22, 147, 133, 0.3)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  background: status === 'active' ? '#4caf50' : status === 'completed' ? '#ff9800' : '#f44336',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.875rem',
  borderRadius: 24,
  padding: '8px 16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 24,
  background: '#e0f2f1',
  borderRadius: 12,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
  '& .progress-fill': {
    height: '100%',
    background: 'linear-gradient(90deg, #169385 0%, #4db6ac 100%)',
    borderRadius: 12,
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 12,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.875rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
}));

const InfoBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  background: 'rgba(22, 147, 133, 0.08)',
  borderRadius: 12,
  border: '1px solid rgba(22, 147, 133, 0.2)',
  marginBottom: 8,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(22, 147, 133, 0.12)',
    border: '1px solid rgba(22, 147, 133, 0.3)',
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  background: '#fff',
  borderRadius: 20,
  border: '2px solid #e0f2f1',
  boxShadow: '0 8px 32px rgba(22, 147, 133, 0.12)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(22, 147, 133, 0.2)',
    border: '2px solid #169385',
  },
}));

const InfoIconBox = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 16px rgba(22, 147, 133, 0.3)',
}));

const CountdownBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
  borderRadius: 20,
  border: '2px solid rgba(22, 147, 133, 0.3)',
  padding: theme.spacing(3),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  color: '#fff',
  boxShadow: '0 8px 32px rgba(22, 147, 133, 0.25)',
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

function ElectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, active } = useWeb3React();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openVoteDialog, setOpenVoteDialog] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showResults, setShowResults] = useState(false);
  const [showVotingDialog, setShowVotingDialog] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [electionResult, setElectionResult] = useState(null);
  const [countdown, setCountdown] = useState('');

  // Hàm lấy chi tiết election từ backend
  const loadElection = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/elections/${id}`);
      setElection(res.data);
    } catch (err) {
      setError('Không thể tải dữ liệu cuộc bầu cử');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách ứng cử viên từ backend
  const loadCandidates = async () => {
    if (!id) return;
    const electionId = String(id);
    if (!/^[a-fA-F0-9]{24}$/.test(electionId)) {
      setCandidates([]);
      setError('ID cuộc bầu cử không hợp lệ');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5000/api/candidates?electionId=${electionId}`);
      setCandidates(res.data);
    } catch (error) {
      setError('Không thể tải dữ liệu ứng cử viên');
    }
  };

  // Hàm lấy kết quả bầu cử
  const loadElectionResult = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/elections/${id}/results`);
      setElectionResult(res.data);
    } catch (err) {
      setElectionResult(null);
    }
  };

  useEffect(() => {
    if (id) {
      loadElection();
      loadCandidates();
    }
  }, [id]);

  useEffect(() => {
    if (election && getElectionStatus(election) === 'completed') {
      loadElectionResult();
    }
  }, [election]);

  useEffect(() => {
    const cccd = localStorage.getItem('voterCCCD');
    if (cccd) {
      const voteKey = `vote_${id}_${cccd}`;
      const hasVoted = localStorage.getItem(voteKey) !== null;
      setHasVoted(hasVoted);
    }
  }, [id]);

  // Tắt countdown timer để tránh timeout
  useEffect(() => {
    if (!election || !election.endTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(election.endTime);
      let diff = Math.max(0, differenceInSeconds(end, now));
      const days = Math.floor(diff / (3600 * 24));
      diff -= days * 3600 * 24;
      const hours = Math.floor(diff / 3600);
      diff -= hours * 3600;
      const minutes = Math.floor(diff / 60);
      const seconds = diff - minutes * 60;
      setCountdown(
        `${days > 0 ? days + ' ngày ' : ''}` +
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [election]);

  const handleVoteSubmitted = async () => {
    try {
      await loadElection();
      setSnackbar({
        open: true,
        message: 'Bạn đã bỏ phiếu thành công!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật kết quả bầu cử',
        severity: 'error'
      });
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getValidVoteCount = (candidateId) => {
    if (!election || !election.candidates) return 0;
    const candidateResult = election.candidates.find(item => item.id === candidateId);
    return candidateResult ? candidateResult.votes : 0;
  };

  const getVotePercentage = (candidateId) => {
    if (!election || !election.candidates) return 0;
    const candidateResult = election.candidates.find(item => item.id === candidateId);
    const totalVoters = election.totalVoters || election.totalVotedVoters || 1;
    return candidateResult ? (candidateResult.votes / totalVoters) * 100 : 0;
  };

  const getWinners = () => {
    if (!election || !election.candidates) return [];
    const maxVotes = Math.max(...election.candidates.map(item => item.votes));
    return election.candidates
      .filter(item => item.votes === maxVotes && item.votes > 0)
      .map(item => item);
  };

  const isWinner = (candidateId) => {
    return getWinners().some(winner => winner.id === candidateId);
  };

  const canVote = () => {
    if (!election || !account) return false;
    const status = getElectionStatus(election);
    return status === 'active' && !hasVoted;
  };

  const shouldShowResults = () => {
    if (!election) return false;
    const status = getElectionStatus(election);
    return status === 'completed' || showResults;
  };

  const renderVoteResults = (candidate) => {
    if (!shouldShowResults()) return null;
    let voteCount = 0, totalVoters = 1, percentage = 0;
    if (electionResult && electionResult.candidates) {
      const c = electionResult.candidates.find(ca => String(ca._id) === String(candidate._id || candidate.id));
      voteCount = c ? c.voteCount : 0;
      totalVoters = electionResult.totalVotedVoters || 1;
      percentage = totalVoters > 0 ? (voteCount / totalVoters) * 100 : 0;
    } else {
      voteCount = getValidVoteCount(candidate.id);
      totalVoters = election.totalVoters || election.totalVotedVoters || 1;
      percentage = getVotePercentage(candidate.id);
    }
    
    return (
      <Box sx={{ mt: 3, width: '100%' }}>
        <Typography variant="h6" sx={{ 
          color: '#169385', 
          fontWeight: 700, 
          mb: 2,
                  display: 'flex',
                  alignItems: 'center',
          '&::before': { 
            content: '""', 
            display: 'inline-block', 
            width: '4px', 
            height: '1.2rem', 
            background: '#169385', 
            mr: 1, 
            borderRadius: '2px' 
          } 
        }}>
          Kết quả bầu cử
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#169385', minWidth: 100 }}>
            {voteCount}/{totalVoters} phiếu
          </Typography>
        </Box>
        <ProgressBar>
          <Box 
            className="progress-fill"
            sx={{ width: `${percentage}%` }}
          >
                    {percentage.toFixed(1)}%
                </Box>
        </ProgressBar>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#169385' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <CleanContainer maxWidth="md">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <SecondaryButton onClick={() => navigate('/elections')}>
          Quay lại danh sách bầu cử
        </SecondaryButton>
      </CleanContainer>
    );
  }

  if (!election) {
    return (
      <CleanContainer maxWidth="md">
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Không tìm thấy cuộc bầu cử
          </Typography>
          <SecondaryButton onClick={() => navigate('/elections')}>
            Quay lại danh sách bầu cử
          </SecondaryButton>
        </Paper>
      </CleanContainer>
    );
  }

  const status = getElectionStatus(election);
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  return (
    <CleanContainer maxWidth="lg">
      {/* Back Button */}
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
        <SecondaryButton
          startIcon={<ArrowBackIcon />}
        >
          Quay lại
        </SecondaryButton>
      </Box> */}

      {/* Header Card - Thông tin cuộc bầu cử */}
      <HeaderCard onClick={() => navigate('/elections')} sx={{ cursor: 'pointer', marginTop: 10}}>
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
          {/* Tiêu đề và trạng thái */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                mb: 2, 
                color: '#169385',
                fontSize: { xs: '2rem', md: '2.5rem' },
                lineHeight: 1.2
              }}>
                {election.title}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#546e7a', 
          mb: 3, 
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: '1000px'
              }}>
                {election.description || 'Cuộc bầu cử trực tuyến minh bạch và bảo mật với công nghệ blockchain tiên tiến'}
              </Typography>
            </Box>
            <StatusChip 
              label={getStatusText(status)}
              status={status}
            />
          </Box>

          {/* Thông tin chi tiết với design mới */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <InfoIconBox>
                    <CalendarTodayIcon sx={{ color: '#fff', fontSize: 28 }} />
                  </InfoIconBox>
                  <Typography variant="caption" sx={{ 
                    color: '#546e7a', 
                    display: 'block',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Thời gian bắt đầu
            </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#169385', 
                    fontWeight: 700,
                    mt: 1
                  }}>
                    {formatDate(election.startTime)}
                </Typography>
                </CardContent>
              </InfoCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <InfoIconBox>
                    <TimerIcon sx={{ color: '#fff', fontSize: 28 }} />
                  </InfoIconBox>
                  <Typography variant="caption" sx={{ 
                    color: '#546e7a', 
                    display: 'block',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Thời gian kết thúc
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#169385', 
                    fontWeight: 700,
                    mt: 1
                  }}>
                    {formatDate(election.endTime)}
                  </Typography>
                </CardContent>
              </InfoCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <InfoIconBox>
                    <PeopleIcon sx={{ color: '#fff', fontSize: 28 }} />
                  </InfoIconBox>
                  <Typography variant="caption" sx={{ 
                    color: '#546e7a', 
                    display: 'block',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Số ứng cử viên
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#169385', 
                    fontWeight: 700,
                    mt: 1
                  }}>
                    {candidates.length} người
                  </Typography>
                </CardContent>
              </InfoCard>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <InfoCard>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <InfoIconBox>
                    <HowToVoteIcon sx={{ color: '#fff', fontSize: 28 }} />
                  </InfoIconBox>
                  <Typography variant="caption" sx={{ 
                    color: '#546e7a', 
                    display: 'block',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    Trạng thái
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#169385', 
                    fontWeight: 700,
                    mt: 1
                  }}>
                    {isActive ? 'Đang diễn ra' : isCompleted ? 'Đã kết thúc' : 'Chưa bắt đầu'}
                  </Typography>
                </CardContent>
              </InfoCard>
            </Grid>
          </Grid>

          {/* Countdown Timer với design mới */}
          {isActive && (
            <CountdownBox>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  mb: 2, 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 2
                }}>
                  ⏰ Thời gian còn lại
                </Typography>
                <Typography variant="h3" sx={{ 
                  color: '#fff', 
                  fontWeight: 700, 
                  fontFamily: 'monospace',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  letterSpacing: 3
                }}>
                  {countdown}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  mt: 1,
                  fontStyle: 'italic'
                }}>
                  Hãy nhanh chóng thực hiện quyền bầu cử của bạn!
                </Typography>
            </Box>
            </CountdownBox>
          )}
        </CardContent>
      </HeaderCard>

      {/* Danh sách ứng cử viên */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" sx={{ 
          fontWeight: 700, 
          mb: 4, 
          color: '#169385',
          textAlign: 'center',
          fontSize: { xs: '2rem', md: '2.5rem' }
        }}>
          Danh sách ứng cử viên
        </Typography>

            {candidates.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 24 }}>
            <Typography variant="body1" sx={{ color: '#546e7a' }}>
              Chưa có ứng cử viên nào cho cuộc bầu cử này
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {shouldShowResults()
              ? [...candidates].sort((a, b) => {
                  if (electionResult && electionResult.candidates) {
                    const ca = electionResult.candidates.find(ca => String(ca._id) === String(a._id || a.id));
                    const cb = electionResult.candidates.find(cb => String(cb._id) === String(b._id || b.id));
                    const pa = ca && electionResult.totalVotedVoters ? (ca.voteCount / electionResult.totalVotedVoters) * 100 : 0;
                    const pb = cb && electionResult.totalVotedVoters ? (cb.voteCount / electionResult.totalVotedVoters) * 100 : 0;
                    return pb - pa;
                  }
                  return 0;
                }).map((candidate) => (
                  <Grid item xs={12} sm={6} md={4} key={candidate._id || candidate.id}>
                    <CandidateCard>
                      <CandidateImage className="candidate-image">
                        <img
                          src={candidate.imageUrl || 'https://via.placeholder.com/400x500?text=No+Image'}
                          alt={candidate.name}
                          style={{ 
                            width: '100%', 
                            height: '400px', 
                            objectFit: 'cover'
                          }}
                        />
                      </CandidateImage>
                      <CardContent sx={{ p: 3 }} className="candidate-info">
                        <Typography variant="h5" sx={{ 
                          fontWeight: 600, 
                          color: '#169385', 
                          mb: 1,
                          textAlign: 'center'
                        }}>
                        {candidate.name}
                      </Typography>
                        <Typography variant="body1" sx={{ 
                          color: '#546e7a', 
                          mb: 3,
                          fontStyle: 'italic',
                          textAlign: 'center',
                          fontWeight: 100
                        }}>
                          {candidate.position || 'Chức vụ chưa cập nhật'}
                        </Typography>
                        
                        {/* Thông tin chi tiết - ẩn khi hiển thị kết quả */}
                        {!shouldShowResults() && (
                          <Box sx={{ mb: 3 }}>
                            <InfoBadge>
                              <EventIcon sx={{ color: '#169385', mr: 1, fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: '#546e7a', display: 'block' }}>
                                  Ngày sinh
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#169385', fontWeight: 600 }}>
                                  {formatDateNoTime(candidate.birthDate)}
                                </Typography>
                              </Box>
                            </InfoBadge>
                            
                            <InfoBadge>
                              <LocationOnIcon sx={{ color: '#169385', mr: 1, fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: '#546e7a', display: 'block' }}>
                                  Quê quán
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#169385', fontWeight: 600 }}>
                                  {candidate.hometown || 'Chưa cập nhật'}
                                </Typography>
                              </Box>
                            </InfoBadge>
                            
                            {candidate.motto && (
                              <InfoBadge>
                                <AccountBalanceIcon sx={{ color: '#169385', mr: 1, fontSize: 20 }} />
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#546e7a', display: 'block' }}>
                                    Châm ngôn
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#169385', fontWeight: 600, fontStyle: 'italic' }}>
                                    "{candidate.motto}"
                                  </Typography>
                                </Box>
                              </InfoBadge>
                            )}
                            
                            {candidate.achievements && (
                              <InfoBadge>
                                <SchoolIcon sx={{ color: '#169385', mr: 1, fontSize: 20 }} />
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#546e7a', display: 'block' }}>
                                    Thành tựu
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#169385', fontWeight: 600, fontStyle: 'italic' }}>
                                    "{candidate.achievements}"
                                  </Typography>
                                </Box>
                              </InfoBadge>
                            )}
                          </Box>
                        )}
                        
                        {renderVoteResults(candidate)}
                      </CardContent>
                    </CandidateCard>
                  </Grid>
                ))
              : candidates.map((candidate) => (
                  <Grid item xs={12} sm={6} md={4} key={candidate._id || candidate.id}>
                    <CandidateCard>
                      <CandidateImage className="candidate-image">
                        <img
                          src={candidate.imageUrl || 'https://via.placeholder.com/400x500?text=Ứng+cử+viên'}
                          alt={candidate.name}
                          style={{ 
                            width: '100%', 
                            height: '400px', 
                            objectFit: 'cover'
                          }}
                        />
                      </CandidateImage>
                      <CardContent sx={{ p: 3 }} className="candidate-info">
                        <Typography variant="h4" sx={{ 
                          fontWeight: 600, 
                          color: '#169385', 
                          mb: 1,
                          textAlign: 'center'
                        }}>
                          {candidate.name}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: '#546e7a', 
                          mb: 3,
                          fontStyle: 'italic',
                          textAlign: 'center',
                          fontWeight: 500
                        }}>
                          {candidate.position || 'Chức vụ chưa cập nhật'}
                        </Typography>
                        
                        {/* Thông tin chi tiết - hiển thị bình thường cho candidates thường */}
                        <Box sx={{ mb: 3 }}>
                          <InfoBadge>
                            <EventIcon sx={{ color: '#169385', mr: 1, fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#546e7a', display: 'block' }}>
                                Ngày sinh
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#169385', fontWeight: 600 }}>
                                {formatDateNoTime(candidate.birthDate)}
                              </Typography>
                        </Box>
                          </InfoBadge>
                          
                          <InfoBadge>
                            <LocationOnIcon sx={{ color: '#169385', mr: 1, fontSize: 20 }} />
                            <Box>
                              <Typography variant="caption" sx={{ color: '#546e7a', display: 'block' }}>
                                Quê quán
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#169385', fontWeight: 600 }}>
                                {candidate.hometown || 'Chưa cập nhật'}
                              </Typography>
                        </Box>
                          </InfoBadge>
                          
                          {candidate.motto && (
                            <InfoBadge>
                              <AccountBalanceIcon sx={{ color: '#169385', mr: 1, fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: '#546e7a', display: 'block' }}>
                                  Châm ngôn
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#169385', fontWeight: 600, fontStyle: 'italic' }}>
                                  "{candidate.motto}"
                          </Typography>
                        </Box>
                            </InfoBadge>
                          )}
                          
                          {candidate.achievements && (
                            <InfoBadge>
                              <SchoolIcon sx={{ color: '#169385', mr: 1, fontSize: 20 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: '#546e7a', display: 'block' }}>
                                  Thành tựu
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#169385', fontWeight: 600, fontStyle: 'italic' }}>
                                  "{candidate.achievements}"
                          </Typography>
                        </Box>
                            </InfoBadge>
                          )}
                        </Box>
                        
                        {!shouldShowResults() && isActive && canVote() && !hasVoted && (
                          <Box sx={{ textAlign: 'center' }}>
                            <ModernButton
                            onClick={() => {
                              setSelectedCandidate(candidate.id || candidate._id);
                              setShowVotingDialog(true);
                            }}
                            startIcon={<HowToVoteIcon />}
                              fullWidth
                            >
                              Bỏ phiếu
                            </ModernButton>
                      </Box>
                        )}
                        
                        {shouldShowResults() && renderVoteResults(candidate)}
                      </CardContent>
                    </CandidateCard>
                  </Grid>
                ))}
          </Grid>
        )}
      </Box>

      {/* Voting Component */}
      <Box id="voting-section">
        <VotingComponent
          electionId={election}
          candidates={candidates}
          onVoteSubmitted={handleVoteSubmitted}
          openDialog={showVotingDialog}
          onCloseDialog={() => setShowVotingDialog(false)}
        />
      </Box>
      
      {/* Dialog đăng nhập */}
      <Dialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Đăng nhập để bỏ phiếu</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Bạn cần đăng nhập hoặc đăng ký tài khoản cử tri để bỏ phiếu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoginDialog(false)}>Hủy</Button>
          <ModernButton onClick={handleLoginRedirect}>
            Đăng nhập
          </ModernButton>
        </DialogActions>
      </Dialog>
      
      {/* Voting Dialog */}
      <Dialog
        open={showVotingDialog}
        onClose={() => setShowVotingDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận bỏ phiếu</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Bạn có chắc chắn muốn bầu cho ứng cử viên này không?
          </Typography>
          {selectedCandidate && (
            <Typography variant="h6" sx={{ color: '#169385', fontWeight: 700 }}>
              {candidates.find(c => c.id === selectedCandidate || c._id === selectedCandidate)?.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVotingDialog(false)}>Hủy</Button>
          <ModernButton
            onClick={async () => {
              try {
                const cccd = localStorage.getItem('voterCCCD');
                if (!cccd) {
                  setShowVotingDialog(false);
                  setOpenLoginDialog(true);
                  return;
                }
                await axios.post('http://localhost:5000/api/votes', {
                  electionId: election._id || id,
                  candidateId: selectedCandidate,
                  cccd,
                });
                localStorage.setItem(`vote_${id}_${cccd}`, '1');
                setHasVoted(true);
                setShowVotingDialog(false);
                handleVoteSubmitted();
              } catch (err) {
                setShowVotingDialog(false);
                setSnackbar({
                  open: true,
                  message: 'Có lỗi xảy ra khi bỏ phiếu. Vui lòng thử lại!',
                  severity: 'error',
                });
              }
            }}
            disabled={!selectedCandidate}
          >
            Xác nhận
          </ModernButton>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
    </CleanContainer>
  );
}

export default ElectionDetail;
