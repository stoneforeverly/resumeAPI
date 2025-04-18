import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface ArrayFieldEditorProps {
  value: string[];
  onChange: (newValue: string[]) => void;
  onOptimize?: (index?: number) => void;
}

const ArrayFieldEditor: React.FC<ArrayFieldEditorProps> = ({ 
  value, 
  onChange,
  onOptimize
}) => {
  const handleItemChange = (index: number, newValue: string) => {
    const updatedItems = [...value];
    updatedItems[index] = newValue;
    onChange(updatedItems);
  };

  const handleAddItem = () => {
    onChange([...value, '']);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...value];
    updatedItems.splice(index, 1);
    onChange(updatedItems);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {value.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            variant="outlined"
          />
          
          {onOptimize && (
            <IconButton 
              color="primary" 
              onClick={() => onOptimize(index)}
              sx={{ ml: 1 }}
            >
              <AutoFixHighIcon fontSize="small" />
            </IconButton>
          )}
          
          <IconButton 
            color="error" 
            onClick={() => handleRemoveItem(index)} 
            sx={{ ml: 0.5 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddItem}
        sx={{ mt: 1 }}
      >
        Add Item
      </Button>
    </Box>
  );
};

export default ArrayFieldEditor; 