import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  Divider,
  Link,
  Paper,
  Alert,
  Chip,
  Stack,
  useMediaQuery,
  IconButton,
  Avatar,
  styled
} from '@mui/material';
import Chatbot from '../components/Chatbot';
import { useNavigate } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import TransparencyIcon from '@mui/icons-material/Visibility';
import ArticleIcon from '@mui/icons-material/Article';
import InfoIcon from '@mui/icons-material/Info';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../components/Web3Provider';
import { motion } from 'framer-motion';
import LoginIcon from '@mui/icons-material/Login';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LogoIcon from '../assets/BG.svg';
import axios from 'axios';

// Clean white background
const CleanBg = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: '#ffffff',
  position: 'relative',
  color: '#169385',
  fontFamily: 'Roboto, Arial, sans-serif',
  overflow: 'hidden',
}));

// Main content container
const MainContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

// Modern button styling
const ModernButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
  borderRadius: 16,
  padding: '12px 32px',
  marginBottom: 60,
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  color: '#fff',
  boxShadow: '0 4px 16px rgba(22, 147, 133, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #0f6b5f 0%, #169385 100%)',
    boxShadow: '0 8px 24px rgba(22, 147, 133, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

// Secondary button styling
const SecondaryButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  borderRadius: 16,
  padding: '12px 32px',
  marginBottom: 60,
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  color: '#169385',
  border: '2px solid #169385',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#169385',
    color: '#fff',
    transform: 'translateY(-2px)',
  },
}));

// Feature card with clean design
const FeatureCard = styled(Card)(({ theme }) => ({
  background: '#fff',
  borderRadius: 20,
  border: '2px solid #e0f2f1',
  boxShadow: '0 8px 32px rgba(22, 147, 133, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(22, 147, 133, 0.2)',
    border: '2px solid #169385',
  },
}));

// Election card with clean styling
const ElectionCard = styled(Box)(({ theme }) => ({
  background: '#fff',
  borderRadius: 16,
  border: '2px solid #e0f2f1',
  boxShadow: '0 4px 16px rgba(22, 147, 133, 0.1)',
  padding: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 24px rgba(22, 147, 133, 0.2)',
    border: '2px solid #169385',
  },
}));

// Step circle with clean design
const StepCircle = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 16px rgba(22, 147, 133, 0.3)',
}));

function ElectionSlider({ elections, onClick }) {
  const [index, setIndex] = React.useState(0);
  const visibleCount = 4;
  
  //Tắt auto-slide để tránh timeout
  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + visibleCount) % (elections.length > 0 ? elections.length : 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [elections.length]);
  
  if (!elections.length) return null;
  
  const getVisible = () => {
    if (elections.length <= visibleCount) return elections;
    let arr = [];
    for (let i = 0; i < visibleCount; i++) {
      arr.push(elections[(index + i) % elections.length]);
    }
    return arr;
  };
  
  const visibleElections = getVisible();
  
  return (
    <Box sx={{ 
      width: '100%', 
      marginBottom: 60,
      mb: 5, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      position: 'relative', 
      gap: 3 
    }}>
      <IconButton 
        onClick={() => setIndex((index - visibleCount + elections.length) % elections.length)} 
        sx={{ 
          position: 'absolute', 
          left: 0, 
          zIndex: 2, 
          color: '#169385', 
          bgcolor: '#fff', 
          border: '2px solid #169385',
          boxShadow: '0 4px 16px rgba(22, 147, 133, 0.2)',
          '&:hover': { 
            bgcolor: '#169385',
            color: '#fff',
            transform: 'scale(1.1)',
          } 
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      
      <Box sx={{ display: 'flex', gap: 3, width: '100%', justifyContent: 'center' }}>
        {visibleElections.map((election, idx) => (
          <ElectionCard key={election.id || idx} onClick={() => onClick(election)}>
            <Box sx={{ position: 'relative', width: 254, height: 180 }}>
              <Box 
                component="img" 
                src={election.logoUrl} 
                alt={election.title} 
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  borderRadius: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }} 
              />
              <Box sx={{ 
                position: 'absolute', 
                left: 0, 
                right: 0, 
                bottom: 0, 
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                color: '#fff', 
                borderBottomLeftRadius: 12, 
                borderBottomRightRadius: 12, 
                px: 2, 
                py: 1.5 
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
                  {election.title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#e0e0e0', fontSize: 14 }}>
                  {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </ElectionCard>
        ))}
      </Box>
      
      <IconButton 
        onClick={() => setIndex((index + visibleCount) % elections.length)} 
        sx={{ 
          position: 'absolute', 
          right: 0, 
          zIndex: 2, 
          color: '#169385', 
          bgcolor: '#fff', 
          border: '2px solid #169385',
          boxShadow: '0 4px 16px rgba(22, 147, 133, 0.2)',
          '&:hover': { 
            bgcolor: '#169385',
            color: '#fff',
            transform: 'scale(1.1)',
          } 
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { active, account, activate, deactivate } = useWeb3React();

  const [ongoingElections, setOngoingElections] = React.useState([]);

  React.useEffect(() => {
    axios.get('http://localhost:5000/api/elections')
      .then(res => {
        const now = new Date();
        const activeElections = (res.data || []).filter(e => {
          const start = new Date(e.startTime);
          const end = new Date(e.endTime);
          return now >= start && now <= end;
        });
        setOngoingElections(activeElections.map(e => ({
          id: e._id || e.id,
          title: e.title,
          logoUrl: e.logoUrl || 'https://i.imgur.com/D2lDXPB.jpg',
          startTime: e.startTime,
          endTime: e.endTime
        })));
      })
      .catch(() => setOngoingElections([]));
  }, []);

  const handleConnectWallet = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnectWallet = () => {
    try {
      deactivate();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 48, color: '#169385' }} />,
      title: 'Bảo Mật Tuyệt Đối',
      description: 'Sử dụng công nghệ blockchain để đảm bảo tính bảo mật và không thể can thiệp vào kết quả bầu cử.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: '#169385' }} />,
      title: 'Nhanh Chóng & Tiện Lợi',
      description: 'Bỏ phiếu trực tuyến mọi lúc mọi nơi, không cần phải đến địa điểm bỏ phiếu.',
    },
    {
      icon: <TransparencyIcon sx={{ fontSize: 48, color: '#169385' }} />,
      title: 'Minh Bạch & Công Khai',
      description: 'Mọi hoạt động bầu cử đều được ghi lại trên blockchain, có thể kiểm tra và xác minh.',
    },
  ];

  return (
    <CleanBg>
      {/* Chatbot Component */}
      <Chatbot />
      
      {/* Main Content */}
      <MainContainer maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          minHeight: 100,
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: { xs: 3, md: 0 },
          mb: 6
        }}>
          {/* Left: Title + Buttons */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: { xs: 'center', md: 'flex-start' }, 
            justifyContent: 'center' 
          }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 3, 
                color: '#0f6b5f', 
                letterSpacing: 2, 
                textAlign: { xs: 'center', md: 'left' },
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              HỆ THỐNG BẦU CỬ TRỰC TUYẾN
            </Typography>
            
            {/* <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 4, 
                color: '#0f6b5f', 
                letterSpacing: 1, 
                textAlign: { xs: 'center', md: 'left' },
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              
            </Typography> */}
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#546e7a', 
                mb: 4, 
                fontWeight: 400, 
                textAlign: { xs: 'center', md: 'left' },
                maxWidth: 500,
                lineHeight: 1.6,
              }}
            >
              Nền tảng bầu cử hiện đại, bảo mật và minh bạch. 
              Tham gia bầu cử trực tuyến một cách dễ dàng và an toàn.
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ 
                mb: 3, 
                alignItems: { xs: 'center', sm: 'flex-start' },
                width: '100%'
              }}
            >
              <Button 
                variant="contained"
                size="large" 
                onClick={() => navigate('/register')}
                sx={{ 
                  bgcolor: '#169385',
                  color: '#fff',
                  '&:hover': { bgcolor: '#0f6b5f' }
                }}
              >
                Đăng ký
              </Button>
              
              <Button 
                variant="outlined"
                size="large" 
                onClick={() => navigate('/login')}
                sx={{ 
                  bgcolor: '#169385',
                  color: '#fff',
                  '&:hover': { bgcolor: '#0f6b5f' }
                }}
              >
                Đăng nhập
              </Button>
              
              {active ? (
                <Chip
                  icon={<AccountBalanceWalletIcon />}
                  label={`Ví: ${account ? account.slice(0, 6) + '...' + account.slice(-4) : ''}`}
                  onDelete={handleDisconnectWallet}
                  sx={{ 
                    bgcolor: '#e8f5e8', 
                    color: '#169385', 
                    border: '1px solid #169385'
                  }}
                />
              ) : (
                <Button 
                  variant="contained"
                  size="large" 
                  onClick={handleConnectWallet}
                  startIcon={<AccountBalanceWalletIcon />}
                  sx={{ 
                    bgcolor: '#169385',
                    color: '#fff',
                    '&:hover': { bgcolor: '#0f6b5f' }
                  }}
                >
                  Kết nối ví MetaMask
                </Button>
              )}
            </Stack>
          </Box>
          
          {/* Right: Logo */}
          <Box sx={{ 
            flexShrink: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: { xs: 'center', md: 'flex-start' }, 
            ml: { md: 4 }, 
            mt: { xs: 3, md: 0 } 
          }}>
            <Box 
              component="img" 
              src={LogoIcon} 
              alt="Logo hệ thống" 
              sx={{ 
                width: 520, 
                height: 520,
                // filter: 'drop-shadow(0 8px 16px rgba(22, 147, 133, 0.2))',
              }} 
            />
          </Box>
        </Box>
        
        {/* Election Slider */}
        <Box sx={{ mb: 6, minHeight: 100 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 4, 
              color: '#169385', 
              letterSpacing: 1, 
              textAlign: 'center',
            }}
          >
            Các cuộc bầu cử đang diễn ra
          </Typography>
          <ElectionSlider 
            elections={ongoingElections} 
            onClick={election => navigate(`/elections/${election.id}`)} 
          />
        </Box>
        
        {/* Features Section */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 4, 
              color: '#169385', 
              letterSpacing: 1, 
              textAlign: 'center',
            }}
          >
            Tính năng nổi bật
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FeatureCard>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#169385', 
                        mb: 2,
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#546e7a', 
                        lineHeight: 1.6 
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Process Section */}
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 4, 
              color: '#169385', 
              letterSpacing: 1, 
              textAlign: 'center',
            }}
          >
            Quy trình bầu cử
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#546e7a', 
              mb: 6, 
              fontWeight: 400, 
              textAlign: 'center',
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            Đăng ký, tham gia bầu cử và xem kết quả một cách minh bạch, bảo mật, hiện đại.
          </Typography>
          
          <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
            {[
              { step: 1, title: 'Đăng ký / Đăng nhập', desc: 'Tạo tài khoản hoặc đăng nhập để bắt đầu.' },
              { step: 2, title: 'Tham gia bầu cử', desc: 'Chọn cuộc bầu cử và bỏ phiếu an toàn.' },
              { step: 3, title: 'Xem kết quả', desc: 'Kết quả minh bạch, cập nhật tức thì.' }
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  p: 3,
                  background: '#fff',
                  borderRadius: 20,
                  border: '2px solid #e0f2f1',
                  boxShadow: '0 4px 16px rgba(22, 147, 133, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(22, 147, 133, 0.2)',
                    border: '2px solid #169385',
                  }
                }}>
                  <StepCircle sx={{ mb: 3 }}>
                    {item.step}
                  </StepCircle>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#169385', 
                      mb: 2,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#546e7a',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </MainContainer>
    </CleanBg>
  );
};

export default Home;