import { useState } from 'react';
import { Alert, Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import Inventory2Icon from '@mui/icons-material/Inventory2Outlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import ShieldIcon from '@mui/icons-material/VerifiedUserOutlined';
import { useAuth } from '../auth/AuthContext.jsx';

const FEATURES = [
  { icon: <Inventory2Icon />, text: 'Add, edit and remove products in seconds' },
  { icon: <CategoryIcon />, text: 'Keep your categories organised' },
  { icon: <ShieldIcon />, text: 'Secure sign-in with JWT tokens' },
];

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('john@mail.com');
  const [password, setPassword] = useState('changeme');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Enter your email and password.');
    setBusy(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message === 'Unauthorized' ? 'Email or password is incorrect.' : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' } }}>
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between',
          p: 7, color: '#fff', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(150deg, #3a56e0 0%, #2a3aa8 55%, #1b2470 100%)',
        }}
      >
        <Box sx={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', border: '1px solid rgba(255,255,255,.14)', top: -160, right: -180 }} />
        <Box sx={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(255,255,255,.14)', bottom: -120, left: -100 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
            <StorefrontIcon />
          </Box>
          <Typography variant="h6">Store Admin</Typography>
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 460 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1.15, mb: 2 }}>
            Run your whole store from one dashboard.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.75)', mb: 4 }}>
            Manage products and categories with live data from the Platzi Fake Store API.
          </Typography>
          {FEATURES.map((f) => (
            <Box key={f.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center' }}>{f.icon}</Box>
              <Typography variant="body2">{f.text}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.6)', position: 'relative' }}>
          Built with React and Material UI
        </Typography>
      </Box>

      {/* Form panel */}
      <Box sx={{ display: 'grid', placeItems: 'center', p: 3, bgcolor: 'background.paper' }}>
        <Box component="form" onSubmit={submit} sx={{ width: '100%', maxWidth: 400 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
            <StorefrontIcon color="primary" />
            <Typography variant="h6">Store Admin</Typography>
          </Box>

          <Typography variant="h4" gutterBottom>Welcome back</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Sign in to manage your products and categories.</Typography>

          <Alert severity="info" icon={false} sx={{ mb: 2, borderRadius: 2 }}>
            Demo account is pre-filled: <b>john@mail.com</b> / <b>changeme</b>
          </Alert>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <TextField
            label="Email" type="email" fullWidth margin="normal" value={email}
            onChange={(e) => setEmail(e.target.value)} autoFocus
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> } }}
          />
          <TextField
            label="Password" type={show ? 'text' : 'password'} fullWidth margin="normal" value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label="Toggle password visibility">
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={busy} sx={{ mt: 3, py: 1.4 }}>
            {busy ? 'Signing in...' : 'Sign in'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}