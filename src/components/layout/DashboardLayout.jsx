import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import '../../assets/styles/dashboard.css';

//este dashboard se reutiliza en todas las pantallas del dashboard con children
export const DashboardLayout = ({ children, headerTitle = "Administrador" }) => {
  //inicializamos el estado dependiendo del tamaño de la pantalla
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

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

  //funciones para despliegue de menu interactivo 
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-wrapper">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

      <main className="dashboard-main">
        <TopHeader toggleSidebar={toggleSidebar} title={headerTitle} />
        <div className="dashboard-content">
          {/* Aquí se inyectan las diferentes tablas/gráficas según la URL */}
          {children}
        </div>
      </main>
    </div>
  );
};
