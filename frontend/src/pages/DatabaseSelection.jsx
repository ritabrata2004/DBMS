import { useState } from 'react';
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
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function DatabaseSelection() {
  const navigate = useNavigate();
  const [showDatabases, setShowDatabases] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [databases, setDatabases] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleViewDatabases = async () => {
    try {
      // This would be replaced with an actual API call when backend is ready
      // For now, we'll simulate a response with hardcoded database names
      throw new Error('Backend not ready');
    } catch (error) {
      // Hardcoded database names in the catch block as requested
      setDatabases([
        { id: 1, name: 'Customer Database' },
        { id: 2, name: 'Product Inventory' },
        { id: 3, name: 'Sales Records' },
        { id: 4, name: 'Employee Directory' },
        { id: 5, name: 'Market Research' }
      ]);
      setShowDatabases(true);
    }
  };

  const handleAddDatabase = () => {
    setAddDialogOpen(true);
  };

  const handleDatabaseSubmit = () => {
    if (!newDatabaseName.trim()) {
      setError('Database name cannot be empty');
      return;
    }

    // In a real implementation, this would call the API
    // Since backend isn't ready, we'll just add to our local state
    const newDatabase = {
      id: databases.length + 1,
      name: newDatabaseName
    };
    
    setDatabases([...databases, newDatabase]);
    setAddDialogOpen(false);
    setNewDatabaseName('');
    setSnackbarMessage(`Database "${newDatabaseName}" added successfully`);
    setSnackbarOpen(true);
  };

  const handleSelectDatabase = (database) => {
    // Navigate to the home page with the selected database
    navigate('/query', { state: { database } });
  };

  const handleBackToSessions = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md" sx={{ pt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main' }}>
            Database Query System
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
            onClick={handleAddDatabase}
            sx={{ py: 1.5, px: 3, borderRadius: 2 }}
          >
            Add New Database
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<ViewListIcon />}
            onClick={handleViewDatabases}
            sx={{ py: 1.5, px: 3, borderRadius: 2 }}
          >
            View Available Databases
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="text"
            onClick={handleBackToSessions}
            sx={{ py: 1, px: 2 }}
          >
            Back to Sessions
          </Button>
        </Box>

        {showDatabases && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
              Available Databases
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {databases.length === 0 ? (
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
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
        
        {/* Add Database Dialog */}
        <Dialog 
          open={addDialogOpen} 
          onClose={() => setAddDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add New Database</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Database Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newDatabaseName}
              onChange={(e) => setNewDatabaseName(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDatabaseSubmit} variant="contained">
              Add Database
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
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default DatabaseSelection;