import { useState, useRef, useEffect } from 'react';
import { useAssetManagement } from './back_asset_management';

//url de la api pasando por vercels
const API_URL = '/api/diagnosticar';

export const useExpertSystem = () => {
  //equipos disponibles
  const { assets, loading: loadingAssets } = useAssetManagement();

  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = loggedUser.id_usuario || loggedUser.id;
  const isSolicitante = loggedUser.rol === 'Usuario Solicitante';

  // Solo operativos. Solicitantes solo ven los suyos. Técnicos ven todos los operativos.
  const availableAssets = assets.filter(a => {
    if (a.estado_operativo !== 'Operativo') return false; 
    if (isSolicitante) {
      return Number(a.id_usuario) === Number(userId);
    }
    return true; 
  });

  //manifestaciones de falla iniciales
  const [sintomasValidos, setSintomasValidos] = useState([]);

  const [sessionData, setSessionData] = useState({
    equipo_codigo: null,
    tipo: null,
    sintoma: null,
    historial: []
  });

  //fases del diagnostico
  const [chatState, setChatState] = useState('ASKING_TIPO'); // ASKING_TIPO | ASKING_SINTOMA | IN_PROGRESS | DONE
  const [isTyping, setIsTyping] = useState(false);
  const [currentPrologQuestion, setCurrentPrologQuestion] = useState(null);

  //historial de mensajes
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! Soy ExperBot. Para iniciar la bitácora de diagnóstico, por favor selecciona el equipo que vas a revisar:',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      showOptions: 'EQUIPO' //desplegar dropdown de equipos
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  //obtener lista de manifestaciones de falla por tipo de equipo (dependiendo el que haya elegido el usuario)
  const fetchSintomas = async (tipoHardware) => {
    try {
      setSintomasValidos([]);
      const response = await fetch(`/api/sintomas?tipo=${tipoHardware}`);
      const data = await response.json();
      if (data.status === 'success') {
        setSintomasValidos(data.sintomas || []);
      }
    } catch (error) {
      console.error("Fallo obteniendo biblioteca de manifestaciones de falla:", error);
    }
  };

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

  //conexion con el motor de inferencia
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
          //prolog pregunta si o no
          setCurrentPrologQuestion(data.valor);
          addBotMessage(data.valor, 'SI_NO');
        } else if (data.accion === 'diagnostico') {
          //prolog encontró el final del árbol
          setChatState('ASKING_FINAL_DETAILS');

          //formateador de texto
          const textoLimpio = data.valor
            .split('. ')
            .filter(s => s.trim().length > 0)
            .map(s => `🔹 ${s.trim()}${s.endsWith('.') ? '' : '.'}`)
            .join('\n\n');

          addBotMessage(`DIAGNÓSTICO ENCONTRADO:\n\n${textoLimpio}\n\n─────────────────────\nPara nutrir la bitácora, por favor describe con tus propias palabras algún detalle extra de la falla en la barra inferior (caja de texto):`);

          const payloadAuditoria = {
            equipo_relacionado: currentPayload.equipo_codigo,
            ...currentPayload,
            diagnostico_final: data.valor
          };
          console.log("[DEBUG] Historial Final Prolog (Éxito):", JSON.stringify(payloadAuditoria, null, 2));
        } else if (data.accion === 'finalizado') {
          //prolog no encontró el final del árbol
          setChatState('ASKING_FINAL_DETAILS');

          const exhausto = data.valor
            ? data.valor.split('. ').filter(s => s.trim().length > 0).map(s => `🔸 ${s.trim()}${s.endsWith('.') ? '' : '.'}`).join('\n\n')
            : "🔸 No se logró encontrar un diagnóstico certero en el árbol de hechos.";

          addBotMessage(`DIAGNÓSTICO INCONCLUSO:\n\n${exhausto}\n\n─────────────────────\nPara escalar tu caso a un técnico, por favor describe a detalle lo que sucede con el equipo en la barra inferior (caja de texto):`);

          const payloadAuditoria = {
            equipo_relacionado: currentPayload.equipo_codigo,
            ...currentPayload,
            diagnostico_final: "SIN RESULTADO"
          };
          console.log("[DEBUG] Historial Final Prolog (Agotado):", JSON.stringify(payloadAuditoria, null, 2));
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


  //cuando el usuario elige un activo (equipo) del select
  const handleAssetSelect = (codigoSeleccionado) => {
    //buscamos en la base de datos el equipo seleccionado
    const asset = availableAssets.find(a => a.codigo_inventario === codigoSeleccionado);
    if (!asset) return;

    //prolog usa estrictamente 'PC' o 'Laptop'
    const tipoNormalizado = (asset.tipo_equipo === 'PC' || asset.tipo_equipo === 'PC de Escritorio') ? 'PC' : 'Laptop';

    addUserMessage(`Asignado: ${asset.codigo_inventario} [${asset.marca} ${asset.modelo}]`);

    //suprimimos el selector
    setMessages(prev => prev.map(m => ({ ...m, showOptions: null })));

    setSessionData(prev => ({ ...prev, equipo_codigo: asset.codigo_inventario, tipo: tipoNormalizado }));
    setChatState('ASKING_SINTOMA');

    //aqui hacemos la peticion de sintomas filtrados por tipo de equipo
    fetchSintomas(tipoNormalizado);

    //retardo natural simulado
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage("Equipo seleccionado correctamente. Por favor, selecciona la manifestación de falla principal que presenta el equipo:", 'SINTOMA');
    }, 600);
  };

  //cuando selecciona la manifestacion de falla principal
  const handleSymptomSelect = (claveSintoma) => {
    const isNoFalla = claveSintoma === 'NO_FALLA';
    const sintomaName = isNoFalla 
      ? 'No veo la falla de mi equipo' 
      : (sintomasValidos.find(s => s.clave === claveSintoma)?.descripcion || claveSintoma);

    addUserMessage(`Manifestación de falla: ${sintomaName}`);

    setMessages(prev => prev.map(m => ({ ...m, showOptions: null })));

    // Si es Usuario Solicitante O seleccionó "No veo la falla", omitimos Prolog
    if (isSolicitante || isNoFalla) {
      setChatState('ASKING_FINAL_DETAILS');
      
      const nuevoPayload = {
        equipo_codigo: sessionData.equipo_codigo,
        tipo: sessionData.tipo,
        sintoma: claveSintoma,
        historial: []
      };
      setSessionData(nuevoPayload);

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoMsg = isSolicitante 
          ? "Hemos registrado tu solicitud de diagnóstico. Para finalizar y notificar a los técnicos, por favor describe con tus propias palabras qué le falla a tu equipo en la barra inferior (caja de texto):"
          : "Entendido. Como la falla no parece estar en la biblioteca estándar, por favor describe detalladamente qué le sucede al equipo en la barra inferior (caja de texto):";
        addBotMessage(autoMsg);
      }, 700);

    } else {
      // Es Técnico/Admin y SÍ es un síntoma del catálogo: consultamos a Prolog.
      setChatState('IN_PROGRESS');

      const nuevoPayload = {
        equipo_codigo: sessionData.equipo_codigo,
        tipo: sessionData.tipo,
        sintoma: claveSintoma,
        historial: []
      };
      setSessionData(nuevoPayload);
      fetchDiagnosisStep(nuevoPayload);
    }
  };

  //cuando el usuario responde si o no a la pregunta de prolog
  const handleLogicAnswer = (respuestaCorta) => {
    addUserMessage(respuestaCorta === 'si' ? 'Sí' : 'No');

    //suprimimos los botones si/no anteriores
    setMessages(prev => prev.map(m => ({ ...m, showOptions: null })));

    //inyectamos el formato que prolog flask espera
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

    //corremos ciclo a prolog otra vez
    fetchDiagnosisStep(nuevoPayload);
  };

  //cuando se envia texto texto (Fase Detalle Final)
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const msg = inputMessage.trim();
    addUserMessage(msg);
    setInputMessage('');

    if (chatState === 'ASKING_FINAL_DETAILS') {
      const nuevoDetalle = msg;
      //guardamos el detalle en sessionData
      setSessionData(prev => ({ ...prev, descripcion_usuario: nuevoDetalle }));

      setChatState('DONE');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const doneMsg = isSolicitante 
          ? "¡Gracias! Tu descripción detallada ha sido registrada con éxito. Un técnico revisará tu caso en breve. El proceso ha finalizado."
          : "¡Gracias! Tu reporte detallado y el diagnóstico previo del sistema experto han sido registrados. El proceso asistido ha finalizado.";
        addBotMessage(doneMsg);
        console.log("[DEBUG] Descripción del usuario:", nuevoDetalle);
      }, 700);
    }
  };

  //reset del ciclo
  const resetDiagnosticSession = () => {
    setSintomasValidos([]); //limpiamos la lista de opciones
    setSessionData({ equipo_codigo: null, tipo: null, sintoma: null, historial: [] });
    setChatState('ASKING_TIPO');
    setCurrentPrologQuestion(null);
    setMessages([{
      id: 1, sender: 'bot', text: '¡Sesión Limpia! Selecciona el equipo a diagnosticar:',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      showOptions: 'EQUIPO'
    }]);
  };

  return {
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
  };
};
