import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';

const API_URL = '/api';

export function useEventsManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar Expediente completo (Eventos + Diagnósticos + Mantenimientos + Equipos desc)
  const fetchExpediente = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Disparar peticiones en paralelo
      const [resEventos, resDiag, resMant, resEquipos] = await Promise.all([
        fetch(`${API_URL}/eventos`, { credentials: 'include' }),
        fetch(`${API_URL}/diagnosticos`, { credentials: 'include' }),
        fetch(`${API_URL}/mantenimientos`, { credentials: 'include' }),
        fetch(`${API_URL}/equipos`, { credentials: 'include' })
      ]);

      const [dataEventos, dataDiag, dataMant, dataEquipos] = await Promise.all([
        resEventos.json(),
        resDiag.json(),
        resMant.json(),
        resEquipos.json()
      ]);

      if (dataEventos.status !== 'success') {
        throw new Error(dataEventos.message || 'Error cargando eventos');
      }

      const eventosList = dataEventos.eventos || [];
      const diagList = dataDiag.diagnosticos || [];
      const mantList = dataMant.mantenimientos || [];
      const equiposList = dataEquipos.equipos || [];

      // 2. Realizar Join en memoria iterativamente
      const joinedRecords = eventosList.map(evento => {
        const myDiag = diagList.find(d => d.id_evento === evento.id_evento) || null;
        const myMant = mantList.find(m => m.id_evento === evento.id_evento) || null;
        const myEq = equiposList.find(e => e.id_equipo === evento.id_equipo) || null;

        return {
          ...evento,
          diagnostico: myDiag,
          mantenimiento: myMant,
          equipo_detalle: myEq // contiene modelo, marca, codigo_inventario, etc.
        };
      });

      // Ordenar: los no validados primero, y por los mas recientes
      joinedRecords.sort((a, b) => {
        if (a.validado === b.validado) {
          return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
        }
        return a.validado ? 1 : -1;
      });

      setRecords(joinedRecords);
    } catch (err) {
      setError(err.message || 'Error de conexión al cargar expediente');
      console.error("fetchExpediente error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // UPDATE Evento
  const updateEvento = async (id_evento, formData) => {
    try {
      const response = await fetch(`${API_URL}/eventos/${id_evento}`, {
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
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'No se pudo contactar al servidor.' });
      return false;
    }
  };

  // UPDATE Diagnostico
  const updateDiagnostico = async (id_evento, formData) => {
    try {
      const response = await fetch(`${API_URL}/diagnosticos/${id_evento}`, {
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
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'Fallo al actualizar diagnóstico.' });
      return false;
    }
  };

  // POST Diagnostico (Excepcional)
  const createDiagnostico = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/diagnosticos`, {
        method: 'POST',
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
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'Fallo al crear diagnóstico.' });
      return false;
    }
  };

  // POST Mantenimiento
  const createMantenimiento = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/mantenimientos`, {
        method: 'POST',
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
      Swal.fire({ icon: 'error', title: 'Error de Red', text: 'Fallo al crear mantenimiento.' });
      return false;
    }
  };

  // UPDATE Mantenimiento
  const updateMantenimiento = async (id_evento, formData) => {
    try {
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
