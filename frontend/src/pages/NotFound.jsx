import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();
    
    return (
        <Container maxWidth="md" className="mt-16">
            <Paper elevation={3} className="p-8 flex flex-col items-center">
                <ErrorOutlineIcon sx={{ fontSize: 80 }} color="error" />
                <Typography variant="h3" className="mt-4 mb-2 text-center">
                    404 Not Found
                </Typography>
                <Typography variant="body1" className="mb-6 text-center text-gray-600">
                    The page you're looking for doesn't exist!
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </Button>
            </Paper>
        </Container>
    );
}

export default NotFound;