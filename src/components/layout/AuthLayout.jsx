import React from 'react';
import { Cpu, Wrench, ClipboardList, AlertCircle, PenTool } from 'lucide-react';
import { InstitutionalHeader } from '../common/InstitutionalHeader';
import '../../assets/styles/auth.css';
import experTrackLogo from '../../assets/img/ExperTrack.png';

export const AuthLayout = ({
  children,
  title = "ACCESO AL SISTEMA",
  brandTitle = "ExperTrack",
  brandSubtitle = '"Diagnóstico Inteligente, control absoluto"',
  showDivider = true
}) => {
  return (
    <div className="layout-wrapper">
      <InstitutionalHeader />
      <div className="login-container">

        {/*panel izquierdo que se reutiliza en todas
      las pantallas antes de iniciar sesión*/}
        <div className="panel left-panel">

          <div className="left-content">
            <h1 className="login-title">
              <span className="title-black">Control Total De</span>
              <span className="title-gray">Equipos De</span>
              <span className="title-black">Cómputo</span>
            </h1>

            <div className="options-grid">
              <div className="option-card hover-effect">
                <div className="icon-box icon-blue">
                  <Cpu size={20} strokeWidth={2} />
                </div>
                <span className="option-text">Diagnóstico con Sistema Experto</span>
              </div>

              <div className="option-card hover-effect">
                <div className="icon-box icon-tools">
                  <Wrench className="icon-wrench" size={18} strokeWidth={2.5} />
                  <PenTool className="icon-pen" size={18} strokeWidth={2.5} />
                </div>
                <span className="option-text">Mantenimiento Preventivo y Correctivo</span>
              </div>

              <div className="option-card hover-effect">
                <div className="icon-box icon-purple">
                  <ClipboardList size={26} strokeWidth={2} />
                </div>
                <span className="option-text">Inventario</span>
              </div>

              <div className="option-card hover-effect">
                <div className="icon-box icon-red">
                  <AlertCircle size={20} strokeWidth={2.5} />
                </div>
                <span className="option-text">Reportes</span>
              </div>
            </div>
          </div>

          <div className="left-footer">
            <p>© 2026 ExperTrack — Todos los derechos reservados</p>
          </div>
        </div>

        {/*panel derecho donde iran los formularios
        necesarios para login, register, recovery password
        y reset password */}
        <div className="panel right-panel">

          <div className="right-content">

            <div className="brand-header">
              <div className="logo-box">
                <img src={experTrackLogo} alt="ExperTrack Logo" className="main-logo-img" />
              </div>
              <h2>{brandTitle}</h2>
              <p>{brandSubtitle}</p>
            </div>

            {showDivider && (
              <div className="divider">
                <div className="line"></div>
                <span>{title}</span>
                <div className="line"></div>
              </div>
            )}

            {/*aqui se inyecta el formulario (login, register, recovery password, reset password) */}
            {children}

          </div>
        </div>
      </div>
    </div>
  );
};
