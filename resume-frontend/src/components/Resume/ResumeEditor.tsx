import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { resumeApi } from '../../services/api';

interface ResumeEditorProps {
  resumeId: string;
  onComplete?: () => void;
}

interface ResumeData {
  [key: string]: any;
  personal_info?: any;
  summary?: string;
  experience?: any[];
  education?: any[];
  skills?: any;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ resumeId, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [fileName, setFileName] = useState('');
  const [score, setScore] = useState(0);
  const [editMode, setEditMode] = useState<{[key: string]: boolean}>({});
  const [editValues, setEditValues] = useState<{[key: string]: any}>({});

  // Fetch resume data when component mounts
  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, try to get the parsed resume
        const response = await resumeApi.getResume(resumeId);
        
        if (response.data.status === 'success') {
          const resume = response.data.data;
          
          // If resume is not parsed yet, trigger parsing
          if (!resume.content || resume.status !== 'parsed') {
            const parseResponse = await resumeApi.parseResume(resumeId);
            
            if (parseResponse.data.status === 'success') {
              setResumeData(parseResponse.data.data.content);
              setFileName(resume.filename || '');
            } else {
              setError('Failed to parse resume');
            }
          } else {
            setResumeData(resume.content);
            setFileName(resume.filename || '');
          }
          
          // Simulate a score for demonstration purposes
          setScore(Math.floor(Math.random() * 30) + 70); // Random score between 70-99
        } else {
          setError('Failed to fetch resume data');
        }
      } catch (err) {
        console.error('Error fetching resume data:', err);
        setError('Failed to fetch resume data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResumeData();
    }
  }, [resumeId]);

  const handleEdit = (section: string) => {
    setEditMode({ ...editMode, [section]: true });
    setEditValues({ 
      ...editValues, 
      [section]: JSON.parse(JSON.stringify(resumeData?.[section] || '')) 
    });
  };

  const handleSave = async (section: string) => {
    setEditMode({ ...editMode, [section]: false });
    
    // Update local state
    const updatedData = {
      ...resumeData,
      [section]: editValues[section]
    };
    
    setResumeData(updatedData);
    
    // Save to backend
    try {
      await resumeApi.updateResumeContent(resumeId, updatedData);
      console.log(`${section} section updated successfully`);
    } catch (error) {
      console.error(`Error updating ${section} section:`, error);
      // Consider adding error notification here
    }
  };

  const handleTextChange = (section: string, value: string) => {
    setEditValues({
      ...editValues,
      [section]: value
    });
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setEditValues({
      ...editValues,
      [section]: {
        ...editValues[section],
        [field]: value
      }
    });
  };

  const renderSectionEditor = (section: string, title: string) => {
    if (!resumeData) return null;

    const sectionData = resumeData[section];
    const isEditing = editMode[section] || false;

    if (typeof sectionData === 'string') {
      // Handle string fields like summary
      return (
        <Card sx={{ mb: 3, position: 'relative' }}>
          <CardHeader 
            title={title} 
            action={
              <IconButton 
                onClick={() => isEditing ? handleSave(section) : handleEdit(section)}
              >
                {isEditing ? <CheckIcon /> : <EditIcon />}
              </IconButton>
            }
          />
          <Divider />
          <CardContent>
            {isEditing ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={editValues[section] || ''}
                onChange={(e) => handleTextChange(section, e.target.value)}
              />
            ) : (
              <Typography>{sectionData}</Typography>
            )}
          </CardContent>
        </Card>
      );
    } else if (section === 'personal_info' && sectionData) {
      // Handle personal info section
      return (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title={title} 
            action={
              <IconButton 
                onClick={() => isEditing ? handleSave(section) : handleEdit(section)}
              >
                {isEditing ? <CheckIcon /> : <EditIcon />}
              </IconButton>
            }
          />
          <Divider />
          <CardContent>
            {isEditing ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.keys(sectionData).map(field => (
                  <Box key={field} sx={{ width: { xs: '100%', sm: '45%' } }}>
                    <TextField
                      fullWidth
                      label={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                      value={editValues[section]?.[field] || ''}
                      onChange={(e) => handleNestedChange(section, field, e.target.value)}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {Object.entries(sectionData).map(([key, value]) => (
                  <Box key={key} sx={{ width: { xs: '100%', sm: '45%' } }}>
                    <Typography variant="subtitle2">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}:
                    </Typography>
                    <Typography gutterBottom>{String(value)}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      );
    } else if (Array.isArray(sectionData)) {
      // Handle array sections like experience or education
      return (
        <Card sx={{ mb: 3 }}>
          <CardHeader 
            title={title} 
            action={
              <IconButton 
                onClick={() => isEditing ? handleSave(section) : handleEdit(section)}
              >
                {isEditing ? <CheckIcon /> : <EditIcon />}
              </IconButton>
            }
          />
          <Divider />
          <CardContent>
            {isEditing ? (
              <Box>
                {editValues[section]?.map((item: any, index: number) => (
                  <Paper key={index} elevation={1} sx={{ mb: 2, p: 2, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">Item {index + 1}</Typography>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => {
                          const newArray = [...editValues[section]];
                          newArray.splice(index, 1);
                          setEditValues({
                            ...editValues,
                            [section]: newArray
                          });
                        }}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    {Object.keys(item).map(field => (
                      <TextField
                        key={field}
                        fullWidth
                        label={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                        value={item[field] || ''}
                        onChange={(e) => {
                          const newArray = [...editValues[section]];
                          newArray[index][field] = e.target.value;
                          setEditValues({
                            ...editValues,
                            [section]: newArray
                          });
                        }}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Paper>
                ))}
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    const newItem = {};
                    if (editValues[section].length > 0) {
                      // Create empty fields based on the first item's structure
                      Object.keys(editValues[section][0]).forEach(key => {
                        (newItem as any)[key] = '';
                      });
                    }
                    setEditValues({
                      ...editValues,
                      [section]: [...editValues[section], newItem]
                    });
                  }}
                >
                  Add Item
                </Button>
              </Box>
            ) : (
              <List>
                {sectionData.map((item: any, index: number) => (
                  <ListItem key={index} divider={index < sectionData.length - 1}>
                    <ListItemText
                      primary={
                        item.title || item.position || item.degree || item.school || `Item ${index + 1}`
                      }
                      secondary={
                        <Box>
                          {Object.entries(item)
                            .filter(([key]) => key !== 'title' && key !== 'position' && key !== 'degree')
                            .map(([key, value]) => (
                              <Typography key={key} variant="body2" component="div">
                                <strong>
                                  {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}:
                                </strong> {String(value)}
                              </Typography>
                            ))}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const renderScoreCard = () => {
    return (
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Resume Score" />
        <Divider />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Box 
              sx={{ 
                position: 'relative', 
                display: 'inline-flex',
                width: 120,
                height: 120
              }}
            >
              <CircularProgress 
                variant="determinate" 
                value={score} 
                size={120} 
                thickness={5} 
                sx={{ color: score > 80 ? 'success.main' : score > 60 ? 'warning.main' : 'error.main' }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" component="div" color="text.secondary">
                  {score}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              out of 100
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mt: 3 }}>Improvement Areas</Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Skills Matching" secondary="90%" />
            </ListItem>
            <ListItem>
              <ListItemText primary="ATS Compatibility" secondary="80%" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Impact Statements" secondary="85%" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Analyzing your resume...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!resumeData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No resume data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Resume Content
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Resume File: {fileName}
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
          {/* Personal Information */}
          {renderSectionEditor('personal_info', 'Contact Information')}
          
          {/* Professional Summary */}
          {renderSectionEditor('summary', 'Professional Summary')}
          
          {/* Experience */}
          {renderSectionEditor('experience', 'Experience')}
          
          {/* Education */}
          {renderSectionEditor('education', 'Education')}
          
          {/* Skills */}
          {renderSectionEditor('skills', 'Skills')}
          
          {/* Any other sections that might be present */}
          {Object.keys(resumeData)
            .filter(key => !['personal_info', 'summary', 'experience', 'education', 'skills', 'raw_text'].includes(key))
            .map(key => renderSectionEditor(key, key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')))}
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
          {/* Score and Suggestions */}
          {renderScoreCard()}
          
          {/* Job Target Optimization */}
          <Card>
            <CardHeader title="Job Target Optimization" />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enter your target job title to get customized suggestions
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. Software Engineer"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth>
                Optimize for Job
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Stack>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={onComplete}
        >
          Finalize and Download
        </Button>
      </Box>
    </Box>
  );
};

export default ResumeEditor; 