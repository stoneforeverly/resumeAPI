import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #eaeaea' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
            ResumeAI
          </Typography>
        </Box>
        
        <IconButton 
          color="inherit" 
          sx={{ 
            width: 40, 
            height: 40,
            border: '1px solid #eaeaea',
            borderRadius: '50%'
          }}
        >
          {isAuthenticated && user?.picture ? (
            <Avatar 
              src={user.picture} 
              alt={user.name} 
              sx={{ width: 32, height: 32 }} 
            />
          ) : (
            <PersonOutlineIcon />
          )}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 