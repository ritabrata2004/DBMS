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
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import DatabaseIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LoadingIndicator from '../components/LoadingIndicator';
import Layout from '../components/Layout';

function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [databases, setDatabases] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [editingSession, setEditingSession] = useState(null);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [databaseError, setDatabaseError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState(null);

  // Fetch user sessions and available databases when component mounts
  useEffect(() => {
    fetchSessions();
    loadDatabases();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Could not load your sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load available databases
  const loadDatabases = () => {
    try {
      // In a real implementation, this would call an API
      // Since the backend isn't ready, we'll use hardcoded databases
      setDatabases([
        { id: 1, name: 'Customer Database' },
        { id: 2, name: 'Product Inventory' },
        { id: 3, name: 'Sales Records' },
        { id: 4, name: 'Employee Directory' },
        { id: 5, name: 'Market Research' }
      ]);
    } catch (error) {
      console.error('Error loading databases:', error);
    }
  };

  const handleCreateSession = async () => {
    // Validate database selection
    if (!selectedDatabase) {
      setDatabaseError('Please select a database for this session');
      return;
    }

    try {
      const response = await api.createSession(newSessionTitle || 'New Session', selectedDatabase);
      setSessions([response.data, ...sessions]);
      
      // Reset form
      setNewSessionTitle('');
      setSelectedDatabase(null);
      setDatabaseError('');
      setCreateDialogOpen(false);
      
      setSnackbarMessage('Session created successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Could not create session. Please try again.');
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    
    try {
      await api.updateSessionTitle(editingSession.id, newSessionTitle);
      setSessions(sessions.map(s => 
        s.id === editingSession.id ? { ...s, title: newSessionTitle } : s
      ));
      setEditDialogOpen(false);
      setEditingSession(null);
      setNewSessionTitle('');
      
      setSnackbarMessage('Session updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating session:', error);
      setError('Could not update session. Please try again.');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await api.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      setSnackbarMessage('Session deleted successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Could not delete session. Please try again.');
    }
  };

  const openEditDialog = (session) => {
    setEditingSession(session);
    setNewSessionTitle(session.title);
    setEditDialogOpen(true);
  };

  const handleSelectSession = (session) => {
    // Navigate to the query page with the selected session
    navigate('/query', { state: { sessionId: session.id } });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <LoadingIndicator />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading your sessions...
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ pt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
              Your Sessions
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ py: 1.5, px: 3, borderRadius: 2 }}
              >
                New Session
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => navigate('/logout')}
                sx={{ py: 1.5, px: 3, borderRadius: 2 }}
              >
                Sign Out
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {sessions.length === 0 ? (
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 8,
              bgcolor: 'background.default',
              borderRadius: 2
            }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                No sessions found
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
                Create your first session to get started with the database query system
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create New Session
              </Button>
            </Box>
          ) : (
            <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
              {sessions.map((session) => (
                <ListItem 
                  key={session.id}
                  disablePadding
                  secondaryAction={
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Edit session title">
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(session);
                        }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete session">
                        <IconButton onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  divider
                >
                  <ListItemButton onClick={() => handleSelectSession(session)} sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                          {session.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {session.database_name && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              <DatabaseIcon fontSize="small" sx={{ color: 'secondary.main', mr: 0.5 }} />
                              <Typography variant="body2" color="text.secondary">
                                {session.database_name}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            Last updated: {formatDate(session.updated_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      {/* Create Session Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            placeholder="New Session"
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth error={!!databaseError}>
            <InputLabel id="database-select-label">Select Database</InputLabel>
            <Select
              labelId="database-select-label"
              value={selectedDatabase ? selectedDatabase.id : ''}
              onChange={(e) => {
                const selectedDb = databases.find(db => db.id === e.target.value);
                setSelectedDatabase(selectedDb);
                setDatabaseError('');
              }}
              label="Select Database"
            >
              {databases.map((db) => (
                <MenuItem key={db.id} value={db.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DatabaseIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                    {db.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {databaseError && <FormHelperText>{databaseError}</FormHelperText>}
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateSession} variant="contained">
            Create Session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateSession} variant="contained">
            Update
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
          severity="success" 
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default Sessions;