import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Divider,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../api';
import LoadingIndicator from './LoadingIndicator';

function SessionSelector({ currentSessionId, onSessionSelect }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [editingSession, setEditingSession] = useState(null);

  // Fetch user sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.getSessions();
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const response = await api.createSession(newSessionTitle || 'New Session');
      setSessions([response.data, ...sessions]);
      onSessionSelect(response.data.id);
      setNewSessionTitle('');
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleUpdateSession = async () => {
    if (!editingSession) return;
    
    try {
      const response = await api.updateSessionTitle(editingSession.id, newSessionTitle);
      setSessions(sessions.map(s => 
        s.id === editingSession.id ? { ...s, title: newSessionTitle } : s
      ));
      setEditDialogOpen(false);
      setEditingSession(null);
      setNewSessionTitle('');
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await api.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      // If the current session was deleted, select another one if available
      if (sessionId === currentSessionId && sessions.length > 1) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          onSessionSelect(remainingSessions[0].id);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const openEditDialog = (session) => {
    setEditingSession(session);
    setNewSessionTitle(session.title);
    setEditDialogOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) return <LoadingIndicator />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Your Sessions</Typography>
        <Button 
          startIcon={<AddIcon />} 
          variant="contained" 
          size="small"
          onClick={() => setCreateDialogOpen(true)}
        >
          New Session
        </Button>
      </Box>
      
      {sessions.length === 0 ? (
        <Typography variant="body2" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
          No sessions yet. Create your first session to get started!
        </Typography>
      ) : (
        <List dense sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              secondaryAction={
                <Box>
                  <Tooltip title="Edit session title">
                    <IconButton edge="end" onClick={() => openEditDialog(session)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete session">
                    <IconButton edge="end" onClick={() => handleDeleteSession(session.id)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              disablePadding
            >
              <ListItemButton 
                selected={session.id === currentSessionId}
                onClick={() => onSessionSelect(session.id)}
                dense
              >
                <ListItemText 
                  primary={session.title} 
                  secondary={
                    <React.Fragment>
                      <Typography variant="caption" component="span">
                        {formatDate(session.updated_at)}
                      </Typography>
                      <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                        {session.query_count} {session.query_count === 1 ? 'query' : 'queries'}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* Create Session Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Session Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            placeholder="New Session"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSession} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Session Title</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Session Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSession} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SessionSelector;