
import React, { useContext, useState, useEffect } from 'react';
import { IonContent, IonLabel, IonInput, IonButton, IonPage, IonToolbar, IonButtons, IonBackButton, IonTitle, IonHeader, IonAlert, IonItem } from '@ionic/react';
import { getAuth, signOut, deleteUser, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { Link, useHistory } from 'react-router-dom';
import { AppContext } from '../App';

const auth = getAuth();

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

const ProfileView: React.FC = () => {
  const { user, setUser } = useContext(AppContext);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formValues, setFormValues] = useState<UserProfile | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setUserProfile(userData);
            setFormValues({ ...userData });
          } else {
            console.error('Datos de usuario no encontrados.');
          }
        } catch (error) {
          console.error('Error al obtener datos de usuario:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user, setUser]);

  const toggleEditMode = () => {
    setIsEditMode((prevMode) => !prevMode);
  };

  const onDeleteUser = async () => {
    try {
      await deleteUser(auth.currentUser!);
      setUser(null);
      history.push('/login');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  };

  const onLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      history.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const onSaveChanges = async () => {
    try {
      console.log('Formulario antes de guardar cambios:', formValues);

      await setDoc(doc(db, 'users', user?.uid), formValues!, { merge: true });

      await updateProfile(auth.currentUser!, { displayName: formValues?.username });

      if (imageFile) {
        const storageReference = storageRef(getStorage(), `${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageReference, imageFile);
        const newPhotoURL = await getDownloadURL(storageReference);

        await setDoc(doc(db, 'users', user?.uid), { photoURL: newPhotoURL }, { merge: true });

        setFormValues((prevValues) => ({
          ...prevValues!,
          photoURL: newPhotoURL,
        }));

        setUserProfile((prevProfile) => ({
          ...prevProfile!,
          photoURL: newPhotoURL,
        }));
      }
      toggleEditMode();

      
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    }
  };

  
useEffect(() => {
  
  setUserProfile((prevProfile) => ({
    ...prevProfile!,
    ...formValues,
  }));
}, [formValues]); 
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
        <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
         
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={styles.container}>
          {user ? (
            <div>
              <h2 style={styles.heading}>Mi Perfil</h2>
              {userProfile ? (
                <div>
                  {isEditMode ? (
                    <form style={styles.form}>
                      <IonItem className="formGroup">
                        <IonLabel position="floating" style={styles.labelForm}>Nombre de Usuario</IonLabel>
                        <IonInput
                          value={formValues?.username}
                          placeholder="Nombre de Usuario"
                          onIonInput={(e) => setFormValues({ ...formValues!, username: e.detail.value! })}
                          style={styles.input}
                        />
                      </IonItem>
                      <IonItem className="formGroup">
                        <IonLabel position="floating" style={styles.labelForm}>Email</IonLabel>
                        <IonInput
                          value={formValues?.email}
                          placeholder="Email"
                          onIonInput={(e) => setFormValues({ ...formValues!, email: e.detail.value! })}
                          style={styles.input}
                          disabled={true} 
                        />
                      </IonItem>
                      <IonItem className="formGroup">
                        <IonLabel position="floating" style={styles.labelForm}>Nombre</IonLabel>
                        <IonInput
                          value={formValues?.firstName}
                          placeholder="Nombre"
                          onIonInput={(e) => setFormValues({ ...formValues!, firstName: e.detail.value! })}
                          style={styles.input}
                        />
                      </IonItem>
                      <IonItem className="formGroup">
                        <IonLabel position="floating" style={styles.labelForm}>Apellido</IonLabel>
                        <IonInput
                          value={formValues?.lastName}
                          placeholder="Apellido"
                          onIonInput={(e) => setFormValues({ ...formValues!, lastName: e.detail.value! })}
                          style={styles.input}
                        />
                      </IonItem>
                      <IonItem className="formGroup">
                        <IonLabel position="floating" style={styles.labelForm}>Fecha de Nacimiento</IonLabel>
                        <IonInput
                          value={formValues?.birthDate}
                          placeholder="Fecha de Nacimiento"
                          onIonInput={(e) => setFormValues({ ...formValues!, birthDate: e.detail.value! })}
                          style={styles.input}
                        />
                      </IonItem>
                      <IonItem className="formGroup">
                        <IonLabel position="floating" style={styles.labelForm}>Rol</IonLabel>
                        <IonInput
                          value={formValues?.role}
                          placeholder="Rol"
                          onIonInput={(e) => setFormValues({ ...formValues!, role: e.detail.value! })}
                          style={styles.input}
                        />
                      </IonItem>
                      <IonItem className="formGroup">
                        <IonLabel position="floating">Foto de Perfil</IonLabel>
                        {userProfile.photoURL && (
                          <img
                            src={userProfile.photoURL}
                            alt="Foto de Perfil"
                            style={styles.profileImage}
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            console.log('Archivo seleccionado:', e.target.files?.[0]);
                            setImageFile(e.target.files?.[0] || null);
                          }}
                          style={{ marginTop: '10px' }}
                        />
                      </IonItem>
                      
                      <IonButton onClick={onSaveChanges} style={styles.submitButton}>
                        Guardar Cambios
                      </IonButton>
                    </form>
                  ) : (
                    <div>
                      <IonLabel style={styles.label}>Nombre de Usuario: {userProfile.username}</IonLabel>
                      <IonLabel style={styles.label}>Email: {userProfile.email}</IonLabel>
                      <IonLabel style={styles.label}>Nombre: {userProfile.firstName}</IonLabel>
                      <IonLabel style={styles.label}>Apellido: {userProfile.lastName}</IonLabel>
                      <IonLabel style={styles.label}>Fecha de Nacimiento: {userProfile.birthDate}</IonLabel>
                      <IonLabel style={styles.label}>Rol: {userProfile.role}</IonLabel>
                      <IonLabel style={styles.label}>Foto de Perfil</IonLabel>
                      {userProfile.photoURL && (
                        <img
                          src={userProfile.photoURL}
                          alt="Foto de Perfil"
                          style={styles.profileImage}
                        />
                      )}
                      
                      <IonButton onClick={toggleEditMode} style={styles.editButton}>
                        Editar Perfil
                      </IonButton>
                      <IonButton onClick={() => setDeleteAlertOpen(true)} style={styles.deleteButton}>
                        Eliminar Usuario
                      </IonButton>
                      <IonButton onClick={onLogout} style={styles.logoutButton}>
                        Cerrar Sesión
                      </IonButton>
                    </div>
                  )}
                </div>
              ) : (
                <p style={styles.noProfile}>Perfil no encontrado.</p>
              )}
            </div>
          ) : (
            <p style={styles.notLoggedIn}>
              Debes <Link to="/login">iniciar sesión</Link> para ver tu perfil.
            </p>
          )}
        </div>

        <IonAlert
          isOpen={deleteAlertOpen}
          onDidDismiss={() => setDeleteAlertOpen(false)}
          header={'Eliminar Usuario'}
          message={'¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => setDeleteAlertOpen(false),
            },
            {
              text: 'Eliminar',
              handler: () => onDeleteUser(),
            },
          ]}
        />
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
  label: {
    marginBottom: '5px',
    fontSize: '1rem',
    display: 'block',
  },
  labelForm: {
    marginBottom: '10px',
    
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    marginBottom: '15px',
  },
  profileImage: {
    width: '100%',
    height: 'auto',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    color: '#fff',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '20px',
  },
  editButton: {
    backgroundColor: '#4caf50',
    color: '#fff',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '20px',
  },
  deleteButton: {
    backgroundColor: '#FF5722',
    color: '#fff',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '20px',
  },
  logoutButton: {
    backgroundColor: '#FF9800',
    color: '#fff',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '20px',
  },
  noProfile: {
    fontSize: '1rem',
    textAlign: 'center' as const,
    color: '#666',
  },
  notLoggedIn: {
    fontSize: '1rem',
    textAlign: 'center' as const,
    color: '#666',
  },
};

export default ProfileView;
