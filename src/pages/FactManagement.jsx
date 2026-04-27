import React, { useState } from 'react';
import { Database, Search, Plus, Edit, Trash2, Tag, BrainCircuit, Activity, RefreshCw, FileDown, X, Monitor, Laptop, HelpCircle, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { useHechosManagement } from '../hooks/back_hechos_management';
import '../assets/styles/users.css';

const FactManagement = () => {
  const {
    sintomas, fallas, categorias, loading, 
    createCategoria, createSintomaConFalla, createFalla, descargarPrologBase
  } = useHechosManagement();

  const [activeTab, setActiveTab] = useState('SINTOMAS'); // 'SINTOMAS' o 'FALLAS'
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'CAT', 'SINTOMA', 'FALLA'

  // Form states
  const [catName, setCatName] = useState('');
  const [formData, setFormData] = useState({
    clave: '', descripcion: '', tipo_equipo: 'PC', categoria_id: '',
    pregunta_pista: '', diagnostico: '', recomendacion: '', sintoma_id: ''
  });

  const openModal = (mode) => {
    setModalMode(mode);
    setCatName('');
    setFormData({
      clave: '', descripcion: '', tipo_equipo: 'PC', categoria_id: '',
      pregunta_pista: '', diagnostico: '', recomendacion: '', sintoma_id: ''
    });
  };

  const closeModal = () => setModalMode(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    
    if (modalMode === 'CAT') {
      success = await createCategoria(catName);
    } else if (modalMode === 'SINTOMA') {
      success = await createSintomaConFalla(formData);
    } else if (modalMode === 'FALLA') {
      success = await createFalla(formData);
    }

    if (success) closeModal();
  };

  const filteredSintomas = sintomas.filter(s => 
    s.clave.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFallas = fallas.filter(f => 
    (f.diagnostico && f.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (f.sintoma_descripcion && f.sintoma_descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout headerTitle="Gestión de Hechos (Base de Conocimiento)">
      <div className="users-container">

        {/* Tab Selector de Categoría Lógica */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(80, 75, 56, 0.1)', paddingBottom: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('SINTOMAS')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                backgroundColor: activeTab === 'SINTOMAS' ? 'var(--color-olive-dark)' : 'transparent',
                color: activeTab === 'SINTOMAS' ? '#FFF' : 'var(--color-olive-dark)'
              }}
            >
              <Tag size={18} /> Diccionario de Síntomas
            </button>
            <button
              onClick={() => setActiveTab('FALLAS')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                backgroundColor: activeTab === 'FALLAS' ? 'var(--color-olive-dark)' : 'transparent',
                color: activeTab === 'FALLAS' ? '#FFF' : 'var(--color-olive-dark)'
              }}
            >
              <BrainCircuit size={18} /> Árbol de Inferencias
            </button>
          </div>
          
          <button onClick={descargarPrologBase} className="btn-chat-action action-yes" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', maxWidth: 'max-content' }}>
            <FileDown size={18} /> Descargar hechos.pl
          </button>
        </div>

        {/* Cabecera Interactiva */}
        <div className="users-header-actions" style={{ marginTop: '1.5rem' }}>
          <div className="search-bar" style={{ flex: '1 1 300px' }}>
            <AuthInput
              icon={Search}
              placeholder={activeTab === 'SINTOMAS' ? "Buscar por clave o descripción..." : "Buscar inferencia por diagnóstico..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required={false}
              label={false}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-add-user" style={{ backgroundColor: '#2563eb' }} onClick={() => openModal('CAT')}>
              <Plus size={20} /> Categoría
            </button>
            {activeTab === 'SINTOMAS' ? (
              <button className="btn-add-user" style={{ backgroundColor: '#504b38' }} onClick={() => openModal('SINTOMA')}>
                <Plus size={20} /> Nuevo Síntoma Inicial
              </button>
            ) : (
              <button className="btn-add-user" style={{ backgroundColor: '#504b38' }} onClick={() => openModal('FALLA')}>
                <Plus size={20} /> Nueva Inferencia (Falla)
              </button>
            )}
          </div>
        </div>

        {/* Tabla Robusta Condicional */}
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              {activeTab === 'SINTOMAS' ? (
                <tr>
                  <th>Clave Única Lenguaje</th>
                  <th>Descripción del Síntoma (Mostrado a usuario)</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              ) : (
                <tr>
                  <th>Contexto (Equipo / Categoría)</th>
                  <th>Síntoma Raíz</th>
                  <th>Veredicto (Diagnóstico y Solución)</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'SINTOMAS' ? (
                filteredSintomas.map((sintoma) => (
                  <tr key={sintoma.id}>
                    <td data-label="Clave">
                      <div className="contact-cell">
                        <span style={{ fontWeight: '600', color: 'var(--color-olive-dark)' }}>{sintoma.clave}</span>
                      </div>
                    </td>
                    <td data-label="Descripción">
                      <div className="contact-cell">
                        <span style={{ color: '#4b5563' }}>{sintoma.descripcion}</span>
                      </div>
                    </td>
                    <td data-label="Acciones">
                      <div className="action-buttons">
                        <button className="btn-icon btn-edit" title="Editar (No disponible)" disabled style={{ opacity: 0.5 }}>
                          <Edit size={18} />
                        </button>
                        <button className="btn-icon btn-delete" title="Borrar (No disponible)" disabled style={{ opacity: 0.5 }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredFallas.map((falla) => (
                  <tr key={falla.id}>
                    <td data-label="Contexto">
                      <div className="contact-cell">
                        <span className={`role-badge ${falla.tipo_equipo === 'Laptop' ? 'role-técnico' : 'role-administrador'}`} style={{ display: 'inline-block', width: 'max-content', marginBottom: '4px' }}>
                          {falla.tipo_equipo}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Cat: {falla.categoria_nombre}</span>
                      </div>
                    </td>
                    <td data-label="Síntoma Raíz">
                      <div className="contact-cell">
                        <span style={{ fontWeight: '600' }}><Tag size={14} style={{ display: 'none' }} /> {falla.sintoma_descripcion}</span>
                        <span style={{ fontSize: '0.8rem', color: '#8b5cf6', marginTop: '4px' }}>Q: {falla.pregunta_pista}</span>
                      </div>
                    </td>
                    <td data-label="Veredicto Final">
                      <div className="contact-cell" style={{ whiteSpace: 'normal', maxWidth: '400px' }}>
                        <span style={{ fontWeight: '600', color: '#111827' }}>D: {falla.diagnostico}</span>
                        <span style={{ color: '#059669', marginTop: '4px' }}>R: {falla.recomendacion}</span>
                      </div>
                    </td>
                    <td data-label="Acciones">
                      <div className="action-buttons">
                        <button className="btn-icon btn-edit" title="Editar (No disponible)" disabled style={{ opacity: 0.5 }}>
                          <Edit size={18} />
                        </button>
                        <button className="btn-icon btn-delete" title="Borrar (No disponible)" disabled style={{ opacity: 0.5 }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              
              {/* Fallback visual vacio */}
              {(activeTab === 'SINTOMAS' && filteredSintomas.length === 0) || (activeTab === 'FALLAS' && filteredFallas.length === 0) ? (
                <tr>
                  <td colSpan={activeTab === 'SINTOMAS' ? "3" : "4"} style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    <Database size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>No se encontraron registros en la base de conocimientos.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* MODALES MULTIPROPOSITO */}
        {modalMode && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: modalMode === 'CAT' ? '400px' : '750px' }}>
              <div className="modal-header">
                <h3>
                  {modalMode === 'CAT' && 'Nueva Categoría de Diagnóstico'}
                  {modalMode === 'SINTOMA' && 'Registrar Síntoma Inicial y Primera Regla'}
                  {modalMode === 'FALLA' && 'Añadir Nueva Inferencia (Regla)'}
                </h3>
                <button type="button" className="btn-close-modal" onClick={closeModal}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="modal-body">

                  {/* FORM: CATEGORIA */}
                  {modalMode === 'CAT' && (
                    <div className="input-group">
                      <label>Nombre de la Categoría</label>
                      <div className="input-wrapper">
                        <Tag className="input-icon" size={20} />
                        <input 
                          type="text" 
                          className="auth-input" 
                          style={{ paddingLeft: '3rem' }} 
                          placeholder="Ej. Problemas de Pantalla" 
                          required 
                          value={catName} 
                          onChange={(e) => setCatName(e.target.value)} 
                        />
                      </div>
                    </div>
                  )}

                  {/* FORMS: SINTOMA Y FALLA COMPARTEN MUCHOS CAMPOS */}
                  {(modalMode === 'SINTOMA' || modalMode === 'FALLA') && (
                    <>
                      {modalMode === 'SINTOMA' && (
                        <>
                          <h4 className="section-divider"><Tag size={20} /> 1. Datos del Síntoma Inicial (Raíz)</h4>
                          <div className="modal-grid">
                            <AuthInput 
                              label="Clave Única (Prolog)" icon={BrainCircuit} 
                              placeholder="ej. pantalla_rota (sin espacios)" required 
                              value={formData.clave} onChange={(e) => setFormData({...formData, clave: e.target.value})} 
                            />
                            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                              <label>Descripción Legible para el Usuario</label>
                              <textarea 
                                className="auth-input" rows={2} required 
                                placeholder="Ej. La pantalla está estrellada o no enciende."
                                value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} 
                              />
                            </div>
                          </div>
                          <h4 className="section-divider" style={{ marginTop: '1.5rem' }}><Activity size={20} /> 2. Falla Asociada (Obligatoria)</h4>
                          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>Todo síntoma debe tener al menos una vía de diagnóstico para que Prolog pueda operar.</p>
                        </>
                      )}

                      {modalMode === 'FALLA' && (
                        <>
                          <div className="input-group select-group" style={{ marginBottom: '1rem' }}>
                            <label>Síntoma Raíz Asociado</label>
                            <div className="input-wrapper">
                              <Tag className="input-icon" size={20} />
                              <select 
                                className="auth-select" required 
                                value={formData.sintoma_id} onChange={(e) => setFormData({...formData, sintoma_id: e.target.value})}
                              >
                                <option value="">Selecciona un síntoma existente...</option>
                                {sintomas.map(s => <option key={s.id} value={s.id}>{s.descripcion}</option>)}
                              </select>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="modal-grid">
                        <div className="input-group select-group">
                          <label>Tipo de Equipo Objetivo</label>
                          <div className="input-wrapper">
                            <Laptop className="input-icon" size={20} />
                            <select className="auth-select" value={formData.tipo_equipo} onChange={(e) => setFormData({...formData, tipo_equipo: e.target.value})}>
                              <option value="PC">Computadora de Escritorio (PC)</option>
                              <option value="Laptop">Portátil (Laptop)</option>
                            </select>
                          </div>
                        </div>

                        <div className="input-group select-group">
                          <label>Categoría Diagnóstica</label>
                          <div className="input-wrapper">
                            <Database className="input-icon" size={20} />
                            <select className="auth-select" required value={formData.categoria_id} onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}>
                              <option value="">Selecciona una categoría...</option>
                              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Pregunta Pista (Motor de Inferencia)</label>
                          <div className="input-wrapper">
                            <HelpCircle className="input-icon" size={20} style={{ top: '15px', transform: 'none' }} />
                            <textarea 
                              className="auth-input" rows={2} style={{ paddingLeft: '3rem' }} required 
                              placeholder="Ej. ¿Emitió algún sonido metálico antes de apagarse?"
                              value={formData.pregunta_pista} onChange={(e) => setFormData({...formData, pregunta_pista: e.target.value})} 
                            />
                          </div>
                        </div>

                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Diagnóstico Técnico (Veredicto)</label>
                          <div className="input-wrapper">
                            <Monitor className="input-icon" size={20} style={{ top: '15px', transform: 'none' }} />
                            <textarea 
                              className="auth-input" rows={2} style={{ paddingLeft: '3rem' }} required 
                              placeholder="Ej. Falla del disco duro por impacto o fatiga mecánica."
                              value={formData.diagnostico} onChange={(e) => setFormData({...formData, diagnostico: e.target.value})} 
                            />
                          </div>
                        </div>

                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                          <label>Recomendación / Solución Estándar</label>
                          <div className="input-wrapper">
                            <CheckCircle2 className="input-icon" size={20} style={{ top: '15px', transform: 'none' }} />
                            <textarea 
                              className="auth-input" rows={2} style={{ paddingLeft: '3rem' }} required 
                              placeholder="Ej. Reemplazar HDD por una unidad SSD y reinstalar el sistema operativo."
                              value={formData.recomendacion} onChange={(e) => setFormData({...formData, recomendacion: e.target.value})} 
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn-submit" disabled={loading}>Guardar en Prolog</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FactManagement;
