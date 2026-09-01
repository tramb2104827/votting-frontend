import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/helpers';
import { getElectionStatus, getStatusColor, getStatusText, getRemainingTime } from '../utils/electionHelpers';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from 'axios';
import { sanitizeImageUrl } from '../utils/imageFallback';
const defaultElectionImage = sanitizeImageUrl('', 'election');

function ElectionList() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [openCandidatesDialog, setOpenCandidatesDialog] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    loadElections();
    loadCandidates();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://votting-backend-a9d7.onrender.com/api/elections');
      setElections(res.data);
    } catch (error) {
      console.error('Error loading elections:', error);
      setElections([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    try {
      const res = await axios.get('https://votting-backend-a9d7.onrender.com/api/candidates');
      setCandidates(res.data);
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
    }
  };

  const getElectionCandidates = (electionId) => {
    return candidates.filter(candidate => candidate.electionId === electionId || candidate.electionId === String(electionId));
  };

  const handleViewCandidates = (election) => {
    setSelectedElection(election);
    setOpenCandidatesDialog(true);
  };

  const handleVote = (election) => {
    navigate(`/elections/${election._id || election.id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Lọc danh sách theo tab
  const filteredElections = elections.filter(election => {
    const status = getElectionStatus(election);
    if (tab === 0) return true;
    if (tab === 1) return status === 'active';
    if (tab === 2) return status === 'completed';
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4,marginTop: 10, mb: 4, fontFamily: 'Roboto, Arial, sans-serif', bgcolor: 'transparent', borderRadius: 4, boxShadow: 0 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#169385', mb: 3 }}>
        Danh sách cuộc bầu cử
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        centered
        sx={{
          bgcolor: '#f5faff',
          borderRadius: 3,
          minHeight: 48,
          px: 2,
          '.MuiTab-root': {
            fontWeight: 600,
            fontSize: 18,
            borderRadius: 2,
            minHeight: 44,
            color: '#333', // màu chữ mặc định
            transition: 'color 0.3s'
          },
          '.Mui-selected': {
            color: '#169385 !important', // chỉ đổi màu chữ khi được chọn
          },
          boxShadow: 2
        }}
        TabIndicatorProps={{ style: { height: 0 } }}
      >
        <Tab label="Tất cả" />
        <Tab label="diễn ra" />
        <Tab label="kết thúc" />
      </Tabs>
    </Box>  

      <Divider sx={{ mb: 4 }} />
      {filteredElections.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#fff', borderRadius: 3, boxShadow: 1 }}>
          <Typography variant="h6" sx={{ color: '#169385', fontWeight: 700 }}>Không có cuộc bầu cử nào</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Vui lòng chọn danh mục khác hoặc quay lại sau
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {filteredElections.map((election) => {
            const status = getElectionStatus(election);
            const isActive = status === 'active';
            const electionCandidates = getElectionCandidates(election._id || election.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={election._id || election.id}>
                <Card 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    borderRadius: 5,
                    boxShadow: 3,
                    bgcolor: '#fff',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8,
                    }
                  }}
                >
                  <Box sx={{ width: '100%', position: 'relative', pt: '56.25%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={sanitizeImageUrl(election.logoUrl || defaultElectionImage, 'election')}
                      alt={election.title}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                    />
                  </Box>
                  <Box sx={{ px: 2, pt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Chip
                      label={getStatusText(status)}
                      color={getStatusColor(status)}
                      sx={{ fontWeight: 'bold', fontSize: 16, px: 2, py: 1, borderRadius: 2, bgcolor: '#f5faff', color: '#169385', boxShadow: 1 }}
                    />
                    {isActive && (
                      <Box sx={{ color: 'success.main', fontWeight: 'bold', fontSize: 16 }}>
                        {getRemainingTime(election.endTime)}
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, bgcolor: 'transparent', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 700, color: '#222' }}>
                      {election.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 48 }}>
                      {election.description}
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                            <EventIcon fontSize="medium" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<span style={{ fontWeight: 600, color: '#169385' }}>Thời gian bắt đầu</span>} 
                          secondary={formatDate(election.startTime)} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.light', width: 40, height: 40 }}>
                            <AccessTimeIcon fontSize="medium" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<span style={{ fontWeight: 600, color: '#169385' }}>Thời gian kết thúc</span>} 
                          secondary={formatDate(election.endTime)} 
                        />
                      </ListItem>
                      <ListItem>
                        {/* <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.light', width: 40, height: 40 }}>
                            <PeopleIcon fontSize="medium" />
                          </Avatar>
                        </ListItemAvatar> */}
                        {/* <ListItemText 
                          primary={<span style={{ fontWeight: 600, color: '#169385' }}>Số lượng ứng cử viên</span>}
                          secondary={electionCandidates.length} 
                        /> */}
                      </ListItem>
                    </List>
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#f5faff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={() => handleVote(election)}
                        fullWidth
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      >
                        {isActive ? 'Bỏ phiếu ngay' : 'Chi tiết'}
                      </Button>
                      {status === 'completed' && (
                        <Button
                          variant="contained"
                          color="secondary"
                          size="medium"
                          fullWidth
                          startIcon={<HowToVoteIcon />}
                          onClick={() => {
                            navigate(`/elections/${election._id || election.id}`);
                            localStorage.setItem('showResults_' + (election._id || election.id), 'true');
                          }}
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                          XEM KẾT QUẢ
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      {/* Dialog hiển thị danh sách ứng cử viên */}
      <Dialog 
        open={openCandidatesDialog} 
        onClose={() => setOpenCandidatesDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fff' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#169385', fontSize: 24 }}>
          {selectedElection && `Ứng cử viên - ${selectedElection.title}`}
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f5faff' }}>
          {selectedElection && getElectionCandidates(selectedElection._id || selectedElection.id).length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
              Chưa có ứng cử viên nào cho cuộc bầu cử này
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {selectedElection && getElectionCandidates(selectedElection._id || selectedElection.id).map((candidate) => (
                <Grid item xs={12} sm={6} md={4} key={candidate._id || candidate.id}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: '#fff' }}>
                    <CardContent>
                      {candidate.imageUrl && (
                        <Box sx={{ width: '100%', position: 'relative', pt: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={candidate.imageUrl}
                            alt={candidate.name}
                            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }}
                          />
                        </Box>
                      )}
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#169385' }}>{candidate.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {candidate.position}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        <strong>Năm sinh:</strong> {candidate.birthDate ? new Date(candidate.birthDate).getFullYear() : 'Không có thông tin'}
                      </Typography>
                      {candidate.hometown && (
                        <Typography variant="body2">
                          <strong>Quê quán:</strong> {candidate.hometown}
                        </Typography>
                      )}
                      {candidate.motto && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                          "{candidate.motto}"
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#f5faff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <Button onClick={() => setOpenCandidatesDialog(false)} sx={{ fontWeight: 600, borderRadius: 2 }}>Đóng</Button>
          {selectedElection && getElectionStatus(selectedElection) === 'active' && (
            <Button 
              variant="contained" 
              onClick={() => {
                setOpenCandidatesDialog(false);
                handleVote(selectedElection);
              }}
              startIcon={<HowToVoteIcon />}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Bầu cử ngay
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ElectionList; 
