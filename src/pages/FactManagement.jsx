import React, { useState } from 'react';
import { Database, Search, Plus, Edit, Trash2, Tag, BrainCircuit, Activity, RefreshCw, FileDown, X, Monitor, Laptop, HelpCircle, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { useHechosManagement } from '../hooks/back_hechos_management';
import '../assets/styles/users.css';
import '../assets/styles/fact-management.css';

const FactManagement = () => {
  const {
    sintomas, fallas, categorias, loading,
    createCategoria, createSintomaConFalla, createFalla, descargarPrologBase
  } = useHechosManagement();

  const [activeTab, setActiveTab] = useState('SINTOMAS'); // 'SINTOMAS' o 'FALLAS'
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'CAT', 'SINTOMA', 'FALLA'

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

        {/*menu de navegacion entre sintomas y fallas*/}
        <div className="fm-tab-header">
          <div className="fm-tab-group">
            <button
              onClick={() => setActiveTab('SINTOMAS')}
              className={`fm-tab-btn ${activeTab === 'SINTOMAS' ? 'active' : ''}`}
            >
              <Tag size={18} /> Diccionario de Síntomas
            </button>
            <button
              onClick={() => setActiveTab('FALLAS')}
              className={`fm-tab-btn ${activeTab === 'FALLAS' ? 'active' : ''}`}
            >
              <BrainCircuit size={18} /> Árbol de Inferencias
            </button>
          </div>

          <button onClick={descargarPrologBase} className="btn-chat-action action-yes btn-download-prolog">
            <FileDown size={18} /> Descargar hechos.pl
          </button>
        </div>

        {/*cabecera interactiva con buscador y botones para agregar*/}
        <div className="users-header-actions fm-header-actions-mt">
          <div className="search-bar fm-search-bar">
            <AuthInput
              icon={Search}
              placeholder={activeTab === 'SINTOMAS' ? "Buscar por clave o descripción..." : "Buscar inferencia por diagnóstico..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required={false}
              label={false}
            />
          </div>
          <div className="fm-btn-group">
            <button className="btn-add-user btn-add-cat" onClick={() => openModal('CAT')}>
              <Plus size={20} /> Categoría
            </button>
            <button className="btn-add-user btn-add-sintoma" onClick={() => openModal('SINTOMA')}>
              <Plus size={20} /> Nuevo Síntoma Inicial
            </button>
            <button className="btn-add-user btn-add-falla" onClick={() => openModal('FALLA')}>
              <Plus size={20} /> Nueva Inferencia (Falla)
            </button>
          </div>
        </div>

        {/*tabla dinamica para mostrar sintomas o fallas*/}
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              {activeTab === 'SINTOMAS' ? (
                <tr>
                  <th>Clave Única Lenguaje</th>
                  <th>Descripción del Síntoma (Mostrado a usuario)</th>
                </tr>
              ) : (
                <tr>
                  <th>Contexto (Equipo / Categoría)</th>
                  <th>Síntoma Raíz</th>
                  <th>Veredicto (Diagnóstico y Solución)</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'SINTOMAS' ? (
                filteredSintomas.map((sintoma) => (
                  <tr key={sintoma.id}>
                    <td data-label="Clave">
                      <div className="contact-cell">
                        <span className="fm-clave-text">{sintoma.clave}</span>
                      </div>
                    </td>
                    <td data-label="Descripción">
                      <div className="contact-cell">
                        <span className="fm-desc-text">{sintoma.descripcion}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredFallas.map((falla) => (
                  <tr key={falla.id}>
                    <td data-label="Contexto">
                      <div className="contact-cell">
                        <span className={`role-badge fm-badge-inline ${falla.tipo_equipo === 'Laptop' ? 'role-técnico' : 'role-administrador'}`}>
                          {falla.tipo_equipo}
                        </span>
                        <span className="fm-cat-label">Cat: {falla.categoria_nombre}</span>
                      </div>
                    </td>
                    <td data-label="Síntoma Raíz">
                      <div className="contact-cell">
                        <span className="fm-sintoma-title">{falla.sintoma_descripcion}</span>
                        <span className="fm-question-text">Q: {falla.pregunta_pista}</span>
                      </div>
                    </td>
                    <td data-label="Veredicto Final">
                      <div className="contact-cell fm-verdict-cell">
                        <span className="fm-diag-text">D: {falla.diagnostico}</span>
                        <span className="fm-recom-text">R: {falla.recomendacion}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {/*msj si no hay registros*/}
              {(activeTab === 'SINTOMAS' && filteredSintomas.length === 0) || (activeTab === 'FALLAS' && filteredFallas.length === 0) ? (
                <tr>
                  <td colSpan={activeTab === 'SINTOMAS' ? "2" : "3"} className="fm-empty-state">
                    <Database size={40} className="fm-empty-icon" />
                    <p>No se encontraron registros en la base de conocimientos.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/*modales multiproposito */}
        {modalMode && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className={`modal-content ${modalMode === 'CAT' ? 'modal-content-sm' : 'modal-content-lg'}`} onClick={(e) => e.stopPropagation()}>
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

                  {/*form para categoria*/}
                  {modalMode === 'CAT' && (
                    <div className="input-group">
                      <label>Nombre de la Categoría</label>
                      <div className="input-wrapper">
                        <Tag className="input-icon" size={20} />
                        <input
                          type="text"
                          className="auth-input fm-input-padding"
                          placeholder="Ej. Problemas de Pantalla"
                          required
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/*forms para sintoma y falla*/}
                  {(modalMode === 'SINTOMA' || modalMode === 'FALLA') && (
                    <>
                      {modalMode === 'SINTOMA' && (
                        <>
                          <h4 className="section-divider"><Tag size={20} /> 1. Datos del Síntoma Inicial (Raíz)</h4>
                          <div className="modal-grid">
                            <AuthInput
                              label="Clave Única (Prolog)" icon={BrainCircuit}
                              placeholder="ej. pantalla_rota (sin espacios)" required
                              value={formData.clave} onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                            />
                            <div className="input-group input-group-full">
                              <label>Descripción Legible para el Usuario</label>
                              <div className="input-wrapper">
                                <textarea
                                  className="textarea-auth" required
                                  placeholder="Ej. La pantalla está estrellada o no enciende."
                                  value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                          <h4 className="section-divider"><Activity size={20} /> 2. Falla Asociada (Obligatoria)</h4>
                          <span className="section-hint">Todo síntoma debe tener al menos una vía de diagnóstico para que Prolog pueda operar.</span>
                        </>
                      )}

                      {modalMode === 'FALLA' && (
                        <>
                          <div className="input-group select-group fm-mb-1">
                            <label>Síntoma Raíz Asociado</label>
                            <div className="input-wrapper">
                              <Tag className="input-icon" size={20} />
                              <select
                                className="auth-select" required
                                value={formData.sintoma_id} onChange={(e) => setFormData({ ...formData, sintoma_id: e.target.value })}
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
                            <select className="auth-select" value={formData.tipo_equipo} onChange={(e) => setFormData({ ...formData, tipo_equipo: e.target.value })}>
                              <option value="PC">Computadora de Escritorio (PC)</option>
                              <option value="Laptop">Portátil (Laptop)</option>
                            </select>
                          </div>
                        </div>

                        <div className="input-group select-group">
                          <label>Categoría Diagnóstica</label>
                          <div className="input-wrapper">
                            <Database className="input-icon" size={20} />
                            <select className="auth-select" required value={formData.categoria_id} onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}>
                              <option value="">Selecciona una categoría...</option>
                              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="input-group input-group-full">
                          <label>Pregunta Pista (Motor de Inferencia)</label>
                          <div className="input-wrapper">
                            <HelpCircle className="icon-textarea" size={20} />
                            <textarea
                              className="textarea-auth textarea-with-icon" required
                              placeholder="Ej. ¿Emitió algún sonido metálico antes de apagarse?"
                              value={formData.pregunta_pista} onChange={(e) => setFormData({ ...formData, pregunta_pista: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-group input-group-full">
                          <label>Diagnóstico Técnico (Veredicto)</label>
                          <div className="input-wrapper">
                            <Monitor className="icon-textarea" size={20} />
                            <textarea
                              className="textarea-auth textarea-with-icon" required
                              placeholder="Ej. Falla del disco duro por impacto o fatiga mecánica."
                              value={formData.diagnostico} onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="input-group input-group-full">
                          <label>Recomendación / Solución Estándar</label>
                          <div className="input-wrapper">
                            <CheckCircle2 className="icon-textarea" size={20} />
                            <textarea
                              className="textarea-auth textarea-with-icon" required
                              placeholder="Ej. Reemplazar HDD por una unidad SSD y reinstalar el sistema operativo."
                              value={formData.recomendacion} onChange={(e) => setFormData({ ...formData, recomendacion: e.target.value })}
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
