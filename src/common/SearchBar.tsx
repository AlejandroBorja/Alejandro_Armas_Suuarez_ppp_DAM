import React, { useState } from 'react';
import { IonButton, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';

interface SearchBarProps {
  onSearch: (query: string, tags: string[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: CustomEvent) => {
    setQuery(e.detail.value);
    setError('');
  };

  const handleTagClick = (tag: string) => {
    const updatedSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((selectedTag) => selectedTag !== tag)
      : [...selectedTags, tag];

    setSelectedTags(updatedSelectedTags);
    setError('');
    onSearch(query, updatedSelectedTags);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!query.trim() && selectedTags.length === 0) {
      setError('Debes ingresar un título o seleccionar al menos un tag.');
      return;
    }

    onSearch(query, selectedTags);
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <IonItem>
        <IonLabel position="floating">Buscar eventos o conferencias</IonLabel>
        <IonInput
          value={query}
          onIonInput={handleInputChange}
          type="text"
        />
      </IonItem>


      {selectedTags.map((tag) => (
        <span key={tag} onClick={() => handleTagClick(tag)} style={styles.tag}>
          {tag}
        </span>
      ))}

      {error && <p style={styles.error}>{error}</p>}

      <IonButton type="submit" expand="full" style={styles.searchButton}>
        Buscar
      </IonButton>
    </form>
  );
};


const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
  },
  tag: {
    padding: '5px 10px',
    margin: '5px',
    cursor: 'pointer',
    backgroundColor: '#2196F3',
    color: '#fff',
    borderRadius: '4px',
  },
  error: {
    color: 'red',
    textAlign: 'center' as const,
  },
  searchButton: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default SearchBar;
