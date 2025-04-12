import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Button,
  Box,
  Container,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import GoogleLoginButton from '../Auth/GoogleLoginButton';

const Header: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1, px: { xs: 0, sm: 2 }, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h5" 
              component="div"
              sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(45deg, #3a7bd5 0%, #00bcd4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              Resume AI
            </Typography>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              color="primary"
              aria-label="menu"
              onClick={handleMobileMenuToggle}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <IconButton 
                    onClick={handleMenuOpen}
                    sx={{ 
                      ml: 2,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      p: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      }
                    }}
                  >
                    {user.picture ? (
                      <Avatar 
                        src={user.picture}
                        alt={user.name}
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: theme.palette.primary.main 
                      }}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    )}
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 180,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                      <ExitToAppIcon fontSize="small" sx={{ mr: 2 }} />
                      Sign Out
                    </MenuItem>
                  </Menu>
                </Box>
              </>
            ) : (
              <GoogleLoginButton 
                variant="outlined"
                size="medium"
              />
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <Box sx={{ 
          width: '100%', 
          bgcolor: 'background.paper',
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: { xs: 'block', md: 'none' },
          py: 1,
        }}>
          <Container maxWidth="lg">
            {user ? (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {user.picture ? (
                    <Avatar 
                      src={user.picture}
                      alt={user.name}
                      sx={{ mr: 2 }}
                    />
                  ) : (
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Button 
                  fullWidth 
                  startIcon={<ExitToAppIcon />} 
                  onClick={handleLogout}
                  variant="outlined"
                  color="primary"
                  sx={{ justifyContent: 'flex-start', textTransform: 'none', mt: 1 }}
                >
                  Sign Out
                </Button>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <GoogleLoginButton
                  fullWidth
                  variant="contained"
                />
              </Box>
            )}
          </Container>
        </Box>
      )}
    </AppBar>
  );
};

export default Header; 