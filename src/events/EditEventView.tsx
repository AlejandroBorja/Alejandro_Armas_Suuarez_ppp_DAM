
import React, { useContext, useEffect, useState } from 'react';
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
import { useHistory, useParams } from 'react-router-dom';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { AppContext } from '../App';

interface EditEventFormValues {
  title: string;
  date: string;
  description: string;
  tags: string;
  photo: string;
  photoFile?: File;
  capacity: number;
  location: string;
}

const EditEventView: React.FC = () => {
  const { user } = useContext(AppContext);
  const { eventId } = useParams<{ eventId: string }>();
  const [formValues, setFormValues] = useState<EditEventFormValues>({
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

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventDocRef = doc(getFirestore(), 'events', eventId);
        const eventSnapshot = await getDoc(eventDocRef);

        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data() as EditEventFormValues;
          setFormValues({
            title: eventData.title,
            date: eventData.date,
            description: eventData.description,
            tags: Array.isArray(eventData.tags) ? eventData.tags.join(', ') : '',
            photo: eventData.photo,
            photoFile: undefined,
            capacity: eventData.capacity || 0,
            location: eventData.location || '',
          });
        }
      } catch (error) {
        console.error('Error al obtener detalles del evento:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleChange = (
    key: keyof EditEventFormValues,
    value: string | string[] | null | undefined
  ) => {
    const sanitizedValue = Array.isArray(value) ? value[0] : value;
    setFormValues((prevValues) => ({
      ...prevValues,
      [key]: sanitizedValue || '',
    }));
  };

  const handleChangeFile = (
    key: keyof EditEventFormValues,
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

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (user) {
        const tagsArray = formValues.tags.split(',').map((tag) => tag.trim());

        if (formValues.photoFile) {
          const storageReference = storageRef(
            getStorage(),
            `${Date.now()}_${formValues.photoFile.name}`
          );

          await uploadBytes(storageReference, formValues.photoFile);

          const photoURL = await getDownloadURL(storageReference);

          await updateDoc(doc(getFirestore(), 'events', eventId), {
            title: formValues.title,
            date: formValues.date,
            description: formValues.description,
            tags: tagsArray,
            photo: photoURL,
            capacity: formValues.capacity,
            location: formValues.location,
          });
        } else {
          await updateDoc(doc(getFirestore(), 'events', eventId), {
            title: formValues.title,
            date: formValues.date,
            description: formValues.description,
            tags: tagsArray,
            capacity: formValues.capacity,
            location: formValues.location,
          });
        }

        console.log('Evento actualizado exitosamente');

        history.push('/OrganizerView');
      }
    } catch (error) {
      console.error('Error al actualizar el evento:', error);

      setErrors({
        title: 'Error al actualizar el evento. Inténtalo de nuevo.',
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
          <h2 style={styles.heading}>Editar Evento</h2>
          <form style={styles.form}>
            <IonItem className="formGroup">
              <IonLabel position="floating">Título</IonLabel>
              <IonInput
                value={formValues.title}
                onIonInput={(e) => handleChange('title', e.detail.value!)}
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
                onIonInput={(e) => handleChange('description', e.detail.value!)}
                style={styles.textarea}
              ></IonTextarea>
            </IonItem>
            <IonItem className="formGroup">
              <IonLabel position="floating">
                Etiquetas (Separadas por comas)
              </IonLabel>
              <IonInput
                value={formValues.tags}
                onIonInput={(e) => handleChange('tags', e.detail.value!)}
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
              <IonLabel position="floating">Capacidad</IonLabel>
              <IonInput
                value={formValues.capacity.toString()}
                onIonInput={(e) => handleChange('capacity', e.detail.value)}
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
              Actualizar Evento
            </IonButton>
          </form>
          <IonAlert
            isOpen={showErrorAlert}
            onDidDismiss={() => setShowErrorAlert(false)}
            header="Error"
            message="Hubo un error al actualizar el evento. Por favor, inténtalo de nuevo."
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

export default EditEventView;
