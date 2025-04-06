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
  ListItemIcon,
  alpha
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Storage as StorageIcon,
  QueryStats as QueryStatsIcon,
  Description as DescriptionIcon,
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon
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
    { name: 'Metadata Manager', path: '/db-tester', icon: <DashboardIcon /> }
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
    <Box sx={{ 
      width: 280, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.background.paper,
      backgroundImage: 'linear-gradient(rgba(30, 36, 50, 0.97), rgba(21, 26, 37, 0.95))'
    }}>
      <Box sx={{ 
        p: 2.5, 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.5)
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          background: 'linear-gradient(45deg, #6596EB, #BB86FC)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          LLM Query System
        </Typography>
      </Box>
      
      <List sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => handleNavigate(item.path)}
              selected={isActive(item.path)}
              sx={{ 
                borderRadius: '8px',
                transition: 'all 0.2s ease-in-out',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.25),
                  }
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 0.1),
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                minWidth: '42px'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 600 : 400,
                  color: isActive(item.path) ? theme.palette.text.primary : theme.palette.text.secondary,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ 
        mt: 'auto', 
        p: 2, 
        borderTop: '1px solid', 
        borderColor: alpha(theme.palette.divider, 0.5),
        backgroundImage: 'linear-gradient(rgba(21, 26, 37, 0.8), rgba(30, 36, 50, 0.9))',
      }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          startIcon={<AccountCircleIcon />}
          onClick={() => handleNavigate('/profile')}
          sx={{ 
            mb: 1.5, 
            borderRadius: '8px',
            py: 1,
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-2px)',
            },
            justifyContent: 'flex-start',
            pl: 2
          }}
        >
          User Profile
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ 
            borderRadius: '8px',
            py: 1,
            background: 'linear-gradient(45deg, #5581D9 10%, #6596EB 90%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #4B74C7 10%, #5889DB 90%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              transform: 'translateY(-2px)',
            },
            justifyContent: 'flex-start',
            pl: 2
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        backgroundImage: 'linear-gradient(rgba(26, 32, 46, 0.95), rgba(30, 36, 50, 0.97))',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.1),
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                mr: 2,
                color: theme.palette.primary.light,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                }
              }}
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
            fontWeight: 600,
            cursor: 'pointer',
            background: 'linear-gradient(45deg, #6596EB, #BB86FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.01em',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
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
                onClick={() => handleNavigate(item.path)}
                startIcon={item.icon}
                sx={{ 
                  mx: 0.8, 
                  px: 2,
                  py: 1,
                  color: isActive(item.path) ? theme.palette.primary.light : alpha(theme.palette.text.primary, 0.8),
                  fontWeight: isActive(item.path) ? 500 : 400,
                  position: 'relative',
                  borderRadius: '8px',
                  '&:after': isActive(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    width: '60%',
                    height: '3px',
                    bgcolor: theme.palette.primary.main,
                    borderRadius: '4px',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg, #5581D9, #BB86FC)',
                  } : {},
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
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
            onClick={handleMenuOpen}
            sx={{ 
              ml: 1,
              transition: 'all 0.2s',
              border: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                transform: 'scale(1.05)',
              },
              p: 0.2,
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: alpha(theme.palette.primary.main, 0.9),
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: 600
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
              elevation: 5,
              sx: { 
                minWidth: 200, 
                mt: 1.5,
                bgcolor: theme.palette.background.paper,
                backgroundImage: 'linear-gradient(rgba(30, 36, 50, 0.97), rgba(21, 26, 37, 0.98))',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.divider, 0.08),
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                overflow: 'hidden',
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.background.paper, 0.4),
              borderBottom: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: theme.palette.primary.main,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    mr: 1.5
                  }}
                >
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {username}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Signed in
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <MenuItem 
              onClick={() => {
                handleMenuClose();
                navigate('/profile');
              }}
              sx={{ 
                p: 1.5,
                mx: 1,
                mt: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <AccountCircleIcon 
                fontSize="small" 
                sx={{ 
                  mr: 2,
                  color: theme.palette.primary.light
                }} 
              />
              <Typography variant="body2">User Profile</Typography>
            </MenuItem>
            
            <MenuItem 
              onClick={handleLogout}
              sx={{ 
                p: 1.5,
                mx: 1,
                my: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.light
                },
              }}
            >
              <LogoutIcon 
                fontSize="small" 
                sx={{ 
                  mr: 2,
                  color: theme.palette.error.main
                }} 
              />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;