import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

function CheckoutForm({
  clientSecret,
  total,
  cart,
  mesa,
  customerEmail,
  customerName,
  API_URL,
  onSuccess
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);

    if (!card) {
      toast.error('No se pudo cargar la tarjeta');
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: customerName,
          email: customerEmail
        }
      }
    });

    if (result.error) {
      toast.error(result.error.message || 'Error al procesar el pago');
      return;
    }

    if (result.paymentIntent.status === 'succeeded') {
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerEmail,
            customerName,
            mesa: Number(mesa),
            items: cart,
            total
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensaje || 'No se pudo crear el pedido');
        }

        toast.success('Pago realizado y pedido creado correctamente');
        onSuccess();
      } catch (error) {
        toast.error(error.message || 'El pago se realizó, pero falló la creación del pedido');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <div
        style={{
          padding: '14px',
          border: '1px solid #ccc',
          borderRadius: '10px',
          background: 'white',
          marginBottom: '15px'
        }}
      >
        <CardElement />
      </div>

      <button className="btn-agregar" type="submit" disabled={!stripe}>
        Pagar ${total}
      </button>
    </form>
  );
}

export default CheckoutForm;