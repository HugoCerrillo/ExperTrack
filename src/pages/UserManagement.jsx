import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search, Shield, UserX, UserCheck, Wrench, Package, X, User, Mail, Phone, Lock, Save, RefreshCw, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import { useUserManagement } from '../hooks/back_user_management';
import '../assets/styles/users.css';

const UserManagement = () => {
  const { users, loading, fetchUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } = useUserManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newUser, setNewUser] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rol: 'Usuario Solicitante',
    estatus: true,
    telefono: '',
    correo: '',
    contrasena: ''
  });

  //modal de agregar usuario
  const openAddModal = () => setIsAddModalOpen(true);

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewUser({
      nombre: '', apellidoPaterno: '', apellidoMaterno: '',
      rol: 'Usuario Solicitante', estatus: true,
      telefono: '', correo: '', contrasena: ''
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await crearUsuario(newUser);
    setIsSaving(false);
    if (ok) closeAddModal();
  };

  //modal para editar usuario
  const handleEdit = (user) => {
    //cargamos los datos del usuario a editar con contraseña vacia por seguridad
    setEditingUser({ ...user, contrasena: '' });
  };

  const closeEditModal = () => setEditingUser(null);

  const saveEditChanges = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    //llamamos a la funcion actualizarUsuario del hook
    const success = await actualizarUsuario(editingUser.id, editingUser);
    setIsSaving(false);

    if (success) {
      closeEditModal();
    }
  };

  //eliminar usuario
  const handleDelete = async (id) => {
    await eliminarUsuario(id);
  };

  //iconos por rol
  const getRoleIcon = (rol) => {
    if (rol === 'Administrador') return <Shield size={14} />;
    if (rol === 'Técnico') return <Wrench size={14} />;
    return <Package size={14} />;
  };

  //filtro de busqueda en tiempo real
  const filteredUsers = users.filter(u =>
    `${u.nombre} ${u.apellidoPaterno} ${u.correo} ${u.rol}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  //mientras carga la tabla muestra skeleton
  const SkeletonRow = () => (
    <tr className="skeleton-row">
      {[...Array(5)].map((_, i) => (
        <td key={i}><div className="skeleton-cell" /></td>
      ))}
    </tr>
  );

  return (
    <DashboardLayout headerTitle="Gestión de Usuarios">
      <div className="users-container">

        {/*cabecera*/}
        <div className="users-header-actions">
          <div className="search-bar">
            <AuthInput
              icon={Search}
              type="text"
              placeholder="Buscar por nombre, correo o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required={false}
              label={false}
            />
          </div>
          <div className="users-actions-group">
            {/*boton para recargar datos*/}
            <button
              className="btn-refresh"
              onClick={fetchUsuarios}
              disabled={loading}
              title="Recargar lista desde el servidor"
            >
              {loading
                ? <Loader2 size={18} className="spin-icon" />
                : <RefreshCw size={18} />
              }
            </button>
            <button className="btn-add-user" onClick={openAddModal}>
              <Plus size={18} />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        {/*tabla de usuarios*/}
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario (Nombre e Info Básica)</th>
                <th>Privilegios (Rol)</th>
                <th>Medios de Contacto</th>
                <th>Estado del Perfil</th>
                <th>Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {/*mientras carga, mostramos un skeleton*/}
              {loading && [...Array(4)].map((_, i) => <SkeletonRow key={i} />)}

              {!loading && filteredUsers.map((user) => (
                <tr key={user.id}>
                  {/*columna usuario*/}
                  <td data-label="Usuario Completo">
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {(user.nombre || '?').charAt(0)}{(user.apellidoPaterno || '').charAt(0)}
                      </div>
                      <div className="user-details">
                        <span className="user-fullname">
                          {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/*columna rol*/}
                  <td data-label="Rol de Usuario">
                    <span className={`role-badge role-${user.rol.split(' ')[0].toLowerCase()}`}>
                      {getRoleIcon(user.rol)}
                      {user.rol}
                    </span>
                  </td>

                  {/*columna contacto*/}
                  <td data-label="Registro de Contacto">
                    <div className="contact-cell">
                      <span>{user.correo}</span>
                      <span className="contact-phone">Tel: {user.telefono}</span>
                    </div>
                  </td>

                  {/*columna estatus*/}
                  <td data-label="Estado">
                    <div className={`status-badge ${user.estatus ? 'status-active' : 'status-inactive'}`}>
                      {user.estatus ? <UserCheck size={14} /> : <UserX size={14} />}
                      {user.estatus ? 'Activo' : 'Suspendido / Baja'}
                    </div>
                  </td>

                  {/*columna acciones con botones de editar y eliminar*/}
                  <td data-label="Control de Acciones">
                    <div className="action-buttons">
                      <button className="btn-icon btn-edit" title="Editar cuenta" onClick={() => handleEdit(user)}>
                        <Edit size={18} />
                      </button>
                      <button className="btn-icon btn-delete" title="Eliminar cuenta permanentemente" onClick={() => handleDelete(user.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {/*estado vacio cuando la busqueda no da resultados*/}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="users-empty-row">
                    {users.length === 0
                      ? 'No hay usuarios registrados en el sistema.'
                      : 'No se encontraron registros que coincidan con la búsqueda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/*modal para editar usuario*/}
        {editingUser && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

              <div className="modal-header">
                <h3>Edición de Cuenta</h3>
                <button type="button" className="btn-close-modal" onClick={closeEditModal} title="Cerrar modal">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={saveEditChanges} className="modal-form">
                <div className="modal-body">
                  <div className="modal-grid">

                    <AuthInput label="Nombre(s)" icon={User} name="nombre"
                      value={editingUser.nombre}
                      onChange={(e) => setEditingUser({ ...editingUser, nombre: e.target.value })}
                      maxLength="50" />

                    <AuthInput label="Apellido Paterno" icon={User} name="apellidoPaterno"
                      value={editingUser.apellidoPaterno}
                      onChange={(e) => setEditingUser({ ...editingUser, apellidoPaterno: e.target.value })}
                      maxLength="50" />

                    <AuthInput label="Apellido Materno" icon={User} name="apellidoMaterno"
                      value={editingUser.apellidoMaterno}
                      onChange={(e) => setEditingUser({ ...editingUser, apellidoMaterno: e.target.value })}
                      maxLength="50" required={false} />

                    <div className="input-group select-group">
                      <label>Rol de Usuario</label>
                      <div className="input-wrapper">
                        <Shield className="input-icon" size={20} />
                        <select className="auth-select" value={editingUser.rol}
                          onChange={(e) => setEditingUser({ ...editingUser, rol: e.target.value })}>
                          <option value="Administrador">Administrador</option>
                          <option value="Técnico">Técnico</option>
                          <option value="Usuario Solicitante">Usuario Solicitante</option>
                        </select>
                      </div>
                    </div>

                    <AuthInput label="Teléfono de Contacto" type="tel" icon={Phone} name="telefono"
                      value={editingUser.telefono}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        if (rawValue.length <= 10) setEditingUser({ ...editingUser, telefono: rawValue });
                      }} />

                    <AuthInput label="Correo Electrónico" type="email" icon={Mail} name="correo"
                      value={editingUser.correo}
                      onChange={(e) => setEditingUser({ ...editingUser, correo: e.target.value })} />

                    <AuthInput label="Contraseña" type="password" icon={Lock} name="contrasena"
                      value={editingUser.contrasena}
                      onChange={(e) => setEditingUser({ ...editingUser, contrasena: e.target.value })}
                      required={false}
                      placeholder="Déjala en blanco para NO cambiarla" />

                    <div className="input-group select-group">
                      <label>Estado</label>
                      <div className="input-wrapper">
                        <UserCheck className="input-icon" size={20} />
                        <select className="auth-select"
                          value={editingUser.estatus ? "true" : "false"}
                          onChange={(e) => setEditingUser({ ...editingUser, estatus: e.target.value === 'true' })}>
                          <option value="true">Activo y Autorizado</option>
                          <option value="false">Dado de Baja / Congelado</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeEditModal}>
                    Cancelar y Descartar Cambios
                  </button>
                  <div className="modal-save-wrapper">
                    <AuthButton type="submit" icon={isSaving ? Loader2 : Save} disabled={isSaving}>
                      {isSaving ? 'Guardando...' : 'Actualizar Servidor'}
                    </AuthButton>
                  </div>
                </div>
              </form>

            </div>
          </div>
        )}

        {/*modal para agregar nuevo usuario*/}
        {isAddModalOpen && (
          <div className="modal-overlay" onClick={closeAddModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Registrar Nuevo Usuario</h3>
                <button type="button" className="btn-close-modal" onClick={closeAddModal} title="Cerrar modal">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="modal-form">
                <div className="modal-body">
                  <div className="modal-grid">

                    <AuthInput label="Nombre(s)" icon={User} name="nombre"
                      value={newUser.nombre}
                      onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                      maxLength="50" />

                    <AuthInput label="Apellido Paterno" icon={User} name="apellidoPaterno"
                      value={newUser.apellidoPaterno}
                      onChange={(e) => setNewUser({ ...newUser, apellidoPaterno: e.target.value })}
                      maxLength="50" />

                    <AuthInput label="Apellido Materno" icon={User} name="apellidoMaterno"
                      value={newUser.apellidoMaterno}
                      onChange={(e) => setNewUser({ ...newUser, apellidoMaterno: e.target.value })}
                      maxLength="50" required={false} />

                    <div className="input-group select-group">
                      <label>Rol de Usuario</label>
                      <div className="input-wrapper">
                        <Shield className="input-icon" size={20} />
                        <select className="auth-select" value={newUser.rol}
                          onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}>
                          <option value="Usuario Solicitante">Usuario Solicitante</option>
                          <option value="Técnico">Técnico</option>
                          <option value="Administrador">Administrador</option>
                        </select>
                      </div>
                    </div>

                    <AuthInput label="Teléfono de Contacto" type="tel" icon={Phone} name="telefono"
                      value={newUser.telefono}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        if (rawValue.length <= 10) setNewUser({ ...newUser, telefono: rawValue });
                      }} />

                    <AuthInput label="Correo Electrónico" type="email" icon={Mail} name="correo"
                      value={newUser.correo}
                      onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })} />

                    <AuthInput label="Contraseña de Acceso" type="password" icon={Lock} name="contrasena"
                      value={newUser.contrasena}
                      onChange={(e) => setNewUser({ ...newUser, contrasena: e.target.value })}
                      placeholder="Asigna una contraseña inicial..." />

                    <div className="input-group select-group">
                      <label>Estado</label>
                      <div className="input-wrapper">
                        <UserCheck className="input-icon" size={20} />
                        <select className="auth-select"
                          value={newUser.estatus ? "true" : "false"}
                          onChange={(e) => setNewUser({ ...newUser, estatus: e.target.value === 'true' })}>
                          <option value="true">Activo y Autorizado</option>
                          <option value="false">Dado de Baja / Congelado</option>
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeAddModal}>
                    Cancelar Registro
                  </button>
                  <div className="modal-save-wrapper">
                    <AuthButton type="submit" icon={isSaving ? Loader2 : Plus} disabled={isSaving}>
                      {isSaving ? 'Creando...' : 'Crear Cuenta'}
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

export default UserManagement;
