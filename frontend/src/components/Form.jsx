import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
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
    IconButton
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openAlert, setOpenAlert] = useState(false);
    const navigate = useNavigate();

    const isLogin = method === "login";
    const name = isLogin ? "Login" : "Register";
    const icon = isLogin ? <LockOutlinedIcon /> : <PersonAddIcon />;

    const handleSubmit = async (e) => {
        setLoading(true);
        setError("");
        setOpenAlert(false);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password })
            if (isLogin) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                // Redirect to the sessions page instead of creating sessions automatically
                navigate("/sessions")
            } else {
                navigate("/login")
            }
        } catch (error) {
            console.error("Auth error:", error);
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const data = error.response.data;
                
                if (data.username) {
                    setError(`Username error: ${data.username.join(', ')}`);
                } else if (data.password) {
                    setError(`Password error: ${data.password.join(', ')}`);
                } else if (data.detail) {
                    setError(data.detail);
                } else {
                    setError(`Error: ${error.response.status} ${error.response.statusText}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError("Network error: Unable to connect to the server. Please check if the server is running.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`Error: ${error.message}`);
            }
            
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
        </Container>
    );
}

export default Form;