import { useState } from 'react';
import axios from 'axios';
import {
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './login.css';


function Login() {
  const [rememberSession, setRememberSession] = useState(true);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await setPersistence(
        auth,
        rememberSession ? browserLocalPersistence : browserSessionPersistence
      );

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      let rol = 'cliente';

      try {
        const res = await axios.get(
          `${API_URL}/api/users/email/${encodeURIComponent(user.email)}`
        );

        if (res.data?.rol) {
          rol = res.data.rol;
        }
      } catch (error) {
        // Si no existe en Mongo, se queda como cliente
        rol = 'cliente';
      }

      localStorage.setItem('userRole', rol);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || 'Sin nombre');

      toast.success(`Inicio de sesión exitoso como ${rol}`);
      navigate('/');
    } catch (error) {
      console.log(error);
      toast.error('Error al iniciar sesión con Google');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar sesión</h2>
        <p>Accede con tu cuenta de Google para continuar</p>

        <button className="google-btn" onClick={handleGoogleLogin}>
          Iniciar sesión con Google
        </button>

        <label className="remember-box">
          <input
            type="checkbox"
            checked={rememberSession}
            onChange={(e) => setRememberSession(e.target.checked)}
          />
          Recordar sesión
        </label>
      </div>
    </div>
  );
}

export default Login;