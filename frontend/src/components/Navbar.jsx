import { useState, useEffect } from 'react';
import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Storage as StorageIcon,
  QueryStats as QueryStatsIcon,
  Description as DescriptionIcon,
  AccountCircle as AccountCircleIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../constants';
import api from '../api';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [username, setUsername] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Check if current route matches the given path
  const isActive = (path) => location.pathname === path;
  
  // Navigation items
  const navItems = [
    { name: 'Databases', path: '/databases', icon: <StorageIcon /> },
    { name: 'Metadata Manager', path: '/db-tester', icon: <StorageIcon /> }
  ];
  
  // Fetch username on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Try to get username from JWT token
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
          // Decode the token to get user information
          const decoded = jwtDecode(token);
          if (decoded.username) {
            setUsername(decoded.username);
            return;
          }
        }
        
        // If we can't get it from the token, fetch from API
        const response = await api.get('/api/user/me/');
        if (response.data && response.data.username) {
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    
    fetchUserInfo();
  }, []);
  
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    navigate('/logout');
  };
  
  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };
  
  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Typography variant="h6" sx={{ px: 2, mb: 2 }}>
        LLM Query System
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/profile')}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="User Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <AppBar position="static" elevation={1} color="primary">
      <Toolbar>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              {drawer}
            </Drawer>
          </>
        ) : null}
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            cursor: 'pointer'
          }}
          onClick={() => navigate('/databases')}
        >
          LLM Query System
        </Typography>
        
        {/* Desktop navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Button 
                key={item.name}
                color="inherit"
                onClick={() => handleNavigate(item.path)}
                sx={{ 
                  mx: 0.5, 
                  borderRadius: 2,
                  borderBottom: isActive(item.path) ? '3px solid white' : 'none',
                  paddingBottom: isActive(item.path) ? '3px' : '6px'
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        )}
        
        {/* User menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit" 
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.dark',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 180, mt: 1.5 }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem sx={{ pointerEvents: 'none', opacity: 0.7 }}>
              <Typography variant="body2">Signed in as {username}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
              handleMenuClose();
              navigate('/profile');
            }}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
              User Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;