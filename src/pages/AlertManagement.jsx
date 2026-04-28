import React, { useState, useEffect } from 'react';
import { 
  Bell, BellRing, CalendarClock, Send, Plus, 
  Trash2, Edit, Monitor, User as UserIcon, RefreshCw, X, Tag, AlignLeft 
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { useAlertasManagement } from '../hooks/back_alerts_management';
import { useAssetManagement } from '../hooks/back_asset_management';
import { useUserManagement } from '../hooks/back_user_management';
import '../assets/styles/users.css';

const AlertManagement = () => {
  const { 
    alertas, loading, fetchAlertas, createAlerta, 
    updateAlerta, deleteAlerta, triggerVerificacionManual 
  } = useAlertasManagement();
  
  const { assets, fetchEquipos } = useAssetManagement();
  const { users } = useUserManagement(); // Técnicos y Administradores

  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = loggedUser.rol === 'Administrador';

  const [activeTab, setActiveTab] = useState('Pendiente'); // 'Pendiente' o 'Enviada'
  const [modalMode, setModalMode] = useState(null); // 'ADD' o 'EDIT'
  const [currentId, setCurrentId] = useState(null);

  const emptyForm = {
    titulo: '',
    descripcion: '',
    id_equipo: '',
    id_usuario: '',
    fecha_programada: ''
  };

  const [formData, setFormData] = useState(emptyForm);

  // Cargar datos iniciales
  useEffect(() => {
    fetchAlertas(activeTab);
    fetchEquipos();
  }, [activeTab, fetchAlertas, fetchEquipos]);

  // Manejo de modales
  const openModal = (mode, alerta = null) => {
    setModalMode(mode);
    if (mode === 'EDIT' && alerta) {
      setCurrentId(alerta.id_alerta);
      setFormData({
        titulo: alerta.titulo,
        descripcion: alerta.descripcion,
        id_equipo: alerta.id_equipo,
        id_usuario: alerta.id_usuario,
        // Adaptar el string de fecha (YYYY-MM-DDTHH:mm:ss -> YYYY-MM-DD)
        fecha_programada: alerta.fecha_programada ? alerta.fecha_programada.substring(0, 10) : ''
      });
    } else {
      setCurrentId(null);
      setFormData(emptyForm);
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.id_equipo || !formData.id_usuario) {
      Swal.fire('Atención', 'Debes seleccionar un usuario y un equipo válido.', 'warning');
      return;
    }

    let success = false;
    
    // Convertir IDs a números
    const dataToSend = {
      ...formData,
      id_equipo: Number(formData.id_equipo),
      id_usuario: Number(formData.id_usuario)
    };

    if (modalMode === 'ADD') {
      success = await createAlerta(dataToSend);
    } else if (modalMode === 'EDIT') {
      success = await updateAlerta(currentId, dataToSend);
    }

    if (success) {
      closeModal();
      fetchAlertas(activeTab);
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteAlerta(id);
    if (success) {
      fetchAlertas(activeTab);
    }
  };

  const handleTriggerManual = async () => {
    const success = await triggerVerificacionManual();
    if (success && activeTab === 'Enviada') {
      fetchAlertas(activeTab); // Refrescar si estamos en la pestaña Enviadas
    } else if (success && activeTab === 'Pendiente') {
      fetchAlertas(activeTab); // Refrescar para ver que desaparecen de pendientes
    }
  };

  // Filtrar equipos basados en el usuario seleccionado
  const filteredEquipos = assets.filter(a => 
    formData.id_usuario ? Number(a.id_usuario) === Number(formData.id_usuario) : true
  );

  return (
    <DashboardLayout headerTitle="Gestión de Alertas Preventivas">
      <div className="users-container">
        
        {/* Pestañas (Tabs) y Botón Manual */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(80, 75, 56, 0.1)', paddingBottom: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('Pendiente')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                backgroundColor: activeTab === 'Pendiente' ? 'var(--color-olive-dark)' : 'transparent',
                color: activeTab === 'Pendiente' ? '#FFF' : 'var(--color-olive-dark)'
              }}
            >
              <CalendarClock size={18} /> Alertas Pendientes
            </button>
            <button
              onClick={() => setActiveTab('Enviada')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                backgroundColor: activeTab === 'Enviada' ? 'var(--color-olive-dark)' : 'transparent',
                color: activeTab === 'Enviada' ? '#FFF' : 'var(--color-olive-dark)'
              }}
            >
              <Send size={18} /> Correos Enviados
            </button>
          </div>
          
          <button onClick={handleTriggerManual} className="btn-chat-action action-yes" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#2563eb', color: '#fff' }}>
            <RefreshCw size={18} /> Forzar Verificación Ahora
          </button>
        </div>

        {/* Toolbar Superior */}
        <div className="users-header-actions" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-add-user" style={{ backgroundColor: '#504b38' }} onClick={() => openModal('ADD')}>
            <Plus size={20} /> Programar Nueva Alerta
          </button>
        </div>

        {/* Tabla Robusta Reutilizada */}
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Asunto / Título</th>
                <th>Equipo Asignado</th>
                <th>Responsable</th>
                <th>Fecha de Envío</th>
                <th style={{ width: '120px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && alertas.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Cargando alertas...</td></tr>
              ) : alertas.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    {activeTab === 'Pendiente' ? <BellRing size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} /> : <Send size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />}
                    <p>No se encontraron alertas en la bandeja.</p>
                  </td>
                </tr>
              ) : (
                alertas.map((alerta) => (
                  <tr key={alerta.id_alerta}>
                    <td data-label="Asunto">
                      <div className="contact-cell" style={{ whiteSpace: 'normal', maxWidth: '300px' }}>
                        <span style={{ fontWeight: '600', color: '#111827' }}>{alerta.titulo}</span>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>{alerta.descripcion}</span>
                      </div>
                    </td>
                    <td data-label="Equipo">
                      <div className="contact-cell">
                        <span style={{ fontWeight: '600', color: 'var(--color-olive-dark)' }}>{alerta.codigo_equipo}</span>
                      </div>
                    </td>
                    <td data-label="Responsable">
                      <div className="contact-cell">
                        <span className={`role-badge ${isAdmin ? 'role-administrador' : 'role-técnico'}`} style={{ display: 'inline-block', width: 'max-content', marginBottom: '4px' }}>
                          Técnico
                        </span>
                        <span style={{ fontSize: '0.85rem' }}>{alerta.nombre_responsable}</span>
                      </div>
                    </td>
                    <td data-label="Fecha de Envío">
                      <div className="contact-cell">
                        <span style={{ color: activeTab === 'Enviada' ? '#059669' : '#d97706', fontWeight: '600' }}>
                          {alerta.fecha_programada ? alerta.fecha_programada.substring(0, 10) : 'S/F'}
                        </span>
                      </div>
                    </td>
                    <td data-label="Acciones">
                      <div className="action-buttons">
                        {activeTab === 'Pendiente' && (
                          <button className="btn-icon btn-edit" title="Editar" onClick={() => openModal('EDIT', alerta)}>
                            <Edit size={18} />
                          </button>
                        )}
                        {isAdmin && (
                          <button className="btn-icon btn-delete" title="Borrar" onClick={() => handleDelete(alerta.id_alerta)}>
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MODAL MULTIPROPÓSITO (ADD/EDIT) */}
        {modalMode && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="modal-header">
                <h3>{modalMode === 'ADD' ? 'Programar Nueva Alerta' : 'Editar Alerta Programada'}</h3>
                <button type="button" className="btn-close-modal" onClick={closeModal}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="modal-body">
                  <div className="modal-grid">
                    
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <AuthInput 
                        label="Título del Asunto" icon={Tag} 
                        placeholder="Ej. Mantenimiento Preventivo Bimestral" required 
                        value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} 
                      />
                    </div>

                    <div className="input-group select-group">
                      <label>1. Usuario Destinatario (Dueño)</label>
                      <div className="input-wrapper">
                        <UserIcon className="input-icon" size={20} />
                        <select 
                          className="auth-select" 
                          required 
                          value={formData.id_usuario} 
                          onChange={(e) => {
                            setFormData({...formData, id_usuario: e.target.value, id_equipo: ''});
                          }}
                        >
                          <option value="">Selecciona al dueño del equipo...</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.nombre} {u.apellidoPaterno || u.apellido_paterno}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="input-group select-group">
                      <label>2. Equipo de {formData.id_usuario ? users.find(u => Number(u.id) === Number(formData.id_usuario))?.nombre : 'Usuario'}</label>
                      <div className="input-wrapper">
                        <Monitor className="input-icon" size={20} />
                        <select 
                          className="auth-select" 
                          required 
                          disabled={!formData.id_usuario}
                          value={formData.id_equipo} 
                          onChange={(e) => setFormData({...formData, id_equipo: e.target.value})}
                        >
                          <option value="">
                            {!formData.id_usuario ? 'Selecciona primero un usuario...' : (filteredEquipos.length === 0 ? 'Este usuario no tiene equipos' : 'Selecciona un equipo...')}
                          </option>
                          {filteredEquipos.map(a => <option key={a.id_equipo} value={a.id_equipo}>{a.codigo_inventario} - {a.marca} {a.modelo}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="input-group select-group">
                      <label>Fecha de la Actividad</label>
                      <div className="input-wrapper">
                        <CalendarClock className="input-icon" size={20} />
                        <input 
                          type="date" 
                          className="auth-select" // Reutilizamos el estilo del select para el padding
                          style={{ fontFamily: 'inherit' }}
                          required 
                          value={formData.fecha_programada} 
                          onChange={(e) => setFormData({...formData, fecha_programada: e.target.value})}
                        />
                      </div>
                      <span className="section-hint" style={{ marginTop: '0.25rem' }}>* El correo se enviará 2 días antes de esta fecha.</span>
                    </div>

                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label>Cuerpo / Descripción de la Alerta</label>
                      <div className="input-wrapper">
                        <AlignLeft className="icon-textarea" size={20} />
                        <textarea 
                          className="textarea-auth textarea-with-icon" required 
                          placeholder="Instrucciones que llegarán en el cuerpo del correo..."
                          value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} 
                        />
                      </div>
                    </div>

                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {modalMode === 'ADD' ? 'Programar Alerta' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AlertManagement;
