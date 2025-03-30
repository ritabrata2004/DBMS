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
    Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Link as RouterLink } from 'react-router-dom';

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const isLogin = method === "login";
    const name = isLogin ? "Login" : "Register";
    const icon = isLogin ? <LockOutlinedIcon /> : <PersonAddIcon />;

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password })
            if (isLogin) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/")
            } else {
                navigate("/login")
            }
        } catch (error) {
            alert(error)
        } finally {
            setLoading(false)
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