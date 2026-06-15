import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';

//url de la api pasando por vercel
const API_URL = '/api';

export function useEventsManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //cargar cxpediente completo (Eventos + Diagnósticos + Mantenimientos + Equipos)
  const fetchExpediente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      //1. llamar peticiones ala api en paralelo
      const [resEventos, resDiag, resMant, resEquipos] = await Promise.all([
        fetch(`${API_URL}/eventos`, { credentials: 'include' }), //para los eventos
        fetch(`${API_URL}/diagnosticos`, { credentials: 'include' }), //para los diagnosticos
        fetch(`${API_URL}/mantenimientos`, { credentials: 'include' }), //para los mantenimientos
        fetch(`${API_URL}/equipos`, { credentials: 'include' }) //para los equipos
      ]);

      //convertir las respuestas a json
      const [dataEventos, dataDiag, dataMant, dataEquipos] = await Promise.all([
        resEventos.json(),
        resDiag.json(),
        resMant.json(),
        resEquipos.json()
      ]);

      //verificar que los eventos se hayan cargado correctamente
      if (dataEventos.status !== 'success') {
        throw new Error(dataEventos.message || 'Error cargando eventos');
      }

      //obtener los datos de los eventos, diagnosticos, mantenimientos y equipos
      const eventosList = dataEventos.eventos || [];
      const diagList = dataDiag.diagnosticos || [];
      const mantList = dataMant.mantenimientos || [];
      const equiposList = dataEquipos.equipos || [];

      //2. realizamos la union de los datos de los eventos, diagnosticos, mantenimientos y equipos
      const joinedRecords = eventosList.map(evento => {
        const myDiag = diagList.find(d => Number(d.id_evento) === Number(evento.id_evento)) || null;
        const myMant = mantList.find(m => Number(m.id_evento) === Number(evento.id_evento)) || null;
        const myEq = equiposList.find(e => Number(e.id_equipo) === Number(evento.id_equipo)) || null;

        return {
          ...evento,
          diagnostico: myDiag,
          mantenimiento: myMant,
          equipo_detalle: myEq //contiene modelo, marca, codigo_inventario, etc.
        };
      });

      //ordenamos los eventos: los no validados primero, y por los mas recientes
      joinedRecords.sort((a, b) => {
        if (a.validado === b.validado) {
          return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
        }
        return a.validado ? 1 : -1;
      });

      setRecords(joinedRecords);  //actualizamos el estado con los datos unidos
    } catch (err) {
      setError(err.message || 'Error de conexión al cargar expediente');
      console.error("fetchExpediente error:", err);
    } finally {
      setLoading(false);  //finalizamos la carga
    }
  }, []);

  //para actualizar un evento
  const updateEvento = async (id_evento, formData) => {
    try {
      //hacemos la peticion a la api para actualizar el evento
      const response = await fetch(`${API_URL}/eventos/${id_evento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json(); //convertimos la respuesta a json
      if (response.ok && data.status === 'success') {
        return true;
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message });
        return false;
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'No se pudo contactar al servidor.' });
      return false;
    }
  };

  //para actualizar un diagnostico
  const updateDiagnostico = async (id_evento, formData) => {
    try {
      //hacemos la peticion a la api para actualizar el diagnostico
      const response = await fetch(`${API_URL}/diagnosticos/${id_evento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json(); //convertimos la respuesta a json
      if (response.ok && data.status === 'success') {
        return true;
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message });
        return false;
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'Fallo al actualizar diagnóstico.' });
      return false;
    }
  };

  //para crear un diagnostico
  const createDiagnostico = async (formData) => {
    try {
      //hacemos la peticion a la api para crear el diagnostico
      const response = await fetch(`${API_URL}/diagnosticos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json(); //convertimos la respuesta a json
      if (response.ok && data.status === 'success') {
        return true;
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message });
        return false;
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'Fallo al crear diagnóstico.' });
      return false;
    }
  };

  //para crear un mantenimiento
  const createMantenimiento = async (formData) => {
    try {
      //hacemos la peticion a la api para crear el mantenimiento
      const response = await fetch(`${API_URL}/mantenimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json(); //convertimos la respuesta a json
      if (response.ok && data.status === 'success') {
        return true;
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message });
        return false;
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'Fallo al crear mantenimiento.' });
      return false;
    }
  };

  //para actualizar un mantenimiento
  const updateMantenimiento = async (id_evento, formData) => {
    try {
      //hacemos la peticion a la api para actualizar el mantenimiento
      const response = await fetch(`${API_URL}/mantenimientos/${id_evento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        return true;
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message });
        return false;
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'Fallo al actualizar mantenimiento.' });
      return false;
    }
  };

  return {
    records,
    loading,
    error,
    fetchExpediente,
    updateEvento,
    updateDiagnostico,
    createDiagnostico,
    createMantenimiento,
    updateMantenimiento
  };
}
