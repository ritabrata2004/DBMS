import { useState } from "react";
import api from "../api";
import "../styles/Home.css";
import { 
  Container, 
  Typography, 
  Paper, 
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  AppBar,
  Toolbar
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";

function Home() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setLoading(true);
        try {
            // This will be replaced with your actual API call
            // const res = await api.post("/api/query/", { prompt: query });
            // setResponse(res.data.response);
            
            // Placeholder for now
            setTimeout(() => {
                setResponse(`This is a simulated response to your query: "${query}"`);
                setHistory(prev => [...prev, { query, response: `Response to: ${query}` }]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error("Error querying LLM:", error);
            setLoading(false);
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" className="mb-4">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        LLM Query System
                    </Typography>
                    <IconButton 
                        color="inherit" 
                        onClick={() => navigate('/logout')}
                        aria-label="logout"
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            
            <Container maxWidth="lg" className="py-4">
                <Grid container spacing={3}>
                    {/* Query Input Section */}
                    <Grid item xs={12}>
                        <Paper elevation={3} className="p-4">
                            <Typography variant="h5" className="mb-4 text-gray-800 font-semibold">
                                Ask a Question
                            </Typography>
                            
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Enter your query"
                                    variant="outlined"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    multiline
                                    rows={3}
                                    className="mb-3"
                                />
                                <Box className="flex justify-end">
                                    <Button 
                                        type="submit"
                                        variant="contained" 
                                        color="primary"
                                        endIcon={<SendIcon />}
                                        disabled={loading || !query.trim()}
                                        className="hover:bg-blue-700 transition-colors"
                                    >
                                        {loading ? "Sending..." : "Send Query"}
                                    </Button>
                                </Box>
                            </form>
                        </Paper>
                    </Grid>
                    
                    {/* Response Section */}
                    {response && (
                        <Grid item xs={12}>
                            <Paper elevation={2} className="p-4 bg-gray-50">
                                <Typography variant="h5" className="mb-2 text-gray-800 font-semibold">
                                    Response
                                </Typography>
                                <Divider className="mb-3" />
                                <Typography variant="body1" className="whitespace-pre-line">
                                    {response}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                    
                    {/* History Section */}
                    {history.length > 0 && (
                        <Grid item xs={12} className="mt-4">
                            <Typography variant="h5" className="mb-3 flex items-center">
                                <HistoryIcon className="mr-2" /> Query History
                            </Typography>
                            
                            <Grid container spacing={2}>
                                {history.map((item, index) => (
                                    <Grid item xs={12} md={6} key={index}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle1" className="font-semibold">
                                                    Query:
                                                </Typography>
                                                <Typography variant="body2" className="mb-2">
                                                    {item.query}
                                                </Typography>
                                                <Divider className="my-2" />
                                                <Typography variant="subtitle1" className="font-semibold mt-2">
                                                    Response:
                                                </Typography>
                                                <Typography variant="body2" noWrap>
                                                    {item.response}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" color="primary">
                                                    View Full
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
}

export default Home;
