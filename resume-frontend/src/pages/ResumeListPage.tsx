import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  Chip,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resumeApi } from '../services/api';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Resume {
  _id: string;
  filename: string;
  status: string;
  upload_date: string;
}

const ResumeListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const [fadeIn, setFadeIn] = useState(false);
  
  useEffect(() => {
    fetchResumes();
    
    setTimeout(() => {
      setFadeIn(true);
    }, 100);
  }, [user]);

  const fetchResumes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await resumeApi.getResumes(user.id || 'google-user-123');
      
      if (response.data.status === 'success') {
        setResumes(response.data.data.resumes);
      } else {
        setError('Failed to fetch resumes');
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('An error occurred while fetching your resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleEditResume = (resumeId: string) => {
    navigate('/', { state: { resumeId } });
  };

  const handleDeleteClick = (resume: Resume) => {
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setResumeToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;

    setIsDeleting(true);
    try {
      // 调用删除API (假设API存在)
      await resumeApi.deleteResume(resumeToDelete._id);
      
      // 更新状态，移除已删除的简历
      setResumes(resumes.filter(resume => resume._id !== resumeToDelete._id));
      
      // 显示成功消息
      setSnackbarMessage('Resume deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting resume:', error);
      // 显示错误消息
      setSnackbarMessage('Failed to delete resume');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    }
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  // Helper function to get file icon based on filename
  const getFileIcon = (filename: string) => {
    const fileExt = filename.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'pdf') {
      return (
        <Avatar sx={{ 
          bgcolor: alpha(theme.palette.error.main, 0.8), 
          color: 'white',
          width: 48,
          height: 48,
        }}>
          <InsertDriveFileIcon />
        </Avatar>
      );
    } else if (fileExt === 'docx' || fileExt === 'doc') {
      return (
        <Avatar sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.8), 
          color: 'white',
          width: 48,
          height: 48,
        }}>
          <InsertDriveFileIcon />
        </Avatar>
      );
    } 
    
    return (
      <Avatar sx={{ 
        bgcolor: alpha(theme.palette.text.secondary, 0.8), 
        color: 'white',
        width: 48,
        height: 48,
      }}>
        <InsertDriveFileIcon />
      </Avatar>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading your resumes...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 4,
            backgroundColor: alpha(theme.palette.error.light, 0.1),
            borderRadius: 3
          }}
        >
          <Typography color="error.main" variant="h5" gutterBottom>
            {error}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            We were unable to load your resumes. Please try again.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => window.location.reload()}
            size="large"
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 12, 
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}
    >
      <Box sx={{ 
        mb: 6, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold"
            sx={{ 
              background: 'linear-gradient(90deg, #4f6df5 0%, #6c63ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            My Resumes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage and optimize your uploaded resumes
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate('/')}
          size="large"
          sx={{ 
            borderRadius: 2, 
            px: 3,
            backgroundImage: 'linear-gradient(135deg, #4f6df5 0%, #6c63ff 100%)',
            boxShadow: '0 8px 16px rgba(108, 99, 255, 0.2)',
            '&:hover': {
              transform: 'scale(1.03)',
              boxShadow: '0 12px 20px rgba(108, 99, 255, 0.3)'
            },
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          Upload New Resume
        </Button>
      </Box>

      {resumes.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            border: '1px dashed',
            borderColor: alpha(theme.palette.primary.main, 0.3),
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease'
          }}
        >
          <DescriptionIcon sx={{ 
            fontSize: 80, 
            color: alpha(theme.palette.primary.main, 0.3), 
            mb: 3 
          }} />
          <Typography variant="h5" gutterBottom fontWeight="medium">
            No Resumes Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
            You haven't uploaded any resumes yet. Upload your first resume to get AI-powered optimization and insights.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/')}
            size="large"
            sx={{ 
              borderRadius: 2, 
              px: 3,
              backgroundImage: 'linear-gradient(135deg, #4f6df5 0%, #6c63ff 100%)',
              boxShadow: '0 8px 16px rgba(108, 99, 255, 0.2)',
              '&:hover': {
                transform: 'scale(1.03)',
                boxShadow: '0 12px 20px rgba(108, 99, 255, 0.3)'
              },
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            Upload Your First Resume
          </Button>
        </Paper>
      ) : (
        <Box 
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: theme => theme.spacing(-1.5) // 负边距补偿间距
          }}
        >
          {resumes.map((resume, index) => (
            <Box 
              key={resume._id}
              sx={{ 
                width: { xs: '100%', sm: '50%', md: '33.333%' },
                padding: 1.5,
                opacity: fadeIn ? 1 : 0,
                transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                transitionDelay: `${index * 0.1}s`
              }}
            >
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.8),
                  backgroundColor: 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Box sx={{ mr: 2, position: 'relative' }}>
                      {getFileIcon(resume.filename)}
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          bottom: -4,
                          right: -4,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: resume.status === 'parsed' ? 'success.main' : 'warning.main',
                          border: '2px solid',
                          borderColor: 'background.paper'
                        }}
                      />
                    </Box>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                      <Typography 
                        variant="h6" 
                        noWrap 
                        title={resume.filename}
                        sx={{ 
                          fontWeight: 600,
                          mb: 0.5,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          width: '100%'
                        }}
                      >
                        {resume.filename}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, opacity: 0.7 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(resume.upload_date)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Chip 
                    label={resume.status === 'parsed' ? 'Ready to edit' : 'Processing'} 
                    size="small"
                    color={resume.status === 'parsed' ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ 
                      borderRadius: 1.5,
                      height: 24,
                      fontWeight: 500,
                      mb: 2
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                    <Tooltip title={resume.status === 'parsed' ? 'Edit Resume' : 'Still processing...'}>
                      <span>
                        <IconButton 
                          color="primary"
                          onClick={() => handleEditResume(resume._id)}
                          disabled={resume.status !== 'parsed'}
                          size="small"
                          sx={{ 
                            backgroundColor: resume.status === 'parsed' ? alpha(theme.palette.primary.main, 0.1) : undefined,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2)
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    
                    <Tooltip title="Delete Resume">
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteClick(resume)}
                        size="small"
                        sx={{ 
                          backgroundColor: alpha(theme.palette.error.main, 0.05),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1)
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Resume
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{resumeToDelete?.filename}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleDeleteCancel} 
            color="primary" 
            variant="outlined"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 消息提示 */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={5000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResumeListPage; 