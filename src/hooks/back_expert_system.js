import { useState, useRef } from 'react';
import { useAssetManagement } from './back_asset_management';

// Reescrito para usar el path /api y que Vercel se encargue del proxy a HTTP AWS RDS
const API_URL = '/api/diagnosticar';

export const useExpertSystem = () => {
  // Obtenemos activos reales de la BD usando el hook existente
  const { assets: availableAssets, loading: loadingAssets } = useAssetManagement();

  // Definición del estado estricto de Peticiones según arquitectura
  const [sessionData, setSessionData] = useState({
    equipo_codigo: null,
    tipo: null,
    sintoma: null,
    historial: []
  });

  // Fases del Chat
  const [chatState, setChatState] = useState('ASKING_TIPO'); // ASKING_TIPO | ASKING_SINTOMA | IN_PROGRESS | DONE
  const [isTyping, setIsTyping] = useState(false);
  const [currentPrologQuestion, setCurrentPrologQuestion] = useState(null);

  // Historial visual de la UI
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy ExperBot. Para iniciar la bitácora de diagnóstico, por favor selecciona el equipo institucional que vas a revisar:',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      showOptions: 'EQUIPO' // Bandera para desplegar dropdown de activos
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Funciones Utilitarias Internas
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

  // ===================================
  // CEREBRO: CONECTOR A LA API PROLOG
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
          
          const payloadAuditoria = { 
            equipo_relacionado: currentPayload.equipo_codigo, 
            ...currentPayload, 
            diagnostico_final: data.valor 
          };
          console.log("✅ [DEBUG] Historial Final Prolog (Éxito):", JSON.stringify(payloadAuditoria, null, 2));
        } else if (data.accion === 'finalizado') {
          // Prolog se quedó exhausto
          setChatState('DONE');
          addBotMessage(data.valor || "No se logró encontrar un diagnóstico certero en el sistema de hechos.");
          
          const payloadAuditoria = { 
            equipo_relacionado: currentPayload.equipo_codigo, 
            ...currentPayload, 
            diagnostico_final: "SIN RESULTADO" 
          };
          console.log("⚠️ [DEBUG] Historial Final Prolog (Agotado):", JSON.stringify(payloadAuditoria, null, 2));
        }
      } else {
        addBotMessage("Hubo una interrupción con el motor de inferencia. Por favor intenta de nuevo.");
      }

    } catch (error) {
      console.error(error);
      setIsTyping(false);
      addBotMessage("Aviso Técnico: El proxy de Vercel falló o el servidor Prolog no responde a la petición /api.");
    }
  };

  // ===================================
  // EXPORTABLES A LA VISTA
  // ===================================

  // Cuando el usuario elige un activo del select
  const handleAssetSelect = (codigoSeleccionado) => {
    // Buscamos con las llaves que vienen de la Base de Datos
    const asset = availableAssets.find(a => a.codigo_inventario === codigoSeleccionado);
    if (!asset) return;

    // Prolog usa estrictamente 'PC' o 'Laptop' en sus llaves
    const tipoNormalizado = asset.tipo_equipo === 'PC de Escritorio' ? 'PC' : 'Laptop';

    addUserMessage(`Asignado: ${asset.codigo_inventario} [${asset.marca} ${asset.modelo}]`);

    // Suprimimos selector
    setMessages(prev => prev.map(m => ({ ...m, showOptions: null })));

    setSessionData(prev => ({ ...prev, equipo_codigo: asset.codigo_inventario, tipo: tipoNormalizado }));
    setChatState('ASKING_SINTOMA');

    // Retardo natural simulado
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage("Activo enlazado correctamente. Para iniciar, ingresa la llave del síntoma general según Prolog (ej: 'no_enciende', 'sin_video').", null);
    }, 600);
  };

  // Cuando Prolog te lanza pregunta y el Usuario pulsa Si o No
  const handleLogicAnswer = (respuestaCorta) => {
    addUserMessage(respuestaCorta === 'si' ? 'Sí' : 'No');

    // Suprimimos los botones Si/No anteriores
    setMessages(prev => prev.map(m => ({ ...m, showOptions: null })));

    // Inyectamos el formato que Prolog Flask espera
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

    // Corremos ciclo a Prolog otra vez
    fetchDiagnosisStep(nuevoPayload);
  };

  // Cuando se envía texto libre
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const msg = inputMessage.trim();
    addUserMessage(msg);
    setInputMessage('');

    if (chatState === 'ASKING_SINTOMA') {
      // El usuario envió el síntoma llave
      setChatState('IN_PROGRESS');
      const nuevoPayload = {
        equipo_codigo: sessionData.equipo_codigo, // Mantenemos el código para la auditoría, backend lo puede ignorar para prolog
        tipo: sessionData.tipo,                   // Se usa en prolog
        sintoma: msg,   
        historial: []   
      };
      setSessionData(nuevoPayload);
      fetchDiagnosisStep(nuevoPayload);
    }
  };

  // Reset del ciclo
  const resetDiagnosticSession = () => {
    setSessionData({ equipo_codigo: null, tipo: null, sintoma: null, historial: [] });
    setChatState('ASKING_TIPO');
    setCurrentPrologQuestion(null);
    setMessages([{
      id: 1, sender: 'bot', text: '¡Sesión Limpia! Selecciona el equipo institucional a diagnosticar:',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      showOptions: 'EQUIPO'
    }]);
  };

  return {
    availableAssets, // Para enviarlo a la UI
    loadingAssets,   // Para control visual
    messages,
    inputMessage,
    setInputMessage,
    isTyping,
    chatState,
    messagesEndRef,
    handleAssetSelect,
    handleLogicAnswer,
    handleSendMessage,
    resetDiagnosticSession
  };
};
