import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Avatar,
  Alert,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useWeb3 } from '../contexts/Web3Context';

function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { active, account, isConnecting, error, connectWallet, disconnectWallet } = useWeb3();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [openEditVoter, setOpenEditVoter] = useState(false);
  const [editVoterData, setEditVoterData] = useState({ name: '', birthDate: '', address: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Khi là cử tri, lấy thông tin từ localStorage (hoặc backend nếu có)
  useEffect(() => {
    if (!isAdmin && isLoggedIn && userData) {
      const voterName = localStorage.getItem('voterName') || userData.name || '';
      const voterBirthDate = localStorage.getItem('voterBirthDate') || '';
      const voterAddress = localStorage.getItem('voterAddress') || '';
      
      console.log('Initializing edit voter data:', {
        name: voterName,
        birthDate: voterBirthDate,
        address: voterAddress
      });
      
      setEditVoterData({
        name: voterName,
        birthDate: voterBirthDate,
        address: voterAddress
      });
    }
  }, [isAdmin, isLoggedIn, userData]);

  // Thêm useEffect để đồng bộ trạng thái đăng nhập khi localStorage thay đổi
  useEffect(() => {
    function syncLoginState() {
      const adminCCCD = localStorage.getItem('adminCCCD');
      const isAdminValue = localStorage.getItem('isAdmin') === 'true';
      const voterCCCD = localStorage.getItem('voterCCCD');
      const isVoterValue = localStorage.getItem('isVoter') === 'true';
      if (isAdminValue && adminCCCD) {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setUserData({ name: 'Admin', cccd: adminCCCD });
      } else if (isVoterValue && voterCCCD) {
        setIsLoggedIn(true);
        setIsAdmin(false);
        const voterName = localStorage.getItem('voterName');
        setUserData({ name: voterName || 'Cử tri', cccd: voterCCCD });
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserData(null);
      }
    }
    syncLoginState();
    window.addEventListener('storage', syncLoginState);
    return () => window.removeEventListener('storage', syncLoginState);
  }, [location.pathname]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('adminCCCD');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminEmail');
      
      if (active) {
        disconnectWallet();
      }

      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserData(null);
      
      handleClose();
      
      navigate('/', { replace: true });
    } else {
      localStorage.removeItem('voterCCCD');
      localStorage.removeItem('isVoter');
      localStorage.removeItem('voterName');
      localStorage.removeItem('voterEmail');
      
      if (active) {
        disconnectWallet();
      }

      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserData(null);
      
      handleClose();
      
      navigate('/', { replace: true });
    }
  };

  const handleOpenEditVoter = () => {
    setEditError('');
    setEditSuccess(false);
    setOpenEditVoter(true);
  };
  const handleCloseEditVoter = () => {
    setOpenEditVoter(false);
  };
  const handleEditVoterChange = (e) => {
    setEditVoterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditVoterSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess(false);
    
    try {
      const jwt = localStorage.getItem('jwt');
      console.log('JWT token:', jwt ? 'Present' : 'Missing');
      
      if (!jwt) {
        setEditError('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
        return;
      }

      const requestData = {
        fullName: editVoterData.name,
        birthDate: editVoterData.birthDate,
        address: editVoterData.address
      };
      
      console.log('Sending update request:', requestData);
      
      const res = await axios.put('https://votting-backend-a9d7.onrender.com/api/voters/me', requestData, {
        headers: { 
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update response:', res.data);
      
      // Cập nhật localStorage và userData
      localStorage.setItem('voterName', res.data.fullName);
      localStorage.setItem('voterBirthDate', res.data.birthDate);
      localStorage.setItem('voterAddress', res.data.address);
      
      // Cập nhật userData state
      setUserData(prev => ({
        ...prev,
        name: res.data.fullName
      }));
      
      setEditSuccess(true);
      // Tắt timeout để tránh lỗi
      // setTimeout(() => {
      //   setOpenEditVoter(false);
      //   // Không reload trang, chỉ cập nhật state
      //   window.location.reload();
      // }, 1000);
      setOpenEditVoter(false);
      // Không reload trang, chỉ cập nhật state
      window.location.reload();
    } catch (err) {
      console.error('Edit voter error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setEditError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 404) {
        setEditError('Không tìm thấy thông tin cử tri.');
      } else {
        setEditError(err.response?.data?.error || 'Cập nhật thất bại. Vui lòng thử lại.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');

  if (isAdminDashboard) return null;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(90deg, #141619 0%, #169385 100%)',
          color: 'primary.contrastText',
          height: 64,
          boxShadow: 2,
          zIndex: 1000,
        }}
      >
        <Toolbar>
          <Typography
            variant="h4"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600,
              fontStyle: 'bold',
            }}
          >
            HỆ THỐNG BẦU CỬ
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isLoggedIn && (
              <>
                {isAdmin ? (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin/dashboard"
                  >
                    Quản lý
                  </Button>
                ) : (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/elections"
                  >
                    Danh sách bầu cử
                  </Button>
                )}
              </>
            )}

            {active && (
              <Chip
                label={formatAddress(account)}
                color="secondary"
                variant="outlined"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiChip-label': { color: 'white' }
                }}
              />
            )}

            {isLoggedIn ? (
              <>
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <Avatar sx={{ bgcolor: isAdmin ? 'primary.dark' : 'secondary.dark' }}>
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
                {!isAdmin && (
                  <Button color="inherit" onClick={handleMenu} sx={{ fontWeight: 600, textTransform: 'none' }}>{userData?.name || 'Cử tri'}</Button>
                )}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem disabled>{isAdmin ? 'Admin' : userData?.name || 'Cử tri'}</MenuItem>
                  {!isAdmin && <MenuItem onClick={() => { handleClose(); handleOpenEditVoter(); }}><EditIcon fontSize="small" sx={{ mr: 1 }} />Chỉnh sửa thông tin</MenuItem>}
                  <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1 }} />Đăng xuất</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {active && (
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <AccountCircleIcon />
                  </IconButton>
                )}
                {!active && !isLoggedIn && (
                  <Button
                    color="inherit"
                    onClick={connectWallet}
                    disabled={isConnecting}
                    startIcon={isConnecting && <CircularProgress size={20} color="inherit" />}
                  >
                    {isConnecting ? 'Đang kết nối...' : 'Kết nối ví'}
                  </Button>
                )}
                {!isMobile && !isLoggedIn && (
                  <>
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/login"
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/register"
                    >
                      Đăng ký
                    </Button>
                    <Button
                      color="inherit"
                      variant="outlined"
                      component={RouterLink}
                      to="/admin"
                      sx={{ 
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Quản trị viên
                    </Button>
                  </>
                )}
                {active && (
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon sx={{ mr: 1 }} />
                      Ngắt kết nối ví
                    </MenuItem>
                  </Menu>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dialog chỉnh sửa thông tin cử tri */}
      <EditVoterDialog
        open={openEditVoter}
        onClose={handleCloseEditVoter}
        data={editVoterData}
        onChange={handleEditVoterChange}
        onSubmit={handleEditVoterSubmit}
        loading={editLoading}
        error={editError}
        success={editSuccess}
      />
    </>
  );
}

// Dialog chỉnh sửa thông tin cử tri
function EditVoterDialog({ open, onClose, data, onChange, onSubmit, loading, error, success }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <TextField
            label="Họ và tên"
            name="name"
            value={data.name}
            onChange={onChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Ngày sinh"
            name="birthDate"
            type="date"
            value={data.birthDate}
            onChange={onChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Địa chỉ"
            name="address"
            value={data.address}
            onChange={onChange}
            fullWidth
            margin="normal"
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>Cập nhật thành công!</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <LoadingButton type="submit" loading={loading} variant="contained">Lưu</LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default Header;