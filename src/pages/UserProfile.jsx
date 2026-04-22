import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Lock, Save, Shield, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import { useUserProfile } from '../hooks/back_user_profile';
import Swal from 'sweetalert2';
import '../assets/styles/profile.css';

const UserProfile = () => {
  const { profile, loading, fetchProfile, updateProfile } = useUserProfile();

  //estado local para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    correo: '',
    contrasena: ''
  });

  //cargamos el perfil al entrar
  useEffect(() => {
    const load = async () => {
      await fetchProfile();
    };
    load();
  }, [fetchProfile]);

  //sincronizamos el formulario cuando el perfil se cargue
  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellidoPaterno: profile.apellido_paterno || profile.apellidoPaterno || '',
        apellidoMaterno: profile.apellido_materno || profile.apellidoMaterno || '',
        telefono: profile.telefono || '',
        correo: profile.correo || '',
        contrasena: ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    //bloqueamos letras en caso del teléfono
    if (e.target.name === 'telefono') {
      const rawValue = e.target.value.replace(/[^0-9]/g, '');
      if (rawValue.length > 10) return;
      setFormData({ ...formData, telefono: rawValue });
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const success = await updateProfile(formData);
    if (success) {
      setFormData(prev => ({ ...prev, contrasena: '' }));
    }
  };

  if (loading && !profile) {
    return (
      <DashboardLayout headerTitle="Mi Perfil">
        <div className="profile-loading-box">
          <Loader2 size={48} className="spin-icon" color="#504b38" />
          <p className="profile-loading-text">Cargando perfil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle="Mi Perfil">
      <div className="profile-container">

        {/*cabecera*/}
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            <User size={48} color="#FFFFFF" strokeWidth={1.5} />
          </div>
          <div className="profile-info-text">
            <h2 className="profile-name">{formData.nombre} {formData.apellidoPaterno}</h2>
            <p className="profile-role">
              <Shield size={14} className="profile-role-icon" />
              Cuenta {profile?.rol || 'Usuario'}
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

            {/*guardar*/}
            <div className="profile-form-footer">
              <div className="profile-action-btn-wrapper">
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
