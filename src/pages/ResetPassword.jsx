import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Key, ShieldCheck, Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import { useResetPassword } from '../hooks/back_reset_password';
import Swal from 'sweetalert2';
import '../assets/styles/reset-password.css'; // Estilos totalmente separados

//pagina para restablecer la contraseña
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const { handleResetPassword, loading } = useResetPassword();

  // Redirigir inmediatamente si alguien entra a /reset-password sin url que contenga token
  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes un token válido para restablecer la contraseña.',
        confirmButtonColor: '#504b38'
      }).then(() => {
        navigate('/', { replace: true });
      });
    }
  }, [token, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseñas no coinciden',
        text: 'Por favor verifica que las contraseñas sean idénticas.',
        confirmButtonColor: '#504b38'
      });
      return;
    }
    
    await handleResetPassword(token, password);
  };

  // Evitar render formulario vacio si no hay token (esta redireccionando)
  if (!token) return null;

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

      <form onSubmit={onSubmit} className="login-form reset-form-layout">

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
          <AuthButton icon={loading ? Loader2 : Key} disabled={loading}>
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
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
