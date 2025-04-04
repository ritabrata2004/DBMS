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
  useTheme,
  InputAdornment,
  Avatar
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import DatabaseIcon from '@mui/icons-material/Storage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from "react-router-dom";
import SessionSelector from "../components/SessionSelector";
import LoadingIndicator from "../components/LoadingIndicator";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN } from "../constants";

function Home() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();
    
    // Get the selected database from location state
    const [selectedDatabase, setSelectedDatabase] = useState(null);
    
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
    
    // Add state for username
    const [username, setUsername] = useState('');
    
    // Add state for username
    const [username, setUsername] = useState('');
    
    // Check for sessionId in location state when component mounts
    useEffect(() => {
        if (location.state && location.state.sessionId) {
            // If a specific session is passed, load it
            loadSession(location.state.sessionId);
        } else {
            // If no session ID is provided, redirect to sessions page
            navigate('/');
        }
    }, []);

    // Fetch user info when component mounts
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // First try to get username from JWT token
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (token) {
                    // Decode the token to get user information
                    const decoded = jwtDecode(token);
                    if (decoded.username) {
                        setUsername(decoded.username);
                        return;
                    }
                }
                
                // If we can't get it from the token, fetch from API
                const response = await api.get('/api/user/me/');
                if (response.data && response.data.username) {
                    setUsername(response.data.username);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };
        
        fetchUserInfo();
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
            
            // If the session has database information, update the selected database
            if (sessionResponse.data.database_name && sessionResponse.data.database_id) {
                setSelectedDatabase({
                    id: sessionResponse.data.database_id,
                    name: sessionResponse.data.database_name
                });
            }
            
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

    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [currentSession]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim() || !currentSessionId || !selectedDatabase) return;
        
        setLoading(true);
        try {
            // Modified to show which database is being queried
            const simulatedResponse = `Your query "${query}" has been sent to database ${selectedDatabase.name}.`;
            
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

    const handleBackToSessions = () => {
        navigate('/');
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
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
            {/* Sidebar - For desktop */}
            {!isMobile && (
                <Box
                    sx={{
                        width: sidebarWidth,
                        height: '100%',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        bgcolor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 100
                    }}
                >
                    <Box sx={{ 
                        p: 2, 
                        borderBottom: '1px solid', 
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                    }}>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 500 }}>
                            Database Query System
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <DatabaseIcon fontSize="small" sx={{ color: 'secondary.main', mr: 1 }} />
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                {selectedDatabase?.name}
                            </Typography>
                        
                        {/* User greeting chip for desktop */}
                        {username && (
                            <Chip
                                avatar={<Avatar sx={{ bgcolor: 'primary.dark' }}>{username.charAt(0).toUpperCase()}</Avatar>}
                                label={`Hey ${username}`}
                                variant="outlined"
                                sx={{ 
                                    alignSelf: 'flex-start',
                                    mt: 1,
                                    color: 'text.primary', 
                                    borderColor: 'primary.main',
                                    '& .MuiChip-label': {
                                        fontWeight: 500
                                    }
                                }}
                            />
                        )}
                        </Box>
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
                            onClick={handleBackToSessions}
                            sx={{ mb: 2 }}
                        >
                            Back to Sessions
                        </Button>
                        <Button 
                            fullWidth 
                            variant="outlined" 
                            color="primary" 
                            onClick={() => navigate('/logout')}
                            startIcon={<LogoutIcon />}
                        >
                            Sign Out
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Main content area */}
            <Box 
                sx={{ 
                    flexGrow: 1, 
                    marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
                    width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Mobile header */}
                {isMobile && (
                    <AppBar position="static" elevation={0} sx={{ zIndex: 1000 }}>
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                edge="start"
                                onClick={() => setDrawerOpen(true)}
                                sx={{ mr: 2 }}
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
                            
                            {/* Add user greeting chip */}
                            {username && (
                                <Chip
                                    avatar={<Avatar sx={{ bgcolor: 'primary.dark' }}>{username.charAt(0).toUpperCase()}</Avatar>}
                                    label={`Hey ${username}`}
                                    variant="outlined"
                                    sx={{ 
                                        mr: 2, 
                                        color: 'white', 
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        '& .MuiChip-label': {
                                            fontWeight: 500
                                        }
                                    }}
                                />
                            )}
                            
                            <IconButton color="inherit" onClick={() => navigate('/logout')}>
                                <LogoutIcon />
                            </IconButton>
                        </Toolbar>
                        {selectedDatabase && (
                            <Box sx={{ bgcolor: 'rgba(0,0,0,0.1)', px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
                                <DatabaseIcon fontSize="small" sx={{ color: 'secondary.main', mr: 1 }} />
                                <Typography variant="body2">
                                    {selectedDatabase.name}
                                </Typography>
                            </Box>
                        )}
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
                                width: sidebarWidth,
                                bgcolor: 'background.paper',
                                color: 'text.primary'
                            },
                        }}
                    >
                        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 500 }}>
                                    Database Query System
                                </Typography>
                                {selectedDatabase && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <DatabaseIcon fontSize="small" sx={{ color: 'secondary.main', mr: 1 }} />
                                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                                            {selectedDatabase.name}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
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
                                    onClick={handleBackToSessions}
                                    sx={{ mb: 2 }}
                                >
                                    Back to Sessions
                                </Button>
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    color="primary" 
                                    onClick={() => navigate('/logout')}
                                    startIcon={<LogoutIcon />}
                                >
                                    Sign Out
                                </Button>
                            </Box>
                        </Box>
                    </Drawer>
                )}
                
                {/* Messages area */}
                <Box 
                    sx={{ 
                        flexGrow: 1, 
                        overflowY: 'auto', 
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        pb: '90px', // Space for the input box
                        px: { xs: 2, md: 4 }
                    }}
                >
                    {!selectedDatabase ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            opacity: 0.7
                        }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                No database selected
                            </Alert>
                            <Button 
                                variant="contained" 
                                onClick={handleBackToSessions}
                                startIcon={<ArrowBackIcon />}
                            >
                                Back to Sessions
                            </Button>
                        </Box>
                    ) : !currentSession?.queries || currentSession.queries.length === 0 ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            opacity: 0.7
                        }}>
                            <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 300 }}>
                                No messages yet
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                Start a conversation by typing a query below
                            </Typography>
                        </Box>
                    ) : (
                        currentSession.queries.map((item, index) => (
                            <Box key={index} sx={{ width: '100%', my: 2 }}>
                                {/* User message */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                    <Paper 
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            color: 'white',
                                            bgcolor: 'primary.dark',
                                            borderRadius: '16px 16px 4px 16px',
                                            maxWidth: { xs: '80%', md: '70%' },
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        <Typography variant="body1">{item.prompt}</Typography>
                                    </Paper>
                                </Box>
                                
                                {/* System message */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <Paper 
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            color: 'text.primary',
                                            bgcolor: 'background.paper',
                                            borderRadius: '16px 16px 16px 4px',
                                            maxWidth: { xs: '85%', md: '75%' },
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
                
                {/* Query input - updated with less width and rounded corners */}
                <Box 
                    component="footer"
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: isMobile ? 0 : sidebarWidth,
                        right: 0,
                        width: 'auto', 
                        bgcolor: 'background.default',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        zIndex: 50,
                        display: 'flex',
                        justifyContent: 'center', // Center the input box
                        p: 2
                    }}
                >
                    <form onSubmit={handleSubmit} style={{ width: '90%', maxWidth: '800px' }}> {/* Reduced width */}
                        <Box sx={{ 
                            display: 'flex',
                            position: 'relative',
                        }}>
                            <TextField
                                fullWidth
                                placeholder={`Type your query for ${selectedDatabase?.name || 'database'}...`}
                                variant="outlined"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                multiline
                                minRows={1}
                                maxRows={3}
                                disabled={!selectedDatabase}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                type="submit"
                                                disabled={loading || !query.trim() || !currentSessionId || !selectedDatabase}
                                                sx={{
                                                    minWidth: 'auto',
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '50%',
                                                    mr: 1
                                                }}
                                            >
                                                <SendIcon />
                                            </Button>
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        pr: 0
                                    }
                                }}
                                sx={{
                                    flexGrow: 1,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '28px', // More pronounced rounded corners
                                        bgcolor: 'background.paper',
                                        '& fieldset': {
                                            borderColor: 'divider',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </form>
                    
                    {loading && (
                        <Box sx={{ 
                            position: 'absolute', 
                            top: -48, 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            bgcolor: 'background.paper',
                            borderRadius: '10px',
                            p: 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 1000
                        }}>
                            <LoadingIndicator />
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                Processing...
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default Home;
