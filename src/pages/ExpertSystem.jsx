import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, User, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import '../assets/styles/expert-system.css';

const API_URL = 'http://18.207.179.123:5000/diagnosticar';

const ExpertSystem = () => {
  // Definición del estado estricto de Peticiones según arquitectura
  const [sessionData, setSessionData] = useState({
    tipo: null,
    sintoma: null,
    historial: []
  });

  // Fases del Chat
  const [chatState, setChatState] = useState('ASKING_TIPO'); // ASKING_TIPO | ASKING_SINTOMA | IN_PROGRESS | DONE
  const [isTyping, setIsTyping] = useState(false);
  const [currentPrologQuestion, setCurrentPrologQuestion] = useState(null);

  // Historial de la UI
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy ExperBot. Para iniciar el proceso asitido del motor de inferencia, por favor selecciona el tipo de equipo a revisar:',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      showOptions: 'TIPO' // Bandera especial para la UI
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages, isTyping]);

  // ===================================
  // CONECTOR A LA API (PROLOG VIA FLASK)
  // ===================================
  const fetchDiagnosisStep = async (currentPayload) => {
    setIsTyping(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPayload)
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.status === 'success') {
        if (data.accion === 'pregunta') {
          // Prolog pide confirmación Sí o No
          setCurrentPrologQuestion(data.valor);
          addBotMessage(data.valor, 'SI_NO');
        } else if (data.accion === 'diagnostico') {
          // Prolog encontró el final del árbol
          setChatState('DONE');
          addBotMessage(`⚠️ DIAGNÓSTICO ENCONTRADO:\n\n${data.valor}`);
        } else if (data.accion === 'finalizado') {
          // Prolog se quedó exhausto
          setChatState('DONE');
          addBotMessage(data.valor || "No se logró encontrar un diagnóstico certero en el sistema de hechos.");
        }
      } else {
        addBotMessage("Hubo una interrupción con el motor de inferencia. Por favor intenta de nuevo.");
      }

    } catch (error) {
      console.error(error);
      setIsTyping(false);
      addBotMessage("Aviso Técnico: El servidor Prolog parece estar fuera de línea temporalmente. Verifica conexión con Flask.");
    }
  };

  // ===================================
  // RESPONDEDORES DE ACCIONAMIENTO DE BOTONES
  // ===================================

  // Cuando el usuario elige Laptop o PC
  const handleTypeSelect = (tipoSeleccionado) => {
    addUserMessage(`Selección: ${tipoSeleccionado}`);

    // Suprimimos los botones anteriores marcandolos como null
    setMessages(prev => prev.map(m => ({ ...m, showOptions: null })));

    setSessionData(prev => ({ ...prev, tipo: tipoSeleccionado }));
    setChatState('ASKING_SINTOMA');

    // Retardo natural simulado
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage("Entendido. Ahora, ingresa exactamente la llave/palabra del síntoma principal, por ejemplo: 'no_enciende', 'sin_video', 'pitidos_3'.", null);
    }, 600);
  };

  // Cuando Prolog te lanza pregunta y el Usuario pulsa Si o No
  const handleLogicAnswer = (respuestaCorta) => {
    addUserMessage(respuestaCorta === 'si' ? 'Sí' : 'No');

    // Suprimimos los botones Si/No anteriores
    setMessages(prev => prev.map(m => ({ ...m, showOptions: null })));

    // Inyectamos el formato que Prolog Flask espera en la lista Historial
    const stepInyectado = {
      p: currentPrologQuestion,
      r: respuestaCorta
    };

    const nuevoPayload = {
      tipo: sessionData.tipo,
      sintoma: sessionData.sintoma,
      historial: [...sessionData.historial, stepInyectado]
    };

    setSessionData(nuevoPayload);

    // Corremos ciclo otra vez
    fetchDiagnosisStep(nuevoPayload);
  };

  // ===================================
  // CONTROLADOR GENERAL DEL CHAT Y EL INPUT LIBRE
  // ===================================
  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1, sender: 'user', text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const addBotMessage = (text, specialOptionType = null) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1, sender: 'bot', text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      showOptions: specialOptionType
    }]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const msg = inputMessage.trim();
    addUserMessage(msg);
    setInputMessage('');

    if (chatState === 'ASKING_SINTOMA') {
      // El usuario envió el síntoma llave
      setChatState('IN_PROGRESS');
      const nuevoPayload = {
        tipo: sessionData.tipo,
        sintoma: msg,   // Inyecta el síntoma tecleado
        historial: []   // Arranca desde 0 la memoria en Prolog
      };
      setSessionData(nuevoPayload);
      fetchDiagnosisStep(nuevoPayload);
    }
    // Si se enviara texto random mientras el bot pregunta Sí/No, lo ignoramos a nivel motor pero se queda en UI
  };

  const resetDiagnosticSession = () => {
    setSessionData({ tipo: null, sintoma: null, historial: [] });
    setChatState('ASKING_TIPO');
    setCurrentPrologQuestion(null);
    setMessages([{
      id: 1, sender: 'bot', text: '¡Sesión reiniciada! Selecciona el tipo de equipo a revisar:',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      showOptions: 'TIPO'
    }]);
  };

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
        <div className="chat-body">
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
                {msg.showOptions === 'TIPO' && (
                  <div className="chat-action-buttons">
                    <button className="btn-chat-action" onClick={() => handleTypeSelect('Laptop')}>💻 Laptop</button>
                    <button className="btn-chat-action" onClick={() => handleTypeSelect('PC')}>🖥️ PC de Escritorio</button>
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

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer Bloqueado Abajo */}
        <div className="chat-footer">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder={
                chatState === 'ASKING_TIPO' ? '↑ Utiliza los botones superiores...' :
                  chatState === 'DONE' ? 'Sesión terminada. Dale a reiniciar.' :
                    "Escribe y pulsa Enter..."
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={chatState === 'ASKING_TIPO' || chatState === 'DONE'}
            />
          </div>
          <button
            className="btn-send-message"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || chatState === 'ASKING_TIPO' || chatState === 'DONE'}
            title="Enviar mensaje"
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ExpertSystem;
