import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormHelperText,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  ListItemAvatar,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Snackbar,
  ButtonGroup,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LoadingButton } from '@mui/lab';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageUpload from '../components/ImageUpload';
import ElectionResultsReport from './ElectionResultsReport';
import { formatDate } from '../utils/helpers';
import { getElectionStatus, getStatusColor, getStatusText } from '../utils/electionHelpers';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import * as XLSX from 'xlsx';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import { sanitizeImageUrl } from '../utils/imageFallback';
import 'chart.js/auto';
import { format, getISOWeek, getYear } from 'date-fns';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Theme kết hợp: sidebar đen, nội dung trắng
const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#169385',
      contrastText: '#fff',
    },
    background: {
      default: '#f9fafe',
      paper: '#fff',
      sidebar: '#f5f7fa',
    },
    text: {
      primary: '#222',
      secondary: '#555',
      sidebar: '#169385',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: { fontWeight: 700, fontSize: 36, letterSpacing: 1, color: '#169385' },
    h5: { fontWeight: 600, fontSize: 24, color: '#169385' },
    body1: { fontSize: 18, color: '#222' },
    button: { fontWeight: 600, fontSize: 16 },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 4px 24px 0 rgba(33,150,243,0.08)',
          backgroundColor: '#fff',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 2px 12px 0 rgba(33, 150, 243, 0.04)',
          backgroundColor: '#fff',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 22,
          backgroundColor: '#fff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 16,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 56,
          fontWeight: 600,
          fontSize: 18,
          borderRadius: 12,
          marginBottom: 8,
          transition: 'background 0.2s, color 0.2s',
          color: '#169385',
          background: '#f5f7fa',
          '&.Mui-selected': {
            background: '#fff',
            color: '#169385',
            boxShadow: '0 2px 8px 0 rgba(33,150,243,0.08)',
          },
          '&:hover': {
            background: '#e3eafc',
            color: '#169385',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: 16,
          padding: '16px 12px',
          borderBottom: '1px solid #f0f0f0',
        },
        head: {
          fontWeight: 700,
          color: '#169385',
          background: '#f5f7fa',
          fontSize: 17,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 0.2s',
          '&:hover': {
            background: '#f0f6ff',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 56,
          height: 56,
          fontSize: 22,
        },
      },
    },
  },
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [openElectionDialog, setOpenElectionDialog] = useState(false);
  const [openCandidateDialog, setOpenCandidateDialog] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [electionFormData, setElectionFormData] = useState({
    title: '',
    description: '',
    startTime: null,
    endTime: null,
    logoUrl: '',
  });
  const [candidateFormData, setCandidateFormData] = useState({
    name: '',
    birthDate: null,
    hometown: '',
    position: '',
    achievements: '',
    motto: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openEditCandidateDialog, setOpenEditCandidateDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [openAddAdminDialog, setOpenAddAdminDialog] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    cccd: '',
    email: '',
    password: '',
    isSuperAdmin: false
  });
  const [selectedElectionIdForResult, setSelectedElectionIdForResult] = useState(null);
  const [showElectionResults, setShowElectionResults] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' mặc định
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedElectionForCandidates, setSelectedElectionForCandidates] = useState(null);
  const [openViewCandidateDialog, setOpenViewCandidateDialog] = useState(false);
  // 1. State cho sửa election
  const [openEditElectionDialog, setOpenEditElectionDialog] = useState(false);
  const [editElectionData, setEditElectionData] = useState(null);
  const [votes, setVotes] = useState([]);
  const [chartMode, setChartMode] = useState('day'); // 'day' | 'week' | 'month'
  const [allCandidates, setAllCandidates] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  // State lưu toàn bộ phiếu bầu
  const [allVotes, setAllVotes] = useState([]);
  // Thêm state riêng cho form sửa election
  const [editElectionFormData, setEditElectionFormData] = useState({ title: '', description: '', startTime: null, endTime: null, logoUrl: '' });

  const initialCandidateFormData = {
    name: '',
    birthDate: null,
    hometown: '',
    position: '',
    achievements: '',
    motto: '',
    imageUrl: '',
    electionId: ''
  };

  const [openAddCandidateDialog, setOpenAddCandidateDialog] = useState(false);
  // State cho import excel
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [importedCandidates, setImportedCandidates] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  
  // State cho dialog xem chi tiết cuộc bầu cử của cử tri
  const [openVoterElectionsDialog, setOpenVoterElectionsDialog] = useState(false);
  const [selectedVoterElections, setSelectedVoterElections] = useState([]);
  const [selectedVoterName, setSelectedVoterName] = useState('');

  // Kiểm tra đăng nhập admin
  useEffect(() => {
    const checkAdminLogin = () => {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const adminCCCD = localStorage.getItem('adminCCCD');
      
      console.log("Admin status check:", { isAdmin, adminCCCD });
      
      if (!isAdmin || !adminCCCD) {
        console.log("Not authenticated as admin, redirecting...");
        navigate('/admin');
        return;
      }
      
      console.log("Admin authenticated successfully");
      
      // Tải danh sách admin
      loadAdmins();
    };
    
    checkAdminLogin();
  }, [navigate]);

  // Load data khi component mount
  useEffect(() => {
    loadElections();
    loadCandidates();
    loadAllCandidates();
    loadVoters();
    loadVotes();
  }, []);

  // Sửa useEffect cập nhật filteredCandidates:
  useEffect(() => {
    if (viewMode === 'candidates' && selectedElectionForCandidates) {
      filterCandidatesByElection(selectedElectionForCandidates);
    }
  }, [viewMode, selectedElectionForCandidates]);

  // Hiển thị thông báo
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 1. Tối ưu loadElections, loadCandidates, loadVoters: loading rõ ràng, luôn cập nhật state mới nhất
  const loadElections = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://votting-backend-a9d7.onrender.com/api/elections');
      setElections(res.data);
    } catch (error) {
      showSnackbar('Không thể tải danh sách bầu cử', 'error');
      setElections([]);
    } finally {
      setLoading(false);
    }
  };
  const loadCandidates = async (electionId) => {
    try {
      setLoading(true);
      let url = 'https://votting-backend-a9d7.onrender.com/api/candidates';
      if (electionId) url += `?electionId=${electionId}`;
      const res = await axios.get(url);
      setCandidates(res.data);
      if (electionId) setFilteredCandidates(res.data);
    } catch (error) {
      showSnackbar('Không thể tải danh sách ứng cử viên', 'error');
      setCandidates([]);
      setFilteredCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Đảm bảo hàm loadVoters vẫn tồn tại:
  const loadVoters = async () => {
    try {
      setLoading(true);
      const jwt = localStorage.getItem('jwt');
      const res = await axios.get('https://votting-backend-a9d7.onrender.com/api/voters', {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setVoters(res.data);
    } catch (error) {
      showSnackbar('Không thể tải danh sách cử tri', 'error');
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật danh sách cử tri mỗi khi tab thay đổi sang tab Danh sách cử tri
  useEffect(() => {
    if (activeTab === 2) {
      loadVoters();
    }
  }, [activeTab]);

  // Thêm mới cuộc bầu cử
  const handleCreateElection = async () => {
    try {
      setCreating(true);
      const { title, description, startTime, endTime, logoUrl } = electionFormData;
      if (!title) {
        showSnackbar('Vui lòng nhập tiêu đề cuộc bầu cử', 'error');
        setCreating(false);
        return;
      }
      if (!startTime || !endTime) {
        showSnackbar('Vui lòng chọn thời gian bắt đầu và kết thúc', 'error');
        setCreating(false);
        return;
      }
      if (startTime >= endTime) {
        showSnackbar('Thời gian kết thúc phải sau thời gian bắt đầu', 'error');
        setCreating(false);
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.post('https://votting-backend-a9d7.onrender.com/api/elections', {
        title,
        description,
        startTime,
        endTime,
        logoUrl
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setElectionFormData({
        title: '',
        description: '',
        startTime: null,
        endTime: null,
        logoUrl: '',
      });
      setOpenElectionDialog(false);
      await loadElections(); // Luôn gọi lại loadElections để đồng bộ dữ liệu mới nhất
      showSnackbar('Đã tạo cuộc bầu cử mới', 'success');
    } catch (error) {
      console.error('Error creating election:', error);
      showSnackbar('Có lỗi xảy ra khi tạo cuộc bầu cử', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Sửa cuộc bầu cử (nếu có chức năng chỉnh sửa, thêm hàm tương tự dùng axios.put)

  // Xóa cuộc bầu cử
  const handleDeleteElection = async (id) => {
    try {
      const idStr = String(id);
      const electionToDelete = elections.find(election => String(election._id || election.id) === idStr);
      if (!electionToDelete) {
        showSnackbar('Không tìm thấy cuộc bầu cử', 'error');
        return;
      }
      if (!window.confirm(`Bạn có chắc chắn muốn xóa cuộc bầu cử "${electionToDelete.title}"? Tất cả dữ liệu liên quan sẽ bị xóa và không thể khôi phục.`)) {
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.delete(`https://votting-backend-a9d7.onrender.com/api/elections/${idStr}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      await loadElections(); // Luôn gọi lại API để cập nhật state
      showSnackbar(`Đã xóa cuộc bầu cử "${electionToDelete.title}" và tất cả dữ liệu liên quan`, 'success');
    } catch (error) {
      const msg = error.response?.data?.error || 'Đã xảy ra lỗi khi xóa cuộc bầu cử';
      showSnackbar(msg, 'error');
      console.error('Lỗi khi xóa cuộc bầu cử:', error);
    }
  };

  // Thêm mới ứng cử viên
  const handleSaveCandidate = async () => {
    try {
      setCreating(true);
      if (!selectedElection) {
        showSnackbar('Vui lòng chọn cuộc bầu cử', 'error');
        setCreating(false);
        return;
      }
      const { name, birthDate, hometown, position, achievements, motto, imageUrl } = candidateFormData;
      if (!name) {
        showSnackbar('Vui lòng nhập tên ứng cử viên', 'error');
        setCreating(false);
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.post('https://votting-backend-a9d7.onrender.com/api/candidates', {
        name,
        birthDate: birthDate ? birthDate.toISOString() : null,
        hometown,
        position,
        achievements,
        motto,
        imageUrl: imageUrl || '',
        electionId: selectedElection
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setCandidateFormData({
        name: '',
        birthDate: null,
        hometown: '',
        position: '',
        achievements: '',
        motto: '',
        imageUrl: '',
      });
      setOpenCandidateDialog(false);
      await loadCandidates(selectedElection);
      await loadAllCandidates(); // cập nhật tổng số ứng viên
      showSnackbar('Đã thêm ứng cử viên mới', 'success');
    } catch (error) {
      console.error('Error saving candidate:', error, error?.response?.data);
    } finally {
      setCreating(false);
    }
  };

  // Sửa ứng cử viên
  const handleUpdateCandidate = async () => {
    try {
      setCreating(true);
      if (!selectedCandidate) {
        showSnackbar('Không tìm thấy ứng cử viên để cập nhật', 'error');
        setCreating(false);
        return;
      }
      const { name, birthDate, hometown, position, achievements, motto, imageUrl } = candidateFormData;
      if (!name) {
        showSnackbar('Vui lòng nhập tên ứng cử viên', 'error');
        setCreating(false);
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.put(`https://votting-backend-a9d7.onrender.com/api/candidates/${selectedCandidate._id || selectedCandidate.id}`, {
        name,
        birthDate: birthDate ? (typeof birthDate === 'string' ? birthDate : birthDate.toISOString()) : null,
        hometown,
        position,
        achievements,
        motto,
        imageUrl: imageUrl || '',
        electionId: selectedCandidate.electionId
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setCandidateFormData({
        name: '',
        birthDate: null,
        hometown: '',
        position: '',
        achievements: '',
        motto: '',
        imageUrl: '',
      });
      setOpenEditCandidateDialog(false);
      setSelectedCandidate(null);
      await loadCandidates(selectedElection);
      await loadAllCandidates(); // cập nhật tổng số ứng viên
      showSnackbar('Đã cập nhật ứng cử viên thành công', 'success');
    } catch (error) {
      console.error('Error updating candidate:', error);
    } finally {
      setCreating(false);
    }
  };

  // Xóa ứng cử viên
  const handleDeleteCandidate = async (id) => {
    try {
      const candidateId = String(id);
      const candidateToDelete = candidates.find(c => String(c._id || c.id) === candidateId);
      if (!candidateToDelete) {
        showSnackbar('Không tìm thấy ứng cử viên', 'error');
        return;
      }
      if (!window.confirm(`Bạn có chắc chắn muốn xóa ứng cử viên "${candidateToDelete.name}"?`)) {
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.delete(`https://votting-backend-a9d7.onrender.com/api/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      await loadCandidates(selectedElection); // Luôn gọi lại API để cập nhật state
      await loadAllCandidates();
      showSnackbar(`Đã xóa ứng cử viên "${candidateToDelete.name}" thành công`, 'success');
    } catch (error) {
      const msg = error.response?.data?.error || 'Đã xảy ra lỗi khi xóa ứng cử viên';
      showSnackbar(msg, 'error');
      console.error('Lỗi khi xóa ứng cử viên:', error);
    }
  };

  // Xóa cử tri
  const handleDeleteVoter = async (cccd) => {
    try {
      const voterToDelete = voters.find(v => String(v.cccd) === String(cccd));
      if (!voterToDelete) {
        showSnackbar('Không tìm thấy cử tri', 'error');
        return;
      }
      if (!window.confirm(`Bạn có chắc chắn muốn xóa cử tri "${voterToDelete.fullName}" (CCCD: ${voterToDelete.cccd})?`)) {
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.delete(`https://votting-backend-a9d7.onrender.com/api/voters/${cccd}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      await loadVoters();
      showSnackbar(`Đã xóa cử tri "${voterToDelete.fullName}" thành công`, 'success');
    } catch (error) {
      const msg = error.response?.data?.error || 'Đã xảy ra lỗi khi xóa cử tri';
      showSnackbar(msg, 'error');
      console.error('Lỗi khi xóa cử tri:', error);
    }
  };

  // Thêm chức năng xóa cử tri
  const handleToggleVoterActive = async (cccd, currentActive) => {
    try {
      const voterToUpdate = voters.find(voter => String(voter.cccd) === String(cccd));
      if (!voterToUpdate) {
        showSnackbar('Không tìm thấy cử tri', 'error');
        return;
      }
      const action = currentActive ? 'khóa' : 'mở khóa';
      if (!window.confirm(`Bạn có chắc chắn muốn ${action} cử tri "${voterToUpdate.fullName}" (CCCD: ${voterToUpdate.cccd})?`)) {
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.patch(`https://votting-backend-a9d7.onrender.com/api/voters/${String(cccd)}/lock`, {
        isActive: !currentActive
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setVoters(prev => prev.map(voter =>
        String(voter.cccd) === String(cccd) ? { ...voter, isActive: !currentActive } : voter
      ));
      showSnackbar(`Đã ${action} cử tri "${voterToUpdate.fullName}" thành công`, 'success');
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái cử tri:', error);
      showSnackbar('Đã xảy ra lỗi khi cập nhật trạng thái cử tri', 'error');
    }
  };

  // Dialog tạo cuộc bầu cử mới
  const NewElectionDialog = ({ open, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
    const [logoUrl, setLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogoChange = (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
          setError('Kích thước file không được vượt quá 5MB');
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target.result);
          setLogoUrl(e.target.result);
        };
        reader.readAsDataURL(file);
        setLogoFile(file);
      }
    };

    const handleSave = async () => {
      if (!title) {
        setError('Vui lòng nhập tiêu đề cuộc bầu cử');
        return;
      }
      if (!startTime || !endTime) {
        setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
        return;
      }
      if (startTime >= endTime) {
        setError('Thời gian kết thúc phải sau thời gian bắt đầu');
        return;
      }
      setLoading(true);
      try {
        const jwt = localStorage.getItem('jwt');
        await axios.post('https://votting-backend-a9d7.onrender.com/api/elections', {
          title,
          description,
          startTime,
          endTime,
          logoUrl
        }, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        setTitle('');
        setDescription('');
        setStartTime(new Date());
        setEndTime(new Date(new Date().setDate(new Date().getDate() + 7)));
        setLogoUrl('');
        setLogoFile(null);
        setLogoPreview('');
        setError('');
        setLoading(false);
        onClose();
        await loadElections();
        showSnackbar('Đã tạo cuộc bầu cử mới', 'success');
      } catch (error) {
        setError('Có lỗi xảy ra khi tạo cuộc bầu cử');
        setLoading(false);
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
        <DialogTitle>Tạo cuộc bầu cử mới</DialogTitle>
        <DialogContent dividers sx={{ pb: 2, overflowY: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Tiêu đề cuộc bầu cử"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
              
              <TextField
                label="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
              
              <Box sx={{ mt: 2, mb: 3 }}>
                <DateTimePicker
                  label="Thời gian bắt đầu"
                  value={startTime}
                  onChange={setStartTime}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                  ampm={false}
                  format="dd/MM/yyyy HH:mm"
                />
                
                <DateTimePicker
                  label="Thời gian kết thúc"
                  value={endTime}
                  onChange={setEndTime}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                  ampm={false}
                  format="dd/MM/yyyy HH:mm"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2, mt: 2, mb: 2, textAlign: 'center' }}>
                {logoPreview ? (
                  <Box sx={{ mb: 2 }}>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ py: 6 }}>
                    <Typography color="textSecondary">Logo cuộc bầu cử</Typography>
                  </Box>
                )}
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Tải lên logo
                  <input
                    type="file"
                    hidden
                    onChange={handleLogoChange}
                    accept="image/*"
                  />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Chấp nhận file: JPG, PNG. Tối đa 5MB
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <LoadingButton
            loading={loading}
            onClick={handleSave}
            variant="contained"
          >
            Tạo cuộc bầu cử
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };

  // Tạo hàm xử lý chỉnh sửa ứng cử viên khi click vào nút sửa
  const handleEditCandidate = (candidate) => {
    console.log('Edit candidate called with:', candidate);
    
    try {
      if (!candidate || (!candidate.id && !candidate._id)) {
        console.error('Invalid candidate data:', candidate);
        showSnackbar('Dữ liệu ứng cử viên không hợp lệ', 'error');
        return;
      }
      
      // Convert candidate data to ensure all fields are present
      const candidateData = {
        id: String(candidate.id || candidate._id),
        name: candidate.name || '',
        birthDate: candidate.birthDate ? new Date(candidate.birthDate) : null,
        hometown: candidate.hometown || '',
        position: candidate.position || '',
        achievements: candidate.achievements || '',
        motto: candidate.motto || '',
        imageUrl: candidate.imageUrl || '',
        electionId: candidate.electionId ? String(candidate.electionId) : ''
      };
      
      console.log('Prepared candidate data for editing:', candidateData);
      
      // Save the candidate to be edited to state
      setSelectedCandidate(candidateData);
      
      // Set the form data
      setCandidateFormData({
        name: candidateData.name,
        birthDate: candidateData.birthDate,
        hometown: candidateData.hometown,
        position: candidateData.position,
        achievements: candidateData.achievements,
        motto: candidateData.motto,
        imageUrl: candidateData.imageUrl,
        electionId: candidateData.electionId
      });
      
      console.log('Form data set for editing');
      
      // Set the selected election
      setSelectedElection(candidateData.electionId);
      
      // Open the edit dialog
      console.log('Opening edit dialog');
      setOpenEditCandidateDialog(true);
      
    } catch (error) {
      console.error('Error preparing candidate for edit:', error);
      showSnackbar('Đã xảy ra lỗi khi chuẩn bị chỉnh sửa ứng cử viên', 'error');
    }
  };

  // Thêm hàm tối ưu hóa ảnh
  const optimizeImage = (base64String, maxWidth = 800, maxHeight = 800) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Tính toán kích thước mới
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Chuyển đổi sang base64 với chất lượng 0.8
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(optimizedBase64);
      };
      img.onerror = reject;
      img.src = base64String;
    });
  };

  // Thêm hàm để mở dialog sửa ứng cử viên
  const resetCandidateForm = () => {
      setCandidateFormData({
        name: '',
        birthDate: null,
        hometown: '',
        position: '',
        achievements: '',
        motto: '',
        imageUrl: '',
      });
  };

  // Thêm hàm tải danh sách admin
  const loadAdmins = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await axios.get('https://votting-backend-a9d7.onrender.com/api/admins', {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setAdmins(res.data);
    } catch (error) {
      console.error('Error loading admins:', error);
      setAdmins([]);
    }
  };

  // Thêm hàm xử lý thêm admin mới
  const handleAddAdmin = async () => {
    try {
      setLoading(true);
      setError('');
      // Kiểm tra dữ liệu nhập vào
      if (!adminFormData.name || !adminFormData.cccd || !adminFormData.email || !adminFormData.password) {
        setError('Vui lòng nhập đầy đủ thông tin admin');
        setLoading(false);
        return;
      }
      // Kiểm tra định dạng CCCD (12 chữ số)
      if (!/^[0-9]{12}$/.test(adminFormData.cccd)) {
        setError('CCCD phải có đúng 12 chữ số');
        setLoading(false);
        return;
      }
      // Kiểm tra email hợp lệ
      if (!/\S+@\S+\.\S+/.test(adminFormData.email)) {
        setError('Email không hợp lệ');
        setLoading(false);
        return;
      }
      // Gửi API tạo admin
      const jwt = localStorage.getItem('jwt');
      await axios.post('https://votting-backend-a9d7.onrender.com/api/admins', {
        cccd: adminFormData.cccd,
        name: adminFormData.name,
        email: adminFormData.email,
        password: adminFormData.password,
        isSuperAdmin: !!adminFormData.isSuperAdmin
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setOpenAddAdminDialog(false);
      setAdminFormData({ name: '', cccd: '', email: '', password: '', isSuperAdmin: false });
      await loadAdmins();
      showSnackbar('Thêm admin mới thành công', 'success');
    } catch (error) {
      setError(error?.response?.data?.error || 'Có lỗi xảy ra khi thêm admin');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xoá admin (tuỳ chọn)
  const handleDeleteAdmin = async (adminId) => {
    try {
      const adminToDelete = admins.find(admin => (admin._id || admin.id) === adminId);
      if (!adminToDelete) {
        showSnackbar('Không tìm thấy admin', 'error');
        return;
      }
      if (!window.confirm(`Bạn có chắc chắn muốn xoá admin "${adminToDelete.name}"?`)) {
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.delete(`https://votting-backend-a9d7.onrender.com/api/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      await loadAdmins();
      showSnackbar('Đã xoá admin thành công', 'success');
    } catch (error) {
      const msg = error.response?.data?.error || 'Đã xảy ra lỗi khi xoá admin';
      showSnackbar(msg, 'error');
      console.error('Error deleting admin:', error);
    }
  };

  // Thêm function lọc ứng cử viên theo cuộc bầu cử
  const filterCandidatesByElection = async (electionId) => {
    console.log('filterCandidatesByElection called with electionId:', electionId);
    
    // If no election selected, show all candidates
    if (!electionId) {
      console.log('No election selected, showing all candidates');
      setFilteredCandidates([]);
      setSelectedElectionForCandidates(null);
      return;
    }
    
    // Convert ID to string for consistent comparison
    const electionIdStr = String(electionId);
    setSelectedElectionForCandidates(electionIdStr);
    
    // Filter candidates trên state (KHÔNG lấy từ localStorage)
    try {
      const res = await axios.get(`https://votting-backend-a9d7.onrender.com/api/candidates?electionId=${electionIdStr}`);
      setFilteredCandidates(res.data);
      console.log(`Loaded ${res.data.length} candidates from backend for election ${electionIdStr}`);
    } catch (error) {
      setFilteredCandidates([]);
      showSnackbar('Không thể tải danh sách ứng cử viên', 'error');
    }
    
    // Also update the main candidates array
    // setCandidates(currentCandidates); // This line is no longer needed as we are not fetching from localStorage here
  };

  // Xem kết quả bầu cử
  const handleViewResults = (electionId) => {
    try {
      // Tìm cuộc bầu cử bằng _id hoặc id (so sánh kiểu string)
      const election = elections.find(e => String(e._id || e.id) === String(electionId));
      if (!election) {
        showSnackbar('Không tìm thấy cuộc bầu cử', 'error');
        return;
      }
      // BỎ kiểm tra trạng thái completed
      // Lưu electionId vào localStorage để ElectionResultsReport có thể đọc
      localStorage.setItem('selectedElectionId', electionId);
      // Chuyển hướng đến trang kết quả bầu cử
      navigate(`/elections/${electionId}/results`);
    } catch (error) {
      console.error('Error viewing election results:', error);
      showSnackbar('Đã xảy ra lỗi khi xem kết quả bầu cử', 'error');
    }
  };

  // Hàm quay lại từ màn hình kết quả
  const handleBackFromResults = () => {
    navigate('/admin');
  };

  // Thêm chức năng chuyển đổi chế độ xem
  const handleViewModeChange = (newView) => {
    setViewMode(newView);
    
    // Nếu chuyển tab, reset form và đóng dialog
    setOpenElectionDialog(false);
    setOpenCandidateDialog(false);
    setOpenEditCandidateDialog(false);
    setOpenAddAdminDialog(false);
    setSelectedCandidate(null);
    
    // Load dữ liệu khi chuyển tab
    if (newView === 'voters') {
      loadVoters();
    }
  };

  // Thêm hàm renderContent để hiển thị nội dung dựa vào tab đang chọn
  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return renderOverviewTab();
      case 1:
        return renderElectionsTab();
      case 2:
        return renderCandidatesTab();
      case 3:
        return renderAdminsTab();
      case 4:
        return renderVotersTab();
      default:
        return renderOverviewTab();
    }
  };

  // Tab Tổng quan
  const renderOverviewTab = () => {
    const totalElections = elections.length;
    const totalCandidates = allCandidates.length;
    const totalVoters = voters.length;
    
    // Generate chart data with improved logic
    let votesGrouped = {};
    let labels = [];
    let data = [];
    
    // Generate labels for the last 7 periods based on chartMode
    const generateLabels = () => {
      const today = new Date();
      const labels = [];
      
      if (chartMode === 'day') {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          labels.push(format(date, 'dd/MM/yyyy'));
        }
      } else if (chartMode === 'week') {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - (i * 7));
          const week = getISOWeek(date);
          const year = getYear(date);
          labels.push(`Tuần ${week}/${year}`);
        }
      } else if (chartMode === 'month') {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();
          labels.push(`${month < 10 ? '0' : ''}${month}/${year}`);
        }
      }
      
      return labels;
    };
    
    // Generate labels first
    labels = generateLabels();
    
    // Initialize data with zeros
    data = new Array(labels.length).fill(0);
    
    // Group votes by chartMode
    if (chartMode === 'day') {
      votes.forEach(vote => {
        if (vote.createdAt) {
          const day = format(new Date(vote.createdAt), 'dd/MM/yyyy');
          const index = labels.indexOf(day);
          if (index !== -1) {
            data[index]++;
          }
        }
      });
    } else if (chartMode === 'week') {
      votes.forEach(vote => {
        if (vote.createdAt) {
          const d = new Date(vote.createdAt);
          const week = getISOWeek(d);
          const year = getYear(d);
          const key = `Tuần ${week}/${year}`;
          const index = labels.indexOf(key);
          if (index !== -1) {
            data[index]++;
          }
        }
      });
    } else if (chartMode === 'month') {
      votes.forEach(vote => {
        if (vote.createdAt) {
          const d = new Date(vote.createdAt);
          const month = d.getMonth() + 1;
          const year = d.getFullYear();
          const key = `${month < 10 ? '0' : ''}${month}/${year}`;
          const index = labels.indexOf(key);
          if (index !== -1) {
            data[index]++;
          }
        }
      });
    }
    
    const chartLabel = chartMode === 'day' ? 'ngày' : chartMode === 'week' ? 'tuần' : 'tháng';
    
    // Enhanced chart configuration
    const chartData = {
      labels,
      datasets: [
        {
          label: `Số phiếu bầu theo ${chartLabel}`,
          data,
          fill: true,
          backgroundColor: 'rgba(22, 147, 133, 0.1)',
          borderColor: '#169385',
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#169385',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#169385',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3
        }
      ]
    };
    
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: darkMode ? '#fff' : '#222',
            font: {
              size: 14,
              weight: '600'
            },
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: darkMode ? '#333' : '#fff',
          titleColor: darkMode ? '#fff' : '#222',
          bodyColor: darkMode ? '#fff' : '#222',
          borderColor: '#169385',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(context) {
              return `Thời gian: ${context[0].label}`;
            },
            label: function(context) {
              return `Số phiếu: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: darkMode ? '#fff' : '#222',
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: darkMode ? '#fff' : '#222',
            font: {
              size: 12
            },
            stepSize: 1,
            callback: function(value) {
              return Math.floor(value);
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      elements: {
        point: {
          hoverRadius: 8
        }
      }
    };
    
    const now = new Date();
    const ongoingElections = elections.filter(e => new Date(e.endTime) > now).length;
    const endedElections = elections.filter(e => new Date(e.endTime) <= now).length;
    
    return (
      <Box>
        {/* Statistics Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(22, 147, 133, 0.15)',
              border: '1px solid rgba(22, 147, 133, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(22, 147, 133, 0.25)'
              }
            }}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                Tổng cuộc bầu cử
              </Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                {totalElections}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.15)',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(33, 150, 243, 0.25)'
              }
            }}>
              <Typography variant="h6" color="info.main" sx={{ fontWeight: 600, mb: 1 }}>
                Đang diễn ra
              </Typography>
              <Typography variant="h3" color="info.main" sx={{ fontWeight: 700 }}>
                {ongoingElections}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(255, 152, 0, 0.25)'
              }
            }}>
              <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600, mb: 1 }}>
                Đã kết thúc
              </Typography>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                {endedElections}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(156, 39, 176, 0.15)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(156, 39, 176, 0.25)'
              }
            }}>
              <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 600, mb: 1 }}>
                Tổng phiếu bầu
              </Typography>
              <Typography variant="h3" color="secondary.main" sx={{ fontWeight: 700 }}>
                {votes.length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Chart Section */}
        <Paper sx={{ 
          p: 4, 
          mt: 3,
          background: darkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}>
          {/* Chart Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                Biểu đồ thống kê phiếu bầu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Theo dõi số lượng phiếu bầu theo thời gian
              </Typography>
            </Box>
            
            {/* Chart Mode Selector */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              p: 1,
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: 2
            }}>
              <Button
                variant={chartMode === 'day' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setChartMode('day')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 80,
                  ...(chartMode === 'day' && {
                    background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
                    boxShadow: '0 2px 8px rgba(22, 147, 133, 0.3)'
                  })
                }}
              >
                Ngày
              </Button>
              <Button
                variant={chartMode === 'week' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setChartMode('week')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 80,
                  ...(chartMode === 'week' && {
                    background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
                    boxShadow: '0 2px 8px rgba(22, 147, 133, 0.3)'
                  })
                }}
              >
                Tuần
              </Button>
              <Button
                variant={chartMode === 'month' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setChartMode('month')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 80,
                  ...(chartMode === 'month' && {
                    background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
                    boxShadow: '0 2px 8px rgba(22, 147, 133, 0.3)'
                  })
                }}
              >
                Tháng
              </Button>
            </Box>
          </Box>
          
          {/* Chart Container */}
          <Box sx={{ 
            height: 400, 
            position: 'relative',
            '& canvas': {
              borderRadius: 2
            }
          }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
          
          {/* Chart Summary */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: darkMode ? 'rgba(22, 147, 133, 0.1)' : 'rgba(22, 147, 133, 0.05)',
            borderRadius: 2,
            border: `1px solid ${darkMode ? 'rgba(22, 147, 133, 0.2)' : 'rgba(22, 147, 133, 0.1)'}`
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Tổng số phiếu bầu trong {labels.length} {chartLabel} gần nhất: <strong>{data.reduce((sum, val) => sum + val, 0)}</strong> phiếu
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  // Tab Cuộc bầu cử
  const renderElectionsTab = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Quản lý cuộc bầu cử</Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenElectionDialog(true)}
              startIcon={<AddIcon />}
            >
              Tạo cuộc bầu cử mới
            </Button>
          </Box>

          {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
        ) : elections.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên cuộc bầu cử</TableCell>
                  <TableCell>Bắt đầu</TableCell>
                  <TableCell>Kết thúc</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {elections.map((election) => {
                  const status = getElectionStatus(election);
                  return (
                    <TableRow key={election._id || election.id}>
                      <TableCell>{election.title}</TableCell>
                      <TableCell>{formatDate(election.startTime)}</TableCell>
                      <TableCell>{formatDate(election.endTime)}</TableCell>
                      <TableCell>{getStatusText(status)}</TableCell>
                      <TableCell align="center">
                        <ButtonGroup size="small" sx={{ '& .MuiButton-root': { borderRadius: 2, textTransform: 'none', fontWeight: 'medium' } }}>
                          <Button
                            variant="outlined"
                            color="info"
                            onClick={() => handleViewResults(election._id || election.id)}
                            startIcon={<AssessmentIcon />}
                          >
                          </Button>
                          {status === 'active' && (
                            <Button
                              variant="outlined"
                              color="success"
                              onClick={() => handleMarkCompleted(election._id || election.id)}
                              startIcon={<DoneAllIcon />}
                            >
                            </Button>
                          )}
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEditElection(election)}
                            startIcon={<EditIcon />}
                          >
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteElection(election._id || election.id)}
                            startIcon={<DeleteIcon />}
                          >
                          </Button>
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Chưa có cuộc bầu cử nào. Hãy tạo cuộc bầu cử mới.
          </Alert>
        )}
      </Paper>
    );
  };

  // Tab Ứng cử viên
  const renderCandidatesTab = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Quản lý ứng cử viên</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Chọn cuộc bầu cử</InputLabel>
              <Select
                value={selectedElectionForCandidates || ''}
                onChange={(e) => filterCandidatesByElection(e.target.value)}
                label="Chọn cuộc bầu cử"
              >
                {elections.map((election) => (
                  <MenuItem key={election._id || election.id} value={election._id || election.id}>
                    {election.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedElectionForCandidates && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => handleAddCandidate(selectedElectionForCandidates)}
              >
                Thêm ứng cử viên
              </Button>
            )}
            {selectedElectionForCandidates && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setOpenImportDialog(true)}
                sx={{ ml: 1 }}
              >
                Import Excel
              </Button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : filteredCandidates && filteredCandidates.length > 0 ? (
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
                {(filteredCandidates || []).filter(Boolean).map((candidate) => (
                  <TableRow key={candidate._id || candidate.id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={sanitizeImageUrl(candidate?.imageUrl, 'candidate')}
                        alt={candidate ? candidate.name : 'Ứng cử viên'}
                        sx={{
                          width: 100,
                          height: 100,
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
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell>{formatDate(candidate.birthDate)}</TableCell>
                    <TableCell>{candidate.hometown || 'Chưa cập nhật'}</TableCell>
                    <TableCell>{candidate.position || 'Chưa cập nhật'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditCandidate(candidate)}
                        sx={{ color: 'primary.main', ml: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCandidate(candidate._id || candidate.id)}
                        sx={{ color: 'error.main', ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            {selectedElectionForCandidates 
              ? 'Chưa có ứng cử viên nào trong cuộc bầu cử này.' 
              : 'Vui lòng chọn một cuộc bầu cử để xem ứng cử viên.'}
          </Alert>
        )}
      </Paper>
    );
  };

  // Tab Quản lý Admin
  const renderAdminsTab = () => {
    return (
      <Paper sx={{ p: 3, maxWidth: 900, margin: 'auto' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Quản lý Admin</Typography>
          <Button variant="contained" onClick={() => setOpenAddAdminDialog(true)} startIcon={<PersonAddIcon />}>Thêm quản trị viên mới</Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : admins.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>CCCD/CMND</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin._id || admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.cccd}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton color="error" onClick={() => handleDeleteAdmin(admin._id || admin.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">Chưa có quản trị viên nào. Hãy thêm quản trị viên mới.</Alert>
        )}
      </Paper>
    );
  };

  // Tab Quản lý Cử tri
  const renderVotersTab = () => {
    return (
      <Paper sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Quản lý cử tri</Typography>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : voters.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>CCCD/CMND</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell>Đã tham gia bầu cử</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voters.map((voter) => {
                  // Lọc các phiếu bầu của cử tri này
                  const votesOfVoter = allVotes.filter(v => v.voterId && (v.voterId._id === voter._id || v.voterId._id === voter.id || v.voterId.cccd === voter.cccd));
                  // Nhóm theo electionId
                  const electionIds = [...new Set(votesOfVoter.map(vote => vote.electionId?._id || vote.electionId || vote.electionId))];
                  return (
                    <TableRow key={voter._id || voter.id}>
                      <TableCell>{voter.fullName}</TableCell>
                      <TableCell>{voter.cccd}</TableCell>
                      <TableCell>{voter.address}</TableCell>
                      <TableCell>{formatDate(voter.birthDate)}</TableCell>
                      <TableCell>
                        {electionIds.length > 0 ? (
                          <Box>
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, mb: 1 }}>
                              Đã tham gia {electionIds.length} cuộc bầu cử
                            </Typography>
                            {isSuperAdmin() && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleViewVoterElections(voter)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.5,
                                  borderColor: '#169385',
                                  color: '#169385',
                                  '&:hover': {
                                    backgroundColor: 'rgba(22, 147, 133, 0.1)',
                                    borderColor: '#169385'
                                  }
                                }}
                              >
                                Xem thêm
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">Chưa tham gia bầu cử nào</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color={voter.isActive ? "warning" : "success"}
                          size="small"
                          onClick={() => handleToggleVoterActive(voter.cccd, voter.isActive)}
                          title={voter.isActive ? "Khóa cử tri" : "Mở khóa cử tri"}
                        >
                          {voter.isActive ? <LockIcon /> : <LockOpenIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Chưa có cử tri nào trong hệ thống. Cử tri sẽ được thêm khi họ đăng ký tài khoản.
          </Alert>
        )}
      </Paper>
    );
  };

  // Hàm tính toán kết quả bầu cử thực tế
  const calculateRealVotes = (electionId) => {
    try {
      // Lấy danh sách ứng viên MỚI NHẤT từ state hoặc localStorage để đảm bảo tính đúng
      const currentCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');
      const electionCandidates = currentCandidates.filter(c => c.electionId && c.electionId.toString() === electionId.toString());
      const realVoteCounts = {};
      let totalRealVotes = 0;

      electionCandidates.forEach(candidate => {
        // Đảm bảo ID là string để nhất quán
        realVoteCounts[candidate.id.toString()] = 0;
      });

      // Lấy danh sách phiếu bầu từ localStorage
      const storedVoters = JSON.parse(localStorage.getItem('voters') || '[]');

      storedVoters.forEach(voter => {
        const voteKey = `vote_${electionId}_${voter.cccd}`;
        const voteData = localStorage.getItem(voteKey);
        if (voteData) {
           try {
             const vote = JSON.parse(voteData);
             if (vote && vote.candidateIds && vote.candidateIds.length > 0) {
               const candidateId = vote.candidateIds[0].toString(); // Đảm bảo ID là string
               // Chỉ đếm nếu ID ứng viên có trong danh sách ứng viên của cuộc bầu cử này
               if (realVoteCounts.hasOwnProperty(candidateId)) {
                 realVoteCounts[candidateId]++;
                 totalRealVotes++;
               } else {
                  console.warn(`Vote from ${voter.cccd} for candidate ${candidateId} ignored (not in election ${electionId})`);
               }
             }
           } catch (parseError) {
             console.error(`Error parsing vote data for voter ${voter.cccd}: ${parseError}`);
           }
        }
      });

      console.log(`Calculated real votes for election ${electionId}:`, realVoteCounts, `Total: ${totalRealVotes}`);
      return { realVoteCounts, totalRealVotes };

    } catch (error) {
      console.error(`Error calculating real votes for election ${electionId}:`, error);
      return { realVoteCounts: {}, totalRealVotes: 0 };
    }
  };

  // Thêm hàm để xử lý hoàn thành cuộc bầu cử
  const handleMarkCompleted = async (electionId) => {
    try {
      if (!electionId) {
        showSnackbar('Không xác định được ID cuộc bầu cử', 'error');
        return;
      }
      // Tìm cuộc bầu cử bằng _id hoặc id (so sánh kiểu string)
      const election = elections.find(e => String(e._id || e.id) === String(electionId));
      if (!election) {
        showSnackbar('Không tìm thấy cuộc bầu cử', 'error');
        return;
      }
      // Gọi API backend để cập nhật trạng thái completed
      const jwt = localStorage.getItem('jwt');
      await axios.put(`https://votting-backend-a9d7.onrender.com/api/elections/${electionId}/complete`, {}, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      await loadElections();
      showSnackbar(`Đã kết thúc và tổng hợp kết quả cho cuộc bầu cử "${election.title}"`, 'success');
      // Chuyển hướng sang trang kết quả
      navigate(`/elections/${electionId}/results`);
    } catch (error) {
      console.error('Error marking election as completed:', error);
      showSnackbar('Đã xảy ra lỗi khi kết thúc cuộc bầu cử', 'error');
    }
  };

  // Thêm hàm xem chi tiết ứng cử viên
  const handleViewCandidate = (candidate) => {
    if (!candidate || !candidate.id) {
      console.error('Invalid candidate data for viewing:', candidate);
      showSnackbar('Dữ liệu ứng cử viên không hợp lệ', 'error');
      return;
    }
    
    // Lưu ứng cử viên được chọn
    setSelectedCandidate(candidate);
    
    // Mở dialog xem chi tiết
    setOpenViewCandidateDialog(true);
  };

  // Thêm hàm utility để quản lý storage
  const storageUtils = {
    // Lấy thông tin ứng cử viên từ localStorage
    getCandidates: () => {
      try {
        return JSON.parse(localStorage.getItem('candidates')) || [];
      } catch (error) {
        console.error('Error getting candidates:', error);
        return [];
      }
    }
  };

  // Khôi phục lại hàm handleAddCandidate
  const handleAddCandidate = (electionId) => {
    if (!electionId) {
      showSnackbar('Vui lòng chọn cuộc bầu cử trước khi thêm ứng cử viên', 'error');
      return;
    }
    resetCandidateForm();
    setSelectedElection(electionId.toString());
    setCandidateFormData({
      name: '',
      birthDate: null,
      hometown: '',
      position: '',
      achievements: '',
      motto: '',
      imageUrl: '',
    });
    setOpenCandidateDialog(true);
  };

  // Hàm upload ảnh ứng cử viên
  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Kích thước file không được vượt quá 5MB', 'error');
        return;
      }
      optimizeImage(URL.createObjectURL(file), 600, 600).then(optimizedBase64 => {
        const sizeInBytes = Math.ceil((optimizedBase64.length * 3) / 4) - (optimizedBase64.endsWith('==') ? 2 : optimizedBase64.endsWith('=') ? 1 : 0);
        if (sizeInBytes > 2 * 1024 * 1024) {
          showSnackbar('Ảnh sau nén vẫn lớn hơn 2MB, vui lòng chọn ảnh khác hoặc resize nhỏ hơn.', 'error');
          return;
        }
        setCandidateFormData(prev => ({ ...prev, imageUrl: optimizedBase64 }));
      });
    }
  };

  // 2. Hàm mở dialog sửa election
  const handleEditElection = (election) => {
    setEditElectionData({ ...election });
    setEditElectionFormData({
      title: election.title || '',
      description: election.description || '',
      startTime: election.startTime ? new Date(election.startTime) : null,
      endTime: election.endTime ? new Date(election.endTime) : null,
      logoUrl: election.logoUrl || ''
    });
    setOpenEditElectionDialog(true);
  };

  // 3. Hàm xử lý submit sửa election
  const handleUpdateElection = async () => {
    console.log('Submitting update election', editElectionFormData);
    try {
      setCreating(true);
      const { title, description, startTime, endTime, logoUrl } = editElectionFormData;
      const { _id, id } = editElectionData;
      if (!title) {
        showSnackbar('Vui lòng nhập tiêu đề cuộc bầu cử', 'error');
        setCreating(false);
        return;
      }
      if (!startTime || !endTime) {
        showSnackbar('Vui lòng chọn thời gian bắt đầu và kết thúc', 'error');
        setCreating(false);
        return;
      }
      if (startTime >= endTime) {
        showSnackbar('Thời gian kết thúc phải sau thời gian bắt đầu', 'error');
        setCreating(false);
        return;
      }
      const jwt = localStorage.getItem('jwt');
      await axios.put(`https://votting-backend-a9d7.onrender.com/api/elections/${_id || id}`, {
        title,
        description,
        startTime,
        endTime,
        logoUrl
      }, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setOpenEditElectionDialog(false);
      setEditElectionData(null);
      setEditElectionFormData({ title: '', description: '', startTime: null, endTime: null, logoUrl: '' });
      await loadElections();
      showSnackbar('Đã cập nhật cuộc bầu cử thành công', 'success');
    } catch (error) {
      console.error('Error updating election:', error);
      showSnackbar(error?.response?.data?.error || 'Có lỗi xảy ra khi cập nhật cuộc bầu cử', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Hàm xử lý file excel
  const handleExcelFile = (e) => {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name || '';
    const isValidType = validExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) ||
      ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'].includes(file.type);

    if (!isValidType) {
      setImportError('File không hợp lệ. Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV.');
      setImportedCandidates([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsed = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!parsed || parsed.length === 0) {
          setImportError('File Excel không có dữ liệu hoặc định dạng không đúng.');
          setImportedCandidates([]);
          return;
        }

        setImportedCandidates(parsed);
      } catch (err) {
        console.error('Excel parse error:', err);
        setImportError('File không hợp lệ hoặc sai định dạng!');
        setImportedCandidates([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Hàm import lên backend
  const handleImportCandidates = async () => {
    if (!selectedElectionForCandidates || importedCandidates.length === 0) return;
    setImportLoading(true);
    setImportError('');
    try {
      const jwt = localStorage.getItem('jwt');
      for (const c of importedCandidates) {
        await axios.post('https://votting-backend-a9d7.onrender.com/api/candidates', {
          name: c.name || c["Tên"],
          birthDate: c.birthDate ? new Date(c.birthDate).toISOString() : (c["Ngày sinh"] ? new Date(c["Ngày sinh"]).toISOString() : null),
          hometown: c.hometown || c["Quê quán"],
          position: c.position || c["Chức vụ"],
          achievements: c.achievements || c["Những thành tựu"],
          motto: c.motto || c["Lời tuyên bố"],
          imageUrl: c.imageUrl || c["Ảnh"],
          electionId: selectedElectionForCandidates
        }, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
      }
      setOpenImportDialog(false);
      setImportedCandidates([]);
      await loadCandidates(selectedElectionForCandidates);
      showSnackbar('Import ứng cử viên thành công!', 'success');
    } catch (err) {
      setImportError('Có lỗi khi import ứng cử viên. Kiểm tra dữ liệu hoặc thử lại.');
    } finally {
      setImportLoading(false);
    }
  };

  const loadVotes = async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await axios.get('https://votting-backend-a9d7.onrender.com/api/votes', {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      setVotes(res.data);
    } catch (error) {
      showSnackbar('Không thể tải danh sách phiếu bầu', 'error');
      setVotes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllCandidates = async () => {
    try {
      const res = await axios.get('https://votting-backend-a9d7.onrender.com/api/candidates');
      setAllCandidates(res.data);
    } catch (error) {
      setAllCandidates([]);
    }
  };

  // Thêm hàm handleViewCandidates nếu chưa có
  const handleViewCandidates = (election) => {
    setSelectedElection(election);
    setViewMode('candidates');
    setOpenCandidateDialog(true);
  };

  // Lấy tên và avatar admin từ localStorage (hoặc backend nếu có)
  const adminName = localStorage.getItem('adminName') || 'Admin';
  const adminAvatar = localStorage.getItem('adminAvatar') || '';
  
  // Kiểm tra admin super
  const isSuperAdmin = () => {
    const adminCCCD = localStorage.getItem('adminCCCD');
    const currentAdmin = admins.find(admin => admin.cccd === adminCCCD);
    return currentAdmin?.isSuperAdmin || false;
  };
  
  // Hàm mở dialog xem chi tiết cuộc bầu cử của cử tri
  const handleViewVoterElections = (voter) => {
    if (!isSuperAdmin()) {
      showSnackbar('Chỉ admin super mới có quyền xem chi tiết này', 'warning');
      return;
    }
    
    // Lọc các phiếu bầu của cử tri này
    const votesOfVoter = allVotes.filter(v => v.voterId && (v.voterId._id === voter._id || v.voterId._id === voter.id || v.voterId.cccd === voter.cccd));
    
    // Lấy thông tin chi tiết các cuộc bầu cử
    const voterElections = votesOfVoter.map(vote => {
      const election = elections.find(e => (e._id || e.id) === (vote.electionId?._id || vote.electionId) || String(e._id || e.id) === String(vote.electionId?._id || vote.electionId));
      return {
        election,
        voteDate: vote.createdAt,
        voteId: vote._id || vote.id
      };
    }).filter(item => item.election); // Lọc bỏ những cuộc bầu cử không tìm thấy
    
    setSelectedVoterElections(voterElections);
    setSelectedVoterName(voter.fullName);
    setOpenVoterElectionsDialog(true);
  };

  // Theme động cho dark/light mode
  const dynamicTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#169385', contrastText: '#fff' },
      background: {
        default: darkMode ? '#111' : '#f9fafe',
        paper: darkMode ? '#181a20' : '#fff',
        sidebar: darkMode ? '#222' : '#f5f7fa',
      },
      text: {
        primary: darkMode ? '#fff' : '#222',
        secondary: darkMode ? '#aaa' : '#555',
        sidebar: darkMode ? '#fff' : '#169385',
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h4: { fontWeight: 700, fontSize: 36, letterSpacing: 1, color: darkMode ? '#fff' : '#169385' },
      h5: { fontWeight: 600, fontSize: 24, color: darkMode ? '#fff' : '#169385' },
      body1: { fontSize: 18, color: darkMode ? '#fff' : '#222' },
      button: { fontWeight: 600, fontSize: 16 },
    },
    shape: { borderRadius: 4 },
    components: {
      MuiPaper: { styleOverrides: { root: { borderRadius: 4, boxShadow: '0 2px 8px 0 rgba(33,150,243,0.06)' } } },
      MuiTableContainer: { styleOverrides: { root: { borderRadius: 4, boxShadow: '0 1px 4px 0 rgba(33,150,243,0.04)' } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 6 } } },
      MuiButton: { styleOverrides: { root: { borderRadius: 4 } } },
      MuiTab: { styleOverrides: { root: { borderRadius: 4, marginBottom: 6 } } },
      MuiTableCell: { styleOverrides: { root: { borderRadius: 0 } } },
      MuiTableRow: { styleOverrides: { root: { borderRadius: 0 } } },
      MuiAvatar: { styleOverrides: { root: { borderRadius: 4 } } },
    },
  });

  // Khi vào tab quản lý cử tri, gọi API lấy toàn bộ phiếu bầu
  useEffect(() => {
    if (activeTab === 4) { // tab Quản lý cử tri
      const fetchVotes = async () => {
        try {
          setLoading(true);
          const jwt = localStorage.getItem('jwt');
          const res = await axios.get('https://votting-backend-a9d7.onrender.com/api/votes', {
            headers: { Authorization: `Bearer ${jwt}` }
          });
          setAllVotes(res.data);
        } catch (err) {
          setAllVotes([]);
        } finally {
          setLoading(false);
        }
      };
      fetchVotes();
    }
  }, [activeTab]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: darkMode ? '#111' : '#f9fafe' }}>
        {/* Sidebar trái */}
        <Box sx={{ width: 250, bgcolor: darkMode ? '#222' : '#f5f7fa', boxShadow: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          {/* Logo nhỏ trên cùng */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <img src="/logo192.png" alt="Logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>Admin</Typography>
          </Box>
          {/* Tabs sidebar */}
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            sx={{ width: '100%', '& .MuiTab-root': { alignItems: 'flex-start', fontWeight: 600, fontSize: 18, px: 2, py: 2, textAlign: 'left', minHeight: 56, borderRadius: 2, mb: 1, transition: 'background 0.2s, color 0.2s', color: darkMode ? '#fff' : '#169385', background: darkMode ? '#222' : '#f5f7fa', '&.Mui-selected': { background: darkMode ? '#111' : '#fff', color: '#169385', fontWeight: 700, boxShadow: 1 } } }}
          >
            <Tab icon={<AssessmentIcon />} iconPosition="start" label="Tổng quan" />
            <Tab icon={<HowToVoteIcon />} iconPosition="start" label="Cuộc bầu cử" />
            <Tab icon={<PeopleAltIcon />} iconPosition="start" label="Ứng cử viên" />
            <Tab icon={<PersonAddIcon />} iconPosition="start" label="Quản lý Admin" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Quản lý Cử tri" />
          </Tabs>
        </Box>
        {/* Main content area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Header nhỏ trong layout quản trị */}
          <Box sx={{ height: 64, bgcolor: darkMode ? '#11' : '#ccc', boxShadow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>Bảng điều khiển quản trị</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => setDarkMode((prev) => !prev)} color="inherit" title={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <Avatar src={adminAvatar} alt={adminName} sx={{ width: 40, height: 40, bgcolor: '#169385' }}>{adminName[0]}</Avatar>
              <Typography variant="body1" sx={{ fontWeight: 600, color: darkMode ? '#fff' : '#222' }}>{adminName}</Typography>
              <IconButton color="error" onClick={() => { localStorage.clear(); navigate('/admin'); }} title="Đăng xuất">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
          {/* Content area bo góc, padding lớn, nền động */}
          <Box sx={{ flex: 1, p: { xs: 1, sm: 3 }, bgcolor: darkMode ? '#181a20' : '#fff', borderRadius: 4, minHeight: 0, maxWidth: 1200, margin: 'auto', width: '100%' }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={hideSnackbar}>
        <Alert onClose={hideSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <NewElectionDialog
        open={openElectionDialog}
        onClose={() => setOpenElectionDialog(false)}
        onSave={handleCreateElection}
      />

      <Dialog
        open={openCandidateDialog}
        onClose={() => setOpenCandidateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedElection ? 'Thêm ứng cử viên' : 'Thêm ứng cử viên'}</DialogTitle>
        <DialogContent dividers>
                <TextField
                  label="Tên ứng cử viên"
                  value={candidateFormData.name}
            onChange={(e) => setCandidateFormData(prev => ({ ...prev, name: e.target.value }))}
                  fullWidth
                  margin="normal"
                />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                  label="Ngày sinh"
              value={candidateFormData.birthDate}
              onChange={(date) => setCandidateFormData(prev => ({ ...prev, birthDate: date }))}
              slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
            />
          </LocalizationProvider>
                <TextField
                  label="Quê quán"
                  value={candidateFormData.hometown}
            onChange={(e) => setCandidateFormData(prev => ({ ...prev, hometown: e.target.value }))}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Chức vụ"
                  value={candidateFormData.position}
            onChange={(e) => setCandidateFormData(prev => ({ ...prev, position: e.target.value }))}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Những thành tựu"
                  value={candidateFormData.achievements}
            onChange={(e) => setCandidateFormData(prev => ({ ...prev, achievements: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
                <TextField
                  label="Lời tuyên bố"
                  value={candidateFormData.motto}
            onChange={(e) => setCandidateFormData(prev => ({ ...prev, motto: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
          <ImageUpload
            imageUrl={candidateFormData.imageUrl}
            onChange={img => setCandidateFormData(prev => ({ ...prev, imageUrl: img }))}
            label="Ảnh ứng cử viên"
          />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCandidateDialog(false)}>Hủy</Button>
            <LoadingButton
              loading={creating}
              onClick={handleSaveCandidate}
              variant="contained"
            >
            {selectedElection ? 'Thêm ứng cử viên' : 'Thêm ứng cử viên'}
            </LoadingButton>
          </DialogActions>
        </Dialog>

      <Dialog
        open={openEditCandidateDialog}
        onClose={() => setOpenEditCandidateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sửa ứng cử viên</DialogTitle>
        <form onSubmit={(e) => { e.preventDefault(); handleUpdateCandidate(); }}>
          <DialogContent dividers>
            <TextField
              label="Tên ứng cử viên"
              value={candidateFormData.name}
              onChange={(e) => setCandidateFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              margin="normal"
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Ngày sinh"
                value={candidateFormData.birthDate}
                onChange={(date) => setCandidateFormData(prev => ({ ...prev, birthDate: date }))}
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
              />
            </LocalizationProvider>
            <TextField
              label="Quê quán"
              value={candidateFormData.hometown}
              onChange={(e) => setCandidateFormData(prev => ({ ...prev, hometown: e.target.value }))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Chức vụ"
              value={candidateFormData.position}
              onChange={(e) => setCandidateFormData(prev => ({ ...prev, position: e.target.value }))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Những thành tựu"
              value={candidateFormData.achievements}
              onChange={(e) => setCandidateFormData(prev => ({ ...prev, achievements: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
            <TextField
              label="Lời tuyên bố"
              value={candidateFormData.motto}
              onChange={(e) => setCandidateFormData(prev => ({ ...prev, motto: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
            <ImageUpload
              imageUrl={candidateFormData.imageUrl}
              onChange={img => setCandidateFormData(prev => ({ ...prev, imageUrl: img }))}
              label="Ảnh ứng cử viên"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditCandidateDialog(false)}>Hủy</Button>
            <LoadingButton
              type="submit"
              loading={creating}
              variant="contained"
            >
              Sửa ứng cử viên
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={openAddAdminDialog}
        onClose={() => setOpenAddAdminDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm quản trị viên mới</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Họ và tên"
            value={adminFormData.name}
            onChange={(e) => setAdminFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="CCCD/CMND"
            value={adminFormData.cccd}
            onChange={(e) => setAdminFormData(prev => ({ ...prev, cccd: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={adminFormData.email}
            onChange={(e) => setAdminFormData(prev => ({ ...prev, email: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Mật khẩu"
            type="password"
            value={adminFormData.password}
            onChange={(e) => setAdminFormData(prev => ({ ...prev, password: e.target.value }))}
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={adminFormData.isSuperAdmin}
                onChange={(e) => setAdminFormData(prev => ({ ...prev, isSuperAdmin: e.target.checked }))}
                color="primary"
              />
            }
            label="Là quản trị viên cao cấp"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddAdminDialog(false)}>Hủy</Button>
          <LoadingButton
            loading={loading}
            onClick={handleAddAdmin}
            variant="contained"
          >
            Thêm quản trị viên
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditElectionDialog}
        onClose={() => setOpenEditElectionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Sửa cuộc bầu cử</DialogTitle>
        <form onSubmit={(e) => { e.preventDefault(); handleUpdateElection(); }}>
          <DialogContent dividers sx={{ pb: 2, overflowY: 'auto' }}>
            <TextField
              label="Tiêu đề cuộc bầu cử"
              value={editElectionFormData.title}
              onChange={(e) => setEditElectionFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Mô tả"
              value={editElectionFormData.description}
              onChange={(e) => setEditElectionFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              margin="normal"
            />
            <Box sx={{ mt: 2, mb: 3 }}>
              <DateTimePicker
                label="Thời gian bắt đầu"
                value={editElectionFormData.startTime}
                onChange={(date) => setEditElectionFormData(prev => ({ ...prev, startTime: date }))}
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                ampm={false}
                format="dd/MM/yyyy HH:mm"
              />
              <DateTimePicker
                label="Thời gian kết thúc"
                value={editElectionFormData.endTime}
                onChange={(date) => setEditElectionFormData(prev => ({ ...prev, endTime: date }))}
                slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                ampm={false}
                format="dd/MM/yyyy HH:mm"
              />
            </Box>
            <ImageUpload
              imageUrl={editElectionFormData.logoUrl}
              onChange={img => setEditElectionFormData(prev => ({ ...prev, logoUrl: img }))}
              label="Logo cuộc bầu cử"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditElectionDialog(false)}>Hủy</Button>
            <LoadingButton
              type="submit"
              loading={creating}
              variant="contained"
            >
              Sửa cuộc bầu cử
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={openViewCandidateDialog}
        onClose={() => setOpenViewCandidateDialog(false)}
        maxWidth="sm"
              fullWidth
      >
        <DialogTitle>Chi tiết ứng cử viên</DialogTitle>
        <DialogContent dividers>
          {selectedCandidate ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={sanitizeImageUrl(selectedCandidate?.imageUrl, 'candidate')}
                  alt={selectedCandidate.name}
                  sx={{ width: 100, height: 100, mr: 2 }}
                />
                <Typography variant="h6">{selectedCandidate.name}</Typography>
              </Box>
              <Typography variant="body1">Ngày sinh: {formatDate(selectedCandidate.birthDate)}</Typography>
              <Typography variant="body1">Quê quán: {selectedCandidate.hometown}</Typography>
              <Typography variant="body1">Chức vụ: {selectedCandidate.position}</Typography>
              <Typography variant="body1">Những thành tựu: {selectedCandidate.achievements}</Typography>
              <Typography variant="body1">Lời tuyên bố: {selectedCandidate.motto}</Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">Không có dữ liệu ứng cử viên.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewCandidateDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        maxWidth="sm"
              fullWidth
      >
        <DialogTitle>Import ứng cử viên từ Excel</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            Vui lòng chọn file Excel (.xlsx) chứa danh sách ứng cử viên.
            File phải có các cột: Tên, Ngày sinh, Quê quán, Chức vụ, Những thành tựu, Lời tuyên bố, Ảnh.
          </Typography>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelFile}
            style={{ marginTop: '10px' }}
          />
          {importedCandidates.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Danh sách ứng cử viên đã tải lên:</Typography>
              <List dense>
                {importedCandidates.map((candidate, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${candidate.name || candidate["Tên"]} (${candidate.cccd || candidate["CCCD"]})`}
                      secondary={`Ngày sinh: ${candidate.birthDate ? formatDate(new Date(candidate.birthDate)) : 'Chưa có'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {importError && (
            <Alert severity="error" sx={{ mt: 2 }}>{importError}</Alert>
          )}
          </DialogContent>
          <DialogActions>
          <Button onClick={() => setOpenImportDialog(false)}>Hủy</Button>
            <LoadingButton
            loading={importLoading}
            onClick={handleImportCandidates}
              variant="contained"
            disabled={Boolean(importedCandidates.length === 0 || importError)}
            >
            Import
            </LoadingButton>
          </DialogActions>
        </Dialog>
        
        {/* Dialog xem chi tiết cuộc bầu cử của cử tri */}
        <Dialog
          open={openVoterElectionsDialog}
          onClose={() => setOpenVoterElectionsDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: darkMode ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
            color: '#fff',
            borderRadius: '12px 12px 0 0',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px 12px 0 0'
            }
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, position: 'relative', zIndex: 1 }}>
              Chi tiết cuộc bầu cử của cử tri: {selectedVoterName}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ 
            p: 3,
            background: darkMode ? 'rgba(255, 255, 255, 0.02)' : '#fff',
            color: darkMode ? '#fff' : '#222'
          }}>
            {selectedVoterElections.length > 0 ? (
              <Box>
                <Typography variant="body1" sx={{ mb: 3, color: darkMode ? '#fff' : '#222' }}>
                  Cử tri <strong>{selectedVoterName}</strong> đã tham gia {selectedVoterElections.length} cuộc bầu cử:
                </Typography>
                
                <Grid container spacing={2}>
                  {selectedVoterElections.map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper sx={{ 
                        p: 2,
                        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(22, 147, 133, 0.05)',
                        borderRadius: 2,
                        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(22, 147, 133, 0.2)'}`,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(22, 147, 133, 0.15)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                            {item.election.title}
                          </Typography>
                          <Chip 
                            label="Đã bỏ phiếu" 
                            color="success" 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.election.description || 'Không có mô tả'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Thời gian bắt đầu:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(item.election.startTime)}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">Thời gian kết thúc:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(item.election.endTime)}
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="caption" color="text.secondary">Ngày bỏ phiếu:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatDate(item.voteDate)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Chip 
                            label={`ID phiếu: ${item.voteId}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                          <Chip 
                            label={`ID cuộc bầu cử: ${item.election._id || item.election.id}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Không có dữ liệu cuộc bầu cử
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cử tri này chưa tham gia cuộc bầu cử nào hoặc dữ liệu không khả dụng.
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 3,
            background: darkMode ? 'rgba(255, 255, 255, 0.02)' : '#f8f9fa',
            borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <Button 
              onClick={() => setOpenVoterElectionsDialog(false)}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#169385',
                color: '#169385',
                '&:hover': {
                  backgroundColor: 'rgba(22, 147, 133, 0.1)',
                  borderColor: '#169385'
                }
              }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
    </ThemeProvider>
  );
}

export default AdminDashboard;
