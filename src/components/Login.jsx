import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { AuthLayout } from './layout/AuthLayout';
import { AuthInput } from './ui/AuthInput';
import { AuthButton } from './ui/AuthButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login intent:', { email, password });
  };

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
