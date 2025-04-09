import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  createTheme,
  ThemeProvider
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  AutoAwesome as AutoAwesomeIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

// Create a dark theme for components
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C4DFF', // Updated to match navbar theme
      light: '#9F7CFF',
      dark: '#5A1FFF',
    },
    secondary: {
      main: '#03DAC6', // Updated to match navbar theme
      light: '#3AEBE0',
      dark: '#00A99B',
    },
    error: {
      main: '#FF5252',
      light: '#FF7D7D',
      dark: '#C62828',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFCC80',
      dark: '#FF9800',
    },
    info: {
      main: '#29B6F6',
      light: '#4FC3F7',
      dark: '#0288D1',
    },
    success: {
      main: '#66BB6A',
      light: '#81C784',
      dark: '#388E3C',
    },
    background: {
      default: '#171E2A', // Updated to match navbar theme
      paper: '#1F2736', // Updated to match navbar theme
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B8C8', // Subtle blue-gray tint
    },
    divider: 'rgba(255, 255, 255, 0.09)',
    // Custom table column colors for the metadata tables
    tableColumns: {
      col1: {
        main: '#7C4DFF',
        light: 'rgba(124, 77, 255, 0.15)',
        dark: 'rgba(124, 77, 255, 0.25)',
      },
      col2: {
        main: '#03DAC6',
        light: 'rgba(3, 218, 198, 0.15)',
        dark: 'rgba(3, 218, 198, 0.25)',
      },
      col3: {
        main: '#FF5252',
        light: 'rgba(255, 82, 82, 0.15)',
        dark: 'rgba(255, 82, 82, 0.25)',
      },
      col4: {
        main: '#FFB74D',
        light: 'rgba(255, 183, 77, 0.15)',
        dark: 'rgba(255, 183, 77, 0.25)',
      },
      col5: {
        main: '#29B6F6',
        light: 'rgba(41, 182, 246, 0.15)',
        dark: 'rgba(41, 182, 246, 0.25)',
      },
      col6: {
        main: '#66BB6A',
        light: 'rgba(102, 187, 106, 0.15)',
        dark: 'rgba(102, 187, 106, 0.25)',
      },
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
              transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(124, 77, 255, 0.5)', // Updated to match theme
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7C4DFF', // Updated to match theme
              boxShadow: '0 0 0 2px rgba(124, 77, 255, 0.2)', // Updated to match theme
            },
            backgroundColor: 'rgba(31, 39, 54, 0.8)',
            borderRadius: 8,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(124, 77, 255, 0.15)', // Updated to match theme
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#7C4DFF', // Updated to match theme
            }
          },
          '& .MuiOutlinedInput-input': {
            color: '#fff',
          },
          marginBottom: '16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F2736', // Updated to match theme
          color: '#fff',
          backgroundImage: 'none',
          transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 15px rgba(124, 77, 255, 0.2)', // Updated to match theme
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
          overflow: 'hidden',
          '&:after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            opacity: 0,
            transform: 'scale(0.5)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          },
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-2px)',
            '&:after': {
              opacity: 1,
              transform: 'scale(1)',
            }
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(45deg, #5A1FFF 10%, #7C4DFF 90%)', // Updated to match theme
            '&:hover': {
              background: 'linear-gradient(45deg, #5A1FFF 30%, #7C4DFF 100%)', // Updated to match theme
            }
          },
          '&.MuiButton-containedSecondary': {
            background: 'linear-gradient(45deg, #00A99B 10%, #03DAC6 90%)', // Updated to match theme
            '&:hover': {
              background: 'linear-gradient(45deg, #00A99B 30%, #03DAC6 100%)', // Updated to match theme
            }
          },
          '&.MuiButton-containedSuccess': {
            background: 'linear-gradient(45deg, #388E3C 10%, #66BB6A 90%)',
          },
          '&.MuiButton-containedError': {
            background: 'linear-gradient(45deg, #C62828 10%, #FF5252 90%)',
          },
          '&.MuiButton-containedInfo': {
            background: 'linear-gradient(45deg, #0288D1 10%, #29B6F6 90%)',
          },
          '&.MuiButton-containedWarning': {
            background: 'linear-gradient(45deg, #FF9800 10%, #FFB74D 90%)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.25)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px 8px 0 0',
          overflow: 'hidden',
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(90deg, #7C4DFF, #03DAC6)', // Updated to match theme
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.6)',
          transition: 'color 0.2s ease-in-out, transform 0.2s ease-in-out',
          '&.Mui-selected': {
            color: '#fff',
            fontWeight: 500,
          },
          '&:hover': {
            color: 'rgba(255, 255, 255, 0.9)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(124, 77, 255, 0.1)', // Updated to match theme
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease-in-out, transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateX(5px)',
          }
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          backgroundImage: 'linear-gradient(135deg, #1F2736 0%, #171E2A 100%)',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #7C4DFF, #03DAC6)', // Updated to match theme
          }
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(124, 77, 255, 0.05)', // Updated to match theme
          }
        },
        head: {
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.8)',
          background: 'linear-gradient(90deg, rgba(124, 77, 255, 0.08), rgba(3, 218, 198, 0.08))', // Updated to match theme
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(124, 77, 255, 0.08)', // Updated to match theme
            transform: 'translateX(5px)',
          },
        },
      },
    },
  },
});

const DatabaseTester = () => {
  const navigate = useNavigate();
  
  // State for database connection
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for the form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    database_type: "postgresql",
    host: "localhost",
    port: 5432,
    database_name: "",
    username: "",
    password: "",
  });

  // State for query execution
  const [selectedDb, setSelectedDb] = useState(null);
  const [query, setQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState(null);
  
  // State for metadata operations
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [schemaData, setSchemaData] = useState(null);
  const [relationshipData, setRelationshipData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: query, 1: schema, 2: relationships, 3: search
  const [editingDescription, setEditingDescription] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  
  // UI states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [databaseToDelete, setDatabaseToDelete] = useState(null);

  // Load existing databases on component mount
  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/databases/databases/");
        setDatabases(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load databases. Please check your authentication.");
        console.error("Error loading databases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabases();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "port" ? parseInt(value, 10) || "" : value,
    });
  };

  // Handle snackbar notifications
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle database creation
  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("/api/databases/databases/", formData);
      setDatabases([...databases, response.data]);
      // Reset form
      setFormData({
        name: "",
        description: "",
        database_type: "postgresql",
        host: "localhost",
        port: 5432,
        database_name: "",
        username: "",
        password: "",
      });
      setError(null);
      showSnackbar("Database added successfully!");
    } catch (err) {
      setError("Failed to create database. Please check your inputs.");
      showSnackbar("Failed to create database", "error");
      console.error("Error creating database:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle connection testing
  const handleTestConnection = async (dbId) => {
    try {
      setLoading(true);
      const response = await api.post(`/api/databases/databases/${dbId}/test_connection/`);
      showSnackbar(
        response.data.success
          ? "Connection successful!" 
          : `Connection failed: ${response.data.message}`,
        response.data.success ? "success" : "error"
      );
    } catch (err) {
      showSnackbar("Failed to test connection", "error");
      console.error("Error testing connection:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle query execution
  const handleExecuteQuery = async (e) => {
    e.preventDefault();
    if (!selectedDb) {
      setQueryError("Please select a database first");
      return;
    }
    if (!query.trim()) {
      setQueryError("Please enter a query");
      return;
    }
    
    try {
      setQueryLoading(true);
      const response = await api.post(`/api/databases/databases/${selectedDb}/execute_query/`, {
        query: query
      });
      setQueryResult(response.data);
      setQueryError(null);
      showSnackbar("Query executed successfully");
    } catch (err) {
      setQueryError("Query execution failed");
      showSnackbar("Query execution failed", "error");
      console.error("Error executing query:", err);
    } finally {
      setQueryLoading(false);
    }
  };

  // Extract metadata from the selected database
  const handleExtractMetadata = async () => {
    if (!selectedDb) {
      showSnackbar("Please select a database first", "warning");
      return;
    }
    
    try {
      setMetadataLoading(true);
      const response = await api.post(`/api/databases/databases/${selectedDb}/extract_metadata/`);
      
      if (response.data.success) {
        showSnackbar("Metadata extraction completed successfully!");
        // After extraction, automatically load schema
        fetchSchema();
      } else {
        showSnackbar(`Metadata extraction failed: ${response.data.message}`, "error");
      }
    } catch (err) {
      showSnackbar("Failed to extract metadata", "error");
      console.error("Error extracting metadata:", err);
    } finally {
      setMetadataLoading(false);
    }
  };
  
  // Update embeddings for the metadata
  const handleUpdateEmbeddings = async () => {
    if (!selectedDb) {
      showSnackbar("Please select a database first", "warning");
      return;
    }
    
    try {
      setMetadataLoading(true);
      const response = await api.post(`/api/databases/databases/${selectedDb}/update_embeddings/`);
      
      if (response.data.success) {
        showSnackbar("Embeddings updated successfully!");
      } else {
        showSnackbar(`Embeddings update failed: ${response.data.message}`, "error");
      }
    } catch (err) {
      showSnackbar("Failed to update embeddings", "error");
      console.error("Error updating embeddings:", err);
    } finally {
      setMetadataLoading(false);
    }
  };
  
  // Fetch schema data for the selected database
  const fetchSchema = async () => {
    if (!selectedDb) {
      showSnackbar("Please select a database first", "warning");
      return;
    }
    
    try {
      setMetadataLoading(true);
      const response = await api.get(`/api/databases/databases/${selectedDb}/schema/`);
      setSchemaData(response.data);
      setActiveTab(1); // Switch to schema tab
    } catch (err) {
      showSnackbar("Failed to fetch schema data", "error");
      console.error("Error fetching schema:", err);
    } finally {
      setMetadataLoading(false);
    }
  };
  
  // Fetch relationship data for the selected database
  const fetchRelationships = async () => {
    if (!selectedDb) {
      showSnackbar("Please select a database first", "warning");
      return;
    }
    
    try {
      setMetadataLoading(true);
      const response = await api.get(`/api/databases/databases/${selectedDb}/relationships/`);
      setRelationshipData(response.data);
      setActiveTab(2); // Switch to relationships tab
    } catch (err) {
      showSnackbar("Failed to fetch relationship data", "error");
      console.error("Error fetching relationships:", err);
    } finally {
      setMetadataLoading(false);
    }
  };
  
  // Search metadata in the selected database
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedDb) {
      showSnackbar("Please select a database first", "warning");
      return;
    }
    
    if (!searchQuery.trim()) {
      showSnackbar("Please enter a search query", "warning");
      return;
    }
    
    try {
      setMetadataLoading(true);
      const response = await api.get(`/api/databases/databases/${selectedDb}/search/?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
    } catch (err) {
      showSnackbar("Failed to search metadata", "error");
      console.error("Error searching metadata:", err);
    } finally {
      setMetadataLoading(false);
    }
  };

  // Handle database deletion
  const handleDeleteDatabase = async () => {
    if (!databaseToDelete) return;
    
    try {
      setLoading(true);
      await api.delete(`/api/databases/databases/${databaseToDelete}/`);
      
      // Update the databases list
      setDatabases(databases.filter(db => db.id !== databaseToDelete));
      
      // If the deleted database was selected, clear selection
      if (selectedDb === databaseToDelete) {
        setSelectedDb(null);
        setQueryResult(null);
        setQueryError(null);
        setSchemaData(null);
        setRelationshipData(null);
        setSearchResults(null);
      }
      
      showSnackbar("Database deleted successfully");
      setDatabaseToDelete(null);
      setDeleteDialogOpen(false);
    } catch (err) {
      showSnackbar("Failed to delete database", "error");
      console.error("Error deleting database:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (dbId) => {
    setDatabaseToDelete(dbId);
    setDeleteDialogOpen(true);
  };

  // Database selection handler
  const handleDatabaseSelect = (dbId) => {
    setSelectedDb(dbId);
    setQueryResult(null);
    setQueryError(null);
    setSchemaData(null);
    setRelationshipData(null);
    setSearchResults(null);
    setActiveTab(0);
    showSnackbar("Database selected");
  };

  // Handle description editing
  const handleEditDescription = (type, id, currentDescription) => {
    setEditingDescription(`${type}_${id}`);
    setEditDescription(currentDescription);
  };

  // Handle description saving
  const handleSaveDescription = async (type, id, newDescription) => {
    try {
      setDescriptionLoading(true);
      const response = await api.post(`/api/databases/databases/${selectedDb}/update_description/`, {
        type,
        id,
        description: newDescription
      });
      if (response.data.success) {
        // Update the local state with the new description
        if (type === 'table') {
          setSchemaData((prevSchemaData) =>
            prevSchemaData.map((table) =>
              table.id === id ? { ...table, description: newDescription } : table
            )
          );
        } else if (type === 'column') {
          setSchemaData((prevSchemaData) =>
            prevSchemaData.map((table) => ({
              ...table,
              columns: table.columns.map((column) =>
                column.id === id ? { ...column, description: newDescription } : column
              )
            }))
          );
        }
        setEditingDescription(null);
        showSnackbar("Description updated successfully");
      } else {
        showSnackbar("Failed to save description", "error");
      }
    } catch (err) {
      showSnackbar("Error saving description", "error");
      console.error("Error saving description:", err);
    } finally {
      setDescriptionLoading(false);
    }
  };

  // Handle AI description generation
  const generateAIDescription = async (type, name, context) => {
    try {
      setDescriptionLoading(true);
      const response = await api.generateMetadataDescription(type, name, context);
      
      if (response.data.description) {
        setEditDescription(response.data.description);
        showSnackbar("AI description generated", "success");
      } else {
        showSnackbar("Failed to generate description", "error");
      }
    } catch (err) {
      showSnackbar("Error generating description", "error");
      console.error("Error generating description:", err);
    } finally {
      setDescriptionLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Navbar />
      <Container 
        maxWidth="xl" 
        sx={{ 
          pt: '84px', // Added top padding to prevent navbar overlap
          pb: 8,
          background: 'linear-gradient(180deg, rgba(26, 35, 50, 0.97) 0%, rgba(18, 26, 41, 0.98) 100%)', // Updated to match theme
          color: '#fff', 
          minHeight: '100vh'
        }}
      >
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={() => navigate('/databases')} 
            color="primary" 
            aria-label="back to databases" 
            className="mr-2"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(45deg, #7C4DFF, #03DAC6)', // Updated to match theme
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Metadata Manager
          </Typography>
        </Box>
        
        {/* Main content area with form and controls */}
        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Database Form Section */}
          <Paper className="p-6 rounded-lg shadow-md" sx={{ 
            background: 'linear-gradient(135deg, #1F2736 0%, #1A2332 100%)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(124, 77, 255, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #7C4DFF, #03DAC6, #FF5252, #FFB74D)',
              backgroundSize: '300% 100%',
              animation: 'gradient-animation 4s ease infinite',
            },
            '@keyframes gradient-animation': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at bottom right, rgba(124, 77, 255, 0.15), transparent 50%)',
              pointerEvents: 'none',
            },
          }}>
            <Typography variant="h5" className="mb-4 font-semibold" sx={{
              background: 'linear-gradient(90deg, #7C4DFF, #03DAC6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Add Database Connection
            </Typography>
            
            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleCreateDatabase} className="space-y-4">
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#03DAC6' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(31, 39, 54, 0.6)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(124, 77, 255, 0.25)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(124, 77, 255, 0.4)'
                    }
                  }
                }}
              />
              
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#03DAC6' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(31, 39, 54, 0.6)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(124, 77, 255, 0.25)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(124, 77, 255, 0.4)'
                    }
                  }
                }}
              />
              
              <Box className="grid grid-cols-2 gap-4">
                <TextField
                  label="Host"
                  name="host"
                  value={formData.host}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  InputLabelProps={{
                    style: { color: '#7C4DFF' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(31, 39, 54, 0.6)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(124, 77, 255, 0.25)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 2px rgba(124, 77, 255, 0.4)'
                      }
                    }
                  }}
                />
                
                <TextField
                  label="Port"
                  name="port"
                  type="number"
                  value={formData.port}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  variant="outlined"
                  InputLabelProps={{
                    style: { color: '#7C4DFF' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(31, 39, 54, 0.6)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(124, 77, 255, 0.25)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 2px rgba(124, 77, 255, 0.4)'
                      }
                    }
                  }}
                />
              </Box>
              
              <TextField
                label="Database Name"
                name="database_name"
                value={formData.database_name}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#03DAC6' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(31, 39, 54, 0.6)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(3, 218, 198, 0.25)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(3, 218, 198, 0.4)'
                    }
                  }
                }}
              />
              
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#FFB74D' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(31, 39, 54, 0.6)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(255, 183, 77, 0.25)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(255, 183, 77, 0.4)'
                    }
                  }
                }}
              />
              
              <TextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
                InputLabelProps={{
                  style: { color: '#FF5252' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(31, 39, 54, 0.6)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(255, 82, 82, 0.25)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(255, 82, 82, 0.4)'
                    }
                  }
                }}
              />
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="py-3"
                sx={{
                  background: 'linear-gradient(45deg, #7C4DFF, #03DAC6)',
                  backgroundSize: '200% 100%',
                  transition: 'all 0.3s ease',
                  marginTop: '24px',
                  height: '48px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '16px',
                  boxShadow: '0 4px 10px rgba(124, 77, 255, 0.3)',
                  '&:hover': {
                    backgroundPosition: 'right center',
                    boxShadow: '0 6px 15px rgba(124, 77, 255, 0.4)',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Add Database"}
              </Button>
            </form>
          </Paper>
          
          {/* Database List & Operations Section */}
          <Box className="space-y-6">
            {/* Database Selection */}
            <Paper className="p-6 rounded-lg shadow-md" sx={{ 
              backgroundColor: '#1F2736',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
              <Typography variant="h5" className="mb-4 font-semibold">
                Your Databases
              </Typography>
              
              {loading && <CircularProgress size={24} className="mx-auto my-4 block" />}
              
              {databases.length === 0 && !loading ? (
                <Typography className="text-gray-400 text-center py-4">
                  No databases added yet.
                </Typography>
              ) : (
                <Box className="divide-y divide-gray-700">
                  {databases.map((db) => (
                    <Box key={db.id} className="py-3 flex justify-between items-center">
                      <Box>
                        <Typography className="font-semibold">
                          {db.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {db.host}:{db.port}/{db.database_name}
                        </Typography>
                      </Box>
                      <Box className="space-x-2">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleTestConnection(db.id)}
                        >
                          Test
                        </Button>
                        <Button
                          size="small"
                          variant={selectedDb === db.id ? "contained" : "outlined"}
                          color="primary"
                          onClick={() => handleDatabaseSelect(db.id)}
                        >
                          {selectedDb === db.id ? "Selected" : "Select"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => openDeleteDialog(db.id)}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              
              {selectedDb && (
                <Box className="mt-4 pt-4 border-t border-gray-700">
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    Metadata Operations
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      disabled={metadataLoading}
                      onClick={handleExtractMetadata}
                      startIcon={<RefreshIcon />}
                    >
                      Extract Metadata
                    </Button>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      disabled={metadataLoading}
                      onClick={handleUpdateEmbeddings}
                    >
                      Update Embeddings
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      disabled={metadataLoading}
                      onClick={fetchSchema}
                    >
                      View Schema
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      disabled={metadataLoading}
                      onClick={fetchRelationships}
                    >
                      View Relationships
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
            
            {/* Tabs navigation for different operations */}
            {selectedDb && (
              <Paper className="rounded-lg shadow-md" sx={{ 
                backgroundColor: '#1F2736',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                  sx={{ 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    "& .MuiTabs-indicator": {
                      background: 'linear-gradient(90deg, #7C4DFF, #03DAC6)', // Updated to match theme
                    }
                  }}
                >
                  <Tab label="SQL Query" />
                  <Tab label="Schema" onClick={() => { if (!schemaData) fetchSchema(); }} />
                  <Tab label="Relationships" onClick={() => { if (!relationshipData) fetchRelationships(); }} />
                  <Tab label="Search" />
                </Tabs>
                
                <Box className="p-6">
                  {/* Query Tab Input Form */}
                  {activeTab === 0 && (
                    <Box>
                      <Typography variant="h6" className="mb-4">
                        Execute SQL Query
                      </Typography>
                      
                      {queryError && (
                        <Alert severity="error" className="mb-4">
                          {queryError}
                        </Alert>
                      )}
                      
                      <form onSubmit={handleExecuteQuery} className="space-y-4">
                        <TextField
                          label="SQL Query"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          fullWidth
                          multiline
                          rows={5}
                          variant="outlined"
                          placeholder="SELECT * FROM table_name"
                          required
                          className="font-mono"
                          sx={{ 
                            "& .MuiOutlinedInput-root": { 
                              backgroundColor: "rgba(31, 39, 54, 0.8)" 
                            } 
                          }}
                        />
                        
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={queryLoading}
                          startIcon={<PlayArrowIcon />}
                        >
                          {queryLoading ? "Executing..." : "Execute Query"}
                        </Button>
                      </form>
                    </Box>
                  )}
                  
                  {/* Schema Tab Input Area */}
                  {activeTab === 1 && (
                    <Box>
                      <Typography variant="h6" className="mb-4">
                        Database Schema
                      </Typography>
                      
                      {metadataLoading && (
                        <Box className="flex justify-center py-8">
                          <CircularProgress />
                        </Box>
                      )}
                      
                      {!metadataLoading && (!schemaData || schemaData.length === 0) && (
                        <Box className="text-center py-8">
                          <Typography className="text-gray-400 mb-4">
                            No schema data available. Please extract metadata first.
                          </Typography>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleExtractMetadata}
                            disabled={metadataLoading}
                          >
                            Extract Metadata
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {/* Relationships Tab Header */}
                  {activeTab === 2 && (
                    <Box>
                      <Typography variant="h6" className="mb-4">
                        Table Relationships
                      </Typography>
                      
                      {metadataLoading && (
                        <Box className="flex justify-center py-8">
                          <CircularProgress />
                        </Box>
                      )}
                      
                      {!metadataLoading && (!relationshipData || relationshipData.length === 0) && (
                        <Box className="text-center py-8">
                          <Typography className="text-gray-400 mb-4">
                            No relationship data available. Please extract metadata first.
                          </Typography>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleExtractMetadata}
                            disabled={metadataLoading}
                          >
                            Extract Metadata
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {/* Search Tab Input Form */}
                  {activeTab === 3 && (
                    <Box>
                      <Typography variant="h6" className="mb-4">
                        Search Metadata
                      </Typography>
                      
                      <form onSubmit={handleSearch} className="mb-6">
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'stretch', // Align items to make them the same height
                          '& .MuiInputBase-root': {
                            height: '100%' // Ensure consistent height
                          }
                        }}>
                          <TextField
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tables, columns, types..."
                            fullWidth
                            variant="outlined"
                            required
                            sx={{ 
                              "& .MuiOutlinedInput-root": { 
                                backgroundColor: "rgba(31, 39, 54, 0.8)",
                                borderRadius: '8px 0 0 8px'
                              } 
                            }}
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={metadataLoading}
                            sx={{ 
                              borderRadius: '0 8px 8px 0',
                              minWidth: '100px',
                              height: 'auto' // Match height of TextField
                            }}
                          >
                            {metadataLoading ? <CircularProgress size={24} /> : "Search"}
                          </Button>
                        </Box>
                      </form>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
        
        {/* Table Results Section - Full Width */}
        {selectedDb && (
          <Box className="mt-8 w-full">
            {/* Query Results Table */}
            {activeTab === 0 && queryResult && (
              <Paper className="w-full rounded-lg shadow-md overflow-hidden" sx={{ 
                backgroundColor: '#1F2736',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <Box className="p-4 border-b border-gray-700">
                  <Typography variant="subtitle1" className="font-semibold mb-2">
                    Results
                  </Typography>
                  <Typography variant="caption" className="text-gray-400 mb-2 block">
                    {queryResult.status}
                  </Typography>
                </Box>
                
                {queryResult.columns && queryResult.columns.length > 0 ? (
                  <Box className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          {queryResult.columns.map((column, idx) => (
                            <th
                              key={idx}
                              className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-gray-700 divide-y divide-gray-600">
                        {queryResult.rows.map((row, rowIdx) => (
                          <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
                            {row.map((cell, cellIdx) => (
                              <td
                                key={cellIdx}
                                className="px-3 py-2 text-sm text-gray-300 whitespace-nowrap"
                              >
                                {cell === null ? (
                                  <span className="text-gray-400 italic">NULL</span>
                                ) : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                ) : (
                  <Typography className="text-center text-gray-400 py-4">
                    No results returned
                  </Typography>
                )}
              </Paper>
            )}
            
            {/* Schema Data Tables */}
            {activeTab === 1 && schemaData && schemaData.length > 0 && (
              <Box className="space-y-6">
                {schemaData.map((table) => (
                  <Paper key={table.id} variant="outlined" className="overflow-hidden w-full" sx={{ 
                    backgroundColor: '#1F2736', 
                    borderColor: 'rgba(255, 255, 255, 0.12)'
                  }}>
                    <Box className="bg-gray-800 p-3 border-b border-gray-700">
                      <Box className="flex justify-between items-start">
                        <Box className="flex-grow">
                          <Typography variant="subtitle1" className="font-medium text-gray-200">
                            {table.schema_name}.{table.table_name}
                            <Chip
                              label={table.table_type}
                              size="small"
                              variant="outlined"
                              className="ml-2 text-xs"
                              sx={{ backgroundColor: 'rgba(31, 39, 54, 0.8)' }}
                            />
                          </Typography>
                          
                          {/* Table Description */}
                          {editingDescription === `table_${table.id}` ? (
                            <Box className="mt-2">
                              <TextField
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  "& .MuiOutlinedInput-root": { 
                                    backgroundColor: "rgba(31, 39, 54, 0.8)" 
                                  } 
                                }}
                              />
                              <Box className="flex gap-2 mt-2">
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleSaveDescription('table', table.id, editDescription)}
                                  startIcon={<CheckIcon />}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => generateAIDescription('table', table.table_name, {
                                    schema: table.schema_name,
                                    columns: table.columns.map(c => c.name).join(', ')
                                  })}
                                  disabled={descriptionLoading}
                                  startIcon={<AutoAwesomeIcon />}
                                >
                                  {descriptionLoading ? "Generating..." : "AI Generate"}
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setEditingDescription(null)}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Box className="group relative mt-1">
                              <Typography variant="body2" className="text-gray-300">
                                {table.description || "No description available."}
                                <IconButton
                                  size="small"
                                  className="ml-1 opacity-0 group-hover:opacity-100"
                                  onClick={() => handleEditDescription('table', table.id, table.description || "")}
                                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Typography>
                            </Box>
                          )}
                          
                          {table.row_count !== null && (
                            <Typography variant="caption" className="text-gray-400 mt-1 block">
                              Rows: {table.row_count}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Table Columns */}
                    <Box className="overflow-x-auto w-full">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr className="bg-gray-800">
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                                style={{ color: '#7C4DFF', borderBottom: '2px solid #7C4DFF' }}>
                              Column
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                                style={{ color: '#03DAC6', borderBottom: '2px solid #03DAC6' }}>
                              Type
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                                style={{ color: '#FF5252', borderBottom: '2px solid #FF5252' }}>
                              Nullable
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                                style={{ color: '#FFB74D', borderBottom: '2px solid #FFB74D' }}>
                              Key
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                                style={{ color: '#29B6F6', borderBottom: '2px solid #29B6F6' }}>
                              Description
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                                style={{ color: '#66BB6A', borderBottom: '2px solid #66BB6A' }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((column, colIdx) => (
                            <tr key={column.id}>
                              <td className="px-3 py-2 text-sm font-medium"
                                  style={{ 
                                    backgroundColor: colIdx % 2 === 0 
                                      ? 'rgba(124, 77, 255, 0.25)'
                                      : 'rgba(124, 77, 255, 0.15)',
                                    color: '#7C4DFF'
                                  }}>
                                {column.name}
                              </td>
                              <td className="px-3 py-2 text-sm"
                                  style={{ 
                                    backgroundColor: colIdx % 2 === 0 
                                      ? 'rgba(3, 218, 198, 0.25)'
                                      : 'rgba(3, 218, 198, 0.15)',
                                    color: '#03DAC6'
                                  }}>
                                {column.data_type}
                              </td>
                              <td className="px-3 py-2 text-sm"
                                  style={{ 
                                    backgroundColor: colIdx % 2 === 0 
                                      ? 'rgba(255, 82, 82, 0.25)'
                                      : 'rgba(255, 82, 82, 0.15)',
                                    color: '#FF5252'
                                  }}>
                                {column.is_nullable ? "Yes" : "No"}
                              </td>
                              <td className="px-3 py-2 text-sm"
                                  style={{ 
                                    backgroundColor: colIdx % 2 === 0 
                                      ? 'rgba(255, 183, 77, 0.25)'
                                      : 'rgba(255, 183, 77, 0.15)',
                                    color: '#FFB74D'
                                  }}>
                                {column.is_primary_key && (
                                  <Chip label="PK" size="small" color="primary" variant="outlined" className="mr-1" sx={{ backgroundColor: 'rgba(31, 39, 54, 0.8)' }} />
                                )}
                                {column.is_foreign_key && (
                                  <Chip label="FK" size="small" color="secondary" variant="outlined" sx={{ backgroundColor: 'rgba(31, 39, 54, 0.8)' }} />
                                )}
                              </td>
                              <td className="px-3 py-2 text-sm"
                                  style={{ 
                                    backgroundColor: colIdx % 2 === 0 
                                      ? 'rgba(41, 182, 246, 0.25)'
                                      : 'rgba(41, 182, 246, 0.15)',
                                    color: '#29B6F6'
                                  }}>
                                {editingDescription === `column_${column.id}` ? (
                                  <TextField
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    size="small"
                                    variant="outlined"
                                    sx={{ 
                                      "& .MuiOutlinedInput-root": { 
                                        backgroundColor: "rgba(31, 39, 54, 0.8)" 
                                      } 
                                    }}
                                  />
                                ) : (
                                  column.description || "-"
                                )}
                              </td>
                              <td className="px-3 py-2 text-sm"
                                  style={{ 
                                    backgroundColor: colIdx % 2 === 0 
                                      ? 'rgba(102, 187, 106, 0.25)'
                                      : 'rgba(102, 187, 106, 0.15)',
                                    color: '#66BB6A'
                                  }}>
                                {editingDescription === `column_${column.id}` ? (
                                  <Box className="flex gap-1">
                                    <Tooltip title="Save">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => handleSaveDescription('column', column.id, editDescription)}
                                      >
                                        <CheckIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Generate with AI">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => generateAIDescription('column', column.name, {
                                          table: table.table_name,
                                          schema: table.schema_name,
                                          data_type: column.data_type,
                                          is_nullable: column.is_nullable,
                                          is_primary_key: column.is_primary_key,
                                          is_foreign_key: column.is_foreign_key
                                        })}
                                        disabled={descriptionLoading}
                                      >
                                        <AutoAwesomeIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel">
                                      <IconButton
                                        size="small"
                                        onClick={() => setEditingDescription(null)}
                                      >
                                        <CloseIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                ) : (
                                  <Tooltip title="Edit Description">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditDescription('column', column.id, column.description || "")}
                                      style={{ color: '#66BB6A' }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
            
            {/* Relationships Table */}
            {activeTab === 2 && relationshipData && relationshipData.length > 0 && (
              <Paper className="overflow-hidden w-full rounded-lg shadow-md" sx={{ 
                backgroundColor: '#1F2736',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <Box className="p-4 border-b border-gray-700">
                  <Typography variant="subtitle1" className="font-semibold">
                    Table Relationships
                  </Typography>
                </Box>
                <Box className="overflow-x-auto w-full">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: '#7C4DFF', borderBottom: '2px solid #7C4DFF' }}>
                          From Table
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: '#03DAC6', borderBottom: '2px solid #03DAC6' }}>
                          From Column
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: '#FF5252', borderBottom: '2px solid #FF5252' }}>
                          Relationship
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: '#FFB74D', borderBottom: '2px solid #FFB74D' }}>
                          To Table
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                            style={{ color: '#29B6F6', borderBottom: '2px solid #29B6F6' }}>
                          To Column
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {relationshipData.map((rel, relIdx) => (
                        <tr key={rel.id}>
                          <td className="px-3 py-2 text-sm"
                              style={{ 
                                backgroundColor: relIdx % 2 === 0 
                                  ? 'rgba(124, 77, 255, 0.25)'
                                  : 'rgba(124, 77, 255, 0.15)',
                                color: '#7C4DFF'
                              }}>
                            {rel.from_schema}.{rel.from_table}
                          </td>
                          <td className="px-3 py-2 text-sm"
                              style={{ 
                                backgroundColor: relIdx % 2 === 0 
                                  ? 'rgba(3, 218, 198, 0.25)'
                                  : 'rgba(3, 218, 198, 0.15)',
                                color: '#03DAC6'
                              }}>
                            {rel.from_column}
                          </td>
                          <td className="px-3 py-2 text-sm"
                              style={{ 
                                backgroundColor: relIdx % 2 === 0 
                                  ? 'rgba(255, 82, 82, 0.25)'
                                  : 'rgba(255, 82, 82, 0.15)',
                                color: '#FF5252'
                              }}>
                            <Chip
                              label={rel.relationship_type}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ backgroundColor: 'rgba(31, 39, 54, 0.8)' }}
                            />
                          </td>
                          <td className="px-3 py-2 text-sm"
                              style={{ 
                                backgroundColor: relIdx % 2 === 0 
                                  ? 'rgba(255, 183, 77, 0.25)'
                                  : 'rgba(255, 183, 77, 0.15)',
                                color: '#FFB74D'
                              }}>
                            {rel.to_schema}.{rel.to_table}
                          </td>
                          <td className="px-3 py-2 text-sm"
                              style={{ 
                                backgroundColor: relIdx % 2 === 0 
                                  ? 'rgba(41, 182, 246, 0.25)'
                                  : 'rgba(41, 182, 246, 0.15)',
                                color: '#29B6F6'
                              }}>
                            {rel.to_column}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Paper>
            )}
            
            {/* Search Results */}
            {activeTab === 3 && searchResults && (
              <Paper className="w-full rounded-lg shadow-md p-4" sx={{ 
                backgroundColor: '#1F2736',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}>
                <Typography variant="subtitle1" className="font-semibold mb-4">
                  Search Results
                </Typography>
                
                {searchResults.length === 0 ? (
                  <Typography className="text-gray-400 text-center py-4">
                    No results found for "{searchQuery}"
                  </Typography>
                ) : (
                  <Box className="space-y-3">
                    {searchResults.map((result, idx) => (
                      <Paper key={idx} variant="outlined" className="p-3" sx={{ 
                        backgroundColor: 'rgba(31, 39, 54, 0.8)', 
                        borderColor: 'rgba(255, 255, 255, 0.12)'
                      }}>
                        {result.type === 'table' ? (
                          <Box>
                            <Box className="flex items-center">
                              <Chip
                                label="Table"
                                size="small"
                                color="primary"
                                className="mr-2"
                                sx={{ backgroundColor: 'rgba(31, 39, 54, 0.8)' }}
                              />
                              <Typography variant="subtitle2">
                                {result.schema}.{result.name}
                              </Typography>
                            </Box>
                            {result.description && (
                              <Typography variant="body2" className="text-gray-300 mt-1">
                                {result.description}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <Box className="flex items-center">
                              <Chip
                                label="Column"
                                size="small"
                                color="secondary"
                                className="mr-2"
                                sx={{ backgroundColor: 'rgba(31, 39, 54, 0.8)' }}
                              />
                              <Typography variant="subtitle2">
                                {result.schema}.{result.table_name}.{result.name}
                              </Typography>
                              <Typography variant="caption" className="text-gray-400 ml-2">
                                ({result.data_type})
                              </Typography>
                            </Box>
                            {result.description && (
                              <Typography variant="body2" className="text-gray-300 mt-1">
                                {result.description}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        )}
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
          PaperProps={{
            sx: {
              backgroundColor: '#1F2736',
              color: '#fff'
            }
          }}
        >
          <DialogTitle id="delete-dialog-title" sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
            Confirm Database Deletion
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>
              Are you sure you want to delete this database connection? This action cannot be undone.
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Note: This will only remove the connection from this application, not delete the actual database.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', px: 3, py: 2 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              variant="outlined"
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(255, 255, 255, 0.23)' 
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteDatabase} 
              color="error" 
              variant="contained"
              startIcon={<DeleteIcon />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default DatabaseTester;