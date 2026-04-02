import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Componente de Orden Superior (HOC) para proteger rutas privadas.
 * Si no existe un usuario en localStorage, redirige al Login.
 */
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');

  if (!user) {
    // Si no hay sesión, mandamos al login
    return <Navigate to="/" replace />;
  }

  // Si hay sesión, renderizamos el contenido de la ruta
  return children;
};

export default ProtectedRoute;
