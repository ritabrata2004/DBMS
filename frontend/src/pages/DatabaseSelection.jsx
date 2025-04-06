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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import LogoutIcon from '@mui/icons-material/Logout';
import StorageIcon from '@mui/icons-material/Storage';
import EditIcon from '@mui/icons-material/Edit';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

function DatabaseSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      setLoading(false);
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

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ pt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main' }}>
              Database Management System
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={() => navigate('/logout')}
              sx={{ py: 1.5, px: 3, borderRadius: 2 }}
            >
              Sign Out
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ py: 1.5, px: 3, borderRadius: 2 }}
            >
              Add New Database
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', display: 'flex', alignItems: 'center' }}>
              <StorageIcon sx={{ mr: 1 }} />
              Your Databases
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : databases.length === 0 ? (
              <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                No databases available. Add a new database to get started.
              </Typography>
            ) : (
              <List sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
                {databases.map((db) => (
                  <ListItem key={db.id} disablePadding divider>
                    <ListItemButton onClick={() => handleSelectDatabase(db)}>
                      <ListItemText 
                        primary={db.name} 
                        secondary={db.description || `PostgreSQL Database at ${db.host}:${db.port}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: db.connection_status === 'connected' ? 'success.main' : 
                                db.connection_status === 'error' ? 'error.main' : 'warning.main',
                          fontWeight: 'bold',
                          mr: 1
                        }}
                      >
                        {db.connection_status?.toUpperCase() || 'UNKNOWN'}
                      </Typography>
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={(event) => openDeleteDialog(db, event)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
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
          >
            <DialogTitle>Add New PostgreSQL Database</DialogTitle>
            <DialogContent>
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
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => {
                  setAddDialogOpen(false);
                  resetNewDatabaseForm();
                }} 
                color="inherit"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddDatabaseSubmit} 
                variant="contained"
                disabled={loading}
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
          >
            <DialogTitle>{selectedDatabase?.name || 'Database Options'}</DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                What would you like to do with this database?
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleUpdateMetadata}
                    sx={{ py: 2, justifyContent: 'flex-start' }}
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
                    sx={{ py: 2, justifyContent: 'flex-start' }}
                  >
                    Query Database
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOptionsDialogOpen(false)} color="inherit">
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
          >
            <DialogTitle>Delete Database</DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete the database "{databaseToDelete?.name}"? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDatabaseToDelete(null);
                }} 
                color="inherit"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteDatabase} 
                variant="contained"
                color="error"
                disabled={loading}
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
        </Paper>
      </Container>
    </>
  );
}

export default DatabaseSelection;