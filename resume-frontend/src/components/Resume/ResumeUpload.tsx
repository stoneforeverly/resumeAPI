import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAuth } from '../../contexts/AuthContext';
import { resumeApi } from '../../services/api';

interface ResumeUploadProps {
  onUploadSuccess?: (resumeId: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      
      // Check if file is PDF, DOCX or DOC
      const fileType = selectedFile.type;
      if (
        fileType === 'application/pdf' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword'
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('只支持PDF、DOCX和DOC格式');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    
    try {
      const response = await resumeApi.uploadResume(file, user?.id || 'temp_user_id');

      if (response.data.status === 'success') {
        setUploadSuccess(true);
        
        if (onUploadSuccess && response.data.data?.resume_id) {
          onUploadSuccess(response.data.data.resume_id);
        }
      } else {
        setError('上传失败: ' + (response.data.message || '未知错误'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('上传失败，请稍后重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: 500, 
          height: 200, 
          border: '1px dashed #ccc', 
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          p: 3,
          cursor: 'pointer',
          backgroundColor: '#f9f9f9',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          }
        }}
        component="label"
        htmlFor="resume-file"
      >
        <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          拖放您的简历文件到这里或点击上传
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          支持PDF
        </Typography>
        
        <input
          accept=".pdf,.docx,.doc"
          style={{ display: 'none' }}
          id="resume-file"
          type="file"
          onChange={handleFileChange}
        />
      </Box>
      
      {file && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          已选择: {file.name}
        </Typography>
      )}
      
      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Button
        variant="contained"
        disabled={!file || uploading}
        onClick={handleUpload}
        size="large"
        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
        sx={{ minWidth: 120 }}
      >
        {uploading ? '上传中...' : '上传简历'}
      </Button>
    </Box>
  );
};

export default ResumeUpload; 