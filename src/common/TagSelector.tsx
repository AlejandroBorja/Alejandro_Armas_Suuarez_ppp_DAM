import React, { useState, useEffect } from 'react';
import { IonButton, IonSelect, IonSelectOption, IonChip } from '@ionic/react';

interface TagSelectorProps {
  availableTags: string[];
  selectedTags: string[];
  onSelectTags: (tags: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ availableTags, selectedTags, onSelectTags }) => {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected(selectedTags);
  }, [selectedTags]);

  const handleTagClick = (tag: string) => {
    const updatedSelected = selected.includes(tag)
      ? selected.filter((selectedTag) => selectedTag !== tag)
      : [...selected, tag];

    setSelected(updatedSelected);
    onSelectTags(updatedSelected);
  };

  return (
    <div style={styles.container}>
      <IonSelect value="" onIonChange={(e) => handleTagClick(e.detail.value)}>
        <IonSelectOption value="">Selecciona una etiqueta...</IonSelectOption>
        {availableTags.map((tag) => (
          <IonSelectOption key={tag} value={tag}>
            {tag}
          </IonSelectOption>
        ))}
      </IonSelect>
      <div style={styles.chipContainer}>
        {selected.map((tag) => (
          <IonChip
            key={tag}
            onClick={() => handleTagClick(tag)}
            style={styles.tagChip}
          >
            {tag}
          </IonChip>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  },
  heading: {
    fontSize: '1.25rem',
    marginBottom: '10px',
  },
  clearButton: {
    marginTop: '10px',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    marginTop: '10px',
  },
  tagChip: {
    margin: '5px',
    backgroundColor: '#2196F3',
    color: '#fff',
    borderRadius: '4px',
  },
};

export default TagSelector;
