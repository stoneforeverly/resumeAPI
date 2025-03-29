import React, { useState } from 'react';
import { Typography, Box, Container, Paper, CircularProgress } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DownloadIcon from '@mui/icons-material/Download';
import ResumeUpload from '../components/Resume/ResumeUpload';
import GoogleLoginButton from '../components/Auth/GoogleLoginButton';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUploadSuccess = (id: string) => {
    console.log('Resume uploaded successfully with ID:', id);
    setResumeId(id);
    setActiveStep(1);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          简历AI优化助手
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          上传您的简历，获得AI驱动的专业优化和量身定制的改进建议，提高面试通过率。
        </Typography>

        {!isAuthenticated && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <GoogleLoginButton />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2, flex: 1, maxWidth: '120px' }}>
            <Paper 
              elevation={activeStep === 0 ? 3 : 1} 
              sx={{ 
                p: 2, 
                borderRadius: '50%', 
                width: 64, 
                height: 64, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: activeStep === 0 ? '#1976d2' : '#f5f5f5',
              }}
            >
              <UploadFileIcon sx={{ fontSize: 36, color: activeStep === 0 ? 'white' : 'text.secondary' }} />
            </Paper>
            <Typography variant="body1" sx={{ mt: 1 }}>
              上传简历
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2, flex: 1, maxWidth: '120px' }}>
            <Paper 
              elevation={activeStep === 1 ? 3 : 1} 
              sx={{ 
                p: 2, 
                borderRadius: '50%', 
                width: 64, 
                height: 64, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: activeStep === 1 ? '#1976d2' : '#f5f5f5',
              }}
            >
              <AutoFixHighIcon sx={{ fontSize: 36, color: activeStep === 1 ? 'white' : 'text.secondary' }} />
            </Paper>
            <Typography variant="body1" sx={{ mt: 1 }}>
              AI优化
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2, flex: 1, maxWidth: '120px' }}>
            <Paper 
              elevation={activeStep === 2 ? 3 : 1} 
              sx={{ 
                p: 2, 
                borderRadius: '50%', 
                width: 64, 
                height: 64, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: activeStep === 2 ? '#1976d2' : '#f5f5f5',
              }}
            >
              <DownloadIcon sx={{ fontSize: 36, color: activeStep === 2 ? 'white' : 'text.secondary' }} />
            </Paper>
            <Typography variant="body1" sx={{ mt: 1 }}>
              下载结果
            </Typography>
          </Box>
        </Box>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            borderRadius: 2,
          }}
        >
          {activeStep === 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                上传您的简历
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                上传您的简历，获得AI驱动的专业优化和量身定制的改进建议，提高面试通过率。
              </Typography>
              <ResumeUpload onUploadSuccess={handleUploadSuccess} />
            </Box>
          )}

          {activeStep === 1 && resumeId && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                AI优化中
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                我们的AI正在分析您的简历，请稍候...
              </Typography>
              <CircularProgress />
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                下载结果
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                您的简历已优化完成，可以下载查看结果。
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LandingPage; 