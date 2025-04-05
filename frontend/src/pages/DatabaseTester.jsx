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
  Snackbar
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  AutoAwesome as AutoAwesomeIcon,
  PlayArrow as PlayArrowIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

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
    <>
      <Navbar />
      <Container maxWidth="xl" className="py-8">
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={() => navigate('/databases')} 
            color="primary" 
            aria-label="back to databases" 
            className="mr-2"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" className="font-bold text-blue-700">
            PostgreSQL Database Manager
          </Typography>
        </Box>
        
        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Form Section */}
          <Paper className="p-6 rounded-lg shadow-md">
            <Typography variant="h5" className="mb-4 font-semibold">
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
              />
              
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
                required
                variant="outlined"
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
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                className="py-3"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Add Database"}
              </Button>
            </form>
          </Paper>
          
          {/* Database List & Operations Section */}
          <Box className="space-y-6">
            {/* Database Selection */}
            <Paper className="p-6 rounded-lg shadow-md">
              <Typography variant="h5" className="mb-4 font-semibold">
                Your Databases
              </Typography>
              
              {loading && <CircularProgress size={24} className="mx-auto my-4 block" />}
              
              {databases.length === 0 && !loading ? (
                <Typography className="text-gray-600 text-center py-4">
                  No databases added yet.
                </Typography>
              ) : (
                <Box className="divide-y">
                  {databases.map((db) => (
                    <Box key={db.id} className="py-3 flex justify-between items-center">
                      <Box>
                        <Typography className="font-semibold">
                          {db.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
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
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
              
              {selectedDb && (
                <Box className="mt-4 pt-4 border-t">
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
            
            {/* Tabs for different operations */}
            {selectedDb && (
              <Paper className="rounded-lg shadow-md">
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                >
                  <Tab label="SQL Query" />
                  <Tab label="Schema" onClick={() => { if (!schemaData) fetchSchema(); }} />
                  <Tab label="Relationships" onClick={() => { if (!relationshipData) fetchRelationships(); }} />
                  <Tab label="Search" />
                </Tabs>
                
                <Box className="p-6">
                  {/* Query Tab Content */}
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
                      
                      {/* Results Table */}
                      {queryResult && (
                        <Box className="mt-6">
                          <Typography variant="subtitle1" className="font-semibold mb-2">
                            Results
                          </Typography>
                          <Typography variant="caption" className="text-gray-500 mb-2 block">
                            {queryResult.status}
                          </Typography>
                          
                          {queryResult.columns && queryResult.columns.length > 0 ? (
                            <Box className="overflow-x-auto border rounded">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    {queryResult.columns.map((column, idx) => (
                                      <th
                                        key={idx}
                                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                      >
                                        {column}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {queryResult.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                      {row.map((cell, cellIdx) => (
                                        <td
                                          key={cellIdx}
                                          className="px-3 py-2 text-sm text-gray-500 whitespace-nowrap"
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
                            <Typography className="text-center text-gray-500 py-4">
                              No results returned
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {/* Schema Tab Content */}
                  {activeTab === 1 && (
                    <Box>
                      <Typography variant="h6" className="mb-4">
                        Database Schema
                      </Typography>
                      
                      {metadataLoading ? (
                        <Box className="flex justify-center py-8">
                          <CircularProgress />
                        </Box>
                      ) : schemaData && schemaData.length > 0 ? (
                        <Box className="space-y-6">
                          {schemaData.map((table) => (
                            <Paper key={table.id} variant="outlined" className="overflow-hidden">
                              <Box className="bg-gray-100 p-3 border-b">
                                <Box className="flex justify-between items-start">
                                  <Box className="flex-grow">
                                    <Typography variant="subtitle1" className="font-medium">
                                      {table.schema_name}.{table.table_name}
                                      <Chip
                                        label={table.table_type}
                                        size="small"
                                        variant="outlined"
                                        className="ml-2 text-xs"
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
                                        <Typography variant="body2" className="text-gray-600">
                                          {table.description || "No description available."}
                                          <IconButton
                                            size="small"
                                            className="ml-1 opacity-0 group-hover:opacity-100"
                                            onClick={() => handleEditDescription('table', table.id, table.description || "")}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Typography>
                                      </Box>
                                    )}
                                    
                                    {table.row_count !== null && (
                                      <Typography variant="caption" className="text-gray-500 mt-1 block">
                                        Rows: {table.row_count}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                              
                              {/* Table Columns */}
                              <Box className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Column
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nullable
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Key
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {table.columns.map((column) => (
                                      <tr key={column.id}>
                                        <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                          {column.name}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500">
                                          {column.data_type}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500">
                                          {column.is_nullable ? "Yes" : "No"}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500">
                                          {column.is_primary_key && (
                                            <Chip label="PK" size="small" color="primary" variant="outlined" className="mr-1" />
                                          )}
                                          {column.is_foreign_key && (
                                            <Chip label="FK" size="small" color="secondary" variant="outlined" />
                                          )}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500">
                                          {editingDescription === `column_${column.id}` ? (
                                            <TextField
                                              value={editDescription}
                                              onChange={(e) => setEditDescription(e.target.value)}
                                              fullWidth
                                              multiline
                                              rows={2}
                                              size="small"
                                              variant="outlined"
                                            />
                                          ) : (
                                            column.description || "-"
                                          )}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500">
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
                      ) : (
                        <Box className="text-center py-8">
                          <Typography className="text-gray-500 mb-4">
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
                  
                  {/* Relationships Tab Content */}
                  {activeTab === 2 && (
                    <Box>
                      <Typography variant="h6" className="mb-4">
                        Table Relationships
                      </Typography>
                      
                      {metadataLoading ? (
                        <Box className="flex justify-center py-8">
                          <CircularProgress />
                        </Box>
                      ) : relationshipData && relationshipData.length > 0 ? (
                        <Box className="overflow-x-auto border rounded">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  From Table
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  From Column
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Relationship
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  To Table
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  To Column
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {relationshipData.map((rel) => (
                                <tr key={rel.id}>
                                  <td className="px-3 py-2 text-sm text-gray-500">
                                    {rel.from_schema}.{rel.from_table}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-500">
                                    {rel.from_column}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-500">
                                    <Chip
                                      label={rel.relationship_type}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-500">
                                    {rel.to_schema}.{rel.to_table}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-500">
                                    {rel.to_column}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Box>
                      ) : (
                        <Box className="text-center py-8">
                          <Typography className="text-gray-500 mb-4">
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
                  
                  {/* Search Tab Content */}
                  {activeTab === 3 && (
                    <Box>
                      <Typography variant="h6" className="mb-4">
                        Search Metadata
                      </Typography>
                      
                      <form onSubmit={handleSearch} className="mb-6">
                        <Box className="flex">
                          <TextField
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tables, columns, types..."
                            fullWidth
                            variant="outlined"
                            required
                            className="rounded-r-none"
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={metadataLoading}
                            className="rounded-l-none h-auto"
                          >
                            {metadataLoading ? <CircularProgress size={24} /> : "Search"}
                          </Button>
                        </Box>
                      </form>
                      
                      {searchResults && (
                        <Box className="space-y-4">
                          <Typography variant="subtitle1" className="font-semibold">
                            Search Results
                          </Typography>
                          
                          {searchResults.length === 0 ? (
                            <Typography className="text-gray-500 text-center py-4">
                              No results found for "{searchQuery}"
                            </Typography>
                          ) : (
                            <Box className="space-y-3">
                              {searchResults.map((result, idx) => (
                                <Paper key={idx} variant="outlined" className="p-3">
                                  {result.type === 'table' ? (
                                    <Box>
                                      <Box className="flex items-center">
                                        <Chip
                                          label="Table"
                                          size="small"
                                          color="primary"
                                          className="mr-2"
                                        />
                                        <Typography variant="subtitle2">
                                          {result.schema}.{result.name}
                                        </Typography>
                                      </Box>
                                      {result.description && (
                                        <Typography variant="body2" className="text-gray-600 mt-1">
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
                                        />
                                        <Typography variant="subtitle2">
                                          {result.schema}.{result.table_name}.{result.name}
                                        </Typography>
                                        <Typography variant="caption" className="text-gray-500 ml-2">
                                          ({result.data_type})
                                        </Typography>
                                      </Box>
                                      {result.description && (
                                        <Typography variant="body2" className="text-gray-600 mt-1">
                                          {result.description}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                </Paper>
                              ))}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
        
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
      </Container>
    </>
  );
};

export default DatabaseTester;