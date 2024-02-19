
import React, { useEffect, useState, useContext } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc as firestoreDoc,
  where,
  query,
} from 'firebase/firestore';
import { AppContext } from '../App';
import { useHistory } from 'react-router-dom';

const MyEventsView: React.FC = () => {
  const { user } = useContext(AppContext);
  const [events, setEvents] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (user) {
          const eventsCollection = collection(db, 'events');
          const userEventsQuery = query(
            eventsCollection,
            where('organizerId', '==', user.uid)
          );
          const eventsSnapshot = await getDocs(userEventsQuery);

          const eventsData = eventsSnapshot.docs.map((doc) => ({
            docId: doc.id, 
            ...doc.data(),
          }));

          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Error al obtener eventos:', error);
      }
    };

    fetchEvents();
  }, [user]);

  const handleEditEvent = (docId: string) => {
    history.push(`/EditEvent/${docId}`);
  };

  const handleDeleteEvent = async (docId: string) => {
    try {
      const eventDocRef = firestoreDoc(db, 'events', docId);
      await deleteDoc(eventDocRef);

      const updatedEvents = events.filter((event) => event.docId !== docId);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Mis Eventos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {events.map((event) => (
            <IonItem key={event.docId}>
              <IonLabel>
                <h2>{event.title}</h2>
                <p>Fecha: {event.date}</p>
              </IonLabel>
              <IonButton onClick={() => handleEditEvent(event.docId)}>
                Editar
              </IonButton>
              <IonButton onClick={() => handleDeleteEvent(event.docId)}>
                Eliminar
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MyEventsView;
