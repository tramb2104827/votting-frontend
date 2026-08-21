import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import web3Service from '../services/web3Service';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { formatDate } from '../utils/helpers';

function ElectionDetail() {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openViewCandidateDialog, setOpenViewCandidateDialog] = useState(false);

  useEffect(() => {
    const initializeAndLoadData = async () => {
      try {
        // Khởi tạo Web3
        await web3Service.initWeb3();
        
        // Lấy địa chỉ ví hiện tại
        const currentAccount = web3Service.getCurrentAccount();
        
        // Lấy thông tin cuộc bầu cử
        const electionData = await web3Service.getElectionById(id);
        setElection(electionData);
        
        // Kiểm tra xem đã bầu chưa
        if (currentAccount) {
          const voted = await web3Service.hasVoted(id, currentAccount);
          setHasVoted(voted);
        }

        // Lấy danh sách ứng cử viên
        const candidatesData = await web3Service.getCandidatesByElection(id);
        setCandidates(candidatesData);
      } catch (error) {
        console.error('Error initializing:', error);
        setError('Không thể kết nối với blockchain');
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoadData();
  }, [id]);

  const handleVote = async () => {
    if (!selectedCandidateId) {
      setError('Vui lòng chọn một ứng cử viên');
      return;
    }

    try {
      setLoading(true);
      const currentAccount = web3Service.getCurrentAccount();
      
      // Tạo hash từ thông tin bầu cử
      const voteHash = web3Service.createVoteHash(
        id,
        selectedCandidateId,
        currentAccount
      );

      // Gửi phiếu bầu lên blockchain
      await web3Service.submitVote(id, voteHash);
      
      setHasVoted(true);
      setError(null);
      
    } catch (error) {
      console.error('Error voting:', error);
      setError('Không thể gửi phiếu bầu');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xem chi tiết ứng cử viên
  const handleViewCandidate = (candidate) => {
    // Mở dialog xem chi tiết ứng cử viên
    setSelectedCandidate(candidate);
    setOpenViewCandidateDialog(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!election) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Không tìm thấy thông tin cuộc bầu cử
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {election.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {election.description}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Thời gian: {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}
        </Typography>
      </Paper>

      {!hasVoted && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Danh sách ứng cử viên
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : candidates.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ảnh</TableCell>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Ngày sinh</TableCell>
                    <TableCell>Quê quán</TableCell>
                    <TableCell>Chức vụ</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <Box
                          component="img"
                          src={candidate.imageUrl || 'https://via.placeholder.com/80x80?text=?'}
                          alt={candidate.name}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '8px',
                            objectFit: 'cover',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ color: '#009688', fontWeight: 500 }}>
                          {candidate.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(candidate.birthDate)}</TableCell>
                      <TableCell>{candidate.hometown || 'Chưa cập nhật'}</TableCell>
                      <TableCell>{candidate.position || 'Chưa cập nhật'}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewCandidate(candidate)}
                          sx={{
                            color: '#009688',
                            borderColor: '#009688',
                            '&:hover': {
                              borderColor: '#00796b',
                              backgroundColor: 'rgba(0, 150, 136, 0.04)'
                            }
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              Chưa có ứng cử viên nào trong cuộc bầu cử này.
            </Alert>
          )}
        </Paper>
      )}

      {hasVoted && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Bạn đã bỏ phiếu thành công!
        </Alert>
      )}
    </Box>
  );
}

export default ElectionDetail;