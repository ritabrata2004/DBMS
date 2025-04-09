import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  useTheme,
  alpha,
  Fade,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';
import * as XLSX from 'xlsx';
import hljs from 'highlight.js/lib/core';
import sqlLanguage from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github-dark.css'; // Import a style theme

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`result-tabpanel-${index}`}
      aria-labelledby={`result-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PopupResult = ({ 
  open, 
  onClose, 
  sql, 
  results, 
  executionTime,
  naturalQuery // Add naturalQuery parameter
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [copySuccess, setCopySuccess] = useState({ sql: false, json: false });
  const [highlightedSql, setHighlightedSql] = useState('');
  
  // Register SQL language for syntax highlighting
  useEffect(() => {
    hljs.registerLanguage('sql', sqlLanguage);
  }, []);
  
  // Highlight SQL code when the sql prop changes or when the component mounts
  useEffect(() => {
    if (sql) {
      const highlighted = hljs.highlight(sql, { language: 'sql' }).value;
      setHighlightedSql(highlighted);
    }
  }, [sql]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle copy to clipboard
  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess({ ...copySuccess, [type]: true });
        
        // Reset success state after 2 seconds
        setTimeout(() => {
          setCopySuccess({ ...copySuccess, [type]: false });
        }, 2000);
      })
      .catch(err => {
        console.error("Could not copy: ", err);
      });
  };

  // Format execution time nicely
  const formatExecutionTime = () => {
    if (!executionTime) return 'N/A';
    
    // If execution time is in milliseconds
    if (executionTime < 1000) {
      return `${executionTime}ms`;
    }
    
    // If execution time is in seconds
    const seconds = executionTime / 1000;
    return `${seconds.toFixed(2)}s`;
  };

  // Export results to Excel
  const exportToExcel = () => {
    if (!results || !results.rows || !results.columns) return;
    
    // Create worksheet with headers
    const ws = XLSX.utils.aoa_to_sheet([results.columns, ...results.rows]);
    
    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Query Results');
    
    // Generate a download name based on current date and time
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const fileName = `query-results-${dateStr}.xlsx`;
    
    // Trigger download
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          maxHeight: '90vh'
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.5),
        backgroundImage: 'linear-gradient(rgba(30, 36, 50, 0.5), rgba(21, 26, 37, 0.8))',
      }}>
        <Typography variant="h6" fontWeight={600} sx={{
          background: 'linear-gradient(45deg, #6596EB, #BB86FC)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Query Results
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip 
            icon={<InfoIcon sx={{ fontSize: 16 }} />}
            label={`Execution time: ${formatExecutionTime()}`} 
            variant="outlined" 
            size="small"
            sx={{ 
              mr: 2, 
              bgcolor: alpha(theme.palette.info.main, 0.1),
              borderColor: alpha(theme.palette.info.main, 0.3),
              color: theme.palette.info.main,
              '& .MuiChip-icon': { color: theme.palette.info.main }
            }}
          />
          <IconButton 
            aria-label="close" 
            onClick={onClose}
            size="small"
            sx={{ color: alpha(theme.palette.text.secondary, 0.7) }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Natural language query display */}
      {naturalQuery && (
        <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.3) }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
            Your query:
          </Typography>
          <Typography variant="body1" sx={{ 
            color: theme.palette.text.primary,
            fontStyle: 'italic',
            fontWeight: 500
          }}>
            "{naturalQuery}"
          </Typography>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="result tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            icon={<TableChartIcon sx={{ fontSize: '1.2rem' }} />} 
            iconPosition="start" 
            label="Table View" 
            sx={{ fontWeight: 500 }}
          />
          <Tab 
            icon={<CodeIcon sx={{ fontSize: '1.2rem' }} />} 
            iconPosition="start" 
            label="SQL Query" 
            sx={{ fontWeight: 500 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Table View Tab */}
        <TabPanel value={tabValue} index={0}>
          {results && results.success ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {results.rows?.length || 0} {results.rows?.length === 1 ? 'row' : 'rows'} returned
                </Typography>
                <Box>
                  <Tooltip title="Export to Excel">
                    <IconButton 
                      onClick={exportToExcel}
                      size="small"
                      sx={{ 
                        mr: 1,
                        color: theme.palette.success.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                        }
                      }}
                    >
                      <GetAppIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Copy as JSON">
                    <IconButton 
                      onClick={() => handleCopy(JSON.stringify(results.rows, null, 2), 'json')}
                      size="small"
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    >
                      {copySuccess.json ? <CheckCircleIcon /> : <ContentCopyIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {results.rows && results.rows.length > 0 ? (
                <TableContainer 
                  component={Paper} 
                  elevation={0}
                  sx={{ 
                    maxHeight: '50vh',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.6),
                    '&::-webkit-scrollbar': {
                      width: '8px',
                      height: '8px',
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
                  <Table stickyHeader size="small" aria-label="query results">
                    <TableHead>
                      <TableRow>
                        {results.columns.map((column, index) => (
                          <TableCell 
                            key={index}
                            sx={{ 
                              fontWeight: 600,
                              bgcolor: alpha(theme.palette.background.default, 0.9),
                              color: theme.palette.primary.main
                            }}
                          >
                            {column}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.rows.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          hover
                          sx={{ 
                            '&:nth-of-type(odd)': { 
                              bgcolor: alpha(theme.palette.action.hover, 0.05)
                            },
                            '&:hover': {
                              bgcolor: alpha(theme.palette.action.hover, 0.1),
                            }
                          }}
                        >
                          {row.map((cell, cellIndex) => (
                            <TableCell 
                              key={cellIndex}
                              sx={{ 
                                maxWidth: '250px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem'
                              }}
                              title={cell === null ? 'NULL' : String(cell)}
                            >
                              {cell === null ? (
                                <span style={{ color: theme.palette.text.disabled }}>NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  borderRadius: 1, 
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.3),
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Query executed successfully, but no rows were returned.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ 
              p: 3, 
              borderRadius: 1, 
              bgcolor: alpha(theme.palette.error.main, 0.1),
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.3),
            }}>
              <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 500 }}>
                Error executing query
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {results?.status || 'An unknown error occurred'}
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* SQL Query Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Copy SQL">
              <IconButton 
                onClick={() => handleCopy(sql, 'sql')}
                size="small"
                sx={{ 
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                {copySuccess.sql ? <CheckCircleIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
          <Paper 
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.5),
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              maxHeight: '50vh'
            }}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: highlightedSql }} 
              className="hljs"
            />
          </Paper>
        </TabPanel>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          disableElevation
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
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupResult;