import React from 'react';
import { 
  DndContext, 
  closestCenter, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  sortableKeyboardCoordinates, 
  arrayMove 
} from '@dnd-kit/sortable';
import { List } from '@mui/material';
import SortableItem from './SortableItem';

export interface SortableListProps {
  items: any[];
  sectionKey: string;
  onReorder: (newItems: any[]) => void;
}

const SortableList: React.FC<SortableListProps> = ({ items, sectionKey, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => `${sectionKey}-item-${item.id || items.indexOf(item)}` === active.id);
      const newIndex = items.findIndex(item => `${sectionKey}-item-${item.id || items.indexOf(item)}` === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map((item, index) => `${sectionKey}-item-${item.id || index}`)}
        strategy={verticalListSortingStrategy}
      >
        <List sx={{ ml: 3 }}>
          {items.map((item, index) => (
            <SortableItem
              key={`${sectionKey}-item-${item.id || index}`}
              id={`${sectionKey}-item-${item.id || index}`}
              item={item}
              index={index}
              sectionKey={sectionKey}
              isLast={index === items.length - 1}
            />
          ))}
        </List>
      </SortableContext>
    </DndContext>
  );
};

export default SortableList; 