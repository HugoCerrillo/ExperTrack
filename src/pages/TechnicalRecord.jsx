import React, { useState, useEffect } from 'react';
import {
  Search, CheckCircle2, XCircle, FileText, Activity, AlertCircle, Wrench, ShieldCheck, ShieldAlert, Edit, Save, X, Loader2, Database, Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import { useEventsManagement } from '../hooks/back_events_management';
import '../assets/styles/users.css';
import '../assets/styles/assets-management.css';

const TechnicalRecord = () => {
  const { records, loading, fetchExpediente, updateEvento, updateDiagnostico, createDiagnostico, createMantenimiento, updateMantenimiento } = useEventsManagement();
  
  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = loggedUser.id_usuario || loggedUser.id;
  const userRole = loggedUser.rol || 'Usuario Solicitante';
  const isAdmin = userRole === 'Administrador';
  const isTecnico = userRole === 'Técnico';

  const [searchTerm, setSearchTerm] = useState('');
  const [hideValidated, setHideValidated] = useState(isTecnico); // Por defecto el tecnico oculta los validados
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('EVENTO'); // EVENTO | DIAGNOSTICO | MANTENIMIENTO

  useEffect(() => {
    fetchExpediente();
  }, [fetchExpediente]);

  // Filtrado reactivo en pantalla
  const filteredRecords = records.filter(r => {
    // 1. Filtro estricto por Rol
    if (isTecnico && Number(r.id_usuario) !== Number(userId)) return false;
    
    // 2. Filtro de Búsqueda
    const searchString = `${r.id_evento} ${r.falla_reportada} ${r.equipo_detalle?.codigo_inventario} ${r.equipo_detalle?.marca}`.toLowerCase();
    if (!searchString.includes(searchTerm.toLowerCase())) return false;

    // 3. Filtro de Validación
    if (hideValidated && r.validado) return false;

    return true;
  });

  const openModal = (record) => {
    // Clonamos profundamente para no mutar el estado principal accidentalmente
    setCurrentEvent({
      ...record,
      diagnostico: record.diagnostico ? { ...record.diagnostico } : null,
      mantenimiento: record.mantenimiento ? { ...record.mantenimiento } : null
    });
    setActiveTab('EVENTO');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentEvent(null);
    setIsModalOpen(false);
  };

  const handleValidarEvento = async () => {
    // Pregunta agresiva de seguridad
    const confirm = await Swal.fire({
      title: '¿Validar y Cerrar Evento?',
      text: "Al validar, el Equipo será declarado como 'Operativo' y este folio se bloqueará en modo Sólo-Lectura permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#504b38',
      cancelButtonColor: '#f85149',
      confirmButtonText: 'Sí, Validar Evento',
      cancelButtonText: 'Cancelar'
    });

    if (!confirm.isConfirmed) return;

    setIsSaving(true);
    // Cambiamos a True
    const success = await updateEvento(currentEvent.id_evento, { validado: true });
    
    if (success) {
      Swal.fire({ icon: 'success', title: 'Evento Cerrado', text: 'El equipo ha recuperado su estatus Operativo.' });
      closeModal();
      fetchExpediente();
    }
    setIsSaving(false);
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Guardar cambios del EVENTO en si (solo estado_fisico, falla_reportada, etc)
      // Ni admin ni tecnico deberian andar cambiando el equipo ni creador desde aqui por seguridad estructural.
      // Tecnico solo puede validar, Admin puede editar texto. El backend rechaza si Tecnico intenta mandar textos al Evento.
      if (isAdmin) {
        await updateEvento(currentEvent.id_evento, {
          falla_reportada: currentEvent.falla_reportada,
          estado_fisico: currentEvent.estado_fisico
        });
      }

      // 2. Guardar DIAGNOSTICO
      if (currentEvent.diagnostico) {
        // En teoria la DB lo crea, pero si lo vamos a mutar:
        if (currentEvent.diagnostico.es_nuevo) { // bandera custom 
          await createDiagnostico({ ...currentEvent.diagnostico, id_evento: currentEvent.id_evento });
        } else {
          await updateDiagnostico(currentEvent.id_evento, {
            resultado_preeliminar: currentEvent.diagnostico.resultado_preeliminar,
            validacion_tecnico: currentEvent.diagnostico.validacion_tecnico
          });
        }
      }

      // 3. Guardar MANTENIMIENTO
      if (currentEvent.mantenimiento) {
        if (currentEvent.mantenimiento.es_nuevo) {
          await createMantenimiento({ ...currentEvent.mantenimiento, id_evento: currentEvent.id_evento });
        } else {
          await updateMantenimiento(currentEvent.id_evento, {
            tipo: currentEvent.mantenimiento.tipo,
            descripcion_trabajo: currentEvent.mantenimiento.descripcion_trabajo,
            piezas_reemplazadas: currentEvent.mantenimiento.piezas_reemplazadas,
            fecha_entrega: currentEvent.mantenimiento.fecha_entrega
          });
        }
      }

      Swal.fire({ icon: 'success', title: 'Cambios Guardados', text: 'El expediente se sincronizó correctamente.' });
      closeModal();
      fetchExpediente();

    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo conflictos guardando todas las pestañas.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Switch de Lectura global
  const isReadOnly = currentEvent?.validado === true;

  return (
    <DashboardLayout headerTitle="Expediente Técnico">
      <div className="users-container">
        
        {/* Barra de herramientas superior */}
        <div className="users-header-actions">
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <AuthInput
                icon={Search} type="text" placeholder="Buscar ticket o equipo..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} required={false} label={false}
              />
            </div>
            
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '1.5rem', paddingRight: '1rem', backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              title="Oculta los eventos que ya fueron validados y completados."
            >
              <input 
                type="checkbox" 
                checked={hideValidated} 
                onChange={(e) => setHideValidated(e.target.checked)} 
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#504b38' }}
              />
              <span 
                onClick={() => setHideValidated(!hideValidated)} 
                style={{ cursor: 'pointer', fontWeight: 600, color: '#504b38', whiteSpace: 'nowrap', fontSize: '0.95rem' }}
              >
                Ocultar Validados
              </span>
            </div>
          </div>
        </div>

        {/* Tabla Dinámica */}
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Folio Evento</th>
                <th>Datos del Equipo</th>
                <th>Estatus / Fases</th>
                <th>Asignación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 size={40} className="spin-icon" style={{ margin: '0 auto', color: '#504b38' }} />
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Sincronizando Expedientes...</p>
                  </td>
                </tr>
              )}

              {!loading && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    No hay eventos que mostrar en la bandeja.
                  </td>
                </tr>
              )}

              {!loading && filteredRecords.map(r => (
                <tr key={r.id_evento}>
                  <td data-label="Folio">
                    <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#504b38' }}>#{r.id_evento}</div>
                    <div className="specs-text">{new Date(r.fecha_creacion).toLocaleDateString()}</div>
                  </td>
                  <td data-label="Equipo">
                    {r.equipo_detalle ? (
                      <div className="user-details" style={{ fontWeight: '500' }}>
                        <span className="asset-main-title">{r.equipo_detalle.codigo_inventario}</span>
                        <span className="asset-subtitle">{r.equipo_detalle.marca} - {r.equipo_detalle.tipo_equipo}</span>
                      </div>
                    ) : (
                      <span className="specs-text">Equipo #{r.id_equipo} (No desc)</span>
                    )}
                  </td>
                  <td data-label="Estatus">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                      <div className={`status-badge ${r.validado ? 'status-active' : 'status-inactive'}`} style={{ backgroundColor: r.validado ? '#bbf7d0' : '#fef08a', color: r.validado ? '#166534' : '#854d0e' }}>
                        {r.validado ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {r.validado ? 'Validado y Cerrado' : 'Abierto (Pediente)'}
                      </div>
                      
                      {/* Pildoras de fases */}
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <div className="status-badge" style={{ backgroundColor: r.diagnostico ? '#dbeafe' : '#f3f4f6', color: r.diagnostico ? '#1e40af' : '#9ca3af' }} title={r.diagnostico ? 'Diagnóstico Anexado' : 'Sin Diagnóstico'}>
                          <Database size={12} /> Diag
                        </div>
                        <div className="status-badge" style={{ backgroundColor: r.mantenimiento ? '#fae8ff' : '#f3f4f6', color: r.mantenimiento ? '#86198f' : '#9ca3af' }} title={r.mantenimiento ? 'Mantenimiento Ejecutado' : 'Sin Mantenimiento'}>
                          <Wrench size={12} /> Mant
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Asignación">
                    <span className="specs-text">Técnico ID: {r.id_usuario}</span>
                  </td>
                  <td data-label="Acciones">
                    <button className="btn-icon btn-edit" title="Gestionar Expediente" onClick={() => openModal(r)}>
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================================================== */}
        {/* MODAL MULTI-TABS DE EXPEDIENTE */}
        {/* ============================================================== */}
        {isModalOpen && currentEvent && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
              
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ marginBottom: '0.2rem' }}>Expediente Folio #{currentEvent.id_evento}</h3>
                  {isReadOnly && <span className="status-badge" style={{ backgroundColor: '#bbf7d0', color: '#166534' }}><ShieldCheck size={12} /> Documento Sellado (Solo Lectura)</span>}
                </div>
                <button type="button" className="btn-close-modal" onClick={closeModal}><X size={24} /></button>
              </div>

              {/* TABS SUPERIORES */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('EVENTO')} 
                  style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab==='EVENTO' ? '3px solid #504b38' : '3px solid transparent', fontWeight: activeTab==='EVENTO' ? 700 : 500, color: activeTab==='EVENTO' ? '#504b38' : '#6b7280', cursor: 'pointer' }}
                >
                  <AlertCircle size={16} style={{ display: 'inline', marginBottom: '-3px', marginRight: '6px' }} /> 1. Falla / Evento
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('DIAGNOSTICO')} 
                  style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab==='DIAGNOSTICO' ? '3px solid #504b38' : '3px solid transparent', fontWeight: activeTab==='DIAGNOSTICO' ? 700 : 500, color: activeTab==='DIAGNOSTICO' ? '#504b38' : '#6b7280', cursor: 'pointer' }}
                >
                  <Activity size={16} style={{ display: 'inline', marginBottom: '-3px', marginRight: '6px' }} /> 2. Diagnóstico Técnico
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveTab('MANTENIMIENTO')} 
                  style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab==='MANTENIMIENTO' ? '3px solid #504b38' : '3px solid transparent', fontWeight: activeTab==='MANTENIMIENTO' ? 700 : 500, color: activeTab==='MANTENIMIENTO' ? '#504b38' : '#6b7280', cursor: 'pointer' }}
                >
                  <Wrench size={16} style={{ display: 'inline', marginBottom: '-3px', marginRight: '6px' }} /> 3. Mantenimiento Final
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="modal-form">
                <div className="modal-body" style={{ minHeight: '320px' }}>

                  {/* VISTA 1: EVENTO / FALLA INICIAL */}
                  {activeTab === 'EVENTO' && (
                    <div className="fade-in-tab">
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Reporte general del incidente y estado en el que se entregó el hardware al departamento de sistemas.</p>
                      <div className="modal-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="input-group">
                          <label>Falla Reportada por el Usuario</label>
                          <textarea 
                            className="auth-input" 
                            rows={3} 
                            value={currentEvent.falla_reportada} 
                            disabled={isReadOnly || !isAdmin} 
                            onChange={(e) => setCurrentEvent({...currentEvent, falla_reportada: e.target.value})} 
                          />
                        </div>
                        <div className="input-group">
                          <label>Condición y Estado Físico de Recepción</label>
                          <textarea 
                            className="auth-input" 
                            rows={2} 
                            value={currentEvent.estado_fisico} 
                            disabled={isReadOnly || !isAdmin} 
                            placeholder="Abonado por el técnico de recepción inicial..."
                            onChange={(e) => setCurrentEvent({...currentEvent, estado_fisico: e.target.value})} 
                          />
                        </div>
                        {!isAdmin && !isReadOnly && (
                          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', gap: '0.8rem', color: '#b91c1c', fontSize: '0.85rem' }}>
                            <ShieldAlert size={18} style={{ flexShrink: 0 }} /> Por seguridad, como Técnico no puedes manipular las evidencias narrativas iniciales de la falla que ya registró este Evento. Ve a las pestañas de resolución.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VISTA 2: DIAGNOSTICO */}
                  {activeTab === 'DIAGNOSTICO' && (
                    <div className="fade-in-tab">
                      {currentEvent.diagnostico ? (
                        <>
                          <div className="modal-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <div className="input-group">
                              <label>Verdugo / Resultado Preliminar ExperBot</label>
                              <textarea 
                                className="auth-input" 
                                rows={3} 
                                value={currentEvent.diagnostico.resultado_preeliminar} 
                                disabled={isReadOnly} 
                                onChange={(e) => setCurrentEvent({...currentEvent, diagnostico: {...currentEvent.diagnostico, resultado_preeliminar: e.target.value}})} 
                              />
                            </div>
                            <div className="input-group">
                              <label>Validación en Sitio (Juicio del Técnico Humano)</label>
                              <textarea 
                                className="auth-input" 
                                rows={3} 
                                placeholder="Describe luego de tu inspección si concordó con Prolog o si localizaste otras deficiencias..."
                                value={currentEvent.diagnostico.validacion_tecnico} 
                                disabled={isReadOnly} 
                                onChange={(e) => setCurrentEvent({...currentEvent, diagnostico: {...currentEvent.diagnostico, validacion_tecnico: e.target.value}})} 
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                          <Activity size={40} style={{ margin: '0 auto', color: '#d1d5db', marginBottom: '1rem' }} />
                          <h4 style={{ color: '#4b5563' }}>Sin Diagnóstico Registrado</h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Este evento se originó sin la asistencia del Sistema Experto.</p>
                          {isTecnico && !isReadOnly && (
                            <button type="button" className="btn-chat-action action-yes" onClick={() => setCurrentEvent({...currentEvent, diagnostico: { es_nuevo: true, resultado_preeliminar: 'Creado manual', validacion_tecnico: '', log_chatbot: null }})}>
                              + Aperturar Diagnóstico Manualmente
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* VISTA 3: MANTENIMIENTO */}
                  {activeTab === 'MANTENIMIENTO' && (
                    <div className="fade-in-tab">
                      {currentEvent.mantenimiento ? (
                        <>
                          <div className="modal-grid">
                            <div className="input-group select-group">
                              <label>Tipo de Intervención</label>
                              <div className="input-wrapper">
                                <Wrench className="input-icon" size={20} />
                                <select 
                                  className="auth-select" 
                                  value={currentEvent.mantenimiento.tipo} 
                                  disabled={isReadOnly}
                                  onChange={(e) => setCurrentEvent({...currentEvent, mantenimiento: {...currentEvent.mantenimiento, tipo: e.target.value}})}
                                >
                                  <option value="Preventivo">Limpieza / Mantenimiento Preventivo</option>
                                  <option value="Correctivo">Reparación Severa / Sustitución de Piezas (Correctivo)</option>
                                </select>
                              </div>
                            </div>
                            <div className="input-group">
                              <label>Fecha de Disposición / Entrega</label>
                              <div className="input-wrapper">
                                <Calendar className="input-icon" size={20} />
                                <input 
                                  type="date" 
                                  className="auth-input" 
                                  style={{ paddingLeft: '3rem' }} 
                                  disabled={isReadOnly}
                                  value={currentEvent.mantenimiento.fecha_entrega ? currentEvent.mantenimiento.fecha_entrega.split('T')[0] : ''} 
                                  onChange={(e) => setCurrentEvent({...currentEvent, mantenimiento: {...currentEvent.mantenimiento, fecha_entrega: e.target.value}})} 
                                />
                              </div>
                            </div>
                          </div>
                          <div className="modal-grid" style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
                            <div className="input-group">
                              <label>Desarrollo y Descripción de los Trabajos Efectuados</label>
                              <textarea 
                                className="auth-input" 
                                rows={3} 
                                disabled={isReadOnly}
                                placeholder="Se destapó el equipo, se cambió pasta térmica..."
                                value={currentEvent.mantenimiento.descripcion_trabajo} 
                                onChange={(e) => setCurrentEvent({...currentEvent, mantenimiento: {...currentEvent.mantenimiento, descripcion_trabajo: e.target.value}})} 
                              />
                            </div>
                            <div className="input-group">
                              <label>Inventario de Repuestos o Piezas Reemplazadas (si aplica)</label>
                              <textarea 
                                className="auth-input" 
                                rows={2} 
                                disabled={isReadOnly}
                                placeholder="1x Memoria RAM DDR4 8GB..."
                                value={currentEvent.mantenimiento.piezas_reemplazadas} 
                                onChange={(e) => setCurrentEvent({...currentEvent, mantenimiento: {...currentEvent.mantenimiento, piezas_reemplazadas: e.target.value}})} 
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                          <Wrench size={40} style={{ margin: '0 auto', color: '#d1d5db', marginBottom: '1rem' }} />
                          <h4 style={{ color: '#4b5563' }}>Sin Actividades de Mantenimiento</h4>
                          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.5rem' }}>No se han documentado intervenciones definitivas para este Evento aún.</p>
                          {isTecnico && !isReadOnly && (
                            <button type="button" className="btn-chat-action action-yes" onClick={() => setCurrentEvent({...currentEvent, mantenimiento: { es_nuevo: true, tipo: 'Correctivo', descripcion_trabajo: '', piezas_reemplazadas: '', fecha_entrega: '' }})}>
                              + Asentar Nuevo Mantenimiento
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* BOTONERA INFERIOR UNIFIED */}
                <div className="modal-footer" style={{ borderTop: '1px solid #e5e7eb', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  
                  {/* Boton especial de validacion para Tecnicos */}
                  <div>
                    {isTecnico && !isReadOnly && (
                      <button type="button" className="btn-chat-action action-no" style={{ backgroundColor: '#22c55e', color: 'white', borderColor: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleValidarEvento}>
                        <CheckCircle2 size={18} /> Aprobar y Validar Todo
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="btn-cancel" onClick={closeModal}>
                      Cancelar
                    </button>
                    
                    {!isReadOnly && (
                      <div style={{ width: '200px' }}>
                        <AuthButton type="submit" icon={isSaving ? Loader2 : Save} disabled={isSaving}>
                          {isSaving ? 'Aplicando...' : 'Guardar Cambios'}
                        </AuthButton>
                      </div>
                    )}
                  </div>

                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TechnicalRecord;
