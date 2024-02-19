import React, { useState, useEffect, useContext, useRef } from 'react';
import { IonContent, IonPage, IonButton, IonText, IonToolbar, IonButtons, IonBackButton, IonHeader, IonTitle } from '@ionic/react';
import {
  collection,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  setDoc,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AppContext } from '../App';
import { useParams, useHistory } from 'react-router-dom';

interface EventDetails {
  title: string;
  date: string;
  description: string;
  tags: string[];
  organizerId: string;
  location: string; 
  capacity: number; 
}

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  photo: string;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  replies: Reply[];
}

interface Reply {
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

const EventDetailsView: React.FC = () => {
  const { user } = useContext(AppContext);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isUserOrganizer, setIsUserOrganizer] = useState<boolean>(false);
  const [isUserAttending, setIsUserAttending] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const { eventId } = useParams<{ eventId: string }>();
  const history = useHistory();
  const commentsContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  };

  const fetchEventDetails = async () => {
    try {
      if (!eventId) {
        console.error('El eventId está vacío o undefined.');
        return;
      }

      const eventDoc = await getDoc(doc(collection(db, 'events'), eventId));

      if (eventDoc.exists()) {
        const eventData = eventDoc.data() as EventDetails;
        setEventDetails(eventData);

        if (user?.uid) {
          checkUserRoles(user.uid);
        }
      } else {
        console.error('Evento no encontrado.');
      }
    } catch (error) {
      console.error('Error al obtener detalles del evento:', error);
    }
  };

  const fetchEventComments = async () => {
    try {
      const commentsCollection = collection(db, 'events', eventId, 'comments');
      const commentsSnapshot = await getDocs(commentsCollection);

      const commentsData: Comment[] = [];

      commentsSnapshot.forEach((commentDoc) => {
        const comment = commentDoc.data() as Comment;
        commentsData.push({
          ...comment,
          id: commentDoc.id,
        });
      });

      commentsData.sort((a, b) => b.timestamp - a.timestamp);

      setComments(commentsData);
      scrollToBottom(); 
    } catch (error) {
      console.error('Error al obtener comentarios del evento:', error);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    fetchEventComments();
  }, [eventId, user]);

  useEffect(() => {
    if (user) {
      checkUserRoles(user.uid);
    }
  }, [user]);

  const checkUserRoles = async (userId: string) => {
    try {
      if (!userId) {
        console.error('El userId está vacío o undefined.');
        return;
      }

      const userRolesDoc = await getDoc(doc(collection(db, 'userRoles'), userId));

      if (userRolesDoc.exists()) {
        const userRoles = userRolesDoc.data();
        setIsUserOrganizer(userRoles?.isOrganizer || false);
        setIsUserAttending(userRoles?.attendingEvents?.includes(eventId) || false);
      }
    } catch (error) {
      console.error('Error al obtener roles del usuario:', error);
    }
  };

  const handleJoinEvent = async () => {
    try {
      if (!user?.uid || !eventId) {
        console.error('UserId o eventId no disponibles.');
        return;
      }

      const userRolesDocRef = doc(collection(db, 'userRoles'), user.uid);
      const userRolesDoc = await getDoc(userRolesDocRef);

      if (userRolesDoc.exists()) {
        await updateDoc(userRolesDocRef, {
          attendingEvents: arrayUnion(eventId),
        });

        setIsUserAttending(true);
      } else {
        await setDoc(userRolesDocRef, {
          attendingEvents: [eventId],
        });

        setIsUserAttending(true);
      }
    } catch (error) {
      console.error('Error al unirse al evento:', error);
    }
  };

  const handleLeaveEvent = async () => {
    try {
      if (!user?.uid || !eventId) {
        console.error('UserId o eventId no disponibles.');
        return;
      }

      await updateDoc(doc(collection(db, 'userRoles'), user.uid), {
        attendingEvents: arrayRemove(eventId),
      });

      setIsUserAttending(false);
    } catch (error) {
      console.error('Error al abandonar el evento:', error);
    }
  };
 
  const handleDeleteEvent = async () => {
    try {
      if (!eventId) {
        console.error('El eventId está vacío o undefined.');
        return;
      }

      await deleteDoc(doc(collection(db, 'events'), eventId));
      history.push('/'); 
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
    }
  };

  const handleAddComment = async () => {
    try {
      if (!user?.uid || !eventId || !newComment) {
        console.error('UserId, eventId o newComment no disponibles.');
        return;
      }

      const userDocRef = doc(collection(db, 'users'), user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const username = userData?.username || 'Anónimo';

        console.log('Nombre de usuario encontrado:', username);

        const commentsCollection = collection(db, 'events', eventId, 'comments');

        await addDoc(commentsCollection, {
          userId: user.uid,
          username: username,
          content: newComment,
          timestamp: Date.now(),
          replies: [],
        });

        setNewComment('');
        fetchEventComments();
      } else {
        console.error('Usuario no encontrado en Firestore');
      }
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const handleReplyComment = async (commentId: string) => {
    try {
      if (!user?.uid || !eventId || !commentTexts[commentId]) {
        console.error('Información de depuración:', { user, eventId, commentTexts });
        console.error('UserId, eventId o newComment no disponibles.');
        return;
      }

      const userDocRef = doc(collection(db, 'users'), user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const username = userData?.username || 'Anónimo';

        console.log('Nombre de usuario encontrado:', username);

        const commentsCollection = collection(db, 'events', eventId, 'comments');
        const commentDocRef = doc(commentsCollection, commentId);

        const reply: Reply = {
          userId: user.uid,
          username: username,
          content: commentTexts[commentId],
          timestamp: Date.now(),
        };

        await updateDoc(commentDocRef, {
          replies: arrayUnion(reply),
        });

        setCommentTexts({ ...commentTexts, [commentId]: '' });

        fetchEventComments();
      } else {
        console.error('Usuario no encontrado en Firestore');
      }
    } catch (error) {
      console.error('Error al responder al comentario:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Detalles</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={styles.container}>
          {eventDetails ? (
            <div>
              <h2 style={styles.heading}>{eventDetails.title}</h2>
              <p style={styles.date}>Fecha: {eventDetails.date}</p>
              <p style={styles.description}>Descripción: {eventDetails.description}</p>
              <p style={styles.location}>Dirección: {eventDetails.location}</p> 
              <p style={styles.capacity}>Aforo: {eventDetails.capacity}</p> 
              <div style={styles.tags}> TAGS: 
                {eventDetails.tags.map((tag) => (
                  <span key={tag} style={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
              {user ? (
                <div style={styles.actions}>
                  {isUserAttending ? (
                    <IonButton onClick={handleLeaveEvent} style={styles.leaveButton}>
                      Dejar de Asistir
                    </IonButton>
                  ) : (
                    <IonButton onClick={handleJoinEvent} style={styles.joinButton}>
                      Asistir al Evento
                    </IonButton>
                  )}
                  {isUserOrganizer && (
                    <IonButton onClick={handleDeleteEvent} style={styles.deleteButton}>
                      Eliminar Evento
                    </IonButton>
                  )}
                </div>
              ) : (
                <IonText>
                  <span
                    style={styles.loginLink}
                    onClick={() =>history.push('/Login')}
                  >
                    Inicia sesión
                  </span>{' '}
                  para asistir al evento.
                </IonText>
              )}
                {user && (
                  <div style={styles.newCommentContainer}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Agregar un nuevo comentario..."
                    />
                    <IonButton onClick={handleAddComment}>Comentar</IonButton>
                  </div>
                )}
              <div
                style={styles.commentsSection}
                ref={(ref) => (commentsContainerRef.current = ref)}
              >
                <h3>Comentarios</h3>
                {comments.map((comment) => (
                  <div key={comment.id} style={styles.commentContainer}>
                    <strong>{comment.username}:</strong> {comment.content}
                    {comment.replies.length > 0 && (
                      <div style={styles.repliesContainer}>
                        {comment.replies.map((reply) => (
                          <div key={reply.timestamp} style={styles.replyContainer}>
                            <strong>{reply.username}:</strong> {reply.content}
                          </div>
                        ))}
                      </div>
                    )}
                    {user && (
                      <div style={styles.replyInputContainer}>
                        <textarea
                          value={commentTexts[comment.id] || ''}
                          onChange={(e) =>
                            setCommentTexts({ ...commentTexts, [comment.id]: e.target.value })
                          }
                          placeholder="Responder al comentario..."
                        />
                        <IonButton onClick={() => handleReplyComment(comment.id)}>
                          Responder
                        </IonButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <IonText>Cargando detalles del evento...</IonText>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: 'auto',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    marginBottom: 8,
  },
  date: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  location: {
    marginBottom: 8,
    // fontWeight: 'bold',
  },
  capacity: {
    marginBottom: 8,
    // fontWeight: 'bold',
  },
  tags: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap' as const,
  },
  tag: {
    background: '#eee',
    padding: '4px 8px',
    borderRadius: 4,
  },
  actions: {
    marginTop: 16,
  },
  joinButton: {
    marginRight: 8,
    padding: '8px 16px',
    '--background': '#4caf50',
    '--color': 'white',
    borderRadius: 4,
    cursor: 'pointer',
  },
  leaveButton: {
    marginRight: 8,
    padding: '8px 16px',
    '--background': '#f44336',
    '--color': 'white',
    borderRadius: 4,
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '8px 16px',
    '--background': '#f44336',
    '--color': 'white',
    borderRadius: 4,
    cursor: 'pointer',
  },
  loginLink: {
    color: '#3498db',
    cursor: 'pointer',
  },
  commentsSection: {
    marginTop: 16,
  },
  commentContainer: {
    marginBottom: 16,
    border: '1px solid #ddd',
    padding: 8,
    borderRadius: 4,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 16,
    borderLeft: '1px solid #ddd',
    paddingLeft: 8,
  },
  replyContainer: {
    marginBottom: 8,
  },
  replyInputContainer: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  newCommentContainer: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
};

export default EventDetailsView;
