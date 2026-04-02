import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
import AssetManagement from './pages/AssetManagement';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Se definen las rutas de navegación del sistema*/}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas Privadas / Internas del Sistema */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/perfil" element={<UserProfile />} />
          <Route path="/dashboard/usuarios" element={<UserManagement />} />
          <Route path="/dashboard/activos" element={<AssetManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
