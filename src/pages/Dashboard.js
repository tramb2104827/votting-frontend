import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function Dashboard() {
  const navigate = useNavigate();
  const [voter, setVoter] = useState(null);
  const [elections, setElections] = useState([]);
  const [votedElections, setVotedElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const isVoter = localStorage.getItem('isVoter') === 'true';
    const voterCCCD = localStorage.getItem('voterCCCD');
    
    if (!isVoter || !voterCCCD) {
      navigate('/login');
      return;
    }

    // Tải thông tin cử tri
    loadVoterInfo(voterCCCD);
    
    // Tải danh sách bầu cử
    loadElections();
    
    // Tải danh sách bầu cử đã tham gia
    loadVotedElections();
  }, [navigate]);

  const loadVoterInfo = (voterCCCD) => {
    try {
      const votersData = JSON.parse(localStorage.getItem('voters') || '[]');
      const voter = votersData.find(v => v.cccd === voterCCCD);
      
      if (voter) {
        setVoter(voter);
      } else {
        // Thử tìm trong danh sách cử tri đăng ký
        const registeredVoters = JSON.parse(localStorage.getItem('registeredVoters') || '[]');
        const registeredVoter = registeredVoters.find(v => v.cccd === voterCCCD);
        
        if (registeredVoter) {
          setVoter(registeredVoter);
        }
      }
    } catch (error) {
      console.error('Error loading voter data:', error);
    }
  };

  const loadElections = () => {
    try {
      const storedElections = localStorage.getItem('elections');
      if (storedElections) {
        setElections(JSON.parse(storedElections));
      }
    } catch (error) {
      console.error('Error loading elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVotedElections = () => {
    try {
      const votedElections = JSON.parse(localStorage.getItem('votedElections') || '[]');
      setVotedElections(votedElections);
    } catch (error) {
      console.error('Error loading voted elections:', error);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'error';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'active':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return '';
    }
  };

  const getActiveElections = () => {
    return elections.filter(election => getElectionStatus(election) === 'active');
  };

  const hasVoted = (electionId) => {
    return votedElections.includes(electionId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, fontFamily: 'Roboto, Arial, sans-serif', bgcolor: 'transparent' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#169385', mb: 3 }}>
        Trang Cử Tri
      </Typography>

      {voter && (
        <Paper sx={{ p: 4, mb: 4, borderRadius: 5, boxShadow: 3, bgcolor: '#fff' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#169385' }}>
            Thông Tin Cử Tri
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Họ và tên" secondary={voter.fullName} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="CCCD" secondary={voter.cccd} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Địa chỉ" secondary={voter.address} />
                </ListItem>
                {voter.birthDate && (
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Ngày sinh" secondary={formatDate(voter.birthDate)} />
                  </ListItem>
                )}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#e3f2fd',
                  color: '#169385',
                  p: 3,
                  borderRadius: 3
                }}
              >
                <HowToVoteIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                  Cuộc bầu cử đang diễn ra
                </Typography>
                <Typography variant="h3" align="center" sx={{ fontWeight: 700 }}>
                  {getActiveElections().length}
                </Typography>
                {getActiveElections().length > 0 && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/elections')}
                    sx={{ mt: 2, borderRadius: 3, fontWeight: 700 }}
                  >
                    Xem danh sách bầu cử
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 4, mb: 4, borderRadius: 5, boxShadow: 3, bgcolor: '#fff' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#169385' }}>
          Cuộc Bầu Cử Đang Diễn Ra
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {getActiveElections().length === 0 ? (
          <Alert severity="info">
            Hiện tại không có cuộc bầu cử nào đang diễn ra
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {getActiveElections().map((election) => (
              <Grid item xs={12} sm={6} md={4} key={election.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 5, boxShadow: 3, bgcolor: '#f5faff', overflow: 'hidden', position: 'relative' }}>
                  {/* Ảnh logo 16:9 với overlay thông tin ở góc dưới */}
                  <Box sx={{ width: '100%', position: 'relative', pt: '56.25%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={election.logoUrl || 'https://i.imgur.com/D2lDXPB.jpg'}
                      alt={election.title}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      bgcolor: 'rgba(25, 118, 210, 0.85)',
                      color: '#fff',
                      borderBottomLeftRadius: 20,
                      borderBottomRightRadius: 20,
                      px: 2,
                      py: 1.2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={getStatusText('active')}
                          color={getStatusColor('active')}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: 13, px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', boxShadow: 0, mr: 1 }}
                        />
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 500 }}>
                          {formatDate(election.startTime)} - {formatDate(election.endTime)}
                        </Typography>
                      </Box>
                      {hasVoted(election.id) && (
                        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, color: '#4caf50' }} />
                          Đã bỏ phiếu
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, bgcolor: 'transparent', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                      {election.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {election.description}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Kết thúc vào: {formatDate(election.endTime)}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    {hasVoted(election.id) ? (
                      <Box display="flex" alignItems="center" mt={1}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          Bạn đã bỏ phiếu
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 1, borderRadius: 3, fontWeight: 700 }}
                        onClick={() => navigate(`/elections/${election.id}`)}
                      >
                        Bỏ phiếu ngay
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 5, boxShadow: 3, bgcolor: '#fff' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#169385' }}>
          Lịch Sử Bỏ Phiếu
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {votedElections.length === 0 ? (
          <Alert severity="info">
            Bạn chưa tham gia bỏ phiếu trong cuộc bầu cử nào
          </Alert>
        ) : (
          <List>
            {votedElections.map((electionId) => {
              const election = elections.find(e => e.id === electionId);
              return election ? (
                <React.Fragment key={electionId}>
                  <ListItem>
                    <ListItemIcon>
                      <HowToVoteIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={<span style={{ fontWeight: 600 }}>{election.title}</span>}
                      secondary={`Đã bỏ phiếu vào ngày ${formatDate(new Date())}`}
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                      onClick={() => navigate(`/elections/${election.id}`)}
                    >
                      Chi tiết
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ) : null;
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard; 
