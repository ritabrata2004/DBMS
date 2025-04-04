import React, { useState, useEffect } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    IconButton, 
    Container, 
    Box,
    Button,
    Avatar,
    Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../constants';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // First try to get username from JWT token
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
    
    const handleLogout = () => {
        navigate('/logout');
    };
    
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh', 
            bgcolor: 'background.default',
            color: 'text.primary'
        }}>
            <AppBar position="static" elevation={0} color="primary">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        LLM Query System
                    </Typography>
                    
                    {/* User Greeting */}
                    {username && (
                        <Chip
                            avatar={<Avatar sx={{ bgcolor: 'primary.dark' }}>{username.charAt(0).toUpperCase()}</Avatar>}
                            label={`Hey ${username}`}
                            variant="outlined"
                            sx={{ 
                                mr: 2, 
                                color: 'white', 
                                borderColor: 'rgba(255,255,255,0.5)',
                                '& .MuiChip-label': {
                                    fontWeight: 500
                                }
                            }}
                        />
                    )}
                    
                    <Button 
                        color="inherit"
                        onClick={handleLogout}
                        endIcon={<LogoutIcon />}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            
            <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
                {children}
            </Container>
            
            <Box component="footer" sx={{ 
                py: 2, 
                mt: 'auto', 
                backgroundColor: 'background.paper', 
                borderTop: '1px solid', 
                borderColor: 'divider' 
            }}>
                <Container maxWidth="lg">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} LLM Query System
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;
