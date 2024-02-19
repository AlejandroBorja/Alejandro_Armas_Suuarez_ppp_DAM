
import React, { useEffect, useState } from 'react';
import {
  IonLabel,
  IonList,
  IonItem,
  IonImg,
} from '@ionic/react';
import { getDocs, collection, query, where, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { useHistory } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  photo: string;
}

interface SearchResultsViewProps {
  searchQuery: string;
  selectedTags: string[];
  onExitSearch: () => void;
}

const SearchResultsView: React.FC<SearchResultsViewProps> = ({ searchQuery, selectedTags, onExitSearch }) => {
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        let eventsQuery = query(collection(db, 'events'), where('title', '>=', searchQuery), where('title', '<=', searchQuery + '\uf8ff'));

        if (selectedTags.length > 0) {
          eventsQuery = query(eventsQuery, where('tags', 'array-contains-any', selectedTags));
        }

        const eventsSnapshot = await getDocs(eventsQuery);

        const eventsData = eventsSnapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            title: data.title,
            date: data.date,
            description: data.description,
            tags: data.tags,
            photo: data.photo,
          } as Event;
        });

        setSearchResults(eventsData);
      } catch (error) {
        console.error('Error al obtener resultados de búsqueda:', error);
      }
    };

    fetchSearchResults();
  }, [searchQuery, selectedTags]);

  const handleEventClick = (eventId: string) => {
    history.push(`/events/${eventId}`);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        Resultados de Búsqueda: "{searchQuery}" {selectedTags.length > 0 && `con etiquetas: ${selectedTags.join(', ')}`}
      </h2>
      {searchResults.length > 0 ? (
        <IonList>
          {searchResults.map((event) => (
            <IonItem key={event.id} style={styles.eventContainer} onClick={() => handleEventClick(event.id)}>
              <IonLabel>
                <h3 style={styles.title}>{event.title}</h3>
                <p style={styles.date}>{event.date}</p>
                <p style={styles.description}>{event.description}</p>
                <IonImg src={event.photo} alt={event.title} style={styles.eventPhoto} />
                <div style={styles.tags}>
                  {event.tags.map((tag) => (
                    <IonLabel key={tag} style={styles.tag}>
                      {tag}
                    </IonLabel>
                  ))}
                </div>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      ) : (
        <p style={styles.noResults}>No hay resultados para la búsqueda.</p>
      )}
      <button style={styles.button} onClick={onExitSearch}>Ver eventos</button>
    </div>
  );
};

const styles = {

  button:{
    margin: '10px 20px',
    padding: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  container: {
    textAlign: 'center' as const,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  eventContainer: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '1.25rem',
    marginBottom: '10px',
  },
  date: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '10px',
  },
  description: {
    fontSize: '1rem',
    marginBottom: '20px',
  },
  eventPhoto: {
    maxWidth: '100%',
    height: 'auto',
    marginBottom: '16px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
  },
  tag: {
    backgroundColor: '#2196F3',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '4px',
    margin: '0 5px 5px 0',
  },
  noResults: {
    fontSize: '1rem',
    textAlign: 'center' as const,
    color: '#666',
  },
};

export default SearchResultsView;
