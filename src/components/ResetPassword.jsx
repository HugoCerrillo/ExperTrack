import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Key, ShieldCheck } from 'lucide-react';
import { AuthLayout } from './layout/AuthLayout';
import { AuthInput } from './ui/AuthInput';
import { AuthButton } from './ui/AuthButton';
import '../assets/styles/reset-password.css'; // Estilos totalmente separados

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = (e) => {
    e.preventDefault();
    console.log('Restableciendo contraseña:', { password, confirmPassword });
  };

  return (
    <AuthLayout 
      brandTitle="Restablecer Contraseña"
      brandSubtitle="Sistema de diagnóstico ExperTrack"
      showDivider={false}
    >
      <div className="reset-info-box">
        <ShieldCheck size={28} className="reset-info-icon" strokeWidth={1.5} />
        <p>Ingresa tu nueva contraseña entre 8-12 caracteres</p>
      </div>

      <form onSubmit={handleResetPassword} className="login-form reset-form-layout">
        
        <AuthInput 
          label="Nueva Contraseña"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
        />

        <AuthInput 
          label="Confirmar Contraseña"
          icon={Lock}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="********"
        />

        <div className="reset-btn-container">
          <AuthButton icon={Key}>
            Restablecer Contraseña
          </AuthButton>
        </div>

        <div className="register-link reset-back-link">
          <Link to="/">&lt;- Volver al inicio de sesión</Link>
        </div>

      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
