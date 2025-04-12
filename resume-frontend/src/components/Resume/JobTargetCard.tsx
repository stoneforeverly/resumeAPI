import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  TextField, 
  Typography 
} from '@mui/material';

interface JobTargetCardProps {
  targetJobTitle: string;
  onChange: (value: string) => void;
}

const JobTargetCard: React.FC<JobTargetCardProps> = ({ targetJobTitle, onChange }) => {
  return (
    <Card>
      <CardHeader title="Job Target Optimization" />
      <Divider />
      <CardContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter your target job title to get customized suggestions for AI optimization
        </Typography>
        <TextField
          fullWidth
          placeholder="e.g. Software Engineer"
          variant="outlined"
          value={targetJobTitle}
          onChange={(e) => onChange(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="text.secondary" paragraph>
          Adding a job title will help the AI tailor content to industry standards
        </Typography>
      </CardContent>
    </Card>
  );
};

export default JobTargetCard; 