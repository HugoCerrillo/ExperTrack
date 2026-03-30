import React from 'react';
import sepLogo from '../../assets/img/sep.png';
import tecnmLogo from '../../assets/img/tecnm.jpg';
import itlLogo from '../../assets/img/itl.png';

export const InstitutionalHeader = () => {
  return (
    <header className="institutional-header">
      {/* Contenedor de logos alineados a la izquierda */}
      <div className="header-logos-container">
        <img 
          src={sepLogo} 
          alt="Secretaría de Educación Pública" 
          className="header-logo sep-logo" 
        />
        <img 
          src={tecnmLogo} 
          alt="Tecnológico Nacional de México" 
          className="header-logo tecnm-logo" 
        />
        <img 
          src={itlLogo} 
          alt="Instituto Tecnológico de La Laguna" 
          className="header-logo itl-logo" 
        />
      </div>
    </header>
  );
};
