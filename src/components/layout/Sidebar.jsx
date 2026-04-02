import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Users, MonitorSmartphone, Bell, FileText, LogOut } from 'lucide-react';
import experTrackLogo from '../../assets/img/ExperTrack.png';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  return (
    <>
      {/* Añadimos clase de desktop-closed para computadoras y mobile-open para móviles */}
      <aside className={`sidebar ${!isOpen ? 'desktop-closed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
        
        {/* Cabecera del Menu */}
        <div className="sidebar-header">
          <img src={experTrackLogo} alt="ExperTrack" className="sidebar-logo-img" />
          <span className="sidebar-brand">ExperTrack</span>
        </div>

        <div className="sidebar-menu-title">Menu Principal</div>
        
        {/* Enlaces de Navegación Interna */}
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={closeSidebar} end className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Home size={20} className="icon" />
            <span>Inicio</span>
          </NavLink>
          
          <NavLink to="/dashboard/perfil" onClick={closeSidebar} className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <User size={20} className="icon" />
            <span>Mi Perfil</span>
          </NavLink>
          
          <NavLink to="/dashboard/usuarios" onClick={closeSidebar} className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Users size={20} className="icon" />
            <span>Administrar Usuarios</span>
          </NavLink>
          
          <NavLink to="/dashboard/activos" onClick={closeSidebar} className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <MonitorSmartphone size={20} className="icon" />
            <span>Activos</span>
          </NavLink>
          
          <NavLink to="/dashboard/alertas" onClick={closeSidebar} className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Bell size={20} className="icon" />
            <span>Gestión de Alertas</span>
          </NavLink>
          
          <NavLink to="/dashboard/expediente" onClick={closeSidebar} className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <FileText size={20} className="icon" />
            <span>Expediente Técnico</span>
          </NavLink>
        </nav>

        {/* Cierre de sesión anclado abajo */}
        <div className="sidebar-bottom">
          <NavLink to="/" onClick={closeSidebar} className="sidebar-item">
            <LogOut size={20} className="icon" />
            <span>Cerrar Sesión</span>
          </NavLink>
        </div>
      </aside>

      {/* Capa negra transparente para cerrar menú en Celulares */}
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={closeSidebar}></div>
    </>
  );
};
