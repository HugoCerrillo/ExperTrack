import React, { useState, useRef, useEffect } from 'react';
import { Send, BrainCircuit, User } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import '../assets/styles/expert-system.css';

const ExpertSystem = () => {
  // Lista ficticia de mensajes de prueba para ilustrar el Flow de la conversación
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola, Técnico! Soy ExperBot, el sistema experto de ExperTrack. ¿En qué diagnóstico te puedo ayudar el día de hoy guiándote paso a paso?',
      time: '08:00 AM'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Tengo una Laptop HP modelo LAT-500 en el escritorio 4 que prende pero arroja 3 pitidos largos y no manda imagen a la pantalla.',
      time: '08:05 AM'
    },
    {
      id: 3,
      sender: 'bot',
      text: 'De acuerdo. El patrón de 3 pitidos largos en los modelos HP suele estar estrictamente relacionado con fallos en la Memoria RAM. \n\nPor favor, retira los módulos de memoria y limpia los contactos con alcohol isopropílico. ¿El error persiste después de esto?',
      time: '08:06 AM'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-smooth-scroll cada vez que entran mensajes nuevos
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Manejador del Input (Acepta enviar en vez de dar salto de línea al pulsar ENTER)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simulación Visual de Envío
  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    // 1. Añade mi mensaje al UI
    const newUserMsg = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    
    // 2. Simulamos el tiempo de espera (pensamiento del bot)
    setIsTyping(true);
    
    // 3. Responde el bot a los (2.5 segundos) de forma automática con un texto mock
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: prev.length + 1,
        sender: 'bot',
        text: 'Interesante. Entendido el nuevo síntoma reportado. (MOCK EXPERCT SYSTEM: Esperando Endpoint de Flask conectable).',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2500);

  };

  return (
    <DashboardLayout headerTitle="Sistema Experto (Beta)">
      <div className="chat-container">
        
        {/* Banner o Cabecera Fija */}
        <div className="chat-header">
          <div className="chat-header-icon">
             <BrainCircuit size={24} />
          </div>
          <div className="chat-header-info">
             <h3>ExperBot - Motor de Diagnóstico</h3>
             <p>Asistente virtual de hardware alimentado por Inteligencia Artificial</p>
          </div>
        </div>

        {/* Zona Scrollable de Conversación */}
        <div className="chat-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'bot' ? <BrainCircuit size={18} /> : <User size={18} />}
              </div>
              
              <div className="message-content">
                <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>
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
              placeholder="Explica detalladamente la falla o síntoma del equipo..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
          <button 
            className="btn-send-message" 
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            title="Enviar informe"
          >
            <Send size={20} />
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ExpertSystem;
