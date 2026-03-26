import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Users.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function WaiterOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [mesas, setMesas] = useState([]);

  useEffect(() => {
    obtenerPedidos();
    obtenerMesas();

    const interval = setInterval(() => {
      obtenerPedidos();
      obtenerMesas();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const obtenerPedidos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders`);
      setPedidos(res.data);
    } catch (error) {
      toast.error('Error al obtener pedidos');
    }
  };

  const obtenerMesas = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tables`);
      setMesas(res.data);
    } catch (error) {
      toast.error('Error al obtener mesas');
    }
  };

  const cambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/estado`, {
        estado: nuevoEstado
      });

      toast.success('Estado del pedido actualizado');
      obtenerPedidos();
      obtenerMesas();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al actualizar estado del pedido';
      toast.error(mensaje);
    }
  };

  const cambiarEstadoMesa = async (id, nuevoEstado) => {
    try {
      await axios.put(`${API_URL}/api/tables/${id}`, {
        estado: nuevoEstado
      });

      toast.success('Estado de la mesa actualizado');
      obtenerMesas();
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje || 'Error al actualizar estado de la mesa';
      toast.error(mensaje);
    }
  };

  const textoEstadoPedido = (estado) => {
    if (estado === 'pendiente') return 'Pendiente';
    if (estado === 'en preparacion') return 'En preparación';
    return 'Entregado';
  };

  const formatearHora = (fecha) => {
    if (!fecha) return '-';

    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tiempoTranscurrido = (fechaInicio, fechaEntrega, estado) => {
    if (!fechaInicio) return '-';

    const inicio = new Date(fechaInicio).getTime();
    const fin =
      estado === 'entregado' && fechaEntrega
        ? new Date(fechaEntrega).getTime()
        : Date.now();

    const diferenciaMs = fin - inicio;
    const minutos = Math.floor(diferenciaMs / 60000);

    if (minutos < 1) return 'Menos de 1 min';
    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    const minsRestantes = minutos % 60;

    return `${horas}h ${minsRestantes}min`;
  };

  const esPedidoUrgente = (pedido) => {
    if (pedido.estado === 'entregado') return false;

    const inicio = new Date(pedido.createdAt).getTime();
    const ahora = Date.now();
    const minutos = Math.floor((ahora - inicio) / 60000);

    return minutos >= 15;
  };

  const claseMesa = (estado) => {
    if (estado === 'disponible') return 'mesa-disponible';
    if (estado === 'reservada') return 'mesa-reservada';
    if (estado === 'ocupada') return 'mesa-ocupada';
    return '';
  };

  const textoTipoPedido = (pedido) => {
    if (pedido.tipoPedido === 'llevar') return 'Para llevar';
    return `Mesa ${pedido.mesa}`;
  };

  return (
    <div className="users-container">
      <div className="users-card">
        <div className="users-header">
          <h2>Panel del Mesero</h2>
        </div>

        <div className="mesas-section">
          <h3>Estado de Mesas</h3>

          {mesas.length === 0 ? (
            <p>No hay mesas registradas.</p>
          ) : (
            <div className="mesas-grid">
              {mesas.map((mesa) => (
                <div key={mesa._id} className={`mesa-card ${claseMesa(mesa.estado)}`}>
                  <h4>Mesa {mesa.numero}</h4>

                  <p>
                    <strong>Estado:</strong> {mesa.estado}
                  </p>

                  <select
                    value={mesa.estado}
                    onChange={(e) => cambiarEstadoMesa(mesa._id, e.target.value)}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="reservada">Reservada</option>
                    <option value="ocupada">Ocupada</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tabla-usuarios" style={{ marginTop: '30px' }}>
          <h3>Pedidos</h3>

          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Hora</th>
                <th>Espera</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Alerta</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan="8">No hay pedidos registrados.</td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr
                    key={pedido._id}
                    className={`${`estado-${pedido.estado}`} ${esPedidoUrgente(pedido) ? 'pedido-urgente' : ''}`}
                  >
                    <td>{textoTipoPedido(pedido)}</td>

                    <td>
                      {pedido.customerName || pedido.clienteNombre}
                      <br />
                      <small>
                        {pedido.customerEmail || pedido.clienteEmail}
                      </small>
                    </td>

                    <td>
                      {(pedido.items || pedido.productos || []).map((item, index) => (
                        <div key={index}>
                          {item.name || item.nombre} x{item.qty || item.cantidad}
                        </div>
                      ))}
                    </td>

                    <td>{formatearHora(pedido.createdAt)}</td>

                    <td>
                      {tiempoTranscurrido(
                        pedido.createdAt,
                        pedido.deliveredAt,
                        pedido.estado
                      )}
                    </td>

                    <td>${pedido.total}</td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span className={`badge-${pedido.estado}`}>
                          {textoEstadoPedido(pedido.estado)}
                        </span>

                        <select
                          value={pedido.estado}
                          onChange={(e) => cambiarEstadoPedido(pedido._id, e.target.value)}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en preparacion">En preparación</option>
                          <option value="entregado">Entregado</option>
                        </select>
                      </div>
                    </td>

                    <td>
                      {esPedidoUrgente(pedido) ? (
                        <span className="badge-urgente">Urgente</span>
                      ) : (
                        <span className="badge-normal">Normal</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WaiterOrders;