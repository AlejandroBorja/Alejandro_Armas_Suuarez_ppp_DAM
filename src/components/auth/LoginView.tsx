import React, { useContext, useState, useEffect } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonLabel, IonItem, IonHeader, IonButtons, IonToolbar, IonBackButton } from '@ionic/react';
import { getAuth, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import { AppContext } from '../../App';
import { useHistory } from 'react-router';

const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user,setUser } = useContext(AppContext);
  const history = useHistory();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const auth = getAuth();
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      if (loggedInUser) {
        setUser(loggedInUser);
        await checkUserRole(loggedInUser.uid);
        onLoginSuccess();
      } else {
        console.error('Usuario no encontrado después de iniciar sesión');
      }
    } catch (error: any) {
      console.error('Error en el inicio de sesión:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Credenciales inválidas. Inténtalo de nuevo.');
      } else {
        setError('Error en el inicio de sesión. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkUserRole = async (userId: string) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', userId);

    try {
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userRole = userData?.role;

       
        if (userRole === 'organizer') {
          history.push('/OrganizerView');
        } else if (userRole === 'client') {
          history.push('/ClientView');
        } else {
          
          console.error('Rol de usuario desconocido:', userRole);
        }
      } else {
        console.error('Documento de usuario no encontrado en Firestore');
      }
    } catch (error) {
      console.error('Error al consultar el rol del usuario en Firestore:', error);
    }
  };

  const onLoginSuccess = () => {
     
  console.log('Usuario logueado:', user);
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
      <IonContent className="ion-padding">
        <div style={styles.container}>
          <h2 style={styles.heading}>Iniciar Sesión</h2>
          <form onSubmit={onSubmit} style={styles.form}>
            <IonItem className="formGroup">
              <IonLabel position="floating">Correo Electrónico</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                style={styles.input}
              />
            </IonItem>
            <IonItem className="formGroup">
              <IonLabel position="floating">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                style={styles.input}
              />
              {error && <p style={styles.error}>{error}</p>}
            </IonItem>
            <IonButton expand="full" type="submit" disabled={isSubmitting} style={styles.submitButton}>
              Iniciar Sesión
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
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
  error: {
    color: 'red',
    fontSize: '0.875rem',
    marginTop: '5px',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    color: '#fff',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
};

export default LoginView;
