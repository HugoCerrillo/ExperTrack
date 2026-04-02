import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Save, Shield } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import '../assets/styles/profile.css'; 

const UserProfile = () => {
  // Estado local para los campos (Próximamente se precargarán desde AWS)
  const [formData, setFormData] = useState({
    nombre: 'Administrador',
    apellidoPaterno: 'Del',
    apellidoMaterno: 'Sistema',
    telefono: '8711002233',
    correo: 'admin@expertrack.com',
    contrasena: '' // Se deja vacío intencionalmente por seguridad
  });

  const handleChange = (e) => {
    // Bloquear letras en caso del teléfono (igual que en registro)
    if (e.target.name === 'telefono') {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        if (rawValue.length > 10) return;
        setFormData({ ...formData, telefono: rawValue });
        return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Aquí conectaremos a la API de Flask posteriormente
    console.log("Comenzando actualización de perfil:", formData);
  };

  return (
    <DashboardLayout headerTitle="Mi Perfil">
      <div className="profile-container">
        
        {/* Cabecera Ilustrativa */}
        <div className="profile-header-card">
          <div className="profile-avatar-large">
             <User size={48} color="#FFFFFF" strokeWidth={1.5} />
          </div>
          <div className="profile-info-text">
            <h2 className="profile-name">{formData.nombre} {formData.apellidoPaterno}</h2>
            <p className="profile-role">
              <Shield size={14} style={{ display: 'inline', marginRight: '5px' }} />
              Cuenta Administrador
            </p>
          </div>
        </div>

        {/* Tarjeta de Edición Principal */}
        <div className="profile-card">
          <h3 className="profile-card-title">Información Personal</h3>
          <p className="profile-card-subtitle">Actualiza tus datos básicos y credenciales de acceso a ExperTrack.</p>

          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-grid">
              
              <AuthInput
                label="Nombre(s)"
                icon={User}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ingresa tu nombre"
                maxLength="50"
              />
              
              <AuthInput
                label="Apellido Paterno"
                icon={User}
                name="apellidoPaterno"
                value={formData.apellidoPaterno}
                onChange={handleChange}
                placeholder="Primer apellido"
                maxLength="50"
              />
              
              <AuthInput
                label="Apellido Materno"
                icon={User}
                name="apellidoMaterno"
                value={formData.apellidoMaterno}
                onChange={handleChange}
                placeholder="Segundo apellido (Opcional)"
                required={false}
                maxLength="50"
              />
              
              <AuthInput
                label="Teléfono Móvil"
                icon={Phone}
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="10 dígitos"
                maxLength="10"
              />

              <AuthInput
                label="Correo Electrónico"
                icon={Mail}
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="usuario@correo.com"
              />

              <div className="password-group">
                <AuthInput
                  label="Nueva Contraseña"
                  icon={Lock}
                  type="password"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required={false}
                />
                <p className="password-hint">Déjalo en blanco si no deseas cambiar tu contraseña actual.</p>
              </div>

            </div>

            {/* Guardar Cambios acomodado a la derecha */}
            <div className="profile-form-footer">
              <div style={{ width: '250px' }}>
                <AuthButton icon={Save}>
                  Guardar Cambios
                </AuthButton>
              </div>
            </div>

          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
