import React from 'react';
import { Box } from "@mui/material";

// Simple layout component to wrap content
function Layout({ children }) {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      {children}
    </Box>
  );
}

export default Layout;
