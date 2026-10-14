import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Breadcrumbs, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import Inventory2Icon from '@mui/icons-material/Inventory2Outlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../auth/AuthContext.jsx';

const WIDTH = 264;
const SIDEBAR = '#111827';
const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/products', label: 'Products', icon: <Inventory2Icon /> },
  { to: '/categories', label: 'Categories', icon: <CategoryIcon /> },
];
const TITLES = { '/dashboard': 'Dashboard', '/products': 'Products', '/categories': 'Categories' };

function SidebarContent({ onNavigate }) {
  const { user, signOut } = useAuth();
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: SIDEBAR, color: '#cbd5e1' }}>
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: '#fff' }}>
          <StorefrontIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ color: '#fff' }}>Store Admin</Typography>
      </Box>

      <Typography variant="caption" sx={{ px: 3, pt: 1.5, pb: 1, color: '#64748b', fontWeight: 600 }}>Menu</Typography>
      <List sx={{ px: 1.5 }}>
        {NAV.map((n) => (
          <ListItemButton
            key={n.to}
            component={NavLink}
            to={n.to}
            onClick={onNavigate}
            sx={{
              borderRadius: 2, mb: 0.5, py: 1.1, color: '#94a3b8',
              '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
              '&:hover': { bgcolor: 'rgba(255,255,255,.06)', color: '#fff' },
              '&.active': { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.main' } },
            }}
          >
            <ListItemIcon>{n.icon}</ListItemIcon>
            <ListItemText primary={n.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14.5 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ m: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 38, height: 38 }} />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body2" noWrap sx={{ color: '#fff', fontWeight: 600 }}>{user?.name}</Typography>
          <Typography variant="caption" noWrap component="div" sx={{ color: '#94a3b8' }}>{user?.email}</Typography>
        </Box>
        <Tooltip title="Sign out">
          <IconButton onClick={signOut} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }} aria-label="Sign out">
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default function Layout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery((t) => t.breakpoints.up('md'));
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ ml: { md: `${WIDTH}px` }, width: { md: `calc(100% - ${WIDTH}px)` }, bgcolor: '#fff', borderBottom: '1px solid #e8ecf3' }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          {!isDesktop && (
            <IconButton edge="start" onClick={() => setOpen(true)} sx={{ mr: 1 }} aria-label="Open menu"><MenuIcon /></IconButton>
          )}
          <Breadcrumbs separator="/">
            <Typography variant="body2" color="text.secondary">Home</Typography>
            <Typography variant="body2" fontWeight={600}>{TITLES[pathname] ?? ''}</Typography>
          </Breadcrumbs>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" fontWeight={600} sx={{ mr: 1.5, display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
          <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Account menu">
            <Avatar src={user?.avatar} alt={user?.name} sx={{ width: 34, height: 34 }} />
          </IconButton>
          <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
            <MenuItem disabled>{user?.email}</MenuItem>
            <MenuItem onClick={signOut}><LogoutIcon fontSize="small" sx={{ mr: 1 }} />Sign out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop || open}
          onClose={() => setOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: WIDTH, boxSizing: 'border-box', border: 'none' } }}
        >
          <SidebarContent onNavigate={() => setOpen(false)} />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: 8, minWidth: 0 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}