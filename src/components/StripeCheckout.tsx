
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import './StripeCheckout.css'; 

interface StripeCheckoutProps {
  onSuccess: () => Promise<void>;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setCardError(error.message || 'Error al procesar el pago');
    } else {
      setCardError(null);
      if (onSuccess) {
        await onSuccess();
      }
    }
  };

  useEffect(() => {
  }, []);

  return (
    <div className="stripe-checkout-container">
      <CardElement className="card-element" />
      {cardError && <div className="error-message">{cardError}</div>}
      <button className="pay-button" onClick={handlePayment}>
        Pagar con Stripe
      </button>
    </div>
  );
};

export default StripeCheckout;
