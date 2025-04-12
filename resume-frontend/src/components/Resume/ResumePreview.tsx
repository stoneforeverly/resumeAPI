import React from 'react';
import { 
  Box,
  Typography,
  Paper,
  Divider,
  styled,
  Link
} from '@mui/material';

// 定义样式组件
const ResumeContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '210mm', // A4 width
  margin: '0 auto',
  padding: theme.spacing(4),
  backgroundColor: '#fff',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '@media print': {
    maxWidth: '100%',
    boxShadow: 'none',
    margin: 0,
    padding: theme.spacing(2)
  }
}));

const CornerDecoration = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '120px',
  height: '120px',
  backgroundColor: theme.palette.primary.main,
  transform: 'rotate(45deg) translate(50px, -50px)',
  zIndex: 0,
  '&::before': {
    content: '"Preview"',
    position: 'absolute',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    top: '75px',
    left: '15px',
    transform: 'rotate(-45deg)',
  },
  '@media print': {
    '&::before': {
      content: '""'
    }
  }
}));

const ResumeHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 1
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(0.5),
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  textTransform: 'uppercase'
}));

const ListItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(0.5),
  '&:before': {
    content: '"•"',
    marginRight: theme.spacing(1),
  }
}));

interface ResumePreviewProps {
  resumeData: any;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData }) => {
  if (!resumeData) return null;
  
  const { 
    personal_information, 
    objective,
    education = [],
    professional_experience = [],
    skills = {}
  } = resumeData;

  return (
    <ResumeContainer elevation={3} className="resume-preview">
      <CornerDecoration className="print-hide" />
      
      {/* 姓名和联系信息 */}
      <ResumeHeader>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {personal_information?.name?.toUpperCase() || 'YOUR NAME'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {personal_information?.phone && (
            <Typography variant="body2">
              {personal_information.phone}
            </Typography>
          )}
          {personal_information?.email && (
            <Typography variant="body2">
              {personal_information.email}
            </Typography>
          )}
          {personal_information?.linkedin && (
            <Typography variant="body2">
              {personal_information.linkedin}
            </Typography>
          )}
        </Box>
      </ResumeHeader>
      
      {/* 教育背景 */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle variant="h6">EDUCATION</SectionTitle>
        {education.map((edu: any, index: number) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '65%' } }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {edu.institution}
                </Typography>
                <Typography variant="body2">
                  {edu.degree} in {edu.field_of_study} {edu.GPA && `• GPA: ${edu.GPA}`}
                </Typography>
              </Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: '30%' }, textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="body2">{edu.location}</Typography>
                <Typography variant="body2">{edu.dates}</Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      
      {/* 目标陈述 - 放在教育和工作经验之间 */}
      {objective && (
        <Box sx={{ mb: 3 }}>
          <SectionTitle variant="h6">OBJECTIVE</SectionTitle>
          <Typography variant="body2">{objective}</Typography>
        </Box>
      )}
      
      {/* 职业经历 */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle variant="h6">PROFESSIONAL EXPERIENCE</SectionTitle>
        {professional_experience.map((exp: any, index: number) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', sm: '65%' } }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {exp.position}
                </Typography>
                <Typography variant="subtitle2">
                  {exp.company}
                </Typography>
              </Box>
              <Box sx={{ flexBasis: { xs: '100%', sm: '30%' }, textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="body2">{exp.dates}</Typography>
              </Box>
            </Box>
            
            {/* 职责描述 */}
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {exp.responsibilities.map((resp: string, i: number) => (
                  <ListItem key={i}>
                    <Typography variant="body2">{resp}</Typography>
                  </ListItem>
                ))}
              </Box>
            )}
            
            {/* 项目经验 */}
            {exp.projects && exp.projects.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  Projects:
                </Typography>
                {exp.projects.map((project: any, i: number) => (
                  <Box key={i} sx={{ mb: 2, ml: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {project.name}
                    </Typography>
                    <Box sx={{ ml: 1 }}>
                      {project.responsibilities && project.responsibilities.map((resp: string, j: number) => (
                        <ListItem key={j}>
                          <Typography variant="body2">{resp}</Typography>
                        </ListItem>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
      
      {/* 技能 */}
      <Box sx={{ mb: 3 }}>
        <SectionTitle variant="h6">SKILLS</SectionTitle>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {skills.programming_languages && (
            <Box sx={{ flexBasis: { xs: '100%', sm: '30%' } }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Programming Languages:
              </Typography>
              <Typography variant="body2">
                {skills.programming_languages.join(', ')}
              </Typography>
            </Box>
          )}
          {skills.frameworks && (
            <Box sx={{ flexBasis: { xs: '100%', sm: '30%' } }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Frameworks:
              </Typography>
              <Typography variant="body2">
                {skills.frameworks.join(', ')}
              </Typography>
            </Box>
          )}
          {skills.technologies && (
            <Box sx={{ flexBasis: { xs: '100%', sm: '30%' } }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Technologies:
              </Typography>
              <Typography variant="body2">
                {skills.technologies.join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ResumeContainer>
  );
};

export default ResumePreview; 