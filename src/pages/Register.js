import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Grid,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import viLocale from 'date-fns/locale/vi';
import { subYears } from 'date-fns';
import { useWeb3React } from '@web3-react/core';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HowToRegIcon from '@mui/icons-material/HowToReg';

function RegisterForm() {
  const navigate = useNavigate();
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    cccd: '',
    fullName: '',
    address: '',
    birthDate: null,
    password: '',
    confirmPassword: '',
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Kiểm tra các trường bắt buộc
      if (!formData.cccd || !formData.fullName || !formData.address || 
          !formData.birthDate || !formData.password || !formData.confirmPassword) {
        setError('Vui lòng điền đầy đủ thông tin');
        setLoading(false);
        return;
      }
      // Kiểm tra mật khẩu xác nhận
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setLoading(false);
        return;
      }
      // Kiểm tra tuổi (phải trên 18 tuổi)
      const eighteenYearsAgo = subYears(new Date(), 18);
      if (formData.birthDate > eighteenYearsAgo) {
        setError('Bạn phải trên 18 tuổi để đăng ký');
        setLoading(false);
        return;
      }
      // Gọi API backend để đăng ký
      const response = await fetch('https://votting-backend-a9d7.onrender.com/api/voters/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cccd: formData.cccd,
          fullName: formData.fullName,
          address: formData.address,
          birthDate: formData.birthDate,
          password: formData.password,
          walletAddress: account || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Đăng ký thất bại');
        setLoading(false);
        return;
      }
      setSuccess('Đăng ký thành công!');
      // Lưu JWT nếu backend trả về (nếu muốn tự động đăng nhập)
      if (data.token) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('isVoter', 'true');
        localStorage.setItem('voterCCCD', data.voter?.cccd || formData.cccd);
        localStorage.setItem('voterName', data.voter?.fullName || formData.fullName);
        if (account) {
          localStorage.setItem('walletAddress', account);
        }
      }
      // Tắt timeout để tránh lỗi
      // setTimeout(() => {
      //   navigate('/elections');
      // }, 1500);
      navigate('/elections');
    } catch (error) {
      setError('Không thể đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container maxWidth="sm" sx={{ fontFamily: 'Roboto, Arial, sans-serif', 
    minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 7, 
    background: 'linear-gradient(0deg, rgba(0, 131, 116, 0.1) 0%,rgb(255, 255, 255) 100%)' }}>
      <Box sx={{ 
        mt: { xs: 2, md: 8 }, 
        mb: 4, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}>
        <Paper 
          elevation={4}
          sx={{
            p: { xs: 2, sm: 4 },
            width: '100%',
            maxWidth: 520,
            backgroundColor: '#fff',
            borderRadius: 5,
            boxShadow: '0 8px 32px 0rgb(187, 255, 247)',
            border: '1px solid #e3eafc',
            transition: 'box-shadow 0.3s',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <HowToRegIcon sx={{ 
              fontSize: 64, 
              color: '#169385',
              mb: 2,
              filter: 'drop-shadow(0 4px 12px #169385)'
            }} />
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                color: '#169385',
                fontWeight: 700,
                  fontSize: { xs: '1.8rem', sm: '2.125rem' },
                textAlign: 'center',
                letterSpacing: 1.2,
                textShadow: '0 2px 8pxrgb(164, 255, 244)'
              }}
            >
              Đăng Ký Cử Tri
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              align="center"
              sx={{ maxWidth: 420, mb: 3, fontSize: 17 }}
            >
              Vui lòng điền đầy đủ thông tin cử tri
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: 16, textAlign: 'center' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2, fontSize: 16, textAlign: 'center' }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CCCD"
                  value={formData.cccd}
                  onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                  required
                  placeholder="12 số CCCD"
                  variant="outlined"
                  InputLabelProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
                  sx={{
                    bgcolor: '#fafdff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: 17,
                      '&.Mui-focused fieldset': {
                        borderColor: '#169385',
                        boxShadow: '0 0 0 2px rgba(22,147,133,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  variant="outlined"
                  InputLabelProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
                  sx={{
                    bgcolor: '#fafdff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: 17,
                      '&.Mui-focused fieldset': {
                        borderColor: '#169385',
                        boxShadow: '0 0 0 2px rgba(22,147,133,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} >
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                  <DatePicker
                    label="Ngày sinh"
                    value={formData.birthDate}
                    onChange={(date) => setFormData({ ...formData, birthDate: date })}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required 
                        InputLabelProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
                        sx={{
                          bgcolor: '#fafdff',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: 17,
                            '&.Mui-focused fieldset': {
                              borderColor: '#169385',
                              boxShadow: '0 0 0 2px rgba(22,147,133,0.1)',
                            },
                          },
                        }}
                      />
                    )}
                    maxDate={subYears(new Date(), 18)}
                    format="dd/MM/yyyy"
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  variant="outlined"
                  multiline
                  rows={2}
                  InputLabelProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
                  sx={{
                    bgcolor: '#fafdff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: 17,
                      '&.Mui-focused fieldset': {
                        borderColor: '#169385',
                        boxShadow: '0 0 0 2px rgba(22,147,133,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  variant="outlined"
                  InputLabelProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    bgcolor: '#fafdff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: 17,
                      '&.Mui-focused fieldset': {
                        borderColor: '#169385',
                        boxShadow: '0 0 0 2px rgba(22,147,133,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  variant="outlined"
                  InputLabelProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    bgcolor: '#fafdff',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: 17,
                      '&.Mui-focused fieldset': {
                        borderColor: '#169385',
                        boxShadow: '0 0 0 2px rgba(22,147,133,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.7,
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    bgcolor: '#169385',
                    letterSpacing: 1.1,
                    boxShadow: '0 4px 16px 0rgb(185, 255, 247)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#169385',
                      boxShadow: '0 8px 24px 0rgb(189, 255, 247)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Đăng Ký'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default RegisterForm;
