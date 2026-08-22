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
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import { useWeb3React } from '@web3-react/core';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

function LoginForm() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cccd: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!formData.cccd || !formData.password) {
        setError('Vui lòng nhập đầy đủ thông tin');
        setLoading(false);
        return;
      }
      if (!executeRecaptcha) {
        setError('Không thể xác thực reCAPTCHA. Vui lòng thử lại sau.');
        setLoading(false);
        return;
      }
      const recaptchaToken = await executeRecaptcha('login');
      console.log('reCAPTCHA token:', recaptchaToken);
      if (!recaptchaToken) {
        setError('Không lấy được mã xác thực reCAPTCHA. Vui lòng thử lại.');
        setLoading(false);
        return;
      }
      let data;
      let response;
      try {
        response = await fetch('https://votting-backend-a9d7.onrender.com/api/voters/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cccd: formData.cccd,
            password: formData.password,
            recaptchaToken,
          }),
        });
        try {
          data = await response.json();
        } catch (jsonErr) {
          setError('Lỗi khi phân tích dữ liệu trả về từ server.');
          setLoading(false);
          console.error('JSON parse error:', jsonErr);
          return;
        }
      } catch (fetchErr) {
        setError('Không thể kết nối tới server. Vui lòng kiểm tra mạng hoặc thử lại sau.');
        setLoading(false);
        console.error('Fetch error:', fetchErr);
        return;
      }
      if (!response.ok) {
        setError(data?.error || 'Đăng nhập thất bại');
        setLoading(false);
        return;
      }
      // Lưu JWT vào localStorage
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('isVoter', 'true');
      localStorage.setItem('voterCCCD', data.voter.cccd);
      localStorage.setItem('voterName', data.voter.fullName);
      if (account) {
        localStorage.setItem('walletAddress', account);
      }
      // Tắt timeout để tránh lỗi
      // setTimeout(() => {
      //   navigate('/elections');
      // }, 500);
      navigate('/elections');
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ fontFamily: 'Roboto, Arial, sans-serif', minHeight: '100vh', minWidth: '100%',
      marginTop: 7, 
     display: 'flex', alignItems: 'center', justifyContent: 'center', 
     background: 'linear-gradient(0deg, rgba(0, 85, 75, 0.1) 0%,rgb(255, 255, 255) 100%)' }}>
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
            background: 'linear-gradient(135deg, #fff 60%,rgb(245, 245, 245) 100%)',
            boxShadow: '0 8px 32px 0rgb(130, 255, 240)',
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
              textShadow: '0 2px 8pxrgb(202, 255, 249)'
            }}
          >
            Đăng nhập
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: 16, textAlign: 'center' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin} autoComplete="off">
            <TextField
              fullWidth
              label="Số CCCD"
              name="cccd"
              value={formData.cccd}
              onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
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
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                boxShadow: '0 4px 16px 0 rgba(159, 255, 244, 0.1)',
                transition: 'all 0.2s',
                '&:hover': {
                  background: '#0f6b5f',
                  boxShadow: '0 8px 24px 0 rgba(159, 255, 244, 0.1)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?{' '}
              <Link 
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{ 
                  color: '#169385',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default function Login() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY} language="vi">
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
} 