import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
import AssetManagement from './pages/AssetManagement';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
          
          {/* Rutas Privadas / Internas del Sistema (Protegidas) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/perfil" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/dashboard/usuarios" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/dashboard/activos" element={<ProtectedRoute><AssetManagement /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
