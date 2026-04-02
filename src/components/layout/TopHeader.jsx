import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';

export const TopHeader = ({ toggleSidebar, title }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Datos Ficticios de Prueba para la UI
  const notifications = [
    { id: 1, text: 'Mantenimiento preventivo PC-Contabilidad completado', time: 'Hace 5 min' },
    { id: 2, text: 'Alerta térmica crítica en Servidor 01 detectada', time: 'Hace 2 hrs' },
    { id: 3, text: 'Inventario actualizado: +5 Discos SSD 1TB ingresados', time: 'Ayer' },
  ];

  // Cerrar paneles flotantes al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar Notificaciones
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      // Cerrar Menú de Usuario
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="dashboard-header">
      {/* Botón Hamburguesa Interactivo */}
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={32} strokeWidth={1.5} />
        </button>
      </div>
      
      {/* Título Central Dinámico */}
      <div className="header-center">
        <h2 className="header-role-title">{title}</h2>
      </div>

      {/* Botones de Acción Derecho con Dropdown */}
      <div className="header-right">
        
        <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="badge">3</span>
          </button>

          {/* Menú Desplegable Renderizado Condicionalmente */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">Notificaciones Recientes</div>
              <div className="dropdown-list">
                {notifications.map(n => (
                  <div key={n.id} className="dropdown-item">
                    <p className="notif-text">{n.text}</p>
                    <span className="notif-time">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="dropdown-footer">Ver todo el historial</div>
            </div>
          )}
        </div>

        <div className="user-menu-wrapper" ref={userMenuRef} style={{ position: 'relative' }}>
          <button 
            className="avatar-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            AD
          </button>

          {/* Menú Desplegable de Usuario */}
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <p className="user-name">Administrador</p>
                <p className="user-role">admin@expertrack.com</p>
              </div>
              
              <div className="dropdown-list">
                <Link to="/dashboard/perfil" className="dropdown-item user-item" onClick={() => setShowUserMenu(false)}>
                  <User size={16} />
                  <span>Mi Perfil</span>
                </Link>
                
                <div className="dropdown-divider"></div>
                
                <Link to="/" className="dropdown-item user-item logout-item" onClick={() => setShowUserMenu(false)}>
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
