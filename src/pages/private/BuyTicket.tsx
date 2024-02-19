
import React, { useState, useContext, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonAlert,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
} from '@ionic/react';
import { loadStripe } from '@stripe/stripe-js';
import { getFirestore, doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { STRIPE_PUBLIC_KEY } from '../../stripe-config';
import StripeCheckout from '../../components/StripeCheckout';
import CreateTicket from '../private/CreateTicket';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../App';
import './BuyTicket.css';


const BuyTicket: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useContext(AppContext);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [capacityExceeded, setCapacityExceeded] = useState(false);
  const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const db = getFirestore();
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          const event = eventSnap.data();
          setEventName(event?.title || '');
          setEventDate(event?.date || null);
        } else {
          console.error('Evento no encontrado');
        }
      } catch (error) {
        console.error('Error al obtener datos del evento:', error);
      }
    };

    fetchEventData();
  }, [eventId]);

  const handlePaymentSuccess = async () => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const db = getFirestore();
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        throw new Error('Evento no encontrado');
      }

      const currentCapacity = eventSnap.data()?.capacity || 0;

    
      if (currentCapacity <= 0) {
        setCapacityExceeded(true);
        return;
      }

     
      await updateDoc(eventRef, {
        capacity: currentCapacity - 1,
      });

      const ticketsCollection = collection(db, 'tickets');
      const newTicketRef = await addDoc(ticketsCollection, {
        eventId: eventId,
        userId: user.uid,
      });

     
      setEventName('');
      setEventDate(null);

     
      const pdfContent = CreateTicket.generatePdfContent(eventName, eventDate);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      setDownloadUrl(downloadUrl);
    } catch (error) {
      console.error('Error al comprar el ticket:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Realizar Pago</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      <div className="ticket-container">  
        <IonInput
          placeholder="Nombre del evento"
          value={eventName}
          readonly={true}
        />

        <h1>Compra de Ticket para {eventName}</h1>

        <StripeCheckout onSuccess={handlePaymentSuccess} />

        {cardError && <div style={{ color: 'red' }}>{cardError}</div>}

        {downloadUrl && (
          <p>
            Descarga tu ticket en la aplicación:{' '}
            <a href={downloadUrl} download={`${eventName}_Ticket.pdf`}>
              Descargar Ticket
            </a>
          </p>
        )}

        <IonAlert
          isOpen={capacityExceeded}
          onDidDismiss={() => setCapacityExceeded(false)}
          header="Aforo Completo"
          message="Lo sentimos, la capacidad para este evento ha sido alcanzada."
          buttons={['OK']}
        />
      </div>  
      </IonContent>
    </IonPage>
  );
};

export default BuyTicket;
