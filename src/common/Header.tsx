
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonPopover, IonList, IonItem, IonIcon } from '@ionic/react';
import { menu } from 'ionicons/icons';

const Header: React.FC = () => {
  const [showPopover, setShowPopover] = useState<{ open: boolean; event: Event | undefined }>({
    open: false,
    event: undefined,
  });

  const [showLinks, setShowLinks] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      setShowLinks(windowWidth >= 768); 
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); 

  return (
    <IonHeader>
      <IonToolbar color="primary">
        <IonButtons slot="start" className={`ion-hide-lg-up ${showLinks ? 'ion-hide' : ''}`}>
          <IonButton onClick={(e) => setShowPopover({ open: true, event: e.nativeEvent })}>
            <IonIcon icon={menu} />
          </IonButton>
          <IonPopover
            isOpen={showPopover.open}
            event={showPopover.event}
            onDidDismiss={() => setShowPopover({ open: false, event: undefined })}
          >
            <IonList>
              <IonItem onClick={() => setShowPopover({ open: false, event: undefined })}>
                <Link to="/Profile" style={styles.menuLink}>
                  Perfil
                </Link>
              </IonItem>
              <IonItem onClick={() => setShowPopover({ open: false, event: undefined })}>
                <Link to="/login" style={styles.menuLink}>
                  Login
                </Link>
              </IonItem>
              <IonItem onClick={() => setShowPopover({ open: false, event: undefined })}>
                <Link to="/register" style={styles.menuLink}>
                  Registro
                </Link>
              </IonItem>
            </IonList>
          </IonPopover>
        </IonButtons>
        <IonTitle>
          <Link to="/" style={styles.logo}>
            EventosApp
          </Link>
        </IonTitle>
        <IonButtons slot="end" className={`ion-hide-md-down ${showPopover.open ? 'ion-hide' : ''}`}>
          <Link to="/events" style={styles.navLink}>
            Eventos
          </Link>
          <Link to="/profile" style={styles.navLink}>
            Perfil
          </Link>
          <Link to="/Login" style={styles.navLink}>
            Login
          </Link>
          <Link to="/Register" style={styles.navLink}>
            Registro
          </Link>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

const styles = {
  logo: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.5rem',
  },
  menuLink: {
    color: 'black',
    textDecoration: 'none',
    padding: '10px',
    display: 'block',
  },
  navLink: {
    textDecoration: 'none',
    color: '#fff',
    margin: '0 15px',
  },
};

export default Header;
