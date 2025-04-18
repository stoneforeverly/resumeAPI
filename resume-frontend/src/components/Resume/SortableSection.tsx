import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  IconButton 
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';

export interface ResumeData {
  [key: string]: any;
  personal_info?: any;
  summary?: string;
  experience?: any[];
  education?: any[];
  skills?: any;
}

export interface SortableSectionProps {
  id: string;
  section: string;
  resumeData: ResumeData;
  editMode: {[key: string]: boolean};
  handleEdit: (section: string) => void;
  handleSave: (section: string) => void;
  renderSectionEditor: (section: string, title: string) => React.ReactNode;
}

const SortableSection = forwardRef<HTMLDivElement, SortableSectionProps>(({ 
  id, 
  section, 
  resumeData, 
  editMode, 
  handleEdit, 
  handleSave, 
  renderSectionEditor 
}, ref) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: '1rem',
    zIndex: isDragging ? 1 : 'auto'
  };

  // 合并forwardRef的ref和useSortable的ref
  const handleRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    // 转发ref到父组件
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <div ref={handleRef} style={style} {...attributes}>
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <div {...listeners} style={{ cursor: 'grab', marginRight: '8px' }}>
                <DragIndicatorIcon sx={{ color: 'text.secondary' }} />
              </div>
              {section.charAt(0).toUpperCase() + section.slice(1).replace(/_/g, ' ')}
            </Box>
          }
          action={
            <IconButton 
              onClick={() => editMode[section] ? handleSave(section) : handleEdit(section)}
            >
              {editMode[section] ? <CheckIcon /> : <EditIcon />}
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          {resumeData && resumeData[section] && renderSectionEditor(section, '')}
        </CardContent>
      </Card>
    </div>
  );
});

export default SortableSection; 