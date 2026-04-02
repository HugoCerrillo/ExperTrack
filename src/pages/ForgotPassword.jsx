import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';

import { useForgotPassword } from '../hooks/back_forgot_password';

//pagina para recuperar contraseña (enviar correo)
const ForgotPassword = () => {
  // Conectamos la interfaz visual con el "hook cerebro"
  const { email, setEmail, handleResetPassword, isLoading } = useForgotPassword();

  return (
    //reutilizamos el layout con otras propiedades
    <AuthLayout
      brandTitle="Recuperar Acceso"
      brandSubtitle="Sistema de diagnóstico ExperTrack"
      showDivider={false}
    >
      <div className="info-box">
        <ShieldCheck size={28} className="info-icon" strokeWidth={1.5} />
        <p>Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.</p>
      </div>

      <form onSubmit={handleResetPassword} className="login-form">
        <AuthInput
          label="Correo electrónico"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@example.com"
        />

        <div style={{ marginTop: '0.5rem' }}>
          <AuthButton icon={Send}>
            Enviar enlace de recuperación
          </AuthButton>
        </div>

        <div className="register-link" style={{ marginTop: '1rem' }}>
          <Link to="/">&lt;- Volver al inicio de sesión</Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
