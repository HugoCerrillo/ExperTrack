import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthInput } from '../components/ui/AuthInput';
import { AuthButton } from '../components/ui/AuthButton';
import { useLogin } from '../hooks/back_login';

//pagina para iniciar sesion
const Login = () => {

  //recibimos los datos del hook correspondiente 
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin
  } = useLogin();

  return (
    <AuthLayout title="ACCESO AL SISTEMA">
      <form onSubmit={handleLogin} className="login-form">

        <AuthInput
          label="Correo electrónico"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@example.com"
        />

        <AuthInput
          label="Contraseña"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="*****************"
        />

        <div className="forgot-password">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </div>

        <AuthButton icon={LogIn}>
          Iniciar Sesión
        </AuthButton>

        <div className="register-link">
          <span>¿No tienes una cuenta? </span>
          <Link to="/register">Regístrate aquí</Link>
        </div>

      </form>
    </AuthLayout>
  );
};

export default Login;
