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
  Avatar,
  Fade,
  alpha,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useLocation } from 'react-router-dom';
import SessionSelector from "../components/SessionSelector";
import LoadingIndicator from "../components/LoadingIndicator";
import Navbar from "../components/Navbar";
import PopupResult from "../components/PopupResult";

function Home() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [generatedSql, setGeneratedSql] = useState("");
    const [showSqlControls, setShowSqlControls] = useState(false);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [queryResult, setQueryResult] = useState(null);
    const [currentNaturalQuery, setCurrentNaturalQuery] = useState(""); // New state for storing natural language query
    const [historicQueryData, setHistoricQueryData] = useState(null); // Store historic query data for popup
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    
    // Session management states
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [currentSession, setCurrentSession] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Sidebar width for calculations
    const sidebarWidth = 320;
    
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
            
            // Store the current query for later use
            const currentQuery = query;
            
            // Generate SQL from natural language query
            const sqlGenResponse = await api.generateSqlFromNL(currentQuery, databaseId);
            
            // Access the correct field name 'sql_query' instead of 'sql'
            let generatedSqlQuery = sqlGenResponse.data.sql_query;
            
            // Clean SQL query by removing markdown code blocks if present
            generatedSqlQuery = cleanSqlQuery(generatedSqlQuery);
            
            console.log("Generated SQL:", generatedSqlQuery);
            
            // Set the generated SQL and show controls
            setGeneratedSql(generatedSqlQuery);
            setShowSqlControls(true);
            
            // Store the natural language query for execution
            setCurrentNaturalQuery(currentQuery);
            
            // Clear the input field
            setQuery("");
        } catch (error) {
            console.error("Error generating SQL query:", error);
            
            // Create an error message that's user-friendly
            let errorMessage = "An error occurred while generating the SQL query.";
            
            if (error.response) {
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
    
    // Execute the generated SQL query
    const executeGeneratedSql = async () => {
        if (!generatedSql || !currentSessionId) return;
        
        setLoading(true);
        try {
            // Get the database ID from the current session
            const sessionResponse = await api.getSession(currentSessionId);
            const databaseId = sessionResponse.data.database_id;
            
            // Execute the generated SQL
            console.log("Executing SQL on database ID:", databaseId);
            const executionResponse = await api.executeSqlQuery(databaseId, generatedSql);
            
            console.log("Query execution success:", executionResponse.data.success);
            
            // Store the query results
            setQueryResult(executionResponse.data);
            
            // Format the response to display the generated SQL and the results
            const formattedResponse = `
**Generated SQL:**
\`\`\`
${generatedSql}
\`\`\`

**Results:**
${formatQueryResults(executionResponse.data)}
`;
            
            // Save the query and response to the current session
            // Use the stored natural language query instead of the empty query state
            await api.addQueryToSession(currentSessionId, currentNaturalQuery, formattedResponse);
            
            // Update the local state to show the response
            setResponse(formattedResponse);
            
            // Show the result popup
            setShowResultPopup(true);
            
            // Reset the SQL controls
            setShowSqlControls(false);
            
            // Reload the session to get the updated queries
            loadSession(currentSessionId);
        } catch (error) {
            console.error("Error executing query:", error);
            
            // Create an error message that's user-friendly
            let errorMessage = "An error occurred while executing the SQL query.";
            
            if (error.response) {
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
    
    // Discard the generated SQL
    const discardGeneratedSql = () => {
        setGeneratedSql("");
        setShowSqlControls(false);
    };
    
    // Copy text to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Could show a temporary "Copied!" notification here
                console.log("Text copied to clipboard");
            })
            .catch(err => {
                console.error("Could not copy text: ", err);
            });
    };
    
    // Helper function to clean SQL query by removing markdown code block markers
    const cleanSqlQuery = (sql) => {
        if (!sql) return sql;
        
        // Remove ```sql and ``` markers if present
        return sql.replace(/```sql\s*/g, '').replace(/```\s*$/g, '').replace(/^```\s*/g, '').replace(/\s*```$/g, '').trim();
    };

    // Helper function to generate a compact summary of query results
    const generateResultsSummary = (responseText) => {
        if (!responseText) return { previewText: "No results available", rowCount: 0 };
        
        // Parse the results from markdown
        const { sql, results } = parseResultsFromMarkdown(responseText);
        
        // If there's an error or no results
        if (!results || !results.success) {
            const errorMatch = responseText.match(/Query failed:\s*(.*)/);
            const errorMessage = errorMatch ? errorMatch[1].trim() : "Query failed";
            return { previewText: errorMessage, rowCount: 0, hasError: true };
        }
        
        // If there are no rows
        if (!results.rows || results.rows.length === 0) {
            return { previewText: "Query executed successfully. No records found.", rowCount: 0 };
        }
        
        // Get row count
        const rowCount = results.rows.length;
        
        // Generate a more detailed preview with column names and values from first few rows
        let previewText = "";
        
        // Show SQL preview first (truncated)
        if (sql) {
            const sqlPreview = sql.length > 70 ? sql.substring(0, 70) + "..." : sql;
            previewText += `SQL: ${sqlPreview}\n\n`;
        }
        
        // Add row count information
        previewText += `Results: ${rowCount} ${rowCount === 1 ? 'row' : 'rows'} returned\n\n`;
        
        // Show column headers (up to 4)
        const maxColumnsToShow = Math.min(4, results.columns.length);
        const columnHeaders = results.columns.slice(0, maxColumnsToShow);
        if (results.columns.length > maxColumnsToShow) {
            columnHeaders.push("...");
        }
        previewText += `${columnHeaders.join(" | ")}\n`;
        
        // Show first 2 rows of data
        const rowsToShow = Math.min(2, results.rows.length);
        for (let i = 0; i < rowsToShow; i++) {
            const rowValues = results.rows[i].slice(0, maxColumnsToShow).map(val => 
                val === null ? 'NULL' : String(val).length > 15 ? String(val).substring(0, 15) + "..." : String(val)
            );
            
            if (results.columns.length > maxColumnsToShow) {
                rowValues.push("...");
            }
            
            previewText += `${rowValues.join(" | ")}\n`;
        }
        
        // If there are more rows, indicate it
        if (results.rows.length > 2) {
            previewText += `... and ${results.rows.length - 2} more rows`;
        }
        
        return { previewText, rowCount, sql };
    };

    // Helper function to format query results for display
    const formatQueryResults = (results) => {
        console.log("Formatting query results:", results);
        
        if (!results) {
            console.log("Results is null or undefined");
            return "No results available.";
        }
        
        if (!results.success) {
            console.log("Query execution reported failure:", results.status);
            return `Query failed: ${results.status}`;
        }
        
        if (!results.rows || results.rows.length === 0) {
            console.log("No rows in results");
            return "No results found.";
        }
        
        console.log("Processing rows:", results.rows);
        console.log("Column headers:", results.columns);
        
        // Create a table header from columns
        const headers = results.columns;
        
        // Format as markdown table
        let tableMarkdown = `| ${headers.join(' | ')} |\n`;
        tableMarkdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
        
        // Add table rows
        results.rows.forEach(row => {
            console.log("Processing row:", row);
            tableMarkdown += `| ${row.map(cell => (cell === null ? 'NULL' : String(cell).replace(/\n/g, ' '))).join(' | ')} |\n`;
        });
        
        console.log("Generated markdown table:", tableMarkdown);
        return tableMarkdown;
    };

    // Helper function to extract SQL from previous response markdown
    const extractSqlFromMarkdown = (responseText) => {
        if (!responseText) return '';
        
        // Look for SQL code block
        const sqlBlockRegex = /```(?:sql)?\s*([\s\S]*?)```/;
        const match = responseText.match(sqlBlockRegex);
        
        if (match && match[1]) {
            return match[1].trim();
        }
        
        return '';
    };
    
    // Helper function to parse previous query results from markdown
    const parseResultsFromMarkdown = (responseText) => {
        if (!responseText) return null;
        
        // Extract SQL
        const sql = extractSqlFromMarkdown(responseText);
        
        // Create a mock result object that matches the expected structure
        const mockResult = {
            success: true,
            columns: [],
            rows: [],
            execution_time: null
        };
        
        // Try to find the results section
        const resultsRegex = /\*\*Results:\*\*([\s\S]*?)(?:$|(?:\n\n))/;
        const resultsMatch = responseText.match(resultsRegex);
        
        if (resultsMatch && resultsMatch[1]) {
            const resultsText = resultsMatch[1].trim();
            
            // Check for error messages
            if (resultsText.includes('Query failed:') || resultsText.includes('No results')) {
                mockResult.success = false;
                mockResult.status = resultsText.replace('Query failed:', '').trim();
                return { sql, results: mockResult };
            }
            
            // Try to parse markdown table
            const tableRegex = /\|\s*(.*?)\s*\|\n\|\s*[-:\s|]*\|\n([\s\S]*)/;
            const tableMatch = resultsText.match(tableRegex);
            
            if (tableMatch) {
                // Parse headers
                mockResult.columns = tableMatch[1].split('|').map(header => header.trim());
                
                // Parse rows
                const rowsText = tableMatch[2];
                const rowLines = rowsText.split('\n').filter(line => line.trim().startsWith('|'));
                
                mockResult.rows = rowLines.map(line => {
                    // Remove first and last | and split by |
                    const cells = line.trim()
                        .substring(1, line.length - 1)
                        .split('|')
                        .map(cell => {
                            const trimmed = cell.trim();
                            return trimmed === 'NULL' ? null : trimmed;
                        });
                    
                    return cells;
                });
                
                return { sql, results: mockResult };
            }
        }
        
        return { sql, results: null };
    };
    
    // Show a previous query's results in the popup
    const showPreviousQueryResults = (item) => {
        const { sql, results } = parseResultsFromMarkdown(item.response);
        
        // Set up the data for the popup
        setHistoricQueryData({
            sql,
            results,
            naturalQuery: item.prompt  // Make sure this contains the original natural language query
        });
        
        // Show the popup
        setShowResultPopup(true);
    };

    // Delete a query and its response from the session
    const handleDeleteQuery = async (queryId) => {
        if (!currentSessionId) return;
        
        try {
            await api.deleteQueryFromSession(currentSessionId, queryId);
            
            // Update the current session by reloading it
            loadSession(currentSessionId);
        } catch (error) {
            console.error("Error deleting query:", error);
        }
    };

    if (initialLoading) {
        return (
            <>
                <Navbar />
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '80vh', 
                    bgcolor: 'background.default',
                }}>
                    <Fade in={true} style={{ transitionDelay: '300ms' }}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            p: 3,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            backdropFilter: 'blur(8px)',
                        }}>
                            <LoadingIndicator size={40} />
                            <Typography variant="h6" sx={{ mt: 2, color: 'text.primary', fontWeight: 500 }}>
                                Loading your session...
                            </Typography>
                        </Box>
                    </Fade>
                </Box>
            </>
        );
    }

    return (
        <Box sx={{ 
            width: '100%',
            height: '100vh',
            maxWidth: '100vw',
            overflowX: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Navbar />
            <Box sx={{ 
                pt: 2, 
                px: 3, 
                bgcolor: theme.palette.background.paper, 
                backgroundImage: 'linear-gradient(rgba(30, 36, 50, 0.8), rgba(21, 26, 37, 0.9))',
                borderBottom: '1px solid', 
                borderColor: 'divider', 
                zIndex: 50 
            }}>
                <Box display="flex" alignItems="center">
                    <IconButton 
                        onClick={() => navigate('/sessions', { state: { database: { id: currentSession?.database_id, name: currentSession?.database_name } } })} 
                        color="primary" 
                        aria-label="back to sessions" 
                        sx={{ 
                            mr: 2,
                            '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1),
                            }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1" fontWeight={600} sx={{
                        background: 'linear-gradient(45deg, #6596EB, #BB86FC)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {currentSession?.title || "Chat Session"}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ 
                display: 'flex', 
                height: 'calc(100vh - 128px)', 
                bgcolor: 'background.default',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(30, 36, 50, 0.1) 0%, rgba(21, 26, 37, 0.5) 100%)',
            }}>
                {/* Sidebar - For desktop */}
                {!isMobile && (
                    <Box
                        sx={{
                            width: sidebarWidth,
                            height: '100%',
                            position: 'fixed',
                            left: 0,
                            top: 64,
                            bottom: 0,
                            bgcolor: alpha(theme.palette.background.paper, 0.97),
                            backdropFilter: 'blur(4px)',
                            borderRight: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.7),
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 100,
                            boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                            overflowY: 'auto',
                            overflowX: 'hidden'
                        }}
                    >
                        <Box sx={{ 
                            p: 2, 
                            borderBottom: '1px solid', 
                            borderColor: 'divider',
                            backgroundImage: 'linear-gradient(rgba(30, 36, 50, 0.5), rgba(21, 26, 37, 0.8))',
                        }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600,
                                background: 'linear-gradient(45deg, #6596EB, #BB86FC)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                LLM Query System
                            </Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'text.secondary',
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
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
                        <Box sx={{ 
                            p: 2, 
                            borderTop: '1px solid', 
                            borderColor: 'divider',
                            backgroundImage: 'linear-gradient(rgba(21, 26, 37, 0.8), rgba(30, 36, 50, 0.5))',
                        }}>
                            <Button 
                                fullWidth 
                                variant="outlined" 
                                color="primary" 
                                onClick={() => navigate('/logout')}
                                startIcon={<LogoutIcon />}
                                sx={{
                                    borderRadius: '8px',
                                    py: 1,
                                    borderWidth: '1.5px',
                                    '&:hover': {
                                        borderWidth: '1.5px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
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
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Mobile header */}
                    {isMobile && (
                        <AppBar position="static" elevation={0} sx={{ 
                            zIndex: 1000,
                            backgroundImage: 'linear-gradient(rgba(30, 36, 50, 0.97), rgba(21, 26, 37, 0.95))',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                            <Toolbar>
                                <IconButton
                                    color="inherit"
                                    edge="start"
                                    onClick={() => setDrawerOpen(true)}
                                    sx={{ mr: 2 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Typography variant="h6" component="div" sx={{ 
                                    flexGrow: 1,
                                    fontWeight: 600,
                                    background: 'linear-gradient(45deg, #6596EB, #BB86FC)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent', 
                                }}>
                                    LLM Query System
                                    {currentSession && (
                                        <Chip 
                                            label={currentSession.title}
                                            size="small"
                                            sx={{ 
                                                ml: 2, 
                                                color: 'white', 
                                                borderColor: alpha(theme.palette.primary.main, 0.5),
                                                backgroundColor: alpha(theme.palette.background.paper, 0.2),
                                                backdropFilter: 'blur(4px)',
                                                fontWeight: 500,
                                            }}
                                            variant="outlined"
                                        />
                                    )}
                                </Typography>
                                <IconButton 
                                    color="inherit" 
                                    onClick={() => navigate('/logout')}
                                    sx={{
                                        color: theme.palette.primary.light,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        }
                                    }}
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
                                    width: sidebarWidth,
                                    bgcolor: alpha(theme.palette.background.paper, 0.98),
                                    backdropFilter: 'blur(8px)',
                                    color: theme.palette.text.primary,
                                    borderRight: '1px solid',
                                    borderColor: alpha(theme.palette.divider, 0.5),
                                    boxShadow: '0 0 20px rgba(0,0,0,0.2)'
                                },
                            }}
                        >
                            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ 
                                    p: 2, 
                                    borderBottom: '1px solid', 
                                    borderColor: 'divider',
                                    backgroundImage: 'linear-gradient(rgba(30, 36, 50, 0.5), rgba(21, 26, 37, 0.8))',
                                }}>
                                    <Typography variant="h6" sx={{ 
                                        fontWeight: 600,
                                        background: 'linear-gradient(45deg, #6596EB, #BB86FC)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}>
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
                                <Box sx={{ 
                                    p: 2, 
                                    borderTop: '1px solid', 
                                    borderColor: 'divider',
                                    backgroundImage: 'linear-gradient(rgba(21, 26, 37, 0.8), rgba(30, 36, 50, 0.5))',
                                }}>
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        color="primary" 
                                        onClick={() => navigate('/logout')}
                                        startIcon={<LogoutIcon />}
                                        sx={{
                                            borderRadius: '8px',
                                            py: 1,
                                            borderWidth: '1.5px',
                                            '&:hover': {
                                                borderWidth: '1.5px',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            </Box>
                        </Drawer>
                    )}
                    
                    {/* Messages area */}
                    <Box 
                        ref={messagesContainerRef}
                        sx={{ 
                            flexGrow: 1, 
                            overflowY: 'auto', 
                            overflowX: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            pb: '90px', // Space for the input box
                            px: { xs: 2, md: 4 },
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${alpha(theme.palette.primary.main, 0.2)} transparent`,
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: alpha(theme.palette.primary.main, 0.2),
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: alpha(theme.palette.primary.main, 0.4),
                            },
                        }}
                    >
                        {/* SQL Controls - Show when SQL is generated but not yet executed */}
                        {showSqlControls && (
                            <Fade in={showSqlControls} timeout={300}>
                                <Paper 
                                    elevation={3}
                                    sx={{
                                        p: 3,
                                        mt: 2,
                                        mb: 3,
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                                        backdropFilter: 'blur(10px)',
                                        position: 'sticky',
                                        top: 10,
                                        zIndex: 10,
                                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight={600} sx={{
                                            color: theme.palette.text.primary,
                                        }}>
                                            Generated SQL Query
                                        </Typography>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => copyToClipboard(generatedSql)}
                                            title="Copy SQL to clipboard"
                                            sx={{ 
                                                color: theme.palette.primary.main,
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                }
                                            }}
                                        >
                                            <Box component="svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </Box>
                                        </IconButton>
                                    </Box>
                                    
                                    <Paper 
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            mb: 3,
                                            borderRadius: 1,
                                            bgcolor: alpha(theme.palette.background.default, 0.7),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.divider, 0.6),
                                            overflow: 'auto',
                                            maxHeight: '200px',
                                            fontFamily: 'monospace',
                                            fontSize: '0.9rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}
                                    >
                                        {generatedSql}
                                    </Paper>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button 
                                            variant="outlined" 
                                            color="error"
                                            onClick={discardGeneratedSql}
                                            sx={{
                                                borderRadius: '8px',
                                                fontWeight: 500,
                                                px: 3
                                            }}
                                        >
                                            Discard
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            onClick={executeGeneratedSql}
                                            sx={{
                                                borderRadius: '8px',
                                                fontWeight: 500,
                                                px: 3,
                                                background: 'linear-gradient(45deg, #5581D9 10%, #6596EB 90%)',
                                                boxShadow: '0 2px 10px rgba(101, 150, 235, 0.3)',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #4B74C7 10%, #5889DB 90%)',
                                                    boxShadow: '0 4px 15px rgba(101, 150, 235, 0.4)',
                                                }
                                            }}
                                        >
                                            Execute Query
                                        </Button>
                                    </Box>
                                </Paper>
                            </Fade>
                        )}

                        {!currentSession?.queries || currentSession.queries.length === 0 ? (
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                opacity: 0.8
                            }}>
                                <Typography variant="h5" sx={{ 
                                    color: alpha(theme.palette.text.secondary, 0.8), 
                                    fontWeight: 300,
                                    textAlign: 'center',
                                    mb: 2,
                                }}>
                                    Start a new conversation
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: alpha(theme.palette.text.secondary, 0.7), 
                                    mt: 1,
                                    textAlign: 'center',
                                    maxWidth: '450px'
                                }}>
                                    Ask questions about your database using natural language
                                </Typography>
                                <Box sx={{ 
                                    mt: 5, 
                                    p: 3, 
                                    borderRadius: 2, 
                                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                                    maxWidth: '80%',
                                    border: '1px dashed',
                                    borderColor: alpha(theme.palette.divider, 0.6)
                                }}>
                                    <Typography variant="body2" fontWeight={500} sx={{ color: theme.palette.text.secondary }}>
                                        Example questions:
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, color: theme.palette.primary.light }}>
                                        • Show me all users who joined in the last 30 days
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, color: theme.palette.primary.light }}>
                                        • What are the top 5 products by revenue?
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, color: theme.palette.primary.light }}>
                                        • Find orders with items that cost more than $100
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            currentSession.queries.map((item, index) => {
                                const { previewText, rowCount, hasError } = generateResultsSummary(item.response);
                                return (
                                    <Fade in={true} key={index} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                                        <Box sx={{ width: '100%', my: 2 }}>
                                            {/* User message */}
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5, alignItems: 'flex-start' }}>
                                                <Box sx={{ maxWidth: { xs: '80%', md: '70%' } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5, mr: 1 }}>
                                                        <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.8) }}>
                                                            You
                                                        </Typography>
                                                    </Box>
                                                    <Paper 
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            color: 'white',
                                                            backgroundImage: 'linear-gradient(45deg, #4776D0 10%, #6596EB 60%, #7EABFF 95%)',
                                                            borderRadius: '16px 16px 4px 16px',
                                                            boxShadow: '0 2px 15px rgba(101, 150, 235, 0.4)',
                                                            overflowWrap: 'break-word',
                                                            wordBreak: 'break-word',
                                                            animation: 'fadeIn 0.5s ease-out',
                                                            '@keyframes fadeIn': {
                                                                '0%': {
                                                                    opacity: 0,
                                                                    transform: 'translateY(10px)'
                                                                },
                                                                '100%': {
                                                                    opacity: 1,
                                                                    transform: 'translateY(0)'
                                                                }
                                                            },
                                                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                                            '&:hover': {
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: '0 4px 20px rgba(101, 150, 235, 0.5)',
                                                            }
                                                        }}
                                                    >
                                                        <Typography variant="body1">{item.prompt}</Typography>
                                                    </Paper>
                                                </Box>
                                                <Avatar 
                                                    sx={{ 
                                                        ml: 1, 
                                                        bgcolor: theme.palette.primary.dark,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                        animation: 'pulseAvatar 0.5s ease-out',
                                                        '@keyframes pulseAvatar': {
                                                            '0%': {
                                                                transform: 'scale(0.8)',
                                                                opacity: 0
                                                            },
                                                            '100%': {
                                                                transform: 'scale(1)',
                                                                opacity: 1
                                                            }
                                                        }
                                                    }} 
                                                    alt="User"
                                                >
                                                    <PersonIcon />
                                                </Avatar>
                                            </Box>
                                            
                                            {/* System message */}
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                                <Avatar 
                                                    sx={{ 
                                                        mr: 1, 
                                                        bgcolor: theme.palette.secondary.dark,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                                    }} 
                                                    alt="AI"
                                                >
                                                    <SmartToyIcon />
                                                </Avatar>
                                                <Box sx={{ maxWidth: { xs: '85%', md: '75%' } }}>
                                                    <Box sx={{ display: 'flex', mb: 0.5, ml: 1 }}>
                                                        <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.8) }}>
                                                            AI Assistant
                                                        </Typography>
                                                    </Box>
                                                    <Paper 
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            color: theme.palette.text.primary,
                                                            backgroundImage: 'linear-gradient(135deg, rgba(100, 95, 190, 0.05) 0%, rgba(80, 110, 200, 0.15) 100%)',
                                                            backdropFilter: 'blur(10px)',
                                                            borderRadius: '16px 16px 16px 4px',
                                                            border: '1px solid',
                                                            borderColor: alpha(theme.palette.divider, 0.4),
                                                            overflowWrap: 'break-word',
                                                            wordWrap: 'break-word',
                                                            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                                            '&:hover': {
                                                                backgroundImage: 'linear-gradient(135deg, rgba(100, 95, 190, 0.1) 0%, rgba(80, 110, 200, 0.2) 100%)',
                                                                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                                                transform: 'translateY(-2px)',
                                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                                            }
                                                        }}
                                                    >
                                                        <Typography 
                                                            variant="body1" 
                                                            sx={{ 
                                                                whiteSpace: 'pre-wrap',
                                                                animation: 'fadeInSlide 0.4s ease-out',
                                                                '@keyframes fadeInSlide': {
                                                                    '0%': {
                                                                        opacity: 0,
                                                                        transform: 'translateY(10px)'
                                                                    },
                                                                    '100%': {
                                                                        opacity: 1,
                                                                        transform: 'translateY(0)'
                                                                    }
                                                                },
                                                                '& code': {
                                                                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                                    fontFamily: 'monospace',
                                                                    p: 0.5,
                                                                    borderRadius: 1,
                                                                },
                                                                '& table': {
                                                                    borderCollapse: 'collapse',
                                                                    width: '100%',
                                                                    my: 1.5,
                                                                    overflowX: 'auto',
                                                                    display: 'block',
                                                                },
                                                                '& th': {
                                                                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                                                    p: 1,
                                                                    textAlign: 'left',
                                                                    fontWeight: 500,
                                                                    color: theme.palette.primary.light,
                                                                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                                },
                                                                '& td': {
                                                                    p: 1,
                                                                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                                                }
                                                            }}
                                                        >
                                                            {previewText}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                                                            <Typography 
                                                                variant="caption" 
                                                                sx={{ 
                                                                    color: alpha(theme.palette.text.secondary, 0.6)
                                                                }}
                                                            >
                                                                {new Date(item.created_at).toLocaleString()}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Button 
                                                                    size="small" 
                                                                    variant="outlined" 
                                                                    color="primary" 
                                                                    onClick={() => showPreviousQueryResults(item)}
                                                                    startIcon={<VisibilityIcon />}
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        fontWeight: 500,
                                                                        px: 2,
                                                                        py: 0.5,
                                                                        ml: 2,
                                                                        borderWidth: '1.5px',
                                                                        '&:hover': {
                                                                            borderWidth: '1.5px',
                                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                                            transform: 'translateY(-2px)',
                                                                        }
                                                                    }}
                                                                >
                                                                    View Details
                                                                </Button>
                                                                <IconButton 
                                                                    size="small" 
                                                                    color="error" 
                                                                    onClick={() => handleDeleteQuery(item.id)}
                                                                    sx={{ ml: 1 }}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    </Paper>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Fade>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </Box>
                    
                    {/* Query input - updated with glass morphism design */}
                    <Box 
                        component="footer"
                        sx={{
                            position: 'fixed',
                            bottom: 0,
                            left: isMobile ? 0 : sidebarWidth,
                            right: 0,
                            width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`, 
                            backgroundImage: 'linear-gradient(rgba(21, 26, 37, 0.6), rgba(30, 36, 50, 0.8))',
                            backdropFilter: 'blur(10px)',
                            borderTop: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.3),
                            zIndex: 50,
                            display: 'flex',
                            justifyContent: 'center',
                            p: 2
                        }}
                    >
                        <form onSubmit={handleSubmit} style={{ width: '90%', maxWidth: '800px' }}>
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
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: '50%',
                                                        mr: 1,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                        background: 'linear-gradient(45deg, #5581D9 10%, #6596EB 90%)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(45deg, #4B74C7 10%, #5889DB 90%)',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                                        },
                                                        transition: 'all 0.2s ease-in-out',
                                                    }}
                                                >
                                                    <SendIcon />
                                                </Button>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            pr: 0,
                                            transition: 'all 0.2s ease-in-out'
                                        }
                                    }}
                                    sx={{
                                        flexGrow: 1,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '28px',
                                            bgcolor: alpha(theme.palette.background.paper, 0.3),
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                            transition: 'all 0.2s ease-in-out',
                                            '& fieldset': {
                                                borderColor: alpha(theme.palette.divider, 0.5),
                                                transition: 'border-color 0.2s ease-in-out',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: alpha(theme.palette.primary.main, 0.7),
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: theme.palette.primary.main,
                                                borderWidth: '2px',
                                            },
                                            '&.Mui-focused': {
                                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </form>
                        
                        {loading && (
                            <Fade in={loading}>
                                <Box sx={{ 
                                    position: 'absolute', 
                                    top: -48, 
                                    left: '50%', 
                                    transform: 'translateX(-50%)',
                                    bgcolor: alpha(theme.palette.background.paper, 0.85),
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    py: 1,
                                    px: 2,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    zIndex: 1000
                                }}>
                                    <LoadingIndicator size={20} />
                                    <Typography variant="body2" fontWeight={500} sx={{ ml: 1.5, color: theme.palette.text.secondary }}>
                                        Processing your query...
                                    </Typography>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </Box>
            </Box>
            
            {/* Results Popup - Show when query results are available */}
            <PopupResult 
                open={showResultPopup}
                onClose={() => {
                    setShowResultPopup(false);
                    setHistoricQueryData(null);  // Clear historic data when closing
                }}
                sql={historicQueryData ? historicQueryData.sql : generatedSql}
                results={historicQueryData ? historicQueryData.results : queryResult}
                executionTime={historicQueryData ? null : queryResult?.execution_time}
                naturalQuery={historicQueryData ? historicQueryData.naturalQuery : currentNaturalQuery}
            />
        </Box>
    );
}

export default Home;
