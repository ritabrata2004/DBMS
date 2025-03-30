import { useState, useEffect } from "react";
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
  Toolbar,
  Drawer,
  Chip
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";
import SessionSelector from "../components/SessionSelector";
import LoadingIndicator from "../components/LoadingIndicator";

function Home() {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();
    
    // Session management states
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [currentSession, setCurrentSession] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // On component mount, we need to either load the user's most recent session
    // or create a new one if none exists
    useEffect(() => {
        const initializeSession = async () => {
            try {
                // Try to get user's sessions
                const sessionsResponse = await api.getSessions();
                const sessions = sessionsResponse.data;
                
                if (sessions.length > 0) {
                    // If user has sessions, load the most recent one
                    const mostRecentSession = sessions[0]; // API returns sessions ordered by updated_at
                    loadSession(mostRecentSession.id);
                } else {
                    // If user has no sessions, create a new one
                    const newSessionResponse = await api.createSession("New Session");
                    setCurrentSessionId(newSessionResponse.data.id);
                    setCurrentSession(newSessionResponse.data);
                    setInitialLoading(false);
                }
            } catch (error) {
                console.error("Error initializing session:", error);
                setInitialLoading(false);
            }
        };
        
        initializeSession();
    }, []);

    // Load a specific session by ID
    const loadSession = async (sessionId) => {
        if (!sessionId) return;
        
        setInitialLoading(true);
        try {
            const sessionResponse = await api.getSession(sessionId);
            setCurrentSessionId(sessionId);
            setCurrentSession(sessionResponse.data);
            
            // If there are queries in this session, set the most recent response
            const queries = sessionResponse.data.queries;
            if (queries && queries.length > 0) {
                setResponse(queries[queries.length - 1].response);
            } else {
                setResponse("");
            }
            
            setDrawerOpen(false); // Close the drawer after selection on mobile
        } catch (error) {
            console.error("Error loading session:", error);
        } finally {
            setInitialLoading(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim() || !currentSessionId) return;
        
        setLoading(true);
        try {
            // This will be replaced with your actual API call
            // For now, we'll simulate a response
            const simulatedResponse = `This is a simulated response to your query: "${query}"`;
            
            // Save the query and response to the current session
            await api.addQueryToSession(currentSessionId, query, simulatedResponse);
            
            // Update the local state to show the response
            setResponse(simulatedResponse);
            
            // Reload the session to get the updated queries
            loadSession(currentSessionId);
        } catch (error) {
            console.error("Error querying LLM:", error);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <LoadingIndicator />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading your session...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" className="mb-4">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        sx={{ mr: 2 }}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        LLM Query System
                        {currentSession && (
                            <Chip 
                                label={currentSession.title}
                                size="small"
                                sx={{ ml: 2, color: 'white', borderColor: 'white' }}
                                variant="outlined"
                            />
                        )}
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
            
            {/* Session drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ width: 300, p: 2 }}>
                    <SessionSelector 
                        currentSessionId={currentSessionId}
                        onSessionSelect={loadSession}
                    />
                </Box>
            </Drawer>
            
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
                                        disabled={loading || !query.trim() || !currentSessionId}
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
                    
                    {/* Session Queries Section */}
                    {currentSession && currentSession.queries && currentSession.queries.length > 0 && (
                        <Grid item xs={12} className="mt-4">
                            <Typography variant="h5" className="mb-3 flex items-center">
                                <HistoryIcon className="mr-2" /> Session History
                            </Typography>
                            
                            <Grid container spacing={2}>
                                {currentSession.queries.map((item, index) => (
                                    <Grid item xs={12} md={6} key={index}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="subtitle1" className="font-semibold">
                                                    Query:
                                                </Typography>
                                                <Typography variant="body2" className="mb-2">
                                                    {item.prompt}
                                                </Typography>
                                                <Divider className="my-2" />
                                                <Typography variant="subtitle1" className="font-semibold mt-2">
                                                    Response:
                                                </Typography>
                                                <Typography variant="body2" 
                                                    sx={{
                                                        maxHeight: 100,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {item.response}
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                                    {new Date(item.created_at).toLocaleString()}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" color="primary" onClick={() => setResponse(item.response)}>
                                                    View Full Response
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
