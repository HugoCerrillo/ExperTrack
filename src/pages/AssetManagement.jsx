import React, { useState } from 'react';
import {
  Edit, Trash2, Plus, Search, MapPin,
  User as UserIcon, Barcode, Calendar, Laptop, Monitor, Tablet,
  Server, Cpu, HardDrive, ShieldCheck, X, Save, AlertCircle, CheckCircle2, XCircle, Tag, ClipboardList, Loader2, RefreshCw
} from 'lucide-react'; //importamos los iconos de lucide-react
import Swal from 'sweetalert2'; //importamos sweetalert2 para las alertas
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import { useAssetManagement } from '../hooks/back_asset_management';
import { useUserManagement } from '../hooks/back_user_management';
import '../assets/styles/users.css';
import '../assets/styles/assets-management.css';

//pagina para la gestion de activos
const AssetManagement = () => {

  const { assets, loading: loadingAssets, fetchEquipos, fetchEquipoDetalle, crearEquipo, actualizarEquipo, eliminarEquipo } = useAssetManagement();
  const { users } = useUserManagement(); // Para el dropdown de dueños

  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'ADD', 'EDIT', o null
  const [isSaving, setIsSaving] = useState(false);

  //estructura de datos para el modal que coincide con el backend
  const emptyAsset = {
    id_usuario: '', // ID Real de la tabla Usuario
    tipo_equipo: 'Laptop',
    marca: '',
    modelo: '',
    numero_serie: '',
    codigo_inventario: '',
    estado_operativo: 'Operativo',
    area: '',
    ubicacion: '',
    fecha_adquisicion: '',
    en_garantia: true,
    especificaciones: {
      sistema_operativo: '',
      procesador: '',
      ram: '',
      tipo_ram: 'DDR4',
      almacenamiento: '',
      almacenamiento_tipo: 'SSD'
    },
    perifericos: []
  };

  const [currentAsset, setCurrentAsset] = useState(emptyAsset);

  //funcion para abrir el modal de editar mediante la variable modalMode
  const openModal = async (mode, asset = null) => {
    if (mode === 'EDIT' && asset) {
      // Cargamos el detalle completo para obtener periféricos y specs vigentes
      const detail = await fetchEquipoDetalle(asset.id_equipo || asset.id);
      if (detail) {
        setCurrentAsset({
          ...detail.equipo,
          especificaciones: detail.especificacion || emptyAsset.especificaciones,
          perifericos: detail.perifericos || []
        });
      } else {
        // Fallback si falla el detalle
        setCurrentAsset({ ...asset, perifericos: [], especificaciones: emptyAsset.especificaciones });
      }
    } else {
      setCurrentAsset(emptyAsset);
    }
    setModalMode(mode);
  };

  //funcion para cerrar el modal
  const closeModal = () => {
    setModalMode(null);
    setCurrentAsset(emptyAsset);
  };

  //aqui abrimos el modal de agregar mediante la variable modalMode
  const handleSaveModal = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    let success = false;
    if (modalMode === 'ADD') {
      success = await crearEquipo(currentAsset);
    } else {
      // Para editar, el backend en Flask usa PUT /equipos/<id>
      success = await actualizarEquipo(currentAsset.id_equipo, currentAsset);
    }

    setIsSaving(false);
    if (success) closeModal();
  };

  const handleDelete = async (id) => {
    await eliminarEquipo(id);
  };

  // =========================================
  // Control Dinámico de Arreglo de Periféricos
  // =========================================
  const addPeripheral = () => {
    const updatedAsset = { ...currentAsset };
    updatedAsset.perifericos.push({ 
      tipo: 'Monitor', 
      marca: '', 
      numero_serie: '', 
      id_inventario_interno: '' // Antes decía codigo_inventario, por eso no se guardaba
    });
    setCurrentAsset(updatedAsset);
  };

  const removePeripheral = (index) => {
    const updatedAsset = { ...currentAsset };
    updatedAsset.perifericos.splice(index, 1);
    setCurrentAsset(updatedAsset);
  };

  const updatePeripheral = (index, field, value) => {
    const updatedAsset = { ...currentAsset };
    updatedAsset.perifericos[index][field] = value;
    setCurrentAsset(updatedAsset);
  };

  // Lógica Visual Helper
  const getTypeIcon = (tipo) => {
    if (tipo === 'Laptop') return <Laptop size={14} />;
    if (tipo === 'PC de Escritorio') return <Server size={14} />;
    return <Tablet size={14} />;
  };

  const filteredAssets = assets.filter(a =>
    `${a.codigo_inventario} ${a.marca} ${a.modelo} ${a.dueño}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  //aqui se renderiza la pagina de activos reutilizando componentes 
  return (
    <DashboardLayout headerTitle="Gestión de Activos">
      <div className="users-container">

        {/* Barra de Herramientas */}
        <div className="users-header-actions">
          <div className="search-bar">
            <AuthInput
              icon={Search} type="text" placeholder="Buscar por código, marca, modelo o dueño..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} required={false} label={false}
            />
          </div>
          <button className="btn-add-user" onClick={() => openModal('ADD')}>
            <Plus size={18} />
            <span>Registrar Nuevo Equipo</span>
          </button>
        </div>

        {/* Tabla Robusta */}
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Tipo</th>
                <th>Asignación y Ubicación</th>
                <th>Especificaciones (Actuales)</th>
                <th>Estatus Operativo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Pantalla de Carga */}
              {loadingAssets && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 size={40} className="spin-icon" style={{ margin: '0 auto', color: '#504b38' }} />
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Consultando Inventario en AWS...</p>
                  </td>
                </tr>
              )}

              {/* Filas Reales */}
              {!loadingAssets && filteredAssets.map((asset) => (
                <tr key={asset.id_equipo}>

                  {/* Celda Identificadora */}
                  <td data-label="Equipo">
                    <div className="user-details" style={{ fontWeight: '500' }}>
                      <span className="asset-main-title">{asset.codigo_inventario}</span>
                      <span className="asset-subtitle">{asset.marca} {asset.modelo}</span>
                      <span className="specs-text" style={{ fontSize: '0.75rem' }}>S/N: {asset.numero_serie}</span>
                    </div>
                  </td>

                  {/* Celda Tipo */}
                  <td data-label="Tipo de Equipo">
                    <span className={`asset-type-badge ${asset.tipo_equipo === 'Laptop' ? 'asset-type-laptop' : 'asset-type-pc'}`}>
                      {getTypeIcon(asset.tipo_equipo)}
                      {asset.tipo_equipo}
                    </span>
                  </td>

                  {/* Celda Asignación */}
                  <td data-label="Asignación Responsable">
                    <div className="contact-cell">
                      <span style={{ fontWeight: '700' }}><UserIcon size={14} style={{ display: 'none' }} /> {asset.dueño}</span>
                      <span className="contact-phone">{asset.area}</span>
                      <span className="specs-text">{asset.ubicacion}</span>
                    </div>
                  </td>

                  {/* Celda Specs Rápidas */}
                  <td data-label="Hardware Clave">
                    {/* Nota: El backend en el plural puede no traer las specs, 
                        pero agregaremos un fallback o verteremos datos básicos */}
                    <div className="contact-cell">
                      <span className="asset-main-title">{asset.tipo_equipo}</span>
                      <span className="specs-text">ID Propietario: {asset.id_usuario}</span>
                      <span className="specs-text">{asset.area}</span>
                    </div>
                  </td>

                  {/* Celda Integridad Operativa */}
                  <td data-label="Estado Operativo">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                      <div className={`status-badge ${asset.estado_operativo === 'Operativo' ? 'status-active' : 'status-inactive'}`}>
                        {asset.estado_operativo === 'Operativo' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {asset.estado_operativo}
                      </div>
                      <div className={`status-badge ${asset.en_garantia ? 'status-active' : 'status-inactive'}`} style={{ backgroundColor: asset.en_garantia ? '#fef08a' : '#f3f4f6', color: asset.en_garantia ? '#854d0e' : '#6b7280' }}>
                        {asset.en_garantia ? <ShieldCheck size={12} /> : <AlertCircle size={12} />}
                        {asset.en_garantia ? 'Garantía Vigente' : 'Sin Garantía'}
                      </div>
                    </div>
                  </td>

                  {/* Celda Acciones */}
                  <td data-label="Mantenimiento">
                    <div className="action-buttons">
                      <button className="btn-icon btn-edit" title="Ver / Editar Ficha" onClick={() => openModal('EDIT', asset)}>
                        <Edit size={18} />
                      </button>
                      <button className="btn-icon btn-delete" title="Retirar Activo" onClick={() => handleDelete(asset.id_equipo)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =========================================
            SÚPER MODAL DRY: (ALTA Y EDICIÓN DE EQUIPO CON RELACIONES)
        ========================================== */}
        {modalMode && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

              <div className="modal-header">
                <h3>{modalMode === 'ADD' ? 'Registrar Nuevo Equipo de Cómputo' : `Ficha Técnica Técnica: ${currentAsset.codigo_inventario}`}</h3>
                <button type="button" className="btn-close-modal" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="modal-form">
                <div className="modal-body">

                  {/* SECCIÓN 1: IDENTIFICACIÓN GENERAL */}
                  <h4 className="section-divider"><Barcode size={20} /> Identificación Institucional</h4>
                  <div className="modal-grid">
                    <AuthInput label="Código de Inventario" icon={Barcode} value={currentAsset.codigo_inventario} onChange={(e) => setCurrentAsset({ ...currentAsset, codigo_inventario: e.target.value })} />
                    <AuthInput label="Número de Serie (S/N)" icon={Barcode} value={currentAsset.numero_serie} onChange={(e) => setCurrentAsset({ ...currentAsset, numero_serie: e.target.value })} />

                    <div className="input-group select-group">
                      <label>Tipo de Autómata</label>
                      <div className="input-wrapper">
                        <Laptop className="input-icon" size={20} />
                        <select className="auth-select" value={currentAsset.tipo_equipo} onChange={(e) => setCurrentAsset({ ...currentAsset, tipo_equipo: e.target.value })}>
                          <option value="Laptop">Portátil (Laptop)</option>
                          <option value="PC de Escritorio">PC de Escritorio</option>
                          <option value="Servidor">Servidor Central</option>
                          <option value="Tablet">Tablet / Dispositivo Móvil</option>
                        </select>
                      </div>
                    </div>

                    <AuthInput label="Marca de Fábrica" icon={Tag} value={currentAsset.marca} onChange={(e) => setCurrentAsset({ ...currentAsset, marca: e.target.value })} />
                    <AuthInput label="Modelo Específico" icon={Monitor} value={currentAsset.modelo} onChange={(e) => setCurrentAsset({ ...currentAsset, modelo: e.target.value })} />
                    <AuthInput label="Fecha de Adquisición" type="date" icon={Calendar} value={currentAsset.fecha_adquisicion} onChange={(e) => setCurrentAsset({ ...currentAsset, fecha_adquisicion: e.target.value })} />
                  </div>

                  {/* SECCIÓN 2: LOCALIZACIÓN Y MANTENIMIENTO */}
                  <h4 className="section-divider"><MapPin size={20} /> Localización Física y Asignaciones</h4>
                  <div className="modal-grid">
                    <div className="input-group select-group">
                      <label>Dueño / Usuario Asignado</label>
                      <div className="input-wrapper">
                        <UserIcon className="input-icon" size={20} />
                        <select 
                          className="auth-select" 
                          value={currentAsset.id_usuario} 
                          onChange={(e) => setCurrentAsset({ ...currentAsset, id_usuario: e.target.value })}
                          required
                        >
                          <option value="">Selecciona un responsable...</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {u.nombre} {u.apellidoPaterno} ({u.rol})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <AuthInput label="Departamento / Área" icon={MapPin} value={currentAsset.area} onChange={(e) => setCurrentAsset({ ...currentAsset, area: e.target.value })} />
                    <AuthInput label="Ubicación Física Exacta" icon={MapPin} value={currentAsset.ubicacion} onChange={(e) => setCurrentAsset({ ...currentAsset, ubicacion: e.target.value })} placeholder="Piso 2, Cubículo 4" />

                    <div className="input-group select-group">
                      <label>Estatus del Hardware</label>
                      <div className="input-wrapper">
                        <ShieldCheck className="input-icon" size={20} />
                        <select className="auth-select" value={currentAsset.estado_operativo} onChange={(e) => setCurrentAsset({ ...currentAsset, estado_operativo: e.target.value })}>
                          <option value="Operativo">100% Operativo</option>
                          <option value="En Reparacion">En Reparación Correctiva</option>
                          <option value="Baja">Dado de Baja</option>
                        </select>
                      </div>
                    </div>

                    <div className="input-group select-group">
                      <label>Cobertura de Garantía Legal</label>
                      <div className="input-wrapper">
                        <ShieldCheck className="input-icon" size={20} />
                        <select className="auth-select" value={currentAsset.en_garantia ? "true" : "false"} onChange={(e) => setCurrentAsset({ ...currentAsset, en_garantia: e.target.value === 'true' })}>
                          <option value="true">Sí, Vigente de Fábrica</option>
                          <option value="false">No (Vencida o Anulada)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: ESPECIFICACIONES TÉCNICAS */}
                  <h4 className="section-divider"><Cpu size={20} /> Matriz de Especificaciones Internas (Vigentes)</h4>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>Al actualizar esto, el sistema versionará las specs antiguas de forma transparente por seguridad de auditoría.</p>

                  <div className="modal-grid">
                    <AuthInput label="Sistema Operativo Instalado" icon={Monitor} value={currentAsset.especificaciones.sistema_operativo} onChange={(e) => setCurrentAsset({ ...currentAsset, especificaciones: { ...currentAsset.especificaciones, sistema_operativo: e.target.value } })} />
                    <AuthInput label="Procesador (CPU Gen)" icon={Cpu} value={currentAsset.especificaciones.procesador} onChange={(e) => setCurrentAsset({ ...currentAsset, especificaciones: { ...currentAsset.especificaciones, procesador: e.target.value } })} />

                    <div className="input-group select-group">
                      <label>Generación Memoria RAM</label>
                      <div className="input-wrapper">
                        <HardDrive className="input-icon" size={20} />
                        <select className="auth-select" value={currentAsset.especificaciones.ram_tipo} onChange={(e) => setCurrentAsset({ ...currentAsset, especificaciones: { ...currentAsset.especificaciones, ram_tipo: e.target.value } })}>
                          <option value="DDR3">Arquitectura DDR3</option>
                          <option value="DDR4">Arquitectura DDR4</option>
                          <option value="DDR5">Arquitectura DDR5</option>
                          <option value="LPDDR">LPDDR (Soldada)</option>
                          <option value="Apple Silicon">Memoria Unificada</option>
                        </select>
                      </div>
                    </div>

                    <AuthInput label="Volumen de RAM Instalada" type="text" icon={HardDrive} value={currentAsset.especificaciones.ram} onChange={(e) => setCurrentAsset({ ...currentAsset, especificaciones: { ...currentAsset.especificaciones, ram: e.target.value } })} />

                    <div className="input-group select-group">
                      <label>Tecnología de Disco Principal</label>
                      <div className="input-wrapper">
                        <HardDrive className="input-icon" size={20} />
                        <select className="auth-select" value={currentAsset.especificaciones.almacenamiento_tipo} onChange={(e) => setCurrentAsset({ ...currentAsset, especificaciones: { ...currentAsset.especificaciones, almacenamiento_tipo: e.target.value } })}>
                          <option value="SSD">Estado Sólido (SSD SATA)</option>
                          <option value="SSD NVMe">SSD M.2 (NVMe Express)</option>
                          <option value="HDD">Disco Mecánico (HDD)</option>
                        </select>
                      </div>
                    </div>

                    <AuthInput label="Volumen del Disco Principal" type="text" icon={HardDrive} placeholder="Ej. 1TB o 512GB" value={currentAsset.especificaciones.almacenamiento} onChange={(e) => setCurrentAsset({ ...currentAsset, especificaciones: { ...currentAsset.especificaciones, almacenamiento: e.target.value } })} />
                  </div>

                  {/* SECCIÓN 4: ASIGNACIÓN DE PERIFÉRICOS (1 a N) */}
                  <h4 className="section-divider"><ClipboardList size={20} /> Periféricos y Accesorios Anexos</h4>
                  <div className="peripherals-wrapper">
                    {currentAsset.perifericos.map((p, index) => (
                      <div className="peripheral-card" key={index}>

                        <div className="peripheral-header">
                          <span>Accesorio #{index + 1}</span>
                          <button type="button" className="btn-remove-peripheral" onClick={() => removePeripheral(index)}>
                            <Trash2 size={16} /> Quitar Liga
                          </button>
                        </div>

                        <div className="peripheral-grid modal-grid">
                          <div className="input-group select-group">
                            <label>Clasificación del Modulo</label>
                            <div className="input-wrapper">
                              <Monitor className="input-icon" size={20} />
                              <select className="auth-select" value={p.tipo} onChange={(e) => updatePeripheral(index, 'tipo', e.target.value)}>
                                <option value="Monitor">Monitor Secundario</option>
                                <option value="Teclado">Teclado Alfanumérico</option>
                                <option value="Mouse">Ratón Óptico/Inalámbrico</option>
                                <option value="Dock Station">Docking Station / Hub</option>
                                <option value="Regulador">Regulador Eléctrico (UPS)</option>
                              </select>
                            </div>
                          </div>

                          <AuthInput label="Marca" icon={Tag} value={p.marca} onChange={(e) => updatePeripheral(index, 'marca', e.target.value)} />
                          <AuthInput label="Número de Serie Físico" icon={Barcode} value={p.numero_serie} onChange={(e) => updatePeripheral(index, 'numero_serie', e.target.value)} />
                          <AuthInput label="Placa de Inventario Interno" icon={Barcode} value={p.id_inventario_interno} onChange={(e) => updatePeripheral(index, 'id_inventario_interno', e.target.value)} required={false} />
                        </div>

                      </div>
                    ))}

                    <button type="button" className="btn-add-peripheral" onClick={addPeripheral}>
                      <Plus size={20} /> Acoplar Nuevo Periférico Físico
                    </button>
                  </div>

                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
                    Cancelar y Descartar Cambios
                  </button>
                  <div style={{ width: '250px' }}>
                    <AuthButton type="submit" icon={isSaving ? Loader2 : Save} disabled={isSaving}>
                      {isSaving ? 'Procesando...' : (modalMode === 'ADD' ? 'Registrar en Inventario' : 'Guardar Ficha Técnica')}
                    </AuthButton>
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

export default AssetManagement;
