

import React, { useState, useEffect, useContext } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AppContext } from '../App';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  photo: string;
}

interface EventListProps {
  forceRenderKey: number;
}

const EventList: React.FC<EventListProps> = ({ forceRenderKey }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const history = useHistory();
  const { user } = useContext(AppContext);
  console.log(user);

  useEffect(() => {
    fetchEvents();
  }, [forceRenderKey]);

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);

      const eventsData: Event[] = [];
      eventsSnapshot.forEach((doc) => {
        const eventData = doc.data() as Event;
        eventsData.push({
          id: doc.id,
          title: eventData.title,
          date: eventData.date,
          description: eventData.description,
          tags: eventData.tags,
          photo: eventData.photo,
        });
      });

      setEvents(eventsData);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
    }
  };

  const handleEventClick = (eventId: string) => {
    history.push(`/events/${eventId}`);
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={styles.heading}>Lista de Eventos</IonTitle>
        </IonToolbar>
      </IonHeader>

      {events.length > 0 ? (
        <IonList style={styles.eventList}>
          {events.map((event) => (
            <IonItem key={event.id} style={styles.eventItem} onClick={() => handleEventClick(event.id)}>
              <IonLabel>
                <IonTitle style={styles.eventTitle}>{event.title}</IonTitle>
                <p style={styles.eventDate}>Fecha: {event.date}</p>
                <p style={styles.eventDescription}>{event.description}</p>
                <img src={event.photo} alt={event.title} style={styles.eventPhoto} />
                <div style={styles.eventTags}>
                  {event.tags.map((tag) => (
                    <span key={tag} style={styles.eventTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      ) : (
        <p style={styles.noEvents}>No hay eventos disponibles.</p>
      )}
    </>
  );
};

const styles = {
  heading: {
    fontSize: '2rem',
    textAlign: 'center' as const,
    marginBottom: '9px',
  },
  eventList: {
    listStyle: 'none',
    padding: 0,
  },
  eventItem: {
    marginBottom: '24px',
    borderBottom: '1px solid #ddd',
  },
  eventTitle: {
    fontSize: '20px',
    marginBottom: '8px',
  },
  eventDate: {
    marginBottom: '8px',
    color: '#666',
  },
  eventDescription: {
    marginBottom: '16px',
  },
  eventPhoto: {
    maxWidth: '100%',
    height: 'auto',
    marginBottom: '16px',
  },
  eventTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  eventTag: {
    background: '#C3BE00',
    padding: '4px 8px',
    borderRadius: '4px',
    
  },
  noEvents: {
    fontSize: '16px',
    textAlign: 'center' as const,
    color: '#666',
  },
};

export default EventList;
