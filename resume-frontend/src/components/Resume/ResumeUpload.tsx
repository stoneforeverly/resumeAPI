import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useAuth } from '../../contexts/AuthContext';
import { resumeApi } from '../../services/api';

interface ResumeUploadProps {
  onUploadSuccess?: (resumeId: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      validateAndSetFile(event.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    // Check if file is PDF, DOCX or DOC
    const fileType = selectedFile.type;
    if (
      fileType === 'application/pdf' || 
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      setFile(selectedFile);
      setError(null);
      setUploadSuccess(false);
    } else {
      setError('Only PDF, DOCX and DOC formats are supported');
      setFile(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    
    try {
      const response = await resumeApi.uploadResume(file, user?.id || 'google-user-123');

      if (response.data.status === 'success') {
        setUploadSuccess(true);
        
        if (onUploadSuccess && response.data.data?.resume_id) {
          onUploadSuccess(response.data.data.resume_id);
        }
      } else {
        setError('Upload failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed, please try again later');
    } finally {
      setUploading(false);
    }
  };

  // Helper function to get file icon
  const getFileIcon = () => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'pdf') {
      return (
        <Box sx={{ 
          bgcolor: '#f44336', 
          color: 'white',
          borderRadius: '4px',
          p: 0.5,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2
        }}>
          <InsertDriveFileIcon />
        </Box>
      );
    } else if (fileExt === 'docx' || fileExt === 'doc') {
      return (
        <Box sx={{ 
          bgcolor: '#2196f3', 
          color: 'white',
          borderRadius: '4px',
          p: 0.5,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2
        }}>
          <InsertDriveFileIcon />
        </Box>
      );
    } 
    
    return (
      <Box sx={{ 
        bgcolor: '#757575', 
        color: 'white',
        borderRadius: '4px',
        p: 0.5,
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 2
      }}>
        <InsertDriveFileIcon />
      </Box>
    );
  };

  return (
    <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ 
          width: '100%', 
          maxWidth: 600, 
          height: 260, 
          border: dragActive 
            ? `2px dashed ${theme.palette.primary.main}` 
            : `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          p: 3,
          cursor: 'pointer',
          backgroundColor: dragActive 
            ? alpha(theme.palette.primary.main, 0.05)
            : alpha(theme.palette.background.paper, 0.6),
          transition: 'all 0.2s ease',
          position: 'relative',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderColor: theme.palette.primary.main,
          }
        }}
        component="div"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          accept=".pdf,.docx,.doc"
          style={{ display: 'none' }}
          id="resume-file"
          type="file"
          onChange={handleFileChange}
        />
        
        {!file ? (
          <>
            <CloudUploadIcon 
              sx={{ 
                fontSize: 64, 
                color: dragActive ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.7), 
                mb: 2 
              }} 
            />
            <Typography variant="h6" color={dragActive ? "primary" : "text.primary"} align="center">
              Drag & drop your resume here
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 1 }}>
              or
            </Typography>
            <Button 
              variant="outlined"
              component="label"
              htmlFor="resume-file"
              sx={{ mt: 2 }}
            >
              Browse Files
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Supports PDF, DOCX and DOC formats
            </Typography>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              p: 2,
              borderRadius: 2,
              mb: 3
            }}>
              {getFileIcon()}
              <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }} noWrap>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ color: theme.palette.success.main, ml: 1 }} />
            </Box>
            <Button 
              variant="outlined"
              component="label"
              htmlFor="resume-file"
              size="small"
            >
              Change File
            </Button>
          </Box>
        )}
      </Paper>
      
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {uploadSuccess && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          p: 1,
          px: 2,
          borderRadius: 2,
          mb: 2
        }}>
          <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2">
            Resume uploaded successfully
          </Typography>
        </Box>
      )}
      
      <Button
        variant="contained"
        disabled={!file || uploading}
        onClick={handleUpload}
        size="large"
        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
        sx={{ 
          minWidth: 160,
          py: 1,
          px: 3,
          borderRadius: '50px',
          background: file && !uploading ? 'linear-gradient(45deg, #3a7bd5 0%, #00bcd4 100%)' : undefined
        }}
      >
        {uploading ? 'Uploading...' : 'Upload Resume'}
      </Button>
    </Box>
  );
};

export default ResumeUpload; 