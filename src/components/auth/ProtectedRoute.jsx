import React from 'react';
import { Navigate } from 'react-router-dom';

//este componente sirve para proteger rutas privadas (cuando inicies sesion no podras entrar a rutas privadas)
//de lo contrario si no tienes sesion, te redirige al login
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');

  if (!user) {
    //si no hay sesion, te redirige al login
    return <Navigate to="/" replace />;
  }

  //si hay sesion, renderiza el contenido de la ruta
  return children;
};

export default ProtectedRoute;
