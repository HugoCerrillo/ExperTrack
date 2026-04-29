import React, { useEffect, useRef } from 'react';
import { Send, BrainCircuit, User, RefreshCw } from 'lucide-react'; //iconos de lucide-react
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

  //manipulacion para el scroll del chat
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
    //componente reutilizado de dashboard
    <DashboardLayout headerTitle="Sistema Experto (Diagnósticos)">
      <div className="chat-container">

        {/*cabecera del chat*/}
        <div className="chat-header">
          <div className="chat-header-icon">
            <BrainCircuit size={24} />
          </div>
          <div className="chat-header-info">
            <h3>ExperBot - Asistente de Diagnóstico</h3>
            <p>Diagnóstico inteligente de equipos</p>
          </div>
          <button onClick={resetDiagnosticSession} className="btn-chat-action btn-reset-chat" title="Limpiar y Reiniciar">
            <RefreshCw size={16} /> Reiniciar
          </button>
        </div>

        {/*zona para hacer scroll en el hatbot*/}
        <div className="chat-body" ref={chatBodyRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'bot' ? <BrainCircuit size={18} /> : <User size={18} />}
              </div>

              <div className="message-content msg-content-flex">
                <div className="message-bubble msg-bubble-pre">
                  {msg.text}
                </div>

                {/*insercion dinamica de botones*/}
                {msg.showOptions === 'EQUIPO' && (
                  <div className="chat-action-buttons chat-options-column">
                    <select
                      className="auth-select chat-select-custom"
                      id="asset-dropdown"
                      defaultValue=""
                    >
                      {loadingAssets ? (
                        <option value="" disabled>Conectando con Activos...</option>
                      ) : (
                        <>
                          <option value="" disabled>-- Selecciona un Activo disponible --</option>
                          {availableAssets.map(asset => (
                            <option key={asset.id_equipo} value={asset.codigo_inventario}>
                              {asset.codigo_inventario} - {asset.marca} {asset.modelo} ({asset.tipo_equipo})
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <button
                      className="btn-chat-action action-yes btn-chat-confirm"
                      onClick={() => {
                        const selector = document.getElementById('asset-dropdown');
                        if (selector.value) handleAssetSelect(selector.value);
                      }}
                    >
                      Confirmar Equipo
                    </button>
                  </div>
                )}

                {/*manifestacion de falla (sintoma) seleccionable*/}
                {msg.showOptions === 'SINTOMA' && (
                  <div className="chat-action-buttons chat-options-column">
                    <select
                      className="auth-select chat-select-custom"
                      id="symptom-dropdown"
                      defaultValue=""
                    >
                      <option value="" disabled>-- Selecciona una manifestación de falla --</option>
                      {sintomasValidos.length === 0 && <option value="" disabled>Cargando manifestación de falla...</option>}
                      {sintomasValidos.map(sint => (
                        <option key={sint.clave} value={sint.clave}>
                          • {sint.descripcion}
                        </option>
                      ))}
                      <option value="NO_FALLA">• No veo la falla de mi equipo en esta lista</option>
                    </select>
                    <button
                      className="btn-chat-action action-yes btn-chat-confirm"
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

          {/*render para el punto de carga del bot*/}
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

        {/*input del usuario bloqueado en la parte inferior*/}
        <div className="chat-footer">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder={
                chatState === 'ASKING_TIPO' ? '↑ Utiliza el selector de equipos arriba...' :
                  chatState === 'ASKING_SINTOMA' ? '↑ Selecciona una falla de la lista superior...' :
                    chatState === 'IN_PROGRESS' ? '↑ Responde utilizando los botones Sí / No...' :
                      chatState === 'ASKING_FINAL_DETAILS' ? 'Escribe aquí los detalles de la falla...' :
                        chatState === 'ASKING_ESTADO_FISICO' ? 'Describe el estado físico del equipo (ej. Golpes, rayones...)' :
                          chatState === 'DONE' ? 'Sesión terminada. Dale a Reiniciar para diagnosticar otro Activo.' :
                            "Escribe y pulsa Enter..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={chatState !== 'ASKING_FINAL_DETAILS' && chatState !== 'ASKING_ESTADO_FISICO'}
            />
          </div>
          <button
            className="btn-send-message"
            onClick={handleSendMessage}
            disabled={(chatState !== 'ASKING_FINAL_DETAILS' && chatState !== 'ASKING_ESTADO_FISICO') || !inputMessage.trim()}
            title={(chatState === 'ASKING_FINAL_DETAILS' || chatState === 'ASKING_ESTADO_FISICO') ? 'Enviar Reporte' : 'Bloqueado temporalmente'}
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ExpertSystem;
