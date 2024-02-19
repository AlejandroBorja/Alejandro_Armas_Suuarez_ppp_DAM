import React, { useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Home from './pages/public/Home';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import RegisterViewSimple from './components/auth/RegisterViewSimple';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import CreateEventView from './events/CreateEventView';
import LoginView from './components/auth/LoginView';
import { createContext } from 'react';
import OrganizerView from './pages/private/OrganizerView';
import UserView from './pages/private/UserView';
import EventDetailsView from './events/EventDetailsView';
import ProfileView from './profile/ProfileView';
import MyEventsView from './events/MyEventsView2';
import EditEventView from './events/EditEventView';
import MyEventAssist from './events/MyEventAssits';
import BuyTicket from './pages/private/BuyTicket';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { firebaseConfig } from './firebase';

setupIonicReact();

const app = initializeApp(firebaseConfig);
const db = getFirestore();
export const AppContext = createContext<any>(null);
const STRIPE_PUBLIC_KEY = 'pk_test_51OgYA5KEX8FoGLtBH8Ts1XbRGBQ1MhpV7YznMjVSzJUKPNZdzIhEAu1uPKXcl4WwOofIKJBS61eSs8eX6ZbSnzVN008t1TBG8m';
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  return (
    <IonApp>
      <IonReactRouter>
        <AppContext.Provider value={{ user, setUser }}>
          <IonRouterOutlet>
            <Route exact path="/home" component={Home}/>
            <Route exact path="/Register" component={RegisterViewSimple}/>
            <Route exact path="/CreateEvent" component={CreateEventView}/>
            <Route exact path="/Login" component={LoginView}/>
            <Route exact path="/OrganizerView" component={OrganizerView}/>
            <Route exact path="/ClientView" component={UserView}/>
            <Route exact path="/Profile" component={ProfileView}/>
            <Route exact path="/MyEvents" component={MyEventsView}/>
            <Route exact path="/EditEvent/:eventId" component={EditEventView}/>
            <Route path="/events/:eventId/" component={EventDetailsView} />
            <Route path="/EventsAssits" component={MyEventAssist} />
            <Route path="/CreateEvent" component={CreateEventView} />
            <Route path="/BuyTicket/:eventId" component={StripeWrapper} />
            <Redirect exact path="/" to="/home" />
          </IonRouterOutlet>
        </AppContext.Provider>
      </IonReactRouter>
    </IonApp>
  );
};

const StripeWrapper: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <BuyTicket />
    </Elements>
  );
};

export default App;
