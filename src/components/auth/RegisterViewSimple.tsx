import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonLabel,
  IonInput,
  IonButton,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonHeader,
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../../firebase';

const auth = getAuth();

const RegisterSimple: React.FC = () => {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    birthDate: '',
    role: 'client',
  });

  const [errorMessages, setErrorMessages] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    birthDate: '',
    role: '',
  });

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (field: keyof typeof formValues, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  };

  const creaUsuario = () => {
    console.log(formValues.password);
    console.log(auth);
    console.log(formValues.email);
    createUserWithEmailAndPassword(auth, formValues.email, formValues.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log(user);

        // Almacena datos adicionales en Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: formValues.email,
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          username: formValues.username,
          birthDate: formValues.birthDate,
          role: formValues.role,
          photoURL: 'https://firebasestorage.googleapis.com/v0/b/proyectoreact01-1b36b.appspot.com/o/login.png?alt=media&token=5c2169c8-6d01-4703-9911-390f542d0f51',
        });

        setRegistrationSuccess(true);

        setFormValues({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          username: '',
          birthDate: '',
          role: 'client',
        });

        setErrorMessages({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          username: '',
          birthDate: '',
          role: '',
        });

      })
      .catch((error) => {
        console.error('Error en registro: ', error);
        const errorCode = error.code;
        const errorMessage = error.message;

        switch (errorCode) {
          case 'auth/invalid-email':
            setErrorMessages((prevErrors) => ({ ...prevErrors, email: errorMessage }));
            break;
          case 'auth/weak-password':
            setErrorMessages((prevErrors) => ({ ...prevErrors, password: errorMessage }));
            break;
          default:
            break;
        }
      });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Registro</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1 className="ion-text-center ion-padding-top">
          ¡Regístrate para obtener acceso a la mejor app del mundo!
        </h1>
        {registrationSuccess && (
          <IonText color="success" className="ion-text-center ion-padding">
            ¡Registro exitoso! Bienvenido.
          </IonText>
        )}
        <form onSubmit={(e) => e.preventDefault()} className="ion-padding-top">
          <IonLabel>Email:</IonLabel>
          <IonInput
            type="email"
            value={formValues.email}
            onIonInput={(e) => handleChange('email', e.detail.value!)}
            required
          />
          {errorMessages.email && (
            <IonText color="danger" className="ion-text-sm">{errorMessages.email}</IonText>
          )}

          <IonLabel>Password:</IonLabel>
          <IonInput
            type="password"
            value={formValues.password}
            onIonInput={(e) => handleChange('password', e.detail.value!)}
            required
          />
          {errorMessages.password && (
            <IonText color="danger" className="ion-text-sm">{errorMessages.password}</IonText>
          )}

          <IonLabel>Confirm Password:</IonLabel>
          <IonInput
            type="password"
            value={formValues.confirmPassword}
            onIonInput={(e) => handleChange('confirmPassword', e.detail.value!)}
            required
          />
          {errorMessages.confirmPassword && (
            <IonText color="danger" className="ion-text-sm">{errorMessages.confirmPassword}</IonText>
          )}

          <IonLabel>First Name:</IonLabel>
          <IonInput
            type="text"
            value={formValues.firstName}
            onIonInput={(e) => handleChange('firstName', e.detail.value!)}
            required
          />
          {errorMessages.firstName && (
            <IonText color="danger" className="ion-text-sm">{errorMessages.firstName}</IonText>
          )}

          <IonLabel>Last Name:</IonLabel>
          <IonInput
            type="text"
            value={formValues.lastName}
            onIonInput={(e) => handleChange('lastName', e.detail.value!)}
            required
          />
          {errorMessages.lastName && (
            <IonText color="danger" className="ion-text-sm">{errorMessages.lastName}</IonText>
          )}

          <IonLabel>Username:</IonLabel>
          <IonInput
            type="text"
            value={formValues.username}
            onIonInput={(e) => handleChange('username', e.detail.value!)}
            required
          />
          {errorMessages.username && (
            <IonText color="danger" className="ion-text-sm">{errorMessages.username}</IonText>
          )}

          <IonLabel>Birth Date:</IonLabel>
          <IonInput
            type="date"
            value={formValues.birthDate}
            onIonInput={(e) => handleChange('birthDate', e.detail.value!)}
            required
          />
          {errorMessages.birthDate && (
            <IonText color="danger" className="ion-text-sm">{errorMessages.birthDate}</IonText>
          )}

          <IonLabel>Role:</IonLabel>
          <IonSelect
            value={formValues.role}
            placeholder="Select Role"
            onIonChange={(e) => handleChange('role', e.detail.value!)}
          >
            <IonSelectOption value="organizer">Organizer</IonSelectOption>
            <IonSelectOption value="client">Client</IonSelectOption>
          </IonSelect>
          {errorMessages.role && (
            <IonText color="danger" className="ion-text-sm">{errorMessages.role}</IonText>
          )}

          <IonButton expand="full" onClick={creaUsuario} className="ion-margin-top">
            Register
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default RegisterSimple;
