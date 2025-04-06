import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../constants';
import api from '../api';
import Layout from '../components/Layout';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Try to get basic info from JWT token
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
          try {
            const decoded = jwtDecode(token);
            setUser(prev => ({
              ...prev,
              username: decoded.username || '',
            }));
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
        
        // Get detailed user info from API
        const response = await api.get('/api/user/me/');
        setUser({
          username: response.data.username,
          email: response.data.email || '',
        });
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      await api.patch('/api/user/me/', {
        email: user.email,
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={() => navigate('/databases')} 
            color="primary" 
            aria-label="back to databases" 
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" gutterBottom>
            User Profile
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mr: 3, 
                fontSize: '2rem',
                bgcolor: 'primary.main' 
              }}
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Account Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account information
              </Typography>
            </Box>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              name="username"
              value={user.username}
              disabled
              variant="outlined"
              sx={{ mb: 3 }}
              helperText="Username cannot be changed"
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Email Address"
              name="email"
              value={user.email}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
              sx={{ mt: 2, py: 1.5 }}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </form>
        </Paper>
      </Container>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          variant="filled"
        >
          Profile updated successfully
        </Alert>
      </Snackbar>
    </>
  );
}

export default UserProfile;