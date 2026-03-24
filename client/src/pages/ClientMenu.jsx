import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import './Menu.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

function ClientMenu() {
  const [menu, setMenu] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [cart, setCart] = useState([]);
  const [mesa, setMesa] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [mostrarPago, setMostrarPago] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);

  const customerEmail = localStorage.getItem('userEmail') || '';
  const customerName = localStorage.getItem('userName') || 'Cliente';

  const stripePromise = useMemo(() => loadStripe(STRIPE_PUBLIC_KEY), []);

  useEffect(() => {
    obtenerMenu();
    obtenerMesas();
  }, []);

  const obtenerMenu = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu`);
      setMenu(res.data);
    } catch (error) {
      toast.error('Error al cargar el menú');
    }
  };

  const obtenerMesas = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tables`);
      const mesasDisponibles = res.data.filter(
        (mesaItem) => mesaItem.estado === 'disponible'
      );
      setMesas(mesasDisponibles);
    } catch (error) {
      toast.error('Error al cargar las mesas');
    }
  };

  const agregarAlCarrito = (item) => {
    const existe = cart.find((p) => p._id === item._id);

    if (item.stock <= 0) {
      toast.warning(`${item.nombre} está agotado`);
      return;
    }

    if (existe) {
      if (existe.qty >= item.stock) {
        toast.warning(`Solo hay ${item.stock} unidades disponibles de ${item.nombre}`);
        return;
      }

      const nuevoCarrito = cart.map((p) =>
        p._id === item._id ? { ...p, qty: p.qty + 1 } : p
      );
      setCart(nuevoCarrito);
    } else {
      setCart([
        ...cart,
        {
          _id: item._id,
          name: item.nombre,
          price: item.precio,
          qty: 1
        }
      ]);
    }

    toast.success(`${item.nombre} agregado`);
  };

  const quitarDelCarrito = (_id) => {
    const producto = cart.find((p) => p._id === _id);

    if (!producto) return;

    if (producto.qty > 1) {
      const nuevoCarrito = cart.map((p) =>
        p._id === _id ? { ...p, qty: p.qty - 1 } : p
      );
      setCart(nuevoCarrito);
    } else {
      const nuevoCarrito = cart.filter((p) => p._id !== _id);
      setCart(nuevoCarrito);
    }
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const iniciarPago = async () => {
    if (!mesa) {
      toast.warning('Debes seleccionar una mesa');
      return;
    }

    if (cart.length === 0) {
      toast.warning('Tu carrito está vacío');
      return;
    }

    if (!STRIPE_PUBLIC_KEY) {
      toast.error('Falta configurar la clave pública de Stripe');
      return;
    }

    try {
      setCargandoPago(true);

      const res = await axios.post(`${API_URL}/api/payments/create-payment-intent`, {
        amount: total
      });

      setClientSecret(res.data.clientSecret);
      setMostrarPago(true);
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al iniciar el pago';
      toast.error(mensaje);
    } finally {
      setCargandoPago(false);
    }
  };

  const cancelarPago = () => {
    setMostrarPago(false);
    setClientSecret('');
  };

  const handlePagoExitoso = () => {
    setCart([]);
    setMesa('');
    setClientSecret('');
    setMostrarPago(false);
    obtenerMenu();
    obtenerMesas();
  };

  return (
    <div className="menu-container">
      <div className="menu">
        <div className="menu-header">
          <div>
            <h2>Menú del Cliente</h2>
            <p className="usuario-logueado">Cliente: {customerName}</p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <select
            value={mesa}
            onChange={(e) => setMesa(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              width: '240px',
              fontSize: '16px'
            }}
          >
            <option value="">Selecciona una mesa</option>
            {mesas.map((mesaItem) => (
              <option key={mesaItem._id} value={mesaItem.numero}>
                Mesa {mesaItem.numero}
              </option>
            ))}
          </select>
        </div>

        {menu.length === 0 ? (
          <p className="sin-platillos">No hay platillos registrados.</p>
        ) : (
          <div className="menu-grid">
            {menu.map((item) => (
              <div key={item._id} className="card">
                {item.imagen ? (
                  <img
                    src={`${API_URL}${item.imagen}`}
                    alt={item.nombre}
                    className="card-img"
                  />
                ) : (
                  <div className="card-placeholder">Sin imagen</div>
                )}

                <div className="card-body">
                  <h3>{item.nombre}</h3>
                  <p><strong>Precio:</strong> ${item.precio}</p>
                  <p><strong>Stock:</strong> {item.stock}</p>

                  <div className="card-actions">
                    {item.stock > 0 ? (
                      <button
                        className="btn-agregar"
                        onClick={() => agregarAlCarrito(item)}
                      >
                        Agregar
                      </button>
                    ) : (
                      <button className="btn-agotado" disabled>
                        Agotado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: '30px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '18px',
            padding: '20px'
          }}
        >
          <h3 style={{ marginTop: 0 }}>Tu pedido</h3>

          {cart.length === 0 ? (
            <p>No has agregado productos aún.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #ddd'
                  }}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <p style={{ margin: '4px 0' }}>
                      Cantidad: {item.qty} | Subtotal: ${item.price * item.qty}
                    </p>
                  </div>

                  <button
                    className="btn-eliminar"
                    onClick={() => quitarDelCarrito(item._id)}
                  >
                    Quitar
                  </button>
                </div>
              ))}

              <h3>Total: ${total}</h3>

              {!mostrarPago ? (
                <button
                  className="btn-agregar"
                  onClick={iniciarPago}
                  disabled={cargandoPago}
                >
                  {cargandoPago ? 'Preparando pago...' : 'Proceder al pago'}
                </button>
              ) : (
                <>
                  <div style={{ marginTop: '16px' }}>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm
                        clientSecret={clientSecret}
                        total={total}
                        cart={cart}
                        mesa={mesa}
                        customerEmail={customerEmail}
                        customerName={customerName}
                        API_URL={API_URL}
                        onSuccess={handlePagoExitoso}
                      />
                    </Elements>
                  </div>

                  <button
                    className="btn-eliminar"
                    onClick={cancelarPago}
                    style={{ marginTop: '12px' }}
                  >
                    Cancelar pago
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClientMenu;