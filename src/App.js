import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { Web3Provider as Web3ContextProvider } from './contexts/Web3Context';
import AppRoutes from './routes';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ElectionList from './pages/ElectionList';
import ElectionDetail from './pages/ElectionDetail';
import ElectionResultsReport from './pages/ElectionResultsReport';
import NotFound from './components/NotFound';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Create Theme 
const theme = createTheme({
  palette: {
    primary: {
      main: '#169385',
      light: '#80CBC4',
      dark: '#0f6b5f',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#80CBC4',
      light: '#a7e8e0',
      dark: '#4db6ac',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: '#141619',
      secondary: '#2C2E3A',
    },
    divider: '#169385',
    error: {
      main: '#FF3B3B',
      contrastText: '#fff',
    },
    success: {
      main: '#00C896',
      contrastText: '#fff',
    },
    warning: {
      main: '#FFB300',
      contrastText: '#fff',
    },
    info: {
      main: '#169385',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#0f6b5f',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(22,147,133,0.08)',
          background: '#fff',
          color: '#141619',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(22,147,133,0.1)',
          background: '#141619',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#fff',
          color: '#141619',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '1rem',
        },
        standardError: {
          background: '#FF3B3B',
          color: '#fff',
        },
        standardSuccess: {
          background: '#00C896',
          color: '#fff',
        },
        standardWarning: {
          background: '#FFB300',
          color: '#fff',
        },
        standardInfo: {
          background: '#2196F3',
          color: '#fff',
        },
      },
    },
  },
});

// Route guard for admin routes
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  console.log('AdminRoute check:', isAdmin);
  return isAdmin ? children : <Navigate to="/admin" />;
};

// Route guard for voter routes
const VoterRoute = ({ children }) => {
  const isVoter = localStorage.getItem('isVoter') === 'true';
  console.log('VoterRoute check:', isVoter);
  return isVoter ? children : <Navigate to="/login" />;
};

function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

function AppWithFooterControl() {
  const location = useLocation();
  const isAdminDashboard = location.pathname.startsWith('/admin');
  return (
    <>
      <Header />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: '#f5f5f5'
      }}>
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: 0,
            pb: 0,
            mt: 0,
          }}
        >
          <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/elections" element={
                      <VoterRoute>
                        <ElectionList />
                      </VoterRoute>
                    } />
                    <Route path="/elections/:id" element={
                      <VoterRoute>
                        <ElectionDetail />
                      </VoterRoute>
                    } />
                    <Route path="/elections/:id/results" element={
                      <AdminRoute>
                        <ElectionResultsReport />
                      </AdminRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Box>
                {!isAdminDashboard && <Footer />}
              </Box>
            </>
          );
        }

function App() {
  // Check for existing login on app start
  useEffect(() => {
    const voterCCCD = localStorage.getItem('voterCCCD');
    const adminCCCD = localStorage.getItem('adminCCCD');
    
    console.log('App init - voter login:', !!voterCCCD);
    console.log('App init - admin login:', !!adminCCCD);
  }, []);

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ContextProvider>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
            <CssBaseline />
            <Router>
              <AppWithFooterControl />
            </Router>
          </LocalizationProvider>
        </ThemeProvider>
      </Web3ContextProvider>
    </Web3ReactProvider>
  );
}

export default App;
