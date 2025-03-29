import React from 'react';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../contexts/AuthContext';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  variant = 'contained',
  fullWidth = false,
  size = 'medium'
}) => {
  const { login } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      // In a real implementation, you would integrate with Google Identity Services
      // For example:
      // 1. Load the Google Identity Services script
      // 2. Initialize the Google Sign-In client
      // 3. Show the Google Sign-In popup
      // 4. Get the ID token from the response
      // 5. Send this token to your backend for verification
      
      // For now, we'll just simulate this with a dummy token
      console.log('Initiating Google login...');
      await login('dummy-google-token');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <Button
      variant={variant}
      color="primary"
      startIcon={<GoogleIcon />}
      onClick={handleGoogleLogin}
      fullWidth={fullWidth}
      size={size}
    >
      使用Google账号登录
    </Button>
  );
};

export default GoogleLoginButton; 