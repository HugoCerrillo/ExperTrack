import React from 'react';

{/*boton que se reutiliza en las paginas
      diferentes antes de iniciar sesión*/}
export const AuthButton = ({ children, onClick, type = 'submit', icon: Icon }) => {
  return (
    <button type={type} onClick={onClick} className="btn-submit">
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};
