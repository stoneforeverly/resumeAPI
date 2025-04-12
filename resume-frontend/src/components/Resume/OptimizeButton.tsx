import React from 'react';
import { CircularProgress, IconButton, IconButtonProps } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface OptimizeButtonProps extends Omit<IconButtonProps, 'onClick'> {
  onClick: () => void;
  isOptimizing: boolean;
  size?: 'small' | 'medium' | 'large';
}

const OptimizeButton: React.FC<OptimizeButtonProps> = ({ 
  onClick, 
  isOptimizing, 
  size = 'medium',
  ...props 
}) => {
  return (
    <IconButton
      color="primary"
      onClick={onClick}
      disabled={isOptimizing}
      {...props}
    >
      {isOptimizing ? (
        <CircularProgress size={size === 'small' ? 20 : 24} />
      ) : (
        <AutoFixHighIcon fontSize={size === 'small' ? 'small' : 'medium'} />
      )}
    </IconButton>
  );
};

export default OptimizeButton; 