import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import '../../assets/styles/dashboard.css';

//este dashboard se reutiliza en todas las pantallas del dashboard con children
export const DashboardLayout = ({ children, headerTitle = "Administrador" }) => {
  //inicializamos el estado dependiendo del tamaño de la pantalla
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [userRole, setUserRole] = useState('Técnico'); // Rol por defecto

  //escuchamos redimensiones para acoplarse automáticamente al usuario
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //extraer el rol del usuario guardado en localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.rol) {
          setUserRole(user.rol);
        }
      } catch (error) {
        console.error("Error al leer el rol del usuario", error);
      }
    }
  }, []);

  //funciones para despliegue de menu interactivo 
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-wrapper">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} userRole={userRole} />

      <main className="dashboard-main">
        <TopHeader toggleSidebar={toggleSidebar} title={headerTitle} />
        <div className="dashboard-content">
          {/*aqui se insertan las diferentes pantallas*/}
          {children}
        </div>
      </main>
    </div>
  );
};
