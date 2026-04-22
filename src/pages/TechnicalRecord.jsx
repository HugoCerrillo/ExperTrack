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
import '../assets/styles/technical-record.css';

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
        <div className="users-header-actions" style={{ flexDirection: 'column', gap: '1rem' }}>
          <div className="tr-search-container">
            <div className="tr-search-input-wrapper">
              <AuthInput
                icon={Search} type="text" placeholder="Buscar ticket o equipo..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} required={false} label={false}
              />
            </div>
            
            <div className="tr-filter-pill" title="Oculta los eventos que ya fueron validados y completados.">
              <input type="checkbox" checked={hideValidated} onChange={(e) => setHideValidated(e.target.checked)} />
              <span onClick={() => setHideValidated(!hideValidated)}>Ocultar Validados</span>
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
                  <td colSpan="5" className="tr-empty-state">
                    <Loader2 size={40} className="spin-icon" style={{ margin: '0 auto', color: '#504b38' }} />
                    <p style={{ marginTop: '1rem' }}>Sincronizando Expedientes...</p>
                  </td>
                </tr>
              )}

              {!loading && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="5" className="tr-empty-state">
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
              
              <div className="tr-modal-header">
                <div className="tr-modal-title-wrapper">
                  <h3 className="tr-modal-title">Expediente Folio #{currentEvent.id_evento}</h3>
                  {isReadOnly && <span className="status-badge tr-seal-badge"><ShieldCheck size={12} /> Documento Sellado (Solo Lectura)</span>}
                </div>
                <button type="button" className="btn-close-modal" onClick={closeModal} style={{ flexShrink: 0, marginTop: '-0.3rem' }}><X size={24} /></button>
              </div>

              {/* TABS SUPERIORES */}
              <div className="tr-tabs-container">
                <button 
                  type="button" onClick={() => setActiveTab('EVENTO')} 
                  className={`tr-tab-btn ${activeTab === 'EVENTO' ? 'active' : ''}`}
                >
                  <AlertCircle size={16} /> Falla
                </button>
                <button 
                  type="button" onClick={() => setActiveTab('DIAGNOSTICO')} 
                  className={`tr-tab-btn ${activeTab === 'DIAGNOSTICO' ? 'active' : ''}`}
                >
                  <Activity size={16} /> Diagnóstico
                </button>
                <button 
                  type="button" onClick={() => setActiveTab('MANTENIMIENTO')} 
                  className={`tr-tab-btn ${activeTab === 'MANTENIMIENTO' ? 'active' : ''}`}
                >
                  <Wrench size={16} /> Mantenimiento
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="modal-form">
                <div className="modal-body">

                  {/* VISTA 1: EVENTO / FALLA INICIAL */}
                  {activeTab === 'EVENTO' && (
                    <div className="fade-in-tab">
                      <p className="tr-tab-desc">Reporte general del incidente y estado en el que se entregó el hardware al departamento de sistemas.</p>
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
                          <div className="tr-alert-box">
                            <ShieldAlert size={18} /> Por seguridad, como Técnico no puedes manipular las evidencias narrativas iniciales de la falla que ya registró este Evento. Ve a las pestañas de resolución.
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
                        <div className="tr-no-data-box">
                          <Activity size={40} className="tr-no-data-icon" />
                          <h4 className="tr-no-data-title">Sin Diagnóstico Registrado</h4>
                          <p className="tr-tab-desc">Este evento se originó sin la asistencia del Sistema Experto.</p>
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
                        <div className="tr-no-data-box">
                          <Wrench size={40} className="tr-no-data-icon" />
                          <h4 className="tr-no-data-title">Sin Actividades de Mantenimiento</h4>
                          <p className="tr-tab-desc">No se han documentado intervenciones definitivas para este Evento aún.</p>
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
                <div className="tr-modal-footer">
                  
                  {/* Boton especial de validacion para Tecnicos */}
                  <div className="tr-footer-left">
                    {isTecnico && !isReadOnly && (
                      <button type="button" className="btn-chat-action tr-btn-validate" onClick={handleValidarEvento}>
                        <CheckCircle2 size={18} /> Aprobar y Validar Todo
                      </button>
                    )}
                  </div>

                  <div className="tr-footer-right">
                    <button type="button" className="btn-cancel tr-cancel-btn" onClick={closeModal}>
                      Cancelar
                    </button>
                    
                    {!isReadOnly && (
                      <div className="tr-save-btn-wrapper">
                        <AuthButton type="submit" icon={isSaving ? Loader2 : Save} disabled={isSaving}>
                          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
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
