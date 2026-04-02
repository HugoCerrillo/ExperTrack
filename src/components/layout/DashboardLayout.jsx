import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import '../../assets/styles/dashboard.css';

/**
 * DashboardLayout envuelve cualquier pantalla (children) con la estructura maestra de trabajo.
 */
export const DashboardLayout = ({ children, headerTitle = "Administrador" }) => {
  // Inicializamos el estado dependiendo del tamaño de la pantalla
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

  // Escuchar redimensiones para acoplarse automáticamente al usuario
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

  // Funciones para despliegue de menú interactivo
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
