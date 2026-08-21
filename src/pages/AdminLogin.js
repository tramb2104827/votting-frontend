import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

function AdminLogin() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [cccd, setCCCD] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập admin, chuyển hướng đến trang quản trị
    const jwt = localStorage.getItem('jwt');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (jwt && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    try {
      // Gọi API backend để đăng nhập admin
      const response = await axios.post('http://localhost:5000/api/admins/login', {
        cccd,
        password
      });
      const data = response.data;
      if (data.token) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminCCCD', data.admin.cccd);
        localStorage.setItem('adminName', data.admin.name);
        localStorage.setItem('adminEmail', data.admin.email);
        if (data.admin.isSuperAdmin) {
          localStorage.setItem('isSuperAdmin', 'true');
        } else {
          localStorage.removeItem('isSuperAdmin');
        }
        setSuccess(true);
        // Tắt timeout để tránh lỗi
        // setTimeout(() => {
        //   navigate('/admin/dashboard');
        // }, 1000);
        navigate('/admin/dashboard');
      } else {
        setError('CCCD hoặc mật khẩu không chính xác');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setCCCD(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ fontFamily: 'Roboto, Arial, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f7fafd' }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
          width: '100%',
        }}
      >
        <Paper 
          elevation={4} 
          sx={{ 
            p: { xs: 2, sm: 4 },
            borderRadius: 5,
            background: 'linear-gradient(135deg, #fff 60%, rgba(22,147,133,0.1) 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 135, 128, 0.1)',
            border: '1px solid #e3eafc',
            maxWidth: 420,
            width: '100%',
            transition: 'box-shadow 0.3s',
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 700,
              color: '#169385',
              mb: 4,
              letterSpacing: 1.2,
              textShadow: '0 2px 8px rgba(66, 255, 246, 0.08)'
            }}
          >
            Đăng nhập Admin
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: 16, textAlign: 'center' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: 16, textAlign: 'center' }}>
              Đăng nhập thành công! Đang chuyển hướng...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Tên đăng nhập"
              name="username"
              value={cccd}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
              sx={{ mb: 3, bgcolor: '#fafdff', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 17, '&.Mui-focused fieldset': { borderColor: '#169385', boxShadow: '0 0 0 2px rgba(22,147,133,0.1)' } } }}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, bgcolor: '#fafdff', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 17, '&.Mui-focused fieldset': { borderColor: '#169385', boxShadow: '0 0 0 2px rgba(22,147,133,0.1)' } } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 3,
                py: 1.7,
                background: '#169385',
                borderRadius: 3,
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: 1.1,
                boxShadow: '0 4px 16px 0 rgba(25,118,210,0.10)',
                transition: 'all 0.2s',
                '&:hover': {
                  background: '#169385',
                  boxShadow: '0 8px 24px 0 rgba(115, 255, 229, 0.18)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Quay lại{' '}
              <Link 
                component="button"
                variant="body2"
                onClick={() => navigate('/')}
                sx={{ 
                  color: '#169385',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                trang chủ
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminLogin; 
