import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAlertasManagement } from '../../hooks/back_alerts_management';

//renderizado de header interactivo
export const TopHeader = ({ toggleSidebar, title }) => {
  const { alertas, fetchAlertas } = useAlertasManagement();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  //cerrar sesion
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

  //cargar alertas enviadas para el centro de notificaciones
  useEffect(() => {
    fetchAlertas('Enviada');

    const interval = setInterval(() => fetchAlertas('Enviada'), 300000);
    return () => clearInterval(interval);
  }, [fetchAlertas]);

  //filtrar alertas para mostrar solo las que pertenecen al usuario
  const personalAlerts = alertas.filter(alerta => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return Number(alerta.id_usuario) === Number(user.id || user.id_usuario);
    }
    return false;
  });

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

        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {personalAlerts.length > 0 && <span className="badge">{personalAlerts.length}</span>}
          </button>

          {/*menu desplegable de notificaciones*/}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">Notificaciones Recientes</div>
              <div className="dropdown-list">
                {personalAlerts.length === 0 ? (
                  <div className="dropdown-item notif-empty">
                    No hay notificaciones nuevas
                  </div>
                ) : (
                  personalAlerts.slice(0, 5).map(alerta => (
                    <div key={alerta.id_alerta} className="dropdown-item">
                      <p className="notif-text notif-title-bold">{alerta.titulo}</p>
                      <p className="notif-text notif-desc-small">
                        Equipo: {alerta.codigo_equipo}
                      </p>
                      <span className="notif-time">{alerta.fecha_programada?.substring(0, 10)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-menu-wrapper" ref={userMenuRef}>
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
                  className="dropdown-item user-item logout-item btn-logout-dropdown"
                  onClick={handleLogout}
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
