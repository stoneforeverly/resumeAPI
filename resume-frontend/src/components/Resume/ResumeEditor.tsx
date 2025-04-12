import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

// 导入API服务
import { resumeApi } from '../../services/api';

// 导入重构后的组件
import SortableSection from './SortableSection';
import SortableList from './SortableList';
import SortableItem from './SortableItem';
import ResumeScoreCard from './ResumeScoreCard';
import JobTargetCard from './JobTargetCard';
import OptimizeButton from './OptimizeButton';
import ResumePreview from './ResumePreview';

// 导入类型
import { ResumeData, AnalysisData } from './utils/types';

interface ResumeEditorProps {
  resumeId: string;
  onComplete?: () => void;
}

const ResumeEditor: React.FC<ResumeEditorProps> = ({ resumeId, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [fileName, setFileName] = useState('');
  const [score, setScore] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [editMode, setEditMode] = useState<{[key: string]: boolean}>({});
  const [editValues, setEditValues] = useState<{[key: string]: any}>({});
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'personal_info',
    'summary',
    'experience',
    'education',
    'skills'
  ]);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isOptimizing, setIsOptimizing] = useState<{[key: string]: boolean}>({});
  const [targetJobTitle, setTargetJobTitle] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
              const content = parseResponse.data.data.content;
              setResumeData(content);
              // Initialize section order based on content
              setSectionOrder(Object.keys(content).filter(key => 
                content[key] && key !== 'raw_text' && typeof content[key] === 'object'
              ));
              setFileName(resume.filename || '');
              
              // After parsing, get or create analysis
              await fetchOrCreateAnalysis(resumeId);
            } else {
              setError('Failed to parse resume');
            }
          } else {
            const content = resume.content;
            setResumeData(content);
            // Initialize section order based on content
            setSectionOrder(Object.keys(content).filter(key => 
              content[key] && key !== 'raw_text' && typeof content[key] === 'object'
            ));
            setFileName(resume.filename || '');
            
            // Get or create analysis
            await fetchOrCreateAnalysis(resumeId);
          }
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

  // 添加函数来获取或创建简历分析
  const fetchOrCreateAnalysis = async (resumeId: string) => {
    try {
      // First try to get existing analysis
      const analysisResponse = await resumeApi.getAnalysis(resumeId);
      
      if (analysisResponse.data.status === 'success' && 
          analysisResponse.data.data && 
          analysisResponse.data.data.analysis) {
        // Use existing analysis
        setAnalysisData(analysisResponse.data.data.analysis);
        setScore(analysisResponse.data.data.analysis.overall_score || 0);
        console.log("Successfully loaded analysis data:", analysisResponse.data.data.analysis);
      } else {
        // If no analysis exists, create one
        const createAnalysisResponse = await resumeApi.analyzeResume(resumeId);
        
        if (createAnalysisResponse.data.status === 'success' && createAnalysisResponse.data.data) {
          const analysis = createAnalysisResponse.data.data.analysis;
          setAnalysisData(analysis);
          setScore(analysis.overall_score || 0);
          console.log("Successfully created analysis data:", analysis);
        } else {
          console.error('Failed to create analysis', createAnalysisResponse);
          // Fallback to a default score in case of error
          setScore(70);
        }
      }
    } catch (error) {
      console.error('Error fetching/creating analysis:', error);
      // Fallback to a default score in case of error
      setScore(70);
    }
  };

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
      
      // Re-analyze the resume after content changes
      if (resumeId) {
        const analyzeResponse = await resumeApi.analyzeResume(resumeId);
        if (analyzeResponse.data.status === 'success') {
          const analysis = analyzeResponse.data.data.analysis;
          setAnalysisData(analysis);
          setScore(analysis.overall_score || 0);
        }
      }
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over.id.toString());
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleItemsReorder = (section: string, newItems: any[]) => {
    // 更新本地状态
    const updatedData = {
      ...resumeData,
      [section]: newItems
    };
    
    setResumeData(updatedData);
    
    // 保存到后端
    try {
      resumeApi.updateResumeContent(resumeId, updatedData);
      console.log(`${section} items reordered successfully`);
    } catch (error) {
      console.error(`Error updating ${section} order:`, error);
    }
  };

  const handleOptimizeContent = async (
    sectionKey: string, 
    currentContent: string, 
    itemIndex?: number, 
    bulletIndex?: number,
    nestedSection?: string,
    nestedItemIndex?: number
  ) => {
    // Create optimization identifier
    const optimizeId = `${sectionKey}${itemIndex !== undefined ? `-${itemIndex}` : ''}${bulletIndex !== undefined ? `-${bulletIndex}` : ''}${nestedSection ? `-${nestedSection}` : ''}${nestedItemIndex !== undefined ? `-${nestedItemIndex}` : ''}`;
    
    // Set optimization status
    setIsOptimizing(prev => ({ ...prev, [optimizeId]: true }));
    
    try {
      // Call API to optimize content
      const response = await resumeApi.optimizeContent(resumeId, {
        sectionKey,
        itemIndex,
        bulletIndex,
        nestedSection,
        nestedItemIndex,
        currentContent,
        jobTitle: targetJobTitle
      });
      
      // If request is successful
      if (response.data && response.data.status === 'success') {
        const optimizedContent = response.data.data.optimizedContent;
        console.log('原始内容:', currentContent);
        console.log('优化后内容:', optimizedContent);
        
        // Update edit values
        if (!resumeData) return;
        
        const sectionData = resumeData[sectionKey];
        
        // 创建resumeData的深拷贝，用于更新
        const updatedResumeData = JSON.parse(JSON.stringify(resumeData));
        
        if (typeof sectionData === 'string') {
          // Update string field
          setEditValues({
            ...editValues,
            [sectionKey]: optimizedContent
          });
          
          // 直接更新resumeData
          updatedResumeData[sectionKey] = optimizedContent;
        } else if (Array.isArray(sectionData)) {
          // Update array field
          if (bulletIndex !== undefined && itemIndex !== undefined) {
            // Update bullet point in an item
            const newArray = [...editValues[sectionKey]];
            const item = newArray[itemIndex];
            
            if (nestedSection && nestedItemIndex !== undefined) {
              try {
                const nestedItems = [...(item[nestedSection] as any[])];
                const nestedItem = nestedItems[nestedItemIndex];
                
                // 找到嵌套项目中包含字符串数组的字段
                const bulletArrayField = Object.keys(nestedItem).find(key => 
                  Array.isArray(nestedItem[key]) && 
                  nestedItem[key].length > 0 && 
                  typeof nestedItem[key][0] === 'string'
                );
                
                if (bulletArrayField) {
                  // 现在我们找到了正确的字段，更新该字段中的特定项
                  const newBullets = [...nestedItem[bulletArrayField]];
                  newBullets[bulletIndex] = optimizedContent;
                  
                  // 更新嵌套对象
                  nestedItems[nestedItemIndex] = { 
                    ...nestedItem, 
                    [bulletArrayField]: newBullets 
                  };
                  newArray[itemIndex] = { ...item, [nestedSection]: nestedItems };
                  
                  // 更新resumeData中的嵌套项目
                  const updatedArray = [...updatedResumeData[sectionKey]];
                  const updatedItem = {...updatedArray[itemIndex]};
                  const updatedNestedItems = [...updatedItem[nestedSection]];
                  const updatedNestedItem = {...updatedNestedItems[nestedItemIndex]};
                  const updatedBullets = [...updatedNestedItem[bulletArrayField]];
                  updatedBullets[bulletIndex] = optimizedContent;
                  
                  updatedNestedItem[bulletArrayField] = updatedBullets;
                  updatedNestedItems[nestedItemIndex] = updatedNestedItem;
                  updatedItem[nestedSection] = updatedNestedItems;
                  updatedArray[itemIndex] = updatedItem;
                  updatedResumeData[sectionKey] = updatedArray;
                } else {
                  // 如果找不到字符串数组字段，可能是直接更新字段值
                  console.log('嵌套项目结构:', nestedItem);
                  
                  // 尝试找到与currentContent匹配的字段
                  const matchingField = Object.keys(nestedItem).find(key => 
                    nestedItem[key] === currentContent
                  );
                  
                  if (matchingField) {
                    nestedItems[nestedItemIndex] = { 
                      ...nestedItem, 
                      [matchingField]: optimizedContent 
                    };
                    newArray[itemIndex] = { ...item, [nestedSection]: nestedItems };
                    
                    // 更新resumeData
                    const updatedArray = [...updatedResumeData[sectionKey]];
                    const updatedItem = {...updatedArray[itemIndex]};
                    const updatedNestedItems = [...updatedItem[nestedSection]];
                    updatedNestedItems[nestedItemIndex] = { 
                      ...updatedNestedItems[nestedItemIndex], 
                      [matchingField]: optimizedContent 
                    };
                    updatedItem[nestedSection] = updatedNestedItems;
                    updatedArray[itemIndex] = updatedItem;
                    updatedResumeData[sectionKey] = updatedArray;
                  }
                }
              } catch (err) {
                console.error('嵌套项目处理错误:', err);
              }
            } else {
              // Update regular bullet point
              const key = Object.keys(item).find(k => 
                Array.isArray(item[k]) && 
                typeof item[k][0] === 'string'
              );
              
              if (key) {
                const newBullets = [...(item[key] as string[])];
                newBullets[bulletIndex] = optimizedContent;
                newArray[itemIndex] = { ...item, [key]: newBullets };
                
                // 更新resumeData中的常规bullet point
                const updatedArray = [...updatedResumeData[sectionKey]];
                const updatedItem = {...updatedArray[itemIndex]};
                const updatedBullets = [...updatedItem[key]];
                updatedBullets[bulletIndex] = optimizedContent;
                updatedItem[key] = updatedBullets;
                updatedArray[itemIndex] = updatedItem;
                updatedResumeData[sectionKey] = updatedArray;
              }
            }
            
            setEditValues({ ...editValues, [sectionKey]: newArray });
          } else if (itemIndex !== undefined) {
            // 处理单个字段优化的情况 (例如职位名称、公司名等)
            const key = Object.keys(editValues[sectionKey][itemIndex]).find(k => 
              editValues[sectionKey][itemIndex][k] === currentContent
            );
            
            if (key) {
              const newArray = [...editValues[sectionKey]];
              newArray[itemIndex] = { ...newArray[itemIndex], [key]: optimizedContent };
              setEditValues({ ...editValues, [sectionKey]: newArray });
              
              // 更新resumeData
              const updatedArray = [...updatedResumeData[sectionKey]];
              updatedArray[itemIndex] = { ...updatedArray[itemIndex], [key]: optimizedContent };
              updatedResumeData[sectionKey] = updatedArray;
            }
          }
        }
        
        // 更新UI显示
        setResumeData(updatedResumeData);
        
        // 保存到后端
        try {
          resumeApi.updateResumeContent(resumeId, updatedResumeData);
        } catch (error) {
          console.error('Error updating content after optimization:', error);
        }
        
        // Show success message
        setSnackbarMessage('Content optimized successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        // Show error message
        setSnackbarMessage('Failed to optimize content. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error optimizing content:', error);
      setSnackbarMessage('Error occurred during optimization');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      // Clear optimization status
      setIsOptimizing(prev => ({ ...prev, [optimizeId]: false }));
    }
  };
  
  // 关闭Snackbar通知
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const renderSectionEditor = (section: string, title: string) => {
    if (!resumeData) return null;

    const sectionData = resumeData[section];
    const isEditing = editMode[section] || false;

    if (typeof sectionData === 'string') {
      // Handle string fields like summary or objective
      return isEditing ? (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={editValues[section] || ''}
              onChange={(e) => handleTextChange(section, e.target.value)}
            />
            <OptimizeButton 
              onClick={() => handleOptimizeContent(section, editValues[section] || '')}
              isOptimizing={!!isOptimizing[section]}
              sx={{ ml: 1 }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Tip: Click the magic wand to optimize this content with AI
          </Typography>
        </Box>
      ) : (
        <Typography>{sectionData}</Typography>
      );
    }
    
    else if (Array.isArray(sectionData)) {
      // Handle array sections like experience or education
      return isEditing ? (
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
              
              {/* Recursive rendering of nested object structure */}
              {Object.entries(item).map(([key, value]) => {
                // Simple string fields
                if (typeof value === 'string') {
                  const optimizeId = `${section}-${index}-${key}`;
                  return (
                    <Box key={key} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <TextField
                          fullWidth
                          multiline
                          size="small"
                          value={value || ''}
                          onChange={(e) => {
                            const newArray = [...editValues[section]];
                            newArray[index] = { ...newArray[index], [key]: e.target.value };
                            setEditValues({ ...editValues, [section]: newArray });
                          }}
                        />
                        <IconButton 
                          color="primary"
                          onClick={() => handleOptimizeContent(section, value as string, index)}
                          disabled={isOptimizing[optimizeId]}
                          sx={{ ml: 1 }}
                        >
                          {isOptimizing[optimizeId] ? (
                            <CircularProgress size={24} />
                          ) : (
                            <AutoFixHighIcon />
                          )}
                        </IconButton>
                      </Box>
                    </Box>
                  );
                }
                
                // String array fields (like responsibilities)
                else if (Array.isArray(value) && (value.length === 0 || typeof value[0] === 'string')) {
                  return (
                    <Box key={key} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                      </Typography>
                      
                      {(value as string[]).map((bullet, bulletIndex) => {
                        const optimizeId = `${section}-${index}-${key}-${bulletIndex}`;
                        return (
                          <Box key={bulletIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TextField
                              fullWidth
                              multiline
                              size="small"
                              value={bullet || ''}
                              onChange={(e) => {
                                const newArray = [...editValues[section]];
                                const newBullets = [...(newArray[index][key] as string[])];
                                newBullets[bulletIndex] = e.target.value;
                                newArray[index] = { ...newArray[index], [key]: newBullets };
                                setEditValues({ ...editValues, [section]: newArray });
                              }}
                            />
                            <IconButton 
                              color="primary"
                              onClick={() => handleOptimizeContent(section, bullet, index, bulletIndex)}
                              disabled={isOptimizing[optimizeId]}
                              sx={{ ml: 1 }}
                            >
                              {isOptimizing[optimizeId] ? (
                                <CircularProgress size={20} />
                              ) : (
                                <AutoFixHighIcon fontSize="small" />
                              )}
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => {
                                const newArray = [...editValues[section]];
                                const newBullets = [...(newArray[index][key] as string[])];
                                newBullets.splice(bulletIndex, 1);
                                newArray[index] = { ...newArray[index], [key]: newBullets };
                                setEditValues({ ...editValues, [section]: newArray });
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}
                      
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => {
                          const newArray = [...editValues[section]];
                          const newBullets = [...(newArray[index][key] as string[]), ''];
                          newArray[index] = { ...newArray[index], [key]: newBullets };
                          setEditValues({ ...editValues, [section]: newArray });
                        }}
                      >
                        Add Item
                      </Button>
                    </Box>
                  );
                }
                
                // Object array fields (like projects)
                else if (Array.isArray(value) && (value.length === 0 || typeof value[0] === 'object')) {
                  return (
                    <Box key={key} sx={{ mb: 2, border: '1px solid #eee', p: 2, borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                      </Typography>
                      
                      {(value as any[]).map((project, projectIndex) => (
                        <Paper key={projectIndex} elevation={1} sx={{ p: 2, mb: 2, position: 'relative' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              Project {projectIndex + 1}
                            </Typography>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => {
                                const newArray = [...editValues[section]];
                                const newProjects = [...(newArray[index][key] as any[])];
                                newProjects.splice(projectIndex, 1);
                                newArray[index] = { ...newArray[index], [key]: newProjects };
                                setEditValues({ ...editValues, [section]: newArray });
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          {/* Recursive rendering of nested object structure */}
                          {Object.entries(project).map(([projectKey, projectValue]) => {
                            // Simple string fields in project
                            if (typeof projectValue === 'string') {
                              const optimizeId = `${section}-${index}-${key}-${projectIndex}-${projectKey}`;
                              return (
                                <Box key={projectKey} sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    {projectKey.charAt(0).toUpperCase() + projectKey.slice(1).replace(/_/g, ' ')}:
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <TextField
                                      fullWidth
                                      multiline
                                      size="small"
                                      value={projectValue || ''}
                                      onChange={(e) => {
                                        const newArray = [...editValues[section]];
                                        const newProjects = [...(newArray[index][key] as any[])];
                                        newProjects[projectIndex] = { 
                                          ...newProjects[projectIndex], 
                                          [projectKey]: e.target.value 
                                        };
                                        newArray[index] = { ...newArray[index], [key]: newProjects };
                                        setEditValues({ ...editValues, [section]: newArray });
                                      }}
                                    />
                                    <IconButton 
                                      color="primary"
                                      onClick={() => handleOptimizeContent(
                                        section, 
                                        projectValue as string, 
                                        index, 
                                        undefined, 
                                        key, 
                                        projectIndex
                                      )}
                                      disabled={isOptimizing[optimizeId]}
                                      sx={{ ml: 1 }}
                                    >
                                      {isOptimizing[optimizeId] ? (
                                        <CircularProgress size={20} />
                                      ) : (
                                        <AutoFixHighIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Box>
                                </Box>
                              );
                            }
                            
                            // String array fields in project
                            else if (Array.isArray(projectValue) && (projectValue.length === 0 || typeof projectValue[0] === 'string')) {
                              return (
                                <Box key={projectKey} sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    {projectKey.charAt(0).toUpperCase() + projectKey.slice(1).replace(/_/g, ' ')}:
                                  </Typography>
                                  
                                  {(projectValue as string[]).map((bullet, bulletIndex) => {
                                    const optimizeId = `${section}-${index}-${key}-${projectIndex}-${projectKey}-${bulletIndex}`;
                                    return (
                                      <Box key={bulletIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <TextField
                                          fullWidth
                                          multiline
                                          size="small"
                                          value={bullet || ''}
                                          onChange={(e) => {
                                            const newArray = [...editValues[section]];
                                            const newProjects = [...(newArray[index][key] as any[])];
                                            const newBullets = [...(newProjects[projectIndex][projectKey] as string[])];
                                            newBullets[bulletIndex] = e.target.value;
                                            newProjects[projectIndex] = { 
                                              ...newProjects[projectIndex], 
                                              [projectKey]: newBullets 
                                            };
                                            newArray[index] = { ...newArray[index], [key]: newProjects };
                                            setEditValues({ ...editValues, [section]: newArray });
                                          }}
                                        />
                                        <IconButton 
                                          color="primary"
                                          onClick={() => handleOptimizeContent(
                                            section, 
                                            bullet, 
                                            index, 
                                            bulletIndex, 
                                            key, 
                                            projectIndex
                                          )}
                                          disabled={isOptimizing[optimizeId]}
                                          sx={{ ml: 1 }}
                                        >
                                          {isOptimizing[optimizeId] ? (
                                            <CircularProgress size={20} />
                                          ) : (
                                            <AutoFixHighIcon fontSize="small" />
                                          )}
                                        </IconButton>
                                        <IconButton 
                                          size="small" 
                                          color="error"
                                          onClick={() => {
                                            const newArray = [...editValues[section]];
                                            const newProjects = [...(newArray[index][key] as any[])];
                                            const newBullets = [...(newProjects[projectIndex][projectKey] as string[])];
                                            newBullets.splice(bulletIndex, 1);
                                            newProjects[projectIndex] = { 
                                              ...newProjects[projectIndex], 
                                              [projectKey]: newBullets 
                                            };
                                            newArray[index] = { ...newArray[index], [key]: newProjects };
                                            setEditValues({ ...editValues, [section]: newArray });
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    );
                                  })}
                                  
                                  <Button 
                                    size="small" 
                                    variant="outlined"
                                    onClick={() => {
                                      const newArray = [...editValues[section]];
                                      const newProjects = [...(newArray[index][key] as any[])];
                                      const newBullets = [...(newProjects[projectIndex][projectKey] as string[]), ''];
                                      newProjects[projectIndex] = { 
                                        ...newProjects[projectIndex], 
                                        [projectKey]: newBullets 
                                      };
                                      newArray[index] = { ...newArray[index], [key]: newProjects };
                                      setEditValues({ ...editValues, [section]: newArray });
                                    }}
                                  >
                                    Add Item
                                  </Button>
                                </Box>
                              );
                            }
                            
                            return null;
                          })}
                        </Paper>
                      ))}
                      
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => {
                          const newArray = [...editValues[section]];
                          const newProjects = [...(newArray[index][key] as any[])];
                          
                          // Create new project template
                          const newProjectTemplate: Record<string, any> = {};
                          if (newProjects.length > 0) {
                            // Create based on existing project structure
                            Object.keys(newProjects[0]).forEach(k => {
                              if (Array.isArray(newProjects[0][k])) {
                                newProjectTemplate[k] = [];
                              } else {
                                newProjectTemplate[k] = '';
                              }
                            });
                          } else {
                            // Default project template
                            newProjectTemplate.name = '';
                            newProjectTemplate.responsibilities = [''];
                          }
                          
                          newProjects.push(newProjectTemplate);
                          newArray[index] = { ...newArray[index], [key]: newProjects };
                          setEditValues({ ...editValues, [section]: newArray });
                        }}
                      >
                        Add Project
                      </Button>
                    </Box>
                  );
                }
                
                return null;
              })}
            </Paper>
          ))}
          
          <Button 
            variant="outlined" 
            onClick={() => {
              const newItem: Record<string, any> = {};
              if (editValues[section].length > 0) {
                // Create new item based on existing structure
                Object.entries(editValues[section][0]).forEach(([key, value]) => {
                  if (Array.isArray(value)) {
                    if (value.length > 0 && typeof value[0] === 'object') {
                      newItem[key] = []; // Empty array for object arrays
                    } else {
                      newItem[key] = ['']; // String array with empty item
                    }
                  } else {
                    newItem[key] = '';
                  }
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
        <SortableList 
          items={sectionData} 
          sectionKey={section}
          onReorder={(newItems) => handleItemsReorder(section, newItems)}
        />
      );
    }

    return null;
  };

  const renderScoreCard = () => {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resume Score
        </Typography>
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
          {analysisData ? (
            <>
              <ListItem>
                <ListItemText 
                  primary="Technical Skills" 
                  secondary={`${analysisData.technical_score || 0}%`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="ATS Compatibility" 
                  secondary={`${analysisData.ats_compatibility_score || 0}%`} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Communication" 
                  secondary={`${analysisData.communication_score || 0}%`} 
                />
              </ListItem>
              {analysisData.areas_for_improvement && analysisData.areas_for_improvement.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Suggestions:</Typography>
                  <List dense>
                    {analysisData.areas_for_improvement.slice(0, 3).map((area: string, index: number) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText 
                          primary={<Typography variant="body2">{area}</Typography>}
                          sx={{ m: 0 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </>
          ) : (
            // Fallback for when analysis data is not available
            <>
              <ListItem>
                <ListItemText primary="Skills Matching" secondary="Loading..." />
              </ListItem>
              <ListItem>
                <ListItemText primary="ATS Compatibility" secondary="Loading..." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Impact Statements" secondary="Loading..." />
              </ListItem>
            </>
          )}
        </List>
      </Paper>
    );
  };

  const renderJobTargetOptimization = () => {
    return (
      <Paper>
        <Typography variant="h6" gutterBottom>
          Job Target Optimization
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter your target job title to get customized suggestions for AI optimization
        </Typography>
        <TextField
          fullWidth
          placeholder="e.g. Software Engineer"
          variant="outlined"
          value={targetJobTitle}
          onChange={(e) => setTargetJobTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="text.secondary" paragraph>
          Adding a job title will help the AI tailor content to industry standards
        </Typography>
      </Paper>
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Tabs 
            value={viewMode} 
            onChange={(_, newValue) => setViewMode(newValue)}
            aria-label="resume view mode"
          >
            <Tab 
              icon={<EditNoteIcon />} 
              label="Edit" 
              value="edit" 
              iconPosition="start" 
            />
            <Tab 
              icon={<VisibilityIcon />} 
              label="Preview" 
              value="preview" 
              iconPosition="start"
            />
          </Tabs>
          <Typography variant="body2" color="text.secondary">
            Resume File: {fileName}
          </Typography>
        </Box>
      </Box>

      {viewMode === 'edit' ? (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sectionOrder}
                strategy={verticalListSortingStrategy}
              >
                {sectionOrder.map((section) => (
                  resumeData && (
                    <SortableSection
                      key={section}
                      id={section}
                      section={section}
                      resumeData={resumeData}
                      editMode={editMode}
                      handleEdit={handleEdit}
                      handleSave={handleSave}
                      renderSectionEditor={renderSectionEditor}
                    />
                  )
                ))}
              </SortableContext>
            </DndContext>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
            <ResumeScoreCard score={score} analysisData={analysisData} />
            <JobTargetCard 
              targetJobTitle={targetJobTitle} 
              onChange={setTargetJobTitle} 
            />
          </Box>
        </Stack>
      ) : (
        <Box sx={{ mt: 3, mb: 4 }}>
          <ResumePreview resumeData={resumeData} />
        </Box>
      )}
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {viewMode === 'preview' && (
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />}
            onClick={() => {
              // Implement PDF export functionality here
              window.print();
            }}
          >
            Export as PDF
          </Button>
        )}
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={onComplete}
        >
          Finalize and Save
        </Button>
      </Box>
      
      {/* Add Snackbar notification */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResumeEditor; 