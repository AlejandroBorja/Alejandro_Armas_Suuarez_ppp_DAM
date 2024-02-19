import React, { useState, useEffect, useContext } from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButton, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle } from '@ionic/react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AppContext } from '../App';
import { useHistory } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  photo: string;
}

const MyEventAssist: React.FC = () => {
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const { user } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    const fetchUserEvents = async (userId: string) => {
      try {
        const userRolesDoc = await getDoc(doc(collection(db, 'userRoles'), userId));
        
        if (userRolesDoc.exists()) {
          const userRoles = userRolesDoc.data();
          const attendedEvents = userRoles?.attendingEvents || [];
          const attendedEventsData: Event[] = await Promise.all(
            attendedEvents.map(async (eventId: string) => {
              const eventDoc = await getDoc(doc(collection(db, 'events'), eventId));

              if (eventDoc.exists()) {
                const eventData = eventDoc.data() as Event;
                return {
                  id: eventDoc.id,
                  title: eventData.title,
                  date: eventData.date,
                  description: eventData.description,
                  tags: eventData.tags,
                  photo: eventData.photo,
                };
              } else {
                console.error(`Evento con ID ${eventId} no encontrado.`);
                return null;
              }
            })
          );

          const filteredEvents = attendedEventsData.filter((event) => event !== null);

          setUserEvents(filteredEvents);
        } else {
          console.error('Roles del usuario no encontrados.');
        }
      } catch (error) {
        console.error('Error al obtener eventos del usuario:', error);
      }
    };

    if (user) {
      fetchUserEvents(user.uid);
    }
  }, [user]);

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
          {userEvents.length > 0 ? (
            userEvents.map((event) => (
              <IonItem key={event.id}>
                <IonLabel>
                  <h2>{event.title}</h2>
                  <p>Fecha: {event.date}</p>
                  <p>{event.description}</p>
                </IonLabel>
                <IonButton onClick={() => history.push(`/buyticket/${event.id}`)}>
                  Comprar
                </IonButton>
              </IonItem>
            ))
          ) : (
            <p>No estás asistiendo a ningún evento actualmente.</p>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MyEventAssist;
