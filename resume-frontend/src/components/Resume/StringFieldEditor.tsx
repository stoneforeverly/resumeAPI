import React from 'react';
import {
  Box,
  TextField,
  IconButton
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface StringFieldEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  onOptimize?: () => void;
  multiline?: boolean;
  rows?: number;
  label?: string;
  placeholder?: string;
}

const StringFieldEditor: React.FC<StringFieldEditorProps> = ({
  value,
  onChange,
  onOptimize,
  multiline = false,
  rows = 4,
  label,
  placeholder
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      <TextField
        fullWidth
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        variant="outlined"
        label={label}
        placeholder={placeholder}
      />
      
      {onOptimize && (
        <IconButton 
          color="primary" 
          onClick={onOptimize}
          sx={{ ml: 1, mt: multiline ? 0 : 0 }}
        >
          <AutoFixHighIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default StringFieldEditor; 