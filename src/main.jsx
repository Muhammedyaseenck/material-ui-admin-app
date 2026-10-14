import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';

const theme = createTheme({
  palette: {
    primary: { main: '#4361ee', dark: '#2f45c4' },
    success: { main: '#12b76a' },
    warning: { main: '#f79009' },
    error: { main: '#f04438' },
    background: { default: '#f4f6fb', paper: '#ffffff' },
    text: { primary: '#1d2433', secondary: '#667085' },
    divider: '#e8ecf3',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Public Sans", system-ui, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid #e8ecf3', boxShadow: '0 1px 2px rgba(16,24,40,.04), 0 6px 18px rgba(16,24,40,.04)' },
      },
    },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#eef1f6' },
        head: { fontWeight: 600, color: '#667085', background: '#f8f9fc', fontSize: 13 },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700 } } },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);