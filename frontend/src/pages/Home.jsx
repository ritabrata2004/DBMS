import { useState, useEffect, useRef } from "react";
import api from "../api";
import "../styles/Home.css";
import { 
  Typography, 
  Paper, 
  Box,
  Button,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  Drawer,
  Chip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";
import SessionSelector from "../components/SessionSelector";
import LoadingIndicator from "../components/LoadingIndicator";

function Home() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    
    // Session management states
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [currentSession, setCurrentSession] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Sidebar width for calculations
    const sidebarWidth = 280;
    
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

    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [currentSession]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
            
            if (isMobile) {
                setDrawerOpen(false); // Close the drawer after selection only on mobile
            }
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
            
            // Clear the input field
            setQuery("");
            
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <LoadingIndicator />
                <Typography variant="h6" sx={{ ml: 2, color: 'text.primary' }}>
                    Loading your session...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Fixed Sidebar for Desktop */}
            {!isMobile && (
                <Box
                    sx={{
                        width: sidebarWidth,
                        flexShrink: 0,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 500 }}>
                            LLM Query System
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {currentSession?.title}
                        </Typography>
                    </Box>
                    <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <SessionSelector 
                            currentSessionId={currentSessionId}
                            onSessionSelect={loadSession}
                            fullHeight={true}
                        />
                    </Box>
                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button 
                            fullWidth 
                            variant="outlined" 
                            color="primary" 
                            onClick={() => navigate('/logout')}
                            startIcon={<LogoutIcon />}
                        >
                            Logout
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Main content */}
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                ml: isMobile ? 0 : `${sidebarWidth}px`,
                width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
            }}>
                {/* Mobile App Bar */}
                {isMobile && (
                    <AppBar position="static" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
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
                                        sx={{ ml: 2, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
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
                )}
                
                {/* Mobile drawer */}
                {isMobile && (
                    <Drawer
                        anchor="left"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        sx={{
                            '& .MuiDrawer-paper': { 
                                bgcolor: 'background.paper',
                                color: 'text.primary',
                                width: sidebarWidth
                            },
                        }}
                    >
                        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 500 }}>
                                    LLM Query System
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                                <SessionSelector 
                                    currentSessionId={currentSessionId}
                                    onSessionSelect={loadSession}
                                    fullHeight={true}
                                />
                            </Box>
                        </Box>
                    </Drawer>
                )}
                
                {/* Chat interface */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    flexGrow: 1,
                    height: isMobile ? 'calc(100vh - 64px)' : '100vh',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Messages Area */}
                    <Box sx={{ 
                        flexGrow: 1, 
                        overflowY: 'auto', 
                        p: 4,
                        pb: 20, // Extra padding at the bottom to ensure content is visible above the input
                        display: 'flex', 
                        flexDirection: 'column'
                    }}>
                        {!currentSession?.queries || currentSession.queries.length === 0 ? (
                            <Box 
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    height: '100%',
                                    opacity: 0.7
                                }}
                            >
                                <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                                    No messages yet
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                    Start a conversation by typing a message below
                                </Typography>
                            </Box>
                        ) : (
                            currentSession.queries.map((item, index) => (
                                <Box key={index} sx={{ mb: 3, display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <Box sx={{ width: '65%', maxWidth: '700px' }}>
                                        {/* User message */}
                                        <Paper 
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                mb: 1.5,
                                                color: 'white',
                                                bgcolor: 'primary.dark',
                                                borderRadius: '18px 18px 4px 18px',
                                                maxWidth: '70%',
                                                ml: 'auto',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            <Typography variant="body1">{item.prompt}</Typography>
                                        </Paper>
                                        
                                        {/* System response */}
                                        <Paper 
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                color: 'text.primary',
                                                bgcolor: 'background.paper',
                                                borderRadius: '18px 18px 18px 4px',
                                                maxWidth: '75%',
                                                mr: 'auto',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                wordWrap: 'break-word',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <Typography 
                                                variant="body1" 
                                                sx={{ whiteSpace: 'pre-wrap' }}
                                            >
                                                {item.response}
                                            </Typography>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    display: 'block', 
                                                    mt: 1, 
                                                    textAlign: 'right',
                                                    color: 'text.secondary' 
                                                }}
                                            >
                                                {new Date(item.created_at).toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                </Box>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </Box>
                    
                    {/* Query Input Area - No footer background, just the input */}
                    <Box 
                        sx={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 3,
                            zIndex: 10,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <form onSubmit={handleSubmit} style={{ width: '100%', margin: 0, padding: 0, boxShadow: 'none', background: 'transparent', display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 1.5, 
                                width: '95%', 
                                maxWidth: '1200px',
                                position: 'relative'
                            }}>
                                <TextField
                                    fullWidth
                                    placeholder="Type your message here..."
                                    variant="outlined"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    multiline
                                    minRows={1}
                                    maxRows={4}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '28px',
                                            bgcolor: 'rgba(30, 30, 30, 0.9)',
                                            backdropFilter: 'blur(10px)',
                                            pr: 7, // Space for button
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'primary.main',
                                                borderWidth: '1px',
                                            },
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(255,255,255,0.1)',
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <Button 
                                                type="submit"
                                                variant="contained" 
                                                color="primary"
                                                disabled={loading || !query.trim() || !currentSessionId}
                                                sx={{ 
                                                    position: 'absolute',
                                                    right: 8,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    minWidth: 0,
                                                    width: 46,
                                                    height: 46,
                                                    borderRadius: '50%',
                                                }}
                                            >
                                                <SendIcon />
                                            </Button>
                                        )
                                    }}
                                />
                            </Box>
                        </form>
                        {loading && (
                            <Box sx={{ 
                                position: 'absolute', 
                                bottom: '80px', 
                                left: '50%', 
                                transform: 'translateX(-50%)' 
                            }}>
                                <LoadingIndicator />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Home;
