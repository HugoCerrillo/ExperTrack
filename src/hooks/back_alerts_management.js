import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';

const API_URL = '/api';

export const useAlertasManagement = () => {
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Obtener alertas, opcionalmente filtradas por estatus ('Pendiente' o 'Enviada')
    const fetchAlertas = useCallback(async (estatus = null) => {
        setLoading(true);
        try {
            let url = `${API_URL}/alertas`;
            if (estatus) {
                url += `?estatus=${estatus}`;
            }

            const response = await fetch(url, { credentials: 'include' });
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setAlertas(data.alertas || []);
                setError(null);
            } else {
                setError(data.message);
                setAlertas([]);
            }
        } catch (err) {
            console.error("Error al obtener alertas:", err);
            setError("Error de conexión al servidor");
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nueva alerta
    const createAlerta = async (alertaData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/alertas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alertaData),
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                Swal.fire('¡Éxito!', 'Alerta preventiva programada correctamente.', 'success');
                return true;
            } else {
                Swal.fire('Error', data.message || 'Error al guardar la alerta', 'error');
                return false;
            }
        } catch (err) {
            Swal.fire('Error', 'Error de conexión con el servidor', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Editar una alerta existente
    const updateAlerta = async (id, alertaData) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/alertas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alertaData),
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                Swal.fire('¡Actualizado!', 'La alerta se modificó correctamente.', 'success');
                return true;
            } else {
                Swal.fire('Error', data.message || 'Error al actualizar la alerta', 'error');
                return false;
            }
        } catch (err) {
            Swal.fire('Error', 'Error de conexión con el servidor', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Eliminar una alerta (Exclusivo Administrador)
    const deleteAlerta = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar alerta?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#504b38',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/alertas/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    Swal.fire('¡Eliminada!', 'La alerta ha sido borrada.', 'success');
                    return true;
                } else {
                    Swal.fire('Error', data.message || 'No se pudo eliminar la alerta', 'error');
                    return false;
                }
            } catch (err) {
                Swal.fire('Error', 'Error de conexión con el servidor', 'error');
                return false;
            } finally {
                setLoading(false);
            }
        }
        return false;
    };

    // Disparador manual para enviar alertas pendientes
    const triggerVerificacionManual = async () => {
        setLoading(true);
        try {
            Swal.fire({
                title: 'Verificando y enviando correos...',
                text: 'El sistema está procesando las alertas preventivas.',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(`${API_URL}/alertas/verificar_manual`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();
            Swal.close();

            if (response.ok && data.status === 'success') {
                Swal.fire(
                    '¡Proceso Completado!',
                    data.message || `Se enviaron ${data.enviadas} alertas preventivas por correo.`,
                    'info'
                );
                return true;
            } else {
                Swal.fire('Error', data.message || 'Ocurrió un error al disparar las alertas', 'error');
                return false;
            }
        } catch (err) {
            Swal.close();
            Swal.fire('Error', 'Error de conexión con el servidor al verificar alertas', 'error');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        alertas,
        loading,
        error,
        fetchAlertas,
        createAlerta,
        updateAlerta,
        deleteAlerta,
        triggerVerificacionManual
    };
};

//
