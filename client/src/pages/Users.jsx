import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './Users.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    rol: 'mesero'
  });

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsuarios(res.data);
    } catch (error) {
      toast.error('Error al obtener usuarios');
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.rol) {
      toast.warning('Todos los campos son obligatorios');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/users`, form);
      toast.success('Usuario creado correctamente');

      setForm({
        nombre: '',
        email: '',
        rol: 'mesero'
      });

      obtenerUsuarios();
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al crear usuario';
      toast.error(mensaje);
    }
  };

  const handleRoleChange = async (id, nuevoRol) => {
    try {
      await axios.put(`${API_URL}/api/users/${id}`, {
        rol: nuevoRol
      });

      toast.success('Rol actualizado correctamente');
      obtenerUsuarios();
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al actualizar rol';
      toast.error(mensaje);
    }
  };

  return (
    <div className="users-container">
      <div className="users-card">
        <div className="users-header">
          <h2>Gestión de Usuarios</h2>
          <Link to="/" className="btn-volver">Volver</Link>
        </div>

        <form className="users-form" onSubmit={handleCreateUser}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleChange}
          />

          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
          >
            <option value="mesero">Mesero</option>
            <option value="admin">Administrador</option>
          </select>

          <button type="submit" className="btn-guardar-usuario">
            Agregar Usuario
          </button>
        </form>

        <div className="tabla-usuarios">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="3">No hay usuarios registrados.</td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario._id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <select
                        value={usuario.rol}
                        onChange={(e) =>
                          handleRoleChange(usuario._id, e.target.value)
                        }
                      >
                        <option value="mesero">Mesero</option>
                        <option value="admin">Administrador</option>
                      </select>
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

export default Users;