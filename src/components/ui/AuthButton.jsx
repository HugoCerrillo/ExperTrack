import React from 'react';

export const AuthButton = ({ children, onClick, type = 'submit', icon: Icon }) => {
  return (
    <button type={type} onClick={onClick} className="btn-submit">
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};
