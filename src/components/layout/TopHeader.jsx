import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

//renderizado de header interactivo
export const TopHeader = ({ toggleSidebar, title }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "Tendrás que volver a ingresar tus credenciales.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#504b38',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      localStorage.clear();
      setShowUserMenu(false);
      navigate('/', { replace: true });
    }
  };

  //obtener datos del usuario logueado en tiempo real
  const [userData, setUserData] = useState({
    initials: 'AD',
    fullName: 'Usuario',
    email: 'correo@expertrack.com'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const n = (user.nombre || "").charAt(0).toUpperCase();
        const ap = (user.apellido_paterno || user.apellidoPaterno || "").charAt(0).toUpperCase();

        setUserData({
          initials: (n + ap) || 'U',
          fullName: `${user.nombre} ${user.apellido_paterno || user.apellidoPaterno || ''}`,
          email: user.correo || 'correo@expertrack.com'
        });
      } catch (e) {
        console.error("Error al cargar datos del header", e);
      }
    }
  }, []);

  // Datos Ficticios de Prueba para la UI
  const notifications = [
    { id: 1, text: 'Mantenimiento preventivo PC-Contabilidad completado', time: 'Hace 5 min' },
    { id: 2, text: 'Alerta térmica crítica en Servidor 01 detectada', time: 'Hace 2 hrs' },
    { id: 3, text: 'Inventario actualizado: +5 Discos SSD 1TB ingresados', time: 'Ayer' },
  ];

  //cerrar paneles flotantes al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      //cerrar notificaciones
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      //cerrar menu de usuario
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="dashboard-header">
      {/*boton hamburguesa interactivo*/}
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={toggleSidebar}>
          <Menu size={32} strokeWidth={1.5} />
        </button>
      </div>

      {/*titulo central dinamico*/}
      <div className="header-center">
        <h2 className="header-role-title">{title}</h2>
      </div>

      {/*botones de accion derecho con dropdown*/}
      <div className="header-right">

        <div className="notification-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="badge">3</span>
          </button>

          {/*menu desplegable de notificaciones*/}
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
            {userData.initials}
          </button>

          {/*menu desplegable de usuario*/}
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <p className="user-name">{userData.fullName}</p>
                <p className="user-role">{userData.email}</p>
              </div>

              <div className="dropdown-list">
                <Link to="/dashboard/perfil" className="dropdown-item user-item" onClick={() => setShowUserMenu(false)}>
                  <User size={16} />
                  <span>Mi Perfil</span>
                </Link>

                <div className="dropdown-divider"></div>

                <button
                  className="dropdown-item user-item logout-item"
                  onClick={handleLogout}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
