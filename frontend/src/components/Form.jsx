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
        
        // Email is required for both login and registration when using Firebase
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
            // For login, try to authenticate directly with the backend first
            // This avoids the issue where Firebase rejects form-based login for Google-created accounts
            if (isLogin) {
                try {
                    // Try direct Django authentication first
                    const res = await api.post("/api/user/login/", { 
                        username, 
                        password,
                        email
                    });
                    
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                    navigate("/");
                } catch (backendError) {
                    // If backend authentication fails, then try Firebase
                    if (backendError.response && backendError.response.status === 401) {
                        // Now try with Firebase
                        try {
                            const authResult = await loginWithEmailAndPassword(email, password);
                            
                            if (authResult.error) {
                                setError(authResult.error.message);
                                setOpenAlert(true);
                                setLoading(false);
                                return;
                            }
                            
                            // If Firebase login succeeds, use firebase-auth endpoint
                            const firebaseUser = authResult.user;
                            const response = await api.post("/api/user/firebase-auth/", { 
                                username,
                                email: firebaseUser.email,
                                uid: firebaseUser.uid,
                                is_registration: false
                            });
                            
                            localStorage.setItem(ACCESS_TOKEN, response.data.access);
                            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                            navigate("/");
                        } catch (firebaseError) {
                            console.error("Firebase login error:", firebaseError);
                            setError("Invalid username or password. If you registered with Google, please use Google Sign-In.");
                            setOpenAlert(true);
                        }
                    } else {
                        handleBackendError(backendError);
                    }
                }
            } else {
                // For registration, use Firebase first as before
                const authResult = await registerWithEmailAndPassword(email, password);
                    
                if (authResult.error) {
                    setError(authResult.error.message);
                    setOpenAlert(true);
                    console.error(`Firebase registration error:`, authResult.error.code);
                    setLoading(false);
                    return;
                }
                
                console.log(`Firebase registration successful for:`, email);
                const firebaseUser = authResult.user;
                
                try {
                    // Register with backend
                    const response = await api.post("/api/user/firebase-auth/", { 
                        username,
                        email: firebaseUser.email,
                        uid: firebaseUser.uid,
                        is_registration: true,
                        password: password // Send the password so backend can store it
                    });
                    
                    // Registration flow - navigate to login
                    setError(""); // Clear any existing errors
                    navigate("/login");
                } catch (backendError) {
                    handleBackendError(backendError);
                }
            }
        } catch (error) {
            console.error("General auth error:", error);
            setError(`An unexpected error occurred: ${error.message}`);
            setOpenAlert(true);
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to handle backend errors
    const handleBackendError = (backendError) => {
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
    };
    
    // Handle Google Sign-in
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
                // Use firebase-auth endpoint - the same one used for form-based auth
                const response = await api.post("/api/user/firebase-auth/", { 
                    email: googleUser.email,
                    uid: googleUser.uid,
                    display_name: googleUser.displayName || "",
                    is_google_login: true
                });
                
                // Store the tokens and redirect
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                navigate("/");
            } catch (backendError) {
                handleBackendError(backendError);
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
                    
                    {/* Email field - now required for both login and registration */}
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