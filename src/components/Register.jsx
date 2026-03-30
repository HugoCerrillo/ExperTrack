import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from './layout/AuthLayout';
import { AuthInput } from './ui/AuthInput';
import { AuthButton } from './ui/AuthButton';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    correo: '',
    contrasena: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log('Registro intent:', formData);
  };

  return (
    <AuthLayout 
      brandTitle="Crear Cuenta"
      brandSubtitle="Solicitud de acceso al sistema ExperTrack"
      showDivider={false}
    >
      <form onSubmit={handleRegister} className="login-form">
        
        <AuthInput 
          label="Nombre"
          icon={User}
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ingresa tu nombre"
        />

        <AuthInput 
          label="Apellido Paterno"
          icon={User}
          type="text"
          name="apellidoPaterno"
          value={formData.apellidoPaterno}
          onChange={handleChange}
          placeholder="Ingresa tu apellido"
        />

        <AuthInput 
          label="Apellido Materno"
          icon={User}
          type="text"
          name="apellidoMaterno"
          value={formData.apellidoMaterno}
          onChange={handleChange}
          placeholder="Ingresa tu apellido"
        />

        <AuthInput 
          label="Teléfono"
          icon={Phone}
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="10 dígitos"
        />

        <AuthInput 
          label="Correo electrónico"
          icon={Mail}
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          placeholder="ejemplo@correo.com"
        />

        <AuthInput 
          label="Contraseña"
          icon={Lock}
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="********"
        />

        <div style={{ marginTop: '0.75rem' }}>
          <AuthButton type="submit">
            Registrarse <ArrowRight size={20} />
          </AuthButton>
        </div>

        <div className="register-link" style={{ marginTop: '0.25rem' }}>
          <span>¿Ya tienes una cuenta? </span>
          <Link to="/">Iniciar Sesión</Link>
        </div>

      </form>
    </AuthLayout>
  );
};

export default Register;
