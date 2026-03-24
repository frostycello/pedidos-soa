import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useEffect, useState } from 'react';
import axios from 'axios';

import Menu from './pages/Menu';
import AddMenu from './pages/AddMenu';
import EditMenu from './pages/EditMenu';
import Login from './pages/Login';
import Users from './pages/Users';
import ClientMenu from './pages/ClientMenu';
import WaiterOrders from './pages/WaiterOrders';
import AdminOrders from './pages/AdminOrders';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('cliente');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const res = await axios.get(
            `${API_URL}/api/users/email/${encodeURIComponent(currentUser.email)}`
          );

          const rolReal = res.data?.rol || 'cliente';
          setRole(rolReal);

          localStorage.setItem('userRole', rolReal);
          localStorage.setItem('userEmail', currentUser.email);
          localStorage.setItem('userName', currentUser.displayName || 'Sin nombre');
        } catch (error) {
          setRole('cliente');

          localStorage.setItem('userRole', 'cliente');
          localStorage.setItem('userEmail', currentUser.email);
          localStorage.setItem('userName', currentUser.displayName || 'Sin nombre');
        }
      } else {
        setRole('cliente');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</p>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            user ? (
              role === 'admin' ? (
                <Menu />
              ) : role === 'mesero' ? (
                <WaiterOrders />
              ) : (
                <ClientMenu />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/add"
          element={
            user && role === 'admin'
              ? <AddMenu />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/edit/:id"
          element={
            user && role === 'admin'
              ? <EditMenu />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/users"
          element={
            user && role === 'admin'
              ? <Users />
              : <Navigate to="/" />
          }
        />
        <Route
          path="/admin-orders"
          element={
            user && role === 'admin'
              ? <AdminOrders />
              : <Navigate to="/" />
          }
        />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;