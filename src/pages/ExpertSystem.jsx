import React, { useEffect, useRef } from 'react';
import { Send, BrainCircuit, User, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import '../assets/styles/expert-system.css';
import { useExpertSystem } from '../hooks/back_expert_system';

const ExpertSystem = () => {
  const {
    availableAssets,
    loadingAssets,
    sintomasValidos,
    messages,
    inputMessage,
    setInputMessage,
    isTyping,
    chatState,
    messagesEndRef,
    handleAssetSelect,
    handleSymptomSelect,
    handleLogicAnswer,
    handleSendMessage,
    resetDiagnosticSession
  } = useExpertSystem();

  const chatBodyRef = useRef(null);

  // Manipulación aislada del contenedor para evitar el salto de ventana Chrome
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => scrollToBottom(), [messages, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout headerTitle="Sistema Experto (Diagnósticos)">
      <div className="chat-container">

        {/* Banner o Cabecera Fija */}
        <div className="chat-header">
          <div className="chat-header-icon">
            <BrainCircuit size={24} />
          </div>
          <div className="chat-header-info">
            <h3>ExperBot - Inferencia en Tiempo Real</h3>
            <p>Arquitectura Prolog</p>
          </div>
          <button onClick={resetDiagnosticSession} className="btn-chat-action" style={{ marginLeft: 'auto' }} title="Limpiar y Reiniciar">
            <RefreshCw size={16} /> Reiniciar
          </button>
        </div>

        {/* Zona Scrollable de Conversación */}
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'bot' ? <BrainCircuit size={18} /> : <User size={18} />}
              </div>

              <div className="message-content" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>

                {/* INYECCIÓN DINÁMICA DE BOTONES PARA MÁQUINA DE ESTADOS */}
                {msg.showOptions === 'EQUIPO' && (
                  <div className="chat-action-buttons" style={{ flexDirection: 'column', gap: '0.6rem' }}>
                    <select 
                      className="auth-select" 
                      id="asset-dropdown"
                      style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--color-khaki)', backgroundColor: '#fff', color: 'var(--color-olive-dark)' }}
                      defaultValue=""
                    >
                      {loadingAssets ? (
                        <option value="" disabled>Conectando con DB de Activos...</option>
                      ) : (
                        <>
                          <option value="" disabled>-- Selecciona un Activo del Sistema --</option>
                          {availableAssets.map(asset => (
                            <option key={asset.id_equipo} value={asset.codigo_inventario}>
                              {asset.codigo_inventario} - {asset.marca} {asset.modelo} ({asset.tipo_equipo})
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <button 
                      className="btn-chat-action action-yes" 
                      style={{ alignSelf: 'flex-start' }}
                      onClick={() => {
                        const selector = document.getElementById('asset-dropdown');
                        if (selector.value) handleAssetSelect(selector.value);
                      }}
                    >
                      Confirmar Equipo
                    </button>
                  </div>
                )}

                {/* SÍNTOMA SELECCIONABLE */}
                {msg.showOptions === 'SINTOMA' && (
                  <div className="chat-action-buttons" style={{ flexDirection: 'column', gap: '0.6rem' }}>
                    <select 
                      className="auth-select" 
                      id="symptom-dropdown"
                      style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--color-khaki)', backgroundColor: '#fff', color: 'var(--color-olive-dark)' }}
                      defaultValue=""
                    >
                      <option value="" disabled>-- Selecciona un Patrón General --</option>
                      {sintomasValidos.length === 0 && <option value="" disabled>Cargando síntomas...</option>}
                      {sintomasValidos.map(sint => (
                        <option key={sint.clave} value={sint.clave}>
                          • {sint.descripcion}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="btn-chat-action action-yes" 
                      style={{ alignSelf: 'flex-start' }}
                      onClick={() => {
                        const selector = document.getElementById('symptom-dropdown');
                        if (selector.value) handleSymptomSelect(selector.value);
                      }}
                    >
                      Reportar Problema
                    </button>
                  </div>
                )}

                {msg.showOptions === 'SI_NO' && (
                  <div className="chat-action-buttons">
                    <button className="btn-chat-action action-yes" onClick={() => handleLogicAnswer('si')}>Sí, correcto</button>
                    <button className="btn-chat-action action-no" onClick={() => handleLogicAnswer('no')}>No, no es así</button>
                  </div>
                )}

                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {/* Render Condicional de Carga (Tres Puntitos Bot) */}
          {isTyping && (
            <div className="chat-message bot">
              <div className="message-avatar">
                <BrainCircuit size={18} />
              </div>
              <div className="message-content">
                <div className="message-bubble typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer Bloqueado Abajo */}
        <div className="chat-footer">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder={
                chatState === 'ASKING_TIPO' ? '↑ Utiliza el selector de equipos arriba...' :
                chatState === 'ASKING_SINTOMA' ? '↑ Selecciona una falla de la lista superior...' :
                chatState === 'IN_PROGRESS' ? '↑ Responde utilizando los botones Sí / No...' :
                chatState === 'ASKING_FINAL_DETAILS' ? 'Escribe aquí los detalles adicionales de la falla...' :
                chatState === 'DONE' ? 'Sesión terminada. Dale a Reiniciar para diagnosticar otro Activo.' :
                "Escribe y pulsa Enter..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={chatState !== 'ASKING_FINAL_DETAILS'} 
            />
          </div>
          <button 
            className="btn-send-message"
            onClick={handleSendMessage}
            disabled={chatState !== 'ASKING_FINAL_DETAILS' || !inputMessage.trim()}
            title={chatState === 'ASKING_FINAL_DETAILS' ? 'Enviar Reporte al Técnico' : 'Bloqueado temporalmente'}
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ExpertSystem;
