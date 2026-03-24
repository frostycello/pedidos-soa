import { useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import './AddMenu.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AddMenu() {
  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    stock: ''
  });

  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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

  const handleRemoveImage = () => {
    setImagen(null);
    setPreview('');

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
      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('precio', form.precio);
      formData.append('stock', form.stock);

      if (imagen) {
        formData.append('imagen', imagen);
      }

      await axios.post(`${API_URL}/api/menu`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Platillo agregado correctamente');
      navigate('/');
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error inesperado';
      toast.error(mensaje);
    }
  };

  return (
    <div className="add-menu-container">
      <div className="add-menu-card">
        <div className="add-menu-header">
          <h2>Agregar Platillo</h2>
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
            Seleccionar imagen
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

              <button
                type="button"
                className="btn-quitar-imagen"
                onClick={handleRemoveImage}
              >
                Quitar imagen
              </button>
            </div>
          )}

          <button type="submit" className="btn-guardar">
            Guardar Platillo
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMenu;