import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import { registerWithEmailAndPassword, loginWithEmailAndPassword, signInWithGoogle } from "../firebase";
import { 
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Avatar,
    Link,
    Alert,
    Collapse,
    IconButton,
    Divider
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import { Link as RouterLink } from 'react-router-dom';

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openAlert, setOpenAlert] = useState(false);
    const navigate = useNavigate();

    const isLogin = method === "login";
    const name = isLogin ? "Login" : "Register";
    const icon = isLogin ? <LockOutlinedIcon /> : <PersonAddIcon />;

    // Validate form before submission
    const validateForm = () => {
        if (!username.trim()) {
            setError("Username is required");
            setOpenAlert(true);
            return false;
        }
        
        if (!email.trim()) {
            setError("Email is required");
            setOpenAlert(true);
            return false;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            setOpenAlert(true);
            return false;
        }
        
        if (!password) {
            setError("Password is required");
            setOpenAlert(true);
            return false;
        }
        
        if (!isLogin && password.length < 6) {
            setError("Password must be at least 6 characters");
            setOpenAlert(true);
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setOpenAlert(false);
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            // First handle Firebase authentication
            console.log(`Attempting ${isLogin ? 'login' : 'registration'} with email: ${email}`);
            
            const authResult = isLogin 
                ? await loginWithEmailAndPassword(email, password)
                : await registerWithEmailAndPassword(email, password);
                
            if (authResult.error) {
                setError(authResult.error.message);
                setOpenAlert(true);
                setLoading(false);
                console.error("Firebase auth error:", authResult.error.code);
                return;
            }
            
            console.log("Firebase auth success, proceeding with backend auth");
            
            // If Firebase auth is successful, proceed with backend auth
            try {
                const res = await api.post(route, { username, password });
                
                if (isLogin) {
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                    navigate("/");
                } else {
                    // On successful registration
                    navigate("/login");
                }
            } catch (backendError) {
                console.error("Backend auth error:", backendError);
                
                if (backendError.response) {
                    const data = backendError.response.data;
                    
                    if (data.username) {
                        setError(`Username error: ${data.username.join(', ')}`);
                    } else if (data.password) {
                        setError(`Password error: ${data.password.join(', ')}`);
                    } else if (data.detail) {
                        setError(data.detail);
                    } else {
                        setError(`Error: ${backendError.response.status} ${backendError.response.statusText}`);
                    }
                } else if (backendError.request) {
                    setError("Network error: Unable to connect to the server. Please check if the server is running.");
                } else {
                    setError(`Error: ${backendError.message}`);
                }
                
                setOpenAlert(true);
            }
        } catch (error) {
            console.error("General auth error:", error);
            setError(`An unexpected error occurred: ${error.message}`);
            setOpenAlert(true);
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to generate a secure password for Google users
    const generateSecurePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';
        
        // Generate a 20-character random password
        for (let i = 0; i < 20; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return password;
    };
    
    // Handle Google Sign-in without a dedicated backend endpoint
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        setOpenAlert(false);
        
        try {
            const authResult = await signInWithGoogle();
            
            if (authResult.error) {
                setError(authResult.error.message);
                setOpenAlert(true);
                setLoading(false);
                console.error("Google auth error:", authResult.error.code);
                return;
            }
            
            // If we get here, Google auth was successful
            const googleUser = authResult.user;
            console.log("Google auth success for:", googleUser.email);
            
            try {
                // We now have a Google user, let's connect with our backend
                if (isLogin) {
                    // For login, use the google-auth endpoint
                    const response = await api.post("/api/user/google-auth/", { 
                        email: googleUser.email,
                        uid: googleUser.uid,
                        display_name: googleUser.displayName || ""
                    });
                    
                    // Store the tokens and redirect
                    localStorage.setItem(ACCESS_TOKEN, response.data.access);
                    localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                    navigate("/");
                } else {
                    // For registration, use the standard registration endpoint
                    // Generate a username from the Google account
                    const suggestedUsername = googleUser.displayName || 
                        googleUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
                    
                    // Prefill the form fields for a better user experience
                    setUsername(suggestedUsername);
                    setEmail(googleUser.email);
                    
                    setError("Google sign-in successful! Please complete your registration by submitting the form.");
                    setOpenAlert(true);
                }
            } catch (backendError) {
                console.error("Backend error after Google sign-in:", backendError);
                
                if (backendError.response) {
                    const data = backendError.response.data;
                    
                    if (data.detail) {
                        setError(`Backend error: ${data.detail}`);
                    } else if (data.username) {
                        setError(`Username error: ${data.username.join(', ')}`);
                    } else if (data.email) {
                        setError(`Email error: ${data.email.join(', ')}`);
                    } else {
                        setError(`Error: ${backendError.response.status} ${backendError.response.statusText}`);
                    }
                    
                    setOpenAlert(true);
                } else {
                    setError("Network error connecting to backend after Google sign-in");
                    setOpenAlert(true);
                }
            }
        } catch (error) {
            console.error("General Google auth error:", error);
            setError(`Google sign-in error: ${error.message}`);
            setOpenAlert(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 4, 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                    {icon}
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ mb: 3, color: 'text.primary' }}>
                    {name}
                </Typography>
                
                <Collapse in={openAlert} sx={{ width: '100%', mb: 2 }}>
                    <Alert 
                        severity="error"
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setOpenAlert(false);
                                }}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                    >
                        {error}
                    </Alert>
                </Collapse>
                
                {/* Google Sign In Button */}
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    sx={{ 
                        mb: 2,
                        py: 1,
                        borderColor: '#4285F4',
                        color: '#4285F4',
                        '&:hover': {
                            borderColor: '#4285F4',
                            backgroundColor: 'rgba(66, 133, 244, 0.04)',
                        }
                    }}
                >
                    {isLogin ? "Sign in with Google" : "Sign up with Google"}
                </Button>
                
                <Divider sx={{ width: '100%', mb: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                        OR
                    </Typography>
                </Divider>
                
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{
                            '& label': { color: 'text.secondary' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                            }
                        }}
                    />
                    
                    {/* Email field */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                            '& label': { color: 'text.secondary' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                            }
                        }}
                    />
                    
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{
                            '& label': { color: 'text.secondary' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                            }
                        }}
                    />
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {name}
                    </Button>
                    
                    {loading && <LoadingIndicator />}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        {isLogin ? (
                            <Link component={RouterLink} to="/register" variant="body2" sx={{ color: 'primary.main' }}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        ) : (
                            <Link component={RouterLink} to="/login" variant="body2" sx={{ color: 'primary.main' }}>
                                {"Already have an account? Sign In"}
                            </Link>
                        )}
                    </Box>
                </form>
            </Paper>
            
            {/* Add a help section */}
            <Box mt={2} textAlign="center">
                <Typography variant="caption" color="text.secondary">
                    Having trouble signing in? Make sure you've registered first.
                </Typography>
            </Box>
        </Container>
    );
}

export default Form;