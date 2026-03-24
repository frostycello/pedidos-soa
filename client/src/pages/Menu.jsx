import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import './Menu.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Menu() {
    const [menu, setMenu] = useState([]);
    const [modalEliminar, setModalEliminar] = useState({
        visible: false,
        id: null,
        nombre: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        obtenerMenu();
    }, []);

    const obtenerMenu = () => {
        axios
            .get(`${API_URL}/api/menu`)
            .then((res) => setMenu(res.data))
            .catch((err) => console.log(err));
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Sesión cerrada correctamente');
            navigate('/login');
        } catch (error) {
            toast.error('Error al cerrar sesión');
        }
    };

    const abrirModalEliminar = (id, nombre) => {
        setModalEliminar({
            visible: true,
            id,
            nombre
        });
    };

    const cerrarModalEliminar = () => {
        setModalEliminar({
            visible: false,
            id: null,
            nombre: ''
        });
    };

    const confirmarEliminacion = async () => {
        try {
            await axios.delete(`${API_URL}/api/menu/${modalEliminar.id}`);
            toast.success('Platillo eliminado correctamente');
            obtenerMenu();
        } catch (error) {
            const mensaje =
                error.response?.data?.mensaje || 'Error al eliminar el platillo';
            toast.error(mensaje);
        } finally {
            cerrarModalEliminar();
        }
    };

    return (
        <div className="menu-container">
            <div className="menu">
                <div className="menu-header">
                    <div>
                        <h2>Menú de Platillos</h2>
                        <p className="usuario-logueado">
                            Usuario: {auth.currentUser?.email}
                        </p>
                    </div>

                    <div className="menu-header-buttons">
                        <Link to="/add">
                            <button className="btn-agregar">+ Agregar Platillo</button>
                        </Link>
                        <Link to="/users">
                            <button className="btn-agregar">Usuarios</button>
                        </Link>
                        <Link to="/admin-orders">
                            <button className="btn-agregar">Pedidos</button>
                        </Link>

                        <button className="btn-cerrar" onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </div>
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
                                    <p>
                                        <strong>Precio:</strong> ${item.precio}
                                    </p>
                                    <p>
                                        <strong>Stock:</strong> {item.stock}
                                    </p>

                                    <div className="card-actions">
                                        <Link to={`/edit/${item._id}`}>
                                            <button className="btn-editar">Editar</button>
                                        </Link>

                                        <button
                                            className="btn-eliminar"
                                            onClick={() => abrirModalEliminar(item._id, item.nombre)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {modalEliminar.visible && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>¿Eliminar platillo?</h3>
                            <p>
                                Estás por eliminar <strong>{modalEliminar.nombre}</strong>
                            </p>

                            <div className="modal-buttons">
                                <button className="btn-cancelar" onClick={cerrarModalEliminar}>
                                    Cancelar
                                </button>

                                <button className="btn-confirmar" onClick={confirmarEliminacion}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Menu;