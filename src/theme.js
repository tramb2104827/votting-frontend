import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#169385',
      contrastText: '#fff',
    },
    secondary: {
      main: '#80CBC4',
      contrastText: '#fff',
    },
    background: {
      default: '#18191A',
      paper: '#23272F',
    },
    text: {
      primary: '#fff',
      secondary: '#ccc',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          '&:hover': {
            backgroundColor: '#80CBC4',
          },
          color: '#fff',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(22,147,133,0.2)',
          '&:hover': {
                          boxShadow: '0 4px 8px rgba(22,147,133,0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,179,173,0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
                      '&:hover fieldset': {
            borderColor: '#169385',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#169385',
          },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#333333',
          boxShadow: '0 2px 4px rgba(22,147,133,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(22,147,133,0.1)',
          },
        },
      },
    },
  },
});

export default theme; 