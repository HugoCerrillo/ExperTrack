import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, User, Users, MonitorSmartphone, Bell, FileText, 
  LogOut, BrainCircuit, Activity, Database, Wrench, AlertTriangle 
} from 'lucide-react';
import Swal from 'sweetalert2';
import experTrackLogo from '../../assets/img/ExperTrack.png';

export const Sidebar = ({ isOpen, closeSidebar, userRole = 'Administrador' }) => {
  const navigate = useNavigate();

  // Diccionario centralizado de los permisos de rutas por cada rol
  const menuConfig = {
    'Administrador': [
      { path: '/dashboard', icon: Home, label: 'Inicio', exact: true },
      { path: '/dashboard/perfil', icon: User, label: 'Mi Perfil' },
      { path: '/dashboard/usuarios', icon: Users, label: 'Administrar Usuarios' },
      { path: '/dashboard/activos', icon: MonitorSmartphone, label: 'Activos' },
      { path: '/dashboard/alertas', icon: Bell, label: 'Gestión de Alertas' },
      { path: '/dashboard/expediente', icon: FileText, label: 'Expediente Técnico' },
    ],
    'Técnico': [
      { path: '/dashboard', icon: Home, label: 'Inicio', exact: true },
      { path: '/dashboard/perfil', icon: User, label: 'Mi Perfil' },
      { path: '/dashboard/activos', icon: MonitorSmartphone, label: 'Activos' },
      { path: '/dashboard/sistema-experto', icon: BrainCircuit, label: 'Diagnostico con sistema experto' },
      { path: '/dashboard/diagnosticos', icon: Activity, label: 'Diagnosticos' },
      { path: '/dashboard/hechos', icon: Database, label: 'Gestión de Hechos (S.E)' },
      { path: '/dashboard/alertas', icon: Bell, label: 'Gestión de Alertas' },
      { path: '/dashboard/intervenciones', icon: Wrench, label: 'Gestión de Intervenciones Técnicas' },
      { path: '/dashboard/expediente', icon: FileText, label: 'Expediente Técnico' },
    ],
    'Usuario Solicitante': [
      { path: '/dashboard', icon: Home, label: 'Inicio', exact: true },
      { path: '/dashboard/perfil', icon: User, label: 'Mi Perfil' },
      { path: '/dashboard/activos', icon: MonitorSmartphone, label: 'Activos' },
      { path: '/dashboard/reportar', icon: AlertTriangle, label: 'Reportar fallas' },
      { path: '/dashboard/expediente', icon: FileText, label: 'Expediente Técnico' },
    ]
  };

  // Seleccionamos la configuración de acuerdo al rol, si no llega uno válido mostramos nivel bajo (Usuario Solicitante)
  const renderMenu = menuConfig[userRole] || menuConfig['Usuario Solicitante'];

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
      closeSidebar();
      navigate('/', { replace: true });
    }
  };
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
        
        {/* Enlaces de Navegación Interna construidos dinámicamente */}
        <nav className="sidebar-nav">
          {renderMenu.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={idx} 
                to={item.path} 
                onClick={closeSidebar} 
                end={item.exact} 
                className={({isActive}) => `sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} className="icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Cierre de sesión anclado abajo */}
        <div className="sidebar-bottom">
          <button className="sidebar-item" onClick={handleLogout} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
            <LogOut size={20} className="icon" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Capa negra transparente para cerrar menú en Celulares */}
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={closeSidebar}></div>
    </>
  );
};
