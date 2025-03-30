import React from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    IconButton, 
    Container, 
    Box,
    Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    
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
