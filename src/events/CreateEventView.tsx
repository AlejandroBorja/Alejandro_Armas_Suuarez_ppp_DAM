
import React, { useContext, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonLabel,
  IonTextarea,
  IonButton,
  IonDatetime,
  IonAlert,
  IonItem,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { getAuth, User, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useHistory } from 'react-router-dom';
import { db } from '../firebase';
import { AppContext } from '../App';

interface CreateEventFormValues {
  title: string;
  date: string;
  description: string;
  tags: string;
  photo: string;
  photoFile?: File;
  capacity: number; 
  location: string;
}

const CreateEventView: React.FC = () => {
  const { user } = useContext(AppContext);
  const [formValues, setFormValues] = useState<CreateEventFormValues>({
    title: '',
    date: '',
    description: '',
    tags: '',
    photo: '',
    photoFile: undefined,
    capacity: 0, 
    location: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const history = useHistory();

  onAuthStateChanged(getAuth(), (user: User | null) => {
    
  });

  const handleChange = (
    key: keyof CreateEventFormValues,
    value: string | string[] | null | undefined
  ) => {
    console.log(`Estableciendo ${key} a:`, value);
    
    const sanitizedValue = Array.isArray(value) ? value[0] : value;

    setFormValues((prevValues) => ({
      ...prevValues,
      [key]: key === 'capacity' ? parseInt(sanitizedValue || '0', 10) : sanitizedValue || '', 
    }));
  };

  const handleChangeFile = (
    key: keyof CreateEventFormValues,
    files: FileList | null
  ) => {
    if (files && files.length > 0) {
      setFormValues((prevValues) => ({
        ...prevValues,
        [key]: files[0],
        photo: '', 
      }));
    }
  };

  
  const generateUniqueEventId = () => {
    return Math.random().toString(36).substr(2, 9); 
  };

  const createEventId = (organizerId: string, eventId: string) =>
    `${organizerId}_${eventId}`;

  const onSubmit = async () => {
    try {
      console.log('Valores del formulario:', formValues);
      setIsSubmitting(true);
      const currentUser = getAuth().currentUser;

      if (currentUser) {
        const tagsArray = formValues.tags.split(',').map((tag) => tag.trim());

        if (formValues.photoFile) {
          const storageReference = storageRef(
            getStorage(),
            `${Date.now()}_${formValues.photoFile.name}`
          );

          await uploadBytes(storageReference, formValues.photoFile);

        
          const photoURL = await getDownloadURL(storageReference);

          const uniqueEventId = generateUniqueEventId();
          const eventRef = await addDoc(collection(db, 'events'), {
            id: createEventId(currentUser.uid, uniqueEventId),
            title: formValues.title,
            date: formValues.date,
            description: formValues.description,
            tags: tagsArray,
            organizerId: currentUser.uid,
            photo: photoURL, 
            capacity: formValues.capacity, 
            location: formValues.location,
          });

          const userEventRef = doc(
            db,
            'users',
            currentUser.uid,
            'user_events',
            eventRef.id
          );
          await setDoc(userEventRef, {
            eventId: eventRef.id,
          });

          console.log('Evento creado exitosamente');
          history.push('/OrganizerView');
        }
      }
    } catch (error) {
      console.error('Error al crear el evento:', error);

      setErrors({
        title: 'Error al crear el evento. Inténtalo de nuevo.',
      });

      setShowErrorAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={styles.container}>
          <h2 style={styles.heading}>Crear Nuevo Evento</h2>
          <form style={styles.form}>
            <IonItem className="formGroup">
              <IonLabel position="floating">Título</IonLabel>
              <IonInput
                value={formValues.title}
                onIonChange={(e) => handleChange('title', e.detail.value!)}
                type="text"
                style={styles.input}
              />
            </IonItem>
            <IonItem className="formGroup">
              <IonLabel position="floating">Fecha</IonLabel>
              <IonDatetime
                value={formValues.date || undefined} 
                onIonChange={(e) => handleChange('date', e.detail.value)}
                min={new Date().toISOString()}  
                style={styles.input}
                max="2050-12-31"  
              />
            </IonItem>
            <IonItem className="formGroup">
              <IonLabel position="floating">Descripción</IonLabel>
              <IonTextarea
                value={formValues.description}
                onIonChange={(e) => handleChange('description', e.detail.value!)}
                style={styles.textarea}
              ></IonTextarea>
            </IonItem>
            <IonItem className="formGroup">
              <IonLabel position="floating">
                Etiquetas (Separadas por comas)
              </IonLabel>
              <IonInput
                value={formValues.tags}
                onIonChange={(e) => handleChange('tags', e.detail.value!)}
                type="text"
                style={styles.input}
              />
            </IonItem>
            <IonItem className="formGroup">
              <IonLabel position="floating">Foto (URL)</IonLabel>
              <IonInput
                value={formValues.photo}
                onIonChange={(e) => handleChange('photo', e.detail.value!)}
                type="text"
                style={styles.input}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleChangeFile('photoFile', e.target.files)
                }
                style={{ marginTop: '10px' }}
              />
            </IonItem>
            <IonItem className="formGroup">
              <IonLabel position="floating">Aforo</IonLabel>
              <IonInput
                value={formValues.capacity.toString()}
                onIonChange={(e) => handleChange('capacity', e.detail.value)}
                type="number"
                style={styles.input}
              />
            </IonItem>
            <IonItem className="formGroup">
              <IonLabel position="floating">Localización</IonLabel>
              <IonInput
                value={formValues.location}
                onIonInput={(e) => handleChange('location', e.detail.value!)}
                type="text"
                style={styles.input}
              />
            </IonItem>
            <IonButton
              expand="full"
              onClick={onSubmit}
              disabled={isSubmitting}
              style={styles.submitButton}
            >
              Crear Evento
            </IonButton>
          </form>
          <IonAlert
            isOpen={showErrorAlert}
            onDidDismiss={() => setShowErrorAlert(false)}
            header="Error"
            message="Hubo un error al crear el evento. Por favor, inténtalo de nuevo."
            buttons={['OK']}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
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
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    marginBottom: '5px',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  textarea: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    minHeight: '100px',
  },
  error: {
    color: 'red',
    fontSize: '0.875rem',
    marginTop: '5px',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default CreateEventView;
