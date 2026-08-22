import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Paper, 
  Button, CircularProgress, Divider, Alert,
  List, ListItem, ListItemText, ListItemAvatar, 
  Avatar, Card, CardContent, CardHeader, 
  IconButton, Stack, Chip, Tooltip
} from '@mui/material';
import { 
  BarChart, PieChart
} from '@mui/x-charts';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/helpers';
import { getElectionStatus, getStatusColor, getStatusText } from '../utils/electionHelpers';
import { calculateElectionResults } from '../utils/electionResults';
import { 
  ArrowBack as ArrowBackIcon, 
  Person as PersonIcon, 
  EmojiEvents as EmojiEventsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

function ElectionResultsReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const electionId = id || localStorage.getItem('selectedElectionId');
        if (!electionId) {
          throw new Error('Không tìm thấy ID cuộc bầu cử');
        }
        // Fetch kết quả từ backend
        const res = await axios.get(`https://votting-backend-a9d7.onrender.com/api/elections/${electionId}/results`);
        setResults(res.data);
      } catch (error) {
        console.error('Error loading election results:', error);
        setError('Không thể tải kết quả bầu cử. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    window.print();
  };

  const renderCharts = () => {
    // Fix triệt để lỗi .length trên undefined
    if (!results || !Array.isArray(results.votesByCandidate) || results.votesByCandidate.length === 0 || (results.totalVotes ?? 0) === 0) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          Không có dữ liệu phiếu bầu để hiển thị biểu đồ.
        </Alert>
      );
    }
    //biểu đồ
    const barChartData = {
      data: results.votesByCandidate.map(item => item.votes),
      labels: results.votesByCandidate.map(item => item.candidate.name)
    };

    const pieChartData = [
      {
        id: 'voted',
        value: results.totalVotedVoters,
        label: `Đã bỏ phiếu (${typeof results.participationRate === 'number' ? results.participationRate.toFixed(1) : '0.0'}%)`,
        color: '#2196f3'
      },
      {
        id: 'not_voted',
        value: results.totalVoters - results.totalVotedVoters,
        label: `Chưa bỏ phiếu (${typeof results.participationRate === 'number' ? (100 - results.participationRate).toFixed(1) : '0.0'}%)`,
        color: '#e0e0e0'
      }
    ];

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ phiếu bầu theo ứng cử viên
            </Typography>
            <Box sx={{ height: 300, width: '100%', mt: 2 }}>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: barChartData.labels,
                  tickLabelStyle: {
                     angle: -30,
                     textAnchor: 'end',
                     fontSize: 10
                  }
                }]}
                series={[{
                  data: barChartData.data,
                  color: '#2196f3',
                }]}
                height={300}
                margin={{ top: 20, bottom: 70, left: 40, right: 10 }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Tỷ lệ tham gia bỏ phiếu
            </Typography>
            <Box sx={{ height: 300, width: '100%', mt: 2 }}>
              <PieChart
                series={[{
                  data: pieChartData,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  innerRadius: 40,
                  outerRadius: 100,
                  paddingAngle: 1,
                  cornerRadius: 3,
                  cx: 120,
                }]}
                height={300}
                margin={{ top: 10, bottom: 10, left: 10, right: 100 }}
                slotProps={{
                  legend: {
                    direction: 'column',
                    position: { vertical: 'middle', horizontal: 'right' },
                    padding: 0,
                    itemMarkWidth: 10,
                    itemMarkHeight: 10,
                    labelStyle: {
                       fontSize: 12,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/dashboard')}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  if (!results) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 3 }}>
          Không tìm thấy kết quả bầu cử
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/dashboard')}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, fontFamily: 'Roboto, Arial, sans-serif', bgcolor: 'transparent' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ borderRadius: 3, fontWeight: 700 }}
        >
          Quay lại
        </Button>
        <Stack direction="row" spacing={2}>
          {/* Đã xóa nút tải xuống báo cáo (CSV) */}
          <Tooltip title="In báo cáo">
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ borderRadius: 3, fontWeight: 700 }}
            >
              In
            </Button>
          </Tooltip>
        </Stack>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#169385' }}>
          Kết quả bầu cử 
        </Typography>
        {results.election && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Typography variant="h6" color="text.primary" sx={{ mr: 1, fontWeight: 700 }}>
              {results.election.title}
            </Typography>
            <Chip
              label={getStatusText(getElectionStatus(results.election))}
              color={getStatusColor(getElectionStatus(results.election))}
              size="small"
              sx={{ fontWeight: 600, fontSize: 15, px: 2, py: 0.5, borderRadius: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              ({formatDate(results.election.startTime)} - {formatDate(results.election.endTime)})
            </Typography>
          </Box>
        )}
        <Divider />
      </Box>
      {results.election && results.election.logoUrl && (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            component="img"
            src={results.election.logoUrl}
            alt={results.election.title}
            sx={{
              width: '100%',
              maxWidth: 600,
              height: 'auto',
              borderRadius: 4,
              boxShadow: 3,
              objectFit: 'cover',
              background: '#f5f5f5',
            }}
          />
        </Box>
      )}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.isArray(results.votesByCandidate) && results.votesByCandidate.length > 0 && results.totalVotedVoters > 0 ? (
          results.votesByCandidate
            .slice()
            .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
            .map((item, index) => (
              <Grid item xs={12} key={item.candidate._id}>
                <Card sx={{ display: 'flex', alignItems: 'center', p: 3, borderRadius: 4, boxShadow: 3, bgcolor: '#fff', mb: 2 }}>
                  <Box
                    component="img"
                    src={item.candidate.imageUrl || 'https://via.placeholder.com/240x320?text=No+Image'}
                    alt={item.candidate.name}
                    sx={{
                      width: 180,
                      height: 240,
                      objectFit: 'cover',
                      borderRadius: 3,
                      boxShadow: 2,
                      mr: 4,
                      background: '#f5f5f5',
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                      {item.candidate.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {item.candidate.position || 'Không có chức vụ'}
                    </Typography>
                    {/* Thanh progress bar kết quả */}
                    <Box sx={{ width: '100%', mb: 2, mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#169385', minWidth: 80 }}>
                          {item.votes}/{results.totalVotedVoters} phiếu
                        </Typography>
                        <Box sx={{ flex: 1, mx: 2 }}>
                          <Box sx={{ width: '100%', height: 18, bgcolor: 'grey.200', borderRadius: 9, overflow: 'hidden', position: 'relative' }}>
                            <Box sx={{
                              width: `${item.percentage}%`,
                              height: '100%',
                              bgcolor: item.percentage >= 50 ? 'primary.main' : '#4fc3f7',
                              borderRadius: 9,
                              transition: 'width 0.5s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              pr: 2,
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 15
                            }}>
                              {item.percentage.toFixed(1)}%
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.candidate.achievements && (<><b>Thành tích:</b> {item.candidate.achievements}<br /></>)}
                      {item.candidate.motto && (<><b>Châm ngôn:</b> {item.candidate.motto}</>)}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info" variant="outlined">Không có dữ liệu phiếu bầu chi tiết.</Alert>
          </Grid>
        )}
      </Grid>
      {results && Array.isArray(results.votesByCandidate) && results.votesByCandidate.length > 0 && results.totalVotedVoters > 0 && renderCharts()}
    </Container>
  );
}

export default ElectionResultsReport;
