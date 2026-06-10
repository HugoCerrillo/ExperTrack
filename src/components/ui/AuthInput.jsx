import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

{/*input que se reutiliza en las paginas
      diferentes antes de iniciar sesión*/}
export const AuthInput = ({ label, icon: Icon, type = 'text', name, value, onChange, placeholder, required = true, ...props }) => {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  // Determinar el tipo de input actual
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`${isPassword ? 'has-toggle' : ''} ${props.className || ''}`.trim()}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

