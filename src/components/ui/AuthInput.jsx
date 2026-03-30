import React from 'react';

{/* Input que se reutiliza en las paginas
      diferentes antes de iniciar sesión*/}
export const AuthInput = ({ label, icon: Icon, type = 'text', name, value, onChange, placeholder, required = true, ...props }) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      </div>
    </div>
  );
};
