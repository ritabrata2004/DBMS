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
  InputAdornment
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
                    // If user has no sessions, redirect to database selection
                    // since we can't create a session without a database
                    navigate('/');
                    setInitialLoading(false);
                }
            } catch (error) {
                console.error("Error initializing session:", error);
                setInitialLoading(false);
            }
        };
        
        // Use a semaphore to prevent multiple initializations
        let isInitializing = false;
        if (!isInitializing) {
            isInitializing = true;
            initializeSession();
        }
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
            // Get the database ID from the current session
            const sessionResponse = await api.getSession(currentSessionId);
            const databaseId = sessionResponse.data.database_id;
            
            if (!databaseId) {
                console.error("No database associated with this session");
                throw new Error("No database associated with this session");
            }
            
            // Step 1: Generate SQL from natural language query
            const sqlGenResponse = await api.generateSqlFromNL(query, databaseId);
            
            // Access the correct field name 'sql_query' instead of 'sql'
            let generatedSql = sqlGenResponse.data.sql_query;
            
            // Clean SQL query by removing markdown code blocks if present
            generatedSql = cleanSqlQuery(generatedSql);
            
            console.log("Generated SQL:", generatedSql);
            
            // Step 2: Execute the generated SQL
            const executionResponse = await api.executeSqlQuery(databaseId, generatedSql);
            
            // Format the response to display the generated SQL and the results
            const formattedResponse = `
**Generated SQL:**
\`\`\`
${generatedSql}
\`\`\`

**Results:**
${formatQueryResults(executionResponse.data)}
`;
            
            // Step 3: Save the query and response to the current session
            await api.addQueryToSession(currentSessionId, query, formattedResponse);
            
            // Update the local state to show the response
            setResponse(formattedResponse);
            
            // Clear the input field
            setQuery("");
            
            // Reload the session to get the updated queries
            loadSession(currentSessionId);
        } catch (error) {
            console.error("Error processing query:", error);
            
            // Create an error message that's user-friendly
            let errorMessage = "An error occurred while processing your query.";
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.data && error.response.data.detail) {
                    errorMessage = `Error: ${error.response.data.detail}`;
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = `Error: ${error.response.data.error}`;
                } else {
                    errorMessage = `Error: ${error.response.status} - ${error.response.statusText}`;
                }
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }
            
            // Save the error message as a response
            await api.addQueryToSession(currentSessionId, query, errorMessage);
            setResponse(errorMessage);
            
            // Reload the session to get the updated queries
            loadSession(currentSessionId);
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to clean SQL query by removing markdown code block markers
    const cleanSqlQuery = (sql) => {
        if (!sql) return sql;
        
        // Remove ```sql and ``` markers if present
        return sql.replace(/```sql\s*/g, '').replace(/```\s*$/g, '').replace(/^```\s*/g, '').replace(/\s*```$/g, '').trim();
    };

    // Helper function to format query results for display
    const formatQueryResults = (results) => {
        if (!results || !results.data || results.data.length === 0) {
            return "No results found.";
        }
        
        // Create a table header from the first row keys
        const headers = Object.keys(results.data[0]);
        
        // Format as markdown table
        let tableMarkdown = `| ${headers.join(' | ')} |\n`;
        tableMarkdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
        
        // Add table rows
        results.data.forEach(row => {
            tableMarkdown += `| ${headers.map(h => String(row[h] || '').replace(/\n/g, ' ')).join(' | ')} |\n`;
        });
        
        return tableMarkdown;
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
                            <IconButton color="inherit" onClick={() => navigate('/logout')}>
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
                                width: sidebarWidth,
                                bgcolor: 'background.paper',
                                color: 'text.primary'
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
                    {!currentSession?.queries || currentSession.queries.length === 0 ? (
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
                                Start a conversation by typing a message below
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
                                placeholder="Type your message here..."
                                variant="outlined"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                multiline
                                minRows={1}
                                maxRows={3}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                type="submit"
                                                disabled={loading || !query.trim() || !currentSessionId}
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
