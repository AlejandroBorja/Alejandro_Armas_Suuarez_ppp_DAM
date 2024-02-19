
import React, { useState, useEffect, useContext } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonImg,
  IonLabel,
  IonContent,
  IonButton,
  useIonViewWillEnter,
} from '@ionic/react';
import HeaderOrganizer from '../../common/HeaderOrganizer';
import EventList from '../../events/EventList';
import SearchBar from '../../common/SearchBar';
import TagSelector from '../../common/TagSelector';
import SearchResultsView from '../../common/SearchsResultView';
import { getDocs, collection, query, DocumentData, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { AppContext } from '../../App';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  firstName: string;
  lastName: string;
  username: string;
  birthDate: string;
  role: string;
}

const OrganizerView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user, setUser } = useContext(AppContext);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [forceRenderKey, setForceRender] = useState(Date.now());
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  useIonViewWillEnter(() => {
    setForceRender(Date.now());
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setUserProfile(userData);
          } else {
            console.error('Datos de usuario no encontrados.');
          }
        } catch (error) {
          console.error('Error al obtener datos de usuario:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user, setUser,forceRenderKey]);

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
    setShowSearchResults(true);
  };

  const handleExitSearch = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setShowSearchResults(false);
    setForceRender(Date.now());
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <HeaderOrganizer />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="container" style={styles.container}>
          {userProfile && (
            <div style={styles.userProfile}>
              <IonImg
                src={userProfile.photoURL}
                alt="Foto de perfil"
                style={styles.userImage}
              />
              <IonLabel style={styles.userName}>{userProfile.username}</IonLabel>
            </div>
          )}
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
  userProfile: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '20px',
  },
  userImage: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    marginBottom: '10px',
  },
  userName: {
    fontSize: '1.2rem',
    fontWeight: 'bold' as const,
  },
};

export default OrganizerView;
