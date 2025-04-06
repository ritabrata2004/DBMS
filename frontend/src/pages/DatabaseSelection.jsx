import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Container, 
  Button, 
  TextField, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  IconButton,
  alpha,
  Zoom,
  Fade,
  Card,
  CardContent,
  useTheme,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import LogoutIcon from '@mui/icons-material/Logout';
import StorageIcon from '@mui/icons-material/Storage';
import EditIcon from '@mui/icons-material/Edit';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

// Wrap a component with framer-motion
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionContainer = motion(Container);
const MotionIconButton = motion(IconButton);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: { 
    y: -15,
    scale: 1.03,
    boxShadow: "0px 20px 30px rgba(0, 0, 0, 0.3)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  },
  tap: { 
    scale: 0.98,
    boxShadow: "0px 10px 15px rgba(0, 0, 0, 0.2)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

function DatabaseSelection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  
  // Add Database Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDatabaseInfo, setNewDatabaseInfo] = useState({
    name: '',
    description: '',
    host: '',
    port: '5432',
    database_name: '',
    username: '',
    password: '',
    ssl_enabled: false
  });
  
  // Option Dialog
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  
  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [databaseToDelete, setDatabaseToDelete] = useState(null);
  
  // Errors and messages
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch databases on component mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const response = await api.getDatabases();
      setDatabases(response.data);
    } catch (error) {
      console.error('Error fetching databases:', error);
      showSnackbar('Failed to fetch databases', 'error');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800); // Small delay to show the loading animation
    }
  };

  const handleAddDatabaseChange = (e) => {
    const { name, value } = e.target;
    setNewDatabaseInfo({
      ...newDatabaseInfo,
      [name]: value
    });
  };

  const handleAddDatabaseSubmit = async () => {
    if (!validateDatabaseForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.createDatabase(newDatabaseInfo);
      setDatabases([...databases, response.data]);
      setAddDialogOpen(false);
      resetNewDatabaseForm();
      showSnackbar(`Database "${newDatabaseInfo.name}" added successfully`, 'success');
    } catch (error) {
      console.error('Error adding database:', error);
      setError(error.response?.data?.message || 'Error adding database');
      showSnackbar('Failed to add database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateDatabaseForm = () => {
    if (!newDatabaseInfo.name.trim()) {
      setError('Database name is required');
      return false;
    }
    if (!newDatabaseInfo.host.trim()) {
      setError('Host is required');
      return false;
    }
    if (!newDatabaseInfo.database_name.trim()) {
      setError('Database name is required');
      return false;
    }
    if (!newDatabaseInfo.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!newDatabaseInfo.password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const resetNewDatabaseForm = () => {
    setNewDatabaseInfo({
      name: '',
      description: '',
      host: '',
      port: '5432',
      database_name: '',
      username: '',
      password: '',
      ssl_enabled: false
    });
    setError(null);
  };

  const handleSelectDatabase = (database) => {
    setSelectedDatabase(database);
    // Store selected database in localStorage for access across the app
    localStorage.setItem('selectedDatabase', JSON.stringify(database));
    setOptionsDialogOpen(true);
  };

  const handleUpdateMetadata = () => {
    navigate(`/db-tester`, { state: { database: selectedDatabase } });
    setOptionsDialogOpen(false);
  };

  const handleQueryDatabase = () => {
    navigate('/sessions', { state: { database: selectedDatabase } });
    setOptionsDialogOpen(false);
  };

  const handleDeleteDatabase = async () => {
    if (!databaseToDelete) return;
    
    setLoading(true);
    try {
      await api.deleteDatabase(databaseToDelete.id);
      
      // Update the local state to remove the deleted database
      setDatabases(databases.filter(db => db.id !== databaseToDelete.id));
      
      // Show success message
      showSnackbar(`Database "${databaseToDelete.name}" deleted successfully`, 'success');
      
      // Close the dialog and reset state
      setDeleteDialogOpen(false);
      setDatabaseToDelete(null);
    } catch (error) {
      console.error('Error deleting database:', error);
      showSnackbar('Failed to delete database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (db, event) => {
    // Stop propagation to prevent the list item click from triggering
    event.stopPropagation();
    setDatabaseToDelete(db);
    setDeleteDialogOpen(true);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'connected':
        return 'linear-gradient(45deg, #03DAC6 0%, #64FFDA 100%)';
      case 'error':
        return 'linear-gradient(45deg, #CF0000 0%, #FF5252 100%)';
      default:
        return 'linear-gradient(45deg, #C67C00 0%, #FFAB40 100%)';
    }
  };

  return (
    <>
      <Navbar />
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          padding: theme => `calc(${theme.spacing(8)} + 70px) 0 ${theme.spacing(4)}`,
          width: '100%',
          background: 'radial-gradient(circle at top right, rgba(124, 77, 255, 0.03), rgba(0, 0, 0, 0.15))',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124, 77, 255, 0.1) 0%, rgba(124, 77, 255, 0) 70%)',
            filter: 'blur(80px)',
            top: '5%',
            right: '5%',
            transform: 'translate(50%, -50%)',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(3, 218, 198, 0.08) 0%, rgba(3, 218, 198, 0) 70%)',
            filter: 'blur(60px)',
            bottom: '10%',
            left: '5%',
            transform: 'translate(-50%, 50%)',
            zIndex: 0,
          }
        }}
      >
        <MotionContainer 
          maxWidth="lg" 
          component={motion.div}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <MotionPaper
            variants={itemVariants}
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(26, 35, 50, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              zIndex: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #7C4DFF, #03DAC6, #64FFDA)',
                backgroundSize: '200% 100%',
                animation: 'gradient-animation 4s linear infinite',
                '@keyframes gradient-animation': {
                  '0%': { backgroundPosition: '0% 0%' },
                  '100%': { backgroundPosition: '200% 0%' },
                }
              }
            }}
          >
            <MotionBox 
              variants={itemVariants}
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                mb: 4 
              }}
            >
              <MotionTypography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #7C4DFF, #03DAC6)',
                  backgroundSize: '200% auto',
                  animation: 'gradient-text-animation 4s infinite linear',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: { xs: 2, md: 0 },
                  '@keyframes gradient-text-animation': {
                    '0%': { backgroundPosition: '0% center' },
                    '100%': { backgroundPosition: '200% center' },
                  }
                }}
              >
                Database Management
              </MotionTypography>
              
              <MotionButton
                component={motion.button}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 0 20px rgba(124, 77, 255, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => navigate('/logout')}
                sx={{ 
                  py: 1.5, 
                  px: 3, 
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  background: alpha(theme.palette.background.paper, 0.2),
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: theme.palette.primary.main,
                  }
                }}
              >
                Sign Out
              </MotionButton>
            </MotionBox>
            
            <MotionBox
              variants={itemVariants}
              sx={{
                display: 'flex', 
                justifyContent: 'center', 
                gap: 3, 
                mb: 5,
                flexWrap: 'wrap',
              }}
            >
              <MotionButton
                component={motion.button}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 10px 25px rgba(124, 77, 255, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
                sx={{ 
                  py: 1.8, 
                  px: 4, 
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 15px rgba(124, 77, 255, 0.3)',
                }}
              >
                Add New Database
              </MotionButton>
              
              <MotionButton
                component={motion.button}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 10px 25px rgba(3, 218, 198, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 10
                }}
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  py: 1.8, 
                  px: 4, 
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 15px rgba(3, 218, 198, 0.3)',
                }}
              >
                Dashboard
              </MotionButton>
            </MotionBox>

            <MotionBox variants={itemVariants} sx={{ mt: 5 }}>
              <MotionBox 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3, 
                  background: alpha(theme.palette.background.paper, 0.3),
                  backdropFilter: 'blur(8px)',
                  borderRadius: 3,
                  p: 2,
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                }}
              >
                <MotionBox
                  component={motion.div}
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatDelay: 5,
                    duration: 1.5
                  }}
                >
                  <StorageIcon sx={{ 
                    mr: 2, 
                    fontSize: 32, 
                    color: theme.palette.primary.main,
                    filter: 'drop-shadow(0 2px 5px rgba(124, 77, 255, 0.4))'
                  }} />
                </MotionBox>
                <Typography variant="h5" sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}>
                  Your Databases
                </Typography>
              </MotionBox>
              <Divider sx={{ 
                mb: 4,
                borderColor: alpha(theme.palette.divider, 0.1),
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }} />
              
              {loading ? (
                <MotionBox 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 12,
                    flexDirection: 'column',
                    gap: 3
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <CircularProgress size={70} thickness={4} sx={{
                      color: theme.palette.primary.main,
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      }
                    }} />
                  </motion.div>
                  <MotionTypography
                    variant="h6"
                    animate={{
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    sx={{ color: alpha(theme.palette.text.primary, 0.7) }}
                  >
                    Loading your databases...
                  </MotionTypography>
                </MotionBox>
              ) : databases.length === 0 ? (
                <MotionPaper
                  variants={itemVariants}
                  elevation={0}
                  sx={{ 
                    py: 8, 
                    px: 4, 
                    textAlign: 'center', 
                    borderRadius: 4,
                    background: alpha(theme.palette.background.paper, 0.2),
                    backdropFilter: 'blur(8px)',
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.divider, 0.4)
                  }}
                >
                  <MotionBox
                    component={motion.div}
                    animate={{ 
                      y: [0, -10, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatDelay: 1.5,
                      duration: 2
                    }}
                    sx={{ mb: 3 }}
                  >
                    <StorageIcon sx={{ 
                      fontSize: 80,
                      color: alpha(theme.palette.primary.main, 0.5),
                      filter: 'drop-shadow(0 4px 8px rgba(124, 77, 255, 0.3))'
                    }} />
                  </MotionBox>
                  
                  <Typography variant="h5" sx={{ 
                    color: alpha(theme.palette.text.primary, 0.9),
                    fontWeight: 600,
                    mb: 2,
                    background: 'linear-gradient(45deg, #7C4DFF, #03DAC6)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    No databases available yet
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: alpha(theme.palette.text.secondary, 0.9),
                    maxWidth: '600px',
                    mx: 'auto',
                    mb: 4,
                    lineHeight: 1.6
                  }}>
                    Get started by adding a new database connection to begin querying your data with natural language.
                    Add PostgreSQL databases to explore with AI-powered natural language queries.
                  </Typography>
                  <MotionButton
                    component={motion.button}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: '0 10px 25px rgba(124, 77, 255, 0.5)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }}
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddDialogOpen(true)}
                    size="large"
                    sx={{ 
                      py: 1.5, 
                      px: 4, 
                      borderRadius: 3,
                      fontSize: '1rem',
                      boxShadow: '0 8px 15px rgba(124, 77, 255, 0.3)',
                    }}
                  >
                    Add Your First Database
                  </MotionButton>
                </MotionPaper>
              ) : (
                <MotionBox
                  component={motion.div}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Grid container spacing={3}>
                    {databases.map((db, index) => (
                      <Grid item xs={12} sm={6} md={4} key={db.id}>
                        <MotionCard
                          component={motion.div}
                          variants={cardVariants}
                          whileHover="hover"
                          whileTap="tap"
                          custom={index}
                          onClick={() => handleSelectDatabase(db)}
                          sx={{ 
                            height: '100%',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: 'rgba(26, 35, 50, 0.7)',
                            backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              width: '30%',
                              height: '5px',
                              background: getStatusColor(db.connection_status),
                              borderRadius: '0 0 0 8px'
                            }
                          }}
                        >
                          <CardContent sx={{ 
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 2
                            }}>
                              <MotionTypography 
                                variant="h6" 
                                fontWeight="bold" 
                                component={motion.h6}
                                animate={{ 
                                  color: [
                                    theme.palette.text.primary, 
                                    theme.palette.primary.light,
                                    theme.palette.text.primary
                                  ] 
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 5
                                }}
                                sx={{ mb: 1 }}
                              >
                                {db.name}
                              </MotionTypography>
                              <Box sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 10,
                                background: getStatusColor(db.connection_status),
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                              }}>
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    repeatDelay: 2 
                                  }}
                                >
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: '#fff',
                                      fontWeight: 'bold',
                                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                                    }}
                                  >
                                    {db.connection_status?.toUpperCase() || 'UNKNOWN'}
                                  </Typography>
                                </motion.div>
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" sx={{ 
                              color: alpha(theme.palette.text.secondary, 0.9),
                              mb: 2,
                              flexGrow: 1,
                            }}>
                              {db.description || `PostgreSQL Database at ${db.host}:${db.port}`}
                            </Typography>
                            
                            <Box sx={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mt: 'auto',
                              pt: 2,
                              borderTop: '1px solid',
                              borderColor: alpha(theme.palette.divider, 0.1)
                            }}>
                              <Tooltip title="Query this database" arrow>
                                <MotionButton
                                  component={motion.button}
                                  whileHover={{ 
                                    scale: 1.1,
                                    boxShadow: '0 0 15px rgba(124, 77, 255, 0.4)'
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 10
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectDatabase(db);
                                    handleQueryDatabase();
                                  }}
                                  variant="outlined"
                                  size="small"
                                  startIcon={<QueryStatsIcon />}
                                  sx={{ 
                                    borderRadius: 2,
                                    borderColor: alpha(theme.palette.primary.main, 0.5),
                                    '&:hover': {
                                      borderColor: theme.palette.primary.main,
                                      background: alpha(theme.palette.primary.main, 0.1)
                                    }
                                  }}
                                >
                                  Query
                                </MotionButton>
                              </Tooltip>
                              
                              <Tooltip title="Delete database" arrow>
                                <MotionIconButton 
                                  component={motion.button}
                                  whileHover={{ 
                                    scale: 1.1,
                                    boxShadow: '0 0 15px rgba(255, 82, 82, 0.4)'
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 10
                                  }}
                                  edge="end" 
                                  aria-label="delete" 
                                  onClick={(event) => openDeleteDialog(db, event)}
                                  color="error"
                                  sx={{
                                    '&:hover': {
                                      background: alpha(theme.palette.error.main, 0.1)
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </MotionIconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </MotionCard>
                      </Grid>
                    ))}
                  </Grid>
                </MotionBox>
              )}
            </MotionBox>
          </MotionPaper>
        </MotionContainer>
      </Box>

      {/* Add Database Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => {
          setAddDialogOpen(false);
          resetNewDatabaseForm();
        }}
        fullWidth
        maxWidth="md"
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 400 }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.97) 0%, rgba(20, 24, 40, 0.98) 100%)',
            backgroundImage: 'linear-gradient(135deg, rgba(124, 77, 255, 0.02) 0%, rgba(3, 218, 198, 0.02) 100%)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #7C4DFF, #03DAC6)',
              borderRadius: '4px 4px 0 0'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3, 
          color: '#fff',
          fontWeight: 'bold',
          background: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <StorageIcon sx={{ color: theme.palette.primary.main }} />
          Add New PostgreSQL Database
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Database Display Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newDatabaseInfo.name}
                onChange={handleAddDatabaseChange}
                required
                error={error && !newDatabaseInfo.name}
                helperText={error && !newDatabaseInfo.name ? 'Display name is required' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transition: 'border-color 0.3s'
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.6)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="description"
                label="Description (Optional)"
                type="text"
                fullWidth
                variant="outlined"
                value={newDatabaseInfo.description}
                onChange={handleAddDatabaseChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transition: 'border-color 0.3s'
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.6)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="host"
                label="Host"
                type="text"
                fullWidth
                variant="outlined"
                value={newDatabaseInfo.host}
                onChange={handleAddDatabaseChange}
                required
                error={error && !newDatabaseInfo.host}
                helperText={error && !newDatabaseInfo.host ? 'Host is required' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transition: 'border-color 0.3s'
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.6)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="port"
                label="Port"
                type="text"
                fullWidth
                variant="outlined"
                value={newDatabaseInfo.port}
                onChange={handleAddDatabaseChange}
                required
                error={error && !newDatabaseInfo.port}
                helperText={error && !newDatabaseInfo.port ? 'Port is required' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transition: 'border-color 0.3s'
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.6)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="database_name"
                label="Database Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newDatabaseInfo.database_name}
                onChange={handleAddDatabaseChange}
                required
                error={error && !newDatabaseInfo.database_name}
                helperText={error && !newDatabaseInfo.database_name ? 'Database name is required' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transition: 'border-color 0.3s'
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.6)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="username"
                label="Username"
                type="text"
                fullWidth
                variant="outlined"
                value={newDatabaseInfo.username}
                onChange={handleAddDatabaseChange}
                required
                error={error && !newDatabaseInfo.username}
                helperText={error && !newDatabaseInfo.username ? 'Username is required' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transition: 'border-color 0.3s'
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.6)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="password"
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={newDatabaseInfo.password}
                onChange={handleAddDatabaseChange}
                required
                error={error && !newDatabaseInfo.password}
                helperText={error && !newDatabaseInfo.password ? 'Password is required' : ''}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transition: 'border-color 0.3s'
                    },
                    '&:hover fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.6)
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                      boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => {
              setAddDialogOpen(false);
              resetNewDatabaseForm();
            }} 
            color="inherit"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: alpha(theme.palette.text.primary, 0.8),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.1),
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddDatabaseSubmit} 
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              background: 'linear-gradient(45deg, #7C4DFF, #03DAC6)',
              boxShadow: '0 4px 12px rgba(124, 77, 255, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 18px rgba(124, 77, 255, 0.6)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Database'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Database Options Dialog */}
      <Dialog
        open={optionsDialogOpen}
        onClose={() => setOptionsDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 400 }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.97) 0%, rgba(18, 26, 41, 0.98) 100%)',
            backgroundImage: 'linear-gradient(135deg, rgba(124, 77, 255, 0.02) 0%, rgba(3, 218, 198, 0.02) 100%)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #7C4DFF, #03DAC6)',
              borderRadius: '4px 4px 0 0'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3, 
          color: '#fff',
          fontWeight: 'bold',
          background: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <StorageIcon sx={{ color: theme.palette.primary.main }} />
          {selectedDatabase?.name || 'Database Options'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: alpha(theme.palette.text.primary, 0.8) }}>
            What would you like to do with this database?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleUpdateMetadata}
                sx={{ 
                  py: 2, 
                  justifyContent: 'flex-start',
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: alpha('#7C4DFF', 0.5),
                  color: alpha('#7C4DFF', 0.9),
                  backdropFilter: 'blur(5px)',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#7C4DFF',
                    background: alpha('#7C4DFF', 0.05),
                    boxShadow: `0 0 20px ${alpha('#7C4DFF', 0.2)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Update Database Metadata
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QueryStatsIcon />}
                onClick={handleQueryDatabase}
                sx={{ 
                  py: 2, 
                  justifyContent: 'flex-start',
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: alpha('#03DAC6', 0.5),
                  color: alpha('#03DAC6', 0.9),
                  backdropFilter: 'blur(5px)',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#03DAC6',
                    background: alpha('#03DAC6', 0.05),
                    boxShadow: `0 0 20px ${alpha('#03DAC6', 0.2)}`,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Query Database
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOptionsDialogOpen(false)} 
            color="inherit"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: alpha(theme.palette.text.primary, 0.8),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.1),
              }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Database Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDatabaseToDelete(null);
        }}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 400 }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(34, 35, 48, 0.97) 0%, rgba(25, 26, 45, 0.98) 100%)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #FF5252, #FF1744)',
              borderRadius: '4px 4px 0 0'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3, 
          color: '#fff',
          fontWeight: 'bold',
          background: alpha(theme.palette.background.paper, 0.1),
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon color="error" /> Delete Database
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert 
            severity="warning" 
            variant="filled" 
            sx={{ 
              mb: 3,
              borderRadius: 2
            }}
          >
            This action cannot be undone
          </Alert>
          <Typography variant="body1" sx={{ color: alpha(theme.palette.text.primary, 0.9) }}>
            Are you sure you want to delete the database <strong>"{databaseToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: alpha(theme.palette.text.secondary, 0.8) }}>
            This will permanently delete the database connection from the system. All sessions and queries associated with this database will also be removed. This action cannot be reversed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setDatabaseToDelete(null);
            }} 
            color="inherit"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              color: alpha(theme.palette.text.primary, 0.8),
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.1),
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteDatabase} 
            variant="contained"
            color="error"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              background: 'linear-gradient(45deg, #FF5252, #FF1744)',
              boxShadow: '0 4px 12px rgba(255, 82, 82, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 18px rgba(255, 82, 82, 0.6)',
                background: 'linear-gradient(45deg, #FF1744, #FF5252)',
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default DatabaseSelection;