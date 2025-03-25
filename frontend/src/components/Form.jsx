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
        <Container maxWidth="xs" className="mt-16">
            <Paper elevation={3} className="p-6">
                <Box className="flex flex-col items-center">
                    <Avatar className="bg-primary mb-2">
                        {icon}
                    </Avatar>
                    <Typography variant="h5" className="mb-4">
                        {name}
                    </Typography>
                    
                    <form onSubmit={handleSubmit} className="w-full">
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
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            className="mt-4 mb-2"
                            disabled={loading}
                        >
                            {name}
                        </Button>
                        
                        {loading && <LoadingIndicator />}
                        
                        <Box className="flex justify-center mt-3">
                            {isLogin ? (
                                <Link component={RouterLink} to="/register" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            ) : (
                                <Link component={RouterLink} to="/login" variant="body2">
                                    {"Already have an account? Sign In"}
                                </Link>
                            )}
                        </Box>
                    </form>
                </Box>
            </Paper>
        </Container>
    );
}

export default Form;