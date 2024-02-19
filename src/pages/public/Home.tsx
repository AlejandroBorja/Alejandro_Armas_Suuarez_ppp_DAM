import React, { useState, useEffect, useContext } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import Header from '../../common/Header';
import EventList from '../../events/EventList';
import SearchBar from '../../common/SearchBar';
import TagSelector from '../../common/TagSelector';
import SearchResultsView from '../../common/SearchsResultView';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { AppContext } from '../../App';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user, setUser } = useContext(AppContext); 
  console.log('Usuario en Home:', user);
  const [forceRenderKey, setForceRender] = useState(Date.now());

  useIonViewWillEnter(() => {
    setForceRender(Date.now());
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);

        const tagsData: string[] = [];

        eventsSnapshot.forEach((doc) => {
          const tags = doc.data().tags;
          tagsData.push(...tags);
        });

        const uniqueTags = Array.from(new Set(tagsData));

        setAllTags(uniqueTags);
      } catch (error) {
        console.error('Error al obtener tags:', error);
      }
    };

    fetchTags();
  }, []);

  const handleSearch = (query: string, tags: string[]) => {
    setSearchQuery(query);
    setSelectedTags(tags);
  };

  const handleExitSearch = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setForceRender(Date.now());
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <Header />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="container" style={styles.container}>
          <h1 className="heading" style={styles.heading}>
            Eventos y Conferencias
          </h1>
          <SearchBar onSearch={handleSearch} />
          <TagSelector
            availableTags={allTags}
            selectedTags={selectedTags}
            onSelectTags={(tags) => setSelectedTags(tags)}
          />
          {searchQuery || selectedTags.length > 0 ? (
            <SearchResultsView
              searchQuery={searchQuery}
              selectedTags={selectedTags}
              onExitSearch={handleExitSearch}
            />
          ) : (
            <EventList forceRenderKey={forceRenderKey} />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  heading: {
    fontSize: '2rem',
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
};

export default Home;
