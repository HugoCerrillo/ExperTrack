import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
import AssetManagement from './pages/AssetManagement';
import ExpertSystem from './pages/ExpertSystem';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Swal from 'sweetalert2';

//por seguridad y para que no se pueda acceder al sistema sin iniciar sesion
//vigila todas las llamadas fetch() que hace el sistema hacia el Backend
//si Flask responde 401 (Unauthorized/JWT Expirado), expulsa al usuario al Login.
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);
  if (response.status === 401) {
    if (!window.hasShown401Alert) {
      window.hasShown401Alert = true;
      localStorage.removeItem('user'); //removemos el usuario del localStorage
      Swal.fire({
        icon: 'warning',
        title: 'Sesión Caducada',
        text: 'Tu sesión ha finalizado. Por motivos de seguridad de ExperTrack, debes volver a iniciar sesión.',
        confirmButtonColor: '#504b38',
        allowOutsideClick: false
      }).then(() => {
        window.location.href = '/';
      });
    }
  }
  return response;
};


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/*definimos las rutas de navegacion del sistema*/}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />

          {/*rutas privadas protegidas*/}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/perfil" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/dashboard/usuarios" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/dashboard/activos" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
          <Route path="/dashboard/sistema-experto" element={<ProtectedRoute><ExpertSystem /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
