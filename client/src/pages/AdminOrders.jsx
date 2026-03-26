import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Users.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminOrders() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    obtenerPedidos();

    const interval = setInterval(() => {
      obtenerPedidos();
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

  const textoTipoPedido = (pedido) => {
    if (pedido.tipoPedido === 'llevar') return 'Para llevar';
    return `Mesa ${pedido.mesa}`;
  };

  const totalPedidos = pedidos.length;
  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
  const enPreparacion = pedidos.filter((p) => p.estado === 'en preparacion').length;
  const entregados = pedidos.filter((p) => p.estado === 'entregado').length;
  const urgentes = pedidos.filter((p) => esPedidoUrgente(p)).length;
  const paraLlevar = pedidos.filter((p) => p.tipoPedido === 'llevar').length;
  const enMesa = pedidos.filter((p) => p.tipoPedido === 'mesa').length;

  return (
    <div className="users-container">
      <div className="users-card">
        <div className="users-header">
          <h2>Supervisión de Pedidos</h2>
          <Link to="/" className="btn-volver">Volver</Link>
        </div>

        <div className="mesas-grid" style={{ marginBottom: '25px' }}>
          <div className="mesa-card mesa-libre">
            <h4>Total de pedidos</h4>
            <p>{totalPedidos}</p>
          </div>

          <div className="mesa-card mesa-pendiente-admin">
            <h4>Pendientes</h4>
            <p>{pendientes}</p>
          </div>

          <div className="mesa-card mesa-reservada">
            <h4>En preparación</h4>
            <p>{enPreparacion}</p>
          </div>

          <div className="mesa-card mesa-disponible">
            <h4>Entregados</h4>
            <p>{entregados}</p>
          </div>

          <div className="mesa-card mesa-urgente-admin">
            <h4>Urgentes</h4>
            <p>{urgentes}</p>
          </div>

          <div className="mesa-card mesa-libre">
            <h4>En mesa</h4>
            <p>{enMesa}</p>
          </div>

          <div className="mesa-card mesa-reservada">
            <h4>Para llevar</h4>
            <p>{paraLlevar}</p>
          </div>
        </div>

        <div className="tabla-usuarios">
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
                      <span className={`badge-${pedido.estado}`}>
                        {textoEstadoPedido(pedido.estado)}
                      </span>
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

export default AdminOrders;