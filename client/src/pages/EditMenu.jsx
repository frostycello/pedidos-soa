import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './AddMenu.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function EditMenu() {
  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    stock: ''
  });

  const [imagenActual, setImagenActual] = useState('');
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    obtenerPlatillo();
  }, []);

  const obtenerPlatillo = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu`);
      const platillo = res.data.find((item) => item._id === id);

      if (!platillo) {
        toast.error('Platillo no encontrado');
        navigate('/');
        return;
      }

      setForm({
        nombre: platillo.nombre,
        precio: platillo.precio,
        stock: platillo.stock
      });

      setImagenActual(platillo.imagen || '');
      setPreview(platillo.imagen ? `${API_URL}${platillo.imagen}` : '');
    } catch (error) {
      toast.error('Error al cargar el platillo');
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImagen(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveSelectedImage = () => {
    setImagen(null);
    setPreview(imagenActual ? `${API_URL}${imagenActual}` : '');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.precio || !form.stock) {
      toast.warning('Todos los campos son obligatorios');
      return;
    }

    try {
      if (imagen) {
        const formData = new FormData();
        formData.append('nombre', form.nombre);
        formData.append('precio', form.precio);
        formData.append('stock', form.stock);
        formData.append('imagen', imagen);

        await axios.put(`${API_URL}/api/menu/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.put(`${API_URL}/api/menu/${id}`, {
          ...form,
          imagen: imagenActual
        });
      }

      toast.success('Platillo actualizado correctamente');
      navigate('/');
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al actualizar';
      toast.error(mensaje);
    }
  };

  return (
    <div className="add-menu-container">
      <div className="add-menu-card">
        <div className="add-menu-header">
          <h2>Editar Platillo</h2>
          <Link to="/" className="btn-volver">Volver</Link>
        </div>

        <form onSubmit={handleSubmit} className="add-menu-form">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del platillo"
            value={form.nombre}
            onChange={handleChange}
          />

          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
          />

          <label className="upload-label">
            Cambiar imagen
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>

          {preview && (
            <div className="preview-container">
              <img
                src={preview}
                alt="Vista previa"
                className="preview-img"
              />

              {imagen && (
                <button
                  type="button"
                  className="btn-quitar-imagen"
                  onClick={handleRemoveSelectedImage}
                >
                  Quitar imagen seleccionada
                </button>
              )}
            </div>
          )}

          <button type="submit" className="btn-guardar">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditMenu;