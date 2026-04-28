import React, { useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useDashboardStats } from '../hooks/back_dashboard';
import { 
  Users, Monitor, AlertTriangle, CheckCircle, 
  Clock, Activity, FileText, BellRing, PieChart
} from 'lucide-react';
import '../assets/styles/dashboard.css';

// ==========================================
// Sub-Componente: Administrador
// ==========================================
const AdminDashboard = ({ data }) => {
  const { distribucion_estados, frecuencia_fallas, indice_proactividad, resumen_general } = data;

  // Extraer valores de estados operativos para la barra
  const operativos = distribucion_estados['Operativo'] || 0;
  const mantenimiento = distribucion_estados['En Mantenimiento'] || 0;
  const baja = distribucion_estados['Baja'] || 0;
  const totalEquipos = resumen_general.total_equipos || 1; // evitar division por cero

  const getPercent = (val) => Math.round((val / totalEquipos) * 100);

  return (
    <div className="dash-stats-wrapper">
      {/* Tarjetas de Resumen */}
      <div className="dash-summary-grid">
        <div className="dash-summary-card">
          <div className="dash-summary-icon icon-blue"><Users size={28} /></div>
          <div className="dash-summary-info">
            <h4>Usuarios Registrados</h4>
            <h2>{resumen_general.total_usuarios}</h2>
          </div>
        </div>
        <div className="dash-summary-card">
          <div className="dash-summary-icon icon-purple"><Monitor size={28} /></div>
          <div className="dash-summary-info">
            <h4>Total de Equipos</h4>
            <h2>{resumen_general.total_equipos}</h2>
          </div>
        </div>
        <div className="dash-summary-card">
          <div className="dash-summary-icon icon-orange"><AlertTriangle size={28} /></div>
          <div className="dash-summary-info">
            <h4>Eventos Reportados</h4>
            <h2>{frecuencia_fallas.total}</h2>
          </div>
        </div>
        <div className="dash-summary-card">
          <div className="dash-summary-icon icon-green"><Activity size={28} /></div>
          <div className="dash-summary-info">
            <h4>Alertas Generadas</h4>
            <h2>{indice_proactividad.total_alertas}</h2>
          </div>
        </div>
      </div>

      {/* Paneles Gráficos */}
      <div className="dash-charts-grid">
        {/* Distribución de Estados */}
        <div className="dash-panel">
          <h3><PieChart size={20} /> Distribución de Estados Operativos</h3>
          <div className="css-bar-chart">
            <div className="bar-item">
              <div className="bar-header"><span>Operativos ({operativos})</span> <span>{getPercent(operativos)}%</span></div>
              <div className="bar-track"><div className="bar-fill fill-operative" style={{ width: `${getPercent(operativos)}%` }}></div></div>
            </div>
            <div className="bar-item">
              <div className="bar-header"><span>En Mantenimiento ({mantenimiento})</span> <span>{getPercent(mantenimiento)}%</span></div>
              <div className="bar-track"><div className="bar-fill fill-maintenance" style={{ width: `${getPercent(mantenimiento)}%` }}></div></div>
            </div>
            <div className="bar-item">
              <div className="bar-header"><span>Dados de Baja ({baja})</span> <span>{getPercent(baja)}%</span></div>
              <div className="bar-track"><div className="bar-fill fill-discarded" style={{ width: `${getPercent(baja)}%` }}></div></div>
            </div>
          </div>
        </div>

        {/* Frecuencia de Fallas */}
        <div className="dash-panel">
          <h3><CheckCircle size={20} /> Validación de Fallas (Eventos)</h3>
          <div className="donut-container">
            <div className="donut-stat">
              <div className="donut-circle circle-total">{frecuencia_fallas.total}</div>
              <span>Totales</span>
            </div>
            <div className="donut-stat">
              <div className="donut-circle circle-success">{frecuencia_fallas.validados}</div>
              <span>Validados</span>
            </div>
            <div className="donut-stat">
              <div className="donut-circle circle-pending">{frecuencia_fallas.pendientes}</div>
              <span>Pendientes</span>
            </div>
          </div>
        </div>

        {/* Índice de Proactividad */}
        <div className="dash-panel">
          <h3><BellRing size={20} /> Índice de Proactividad Técnica</h3>
          <div className="donut-container">
            <div className="donut-stat">
              <div className="donut-circle circle-total">{indice_proactividad.total_alertas}</div>
              <span>Alertas</span>
            </div>
            <div className="donut-stat">
              <div className="donut-circle circle-success">{indice_proactividad.enviadas}</div>
              <span>Enviadas</span>
            </div>
            <div className="donut-stat">
              <div className="donut-circle circle-pending">{indice_proactividad.pendientes}</div>
              <span>Pendientes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Sub-Componente: Técnico
// ==========================================
const TechDashboard = ({ data }) => {
  const { diagnosticos_pendientes, sugerencias_recientes } = data;

  return (
    <div className="dash-stats-wrapper">
      <div className="dash-charts-grid">
        
        <div className="dash-panel">
          <h3><Clock size={20} /> Diagnósticos Pendientes de Validación</h3>
          {diagnosticos_pendientes.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No hay diagnósticos pendientes.</p>
          ) : (
            <div className="dash-list">
              {diagnosticos_pendientes.map(diag => (
                <div key={diag.id_evento} className="dash-list-item" style={{ borderLeftColor: '#f59e0b' }}>
                  <span className="item-title">{diag.falla}</span>
                  <div className="item-meta">
                    <span>Equipo: <strong>{diag.equipo}</strong></span>
                    <span>{diag.fecha.substring(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-panel">
          <h3><BellRing size={20} /> Sugerencias Preventivas Recientes</h3>
          {sugerencias_recientes.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No hay alertas recientes.</p>
          ) : (
            <div className="dash-list">
              {sugerencias_recientes.map(alerta => (
                <div key={alerta.id_alerta} className="dash-list-item" style={{ borderLeftColor: '#10b981' }}>
                  <span className="item-title">{alerta.titulo}</span>
                  <div className="item-meta">
                    <span>Estatus: <strong style={{ color: alerta.estatus === 'Enviada' ? '#10b981' : '#f59e0b' }}>{alerta.estatus}</strong></span>
                    <span>{alerta.fecha_programada.substring(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ==========================================
// Sub-Componente: Solicitante
// ==========================================
const UserDashboard = ({ data }) => {
  const { mis_reportes, notificaciones_preventivas } = data;

  return (
    <div className="dash-stats-wrapper">
      <div className="dash-charts-grid">
        
        <div className="dash-panel">
          <h3><FileText size={20} /> Mis Reportes Actuales</h3>
          {mis_reportes.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No has realizado ningún reporte.</p>
          ) : (
            <div className="dash-list">
              {mis_reportes.slice(0, 10).map(reporte => (
                <div key={reporte.id_evento} className="dash-list-item" style={{ borderLeftColor: reporte.validado ? '#10b981' : '#f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="item-title">{reporte.falla_reportada}</span>
                    <span className={reporte.validado ? "badge-status badge-success" : "badge-status badge-pending"}>
                      {reporte.validado ? 'Validado' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="item-meta">
                    <span>{reporte.fecha_creacion.substring(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-panel">
          <h3><BellRing size={20} /> Notificaciones de mis Equipos</h3>
          {notificaciones_preventivas.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>Tus equipos no tienen alertas pendientes.</p>
          ) : (
            <div className="dash-list">
              {notificaciones_preventivas.map(alerta => (
                <div key={alerta.id_alerta} className="dash-list-item" style={{ borderLeftColor: '#3b82f6' }}>
                  <span className="item-title">{alerta.titulo}</span>
                  <div className="item-meta">
                    <span style={{ color: '#4b5563' }}>{alerta.descripcion}</span>
                  </div>
                  <div className="item-meta" style={{ marginTop: '0.5rem' }}>
                    <span>Fecha programada: <strong>{alerta.fecha_programada.substring(0, 10)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL WRAPPER
// ==========================================
const Dashboard = () => {
  const { stats, loading, error, fetchStats } = useDashboardStats();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Manejo de UI de carga
  if (loading) {
    return (
      <DashboardLayout headerTitle="Panel de Control">
        <div className="dash-stats-wrapper">
          <div className="dash-summary-grid">
            <div className="dash-skeleton" style={{ height: '100px' }}></div>
            <div className="dash-skeleton" style={{ height: '100px' }}></div>
            <div className="dash-skeleton" style={{ height: '100px' }}></div>
          </div>
          <div className="dash-charts-grid">
            <div className="dash-skeleton" style={{ height: '300px' }}></div>
            <div className="dash-skeleton" style={{ height: '300px' }}></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Manejo de Error
  if (error || !stats) {
    return (
      <DashboardLayout headerTitle="Panel de Control">
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          <AlertTriangle size={48} style={{ margin: '0 auto 1rem auto' }} />
          <h3>No se pudieron cargar las estadísticas.</h3>
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Renderizado dinámico según el rol devuelto por la API
  return (
    <DashboardLayout headerTitle={`Tablero Principal - ${stats.rol}`}>
      {stats.rol === 'Administrador' && <AdminDashboard data={stats.data} />}
      {stats.rol === 'Técnico' && <TechDashboard data={stats.data} />}
      {stats.rol === 'Solicitante' && <UserDashboard data={stats.data} />}
    </DashboardLayout>
  );
};

export default Dashboard;
