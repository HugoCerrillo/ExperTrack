import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

//----------------------------------------------------
// URL base de la API en AWS EC2
const API_URL = '/api';
//----------------------------------------------------

export function useAssetManagement() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //----------------------------------------------------
    // GET /equipos — Traer todos los equipos del servidor
    //----------------------------------------------------
    const fetchEquipos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/equipos`, {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setAssets(data.equipos || []);
            } else {
                setError(data.message || 'Error al cargar equipos.');
            }
        } catch (err) {
            setError('No se pudo contactar al servidor. Revisa tu conexión.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar al montar
    useEffect(() => {
        fetchEquipos();
    }, [fetchEquipos]);

    //----------------------------------------------------
    // GET /equipos/<id> — Detalle completo incluyendo hijos
    //----------------------------------------------------
    const fetchEquipoDetalle = async (id) => {
        try {
            const response = await fetch(`${API_URL}/equipos/${id}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                return data; // Contiene data.equipo, data.perifericos, data.especificacion
            }
            return null;
        } catch (err) {
            console.error("Error al obtener detalle del equipo:", err);
            return null;
        }
    };

    //----------------------------------------------------
    // POST /equipos — Registrar nuevo equipo
    //----------------------------------------------------
    const crearEquipo = async (formData) => {
        try {
            Swal.fire({
                title: 'Registrando activo...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(`${API_URL}/equipos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                await fetchEquipos(); // Refrescar lista
                Swal.fire({
                    icon: 'success',
                    title: '¡Equipo Registrado!',
                    text: 'El activo se integró al inventario.',
                    confirmButtonColor: '#504b38'
                });
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Registro',
                    text: data.message || 'Verifica los datos e inténtalo de nuevo.',
                    confirmButtonColor: '#504b38'
                });
                return false;
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudo contactar al servidor.',
                confirmButtonColor: '#504b38'
            });
            return false;
        }
    };

    //----------------------------------------------------
    // PUT /equipos/<id> — Actualizar equipo y specs
    //----------------------------------------------------
    const actualizarEquipo = async (id, formData) => {
        try {
            Swal.fire({
                title: 'Actualizando equipo...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(`${API_URL}/equipos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                await fetchEquipos(); // Actualizar lista
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Auditoría técnica guardada exitosamente.',
                    confirmButtonColor: '#504b38'
                });
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al Actualizar',
                    text: data.message || 'Ocurrió un problema.',
                    confirmButtonColor: '#504b38'
                });
                return false;
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudo contactar al servidor.',
                confirmButtonColor: '#504b38'
            });
            return false;
        }
    };

    //----------------------------------------------------
    // DELETE /equipos/<id> — Baja de equipo
    //----------------------------------------------------
    const eliminarEquipo = async (id) => {
        const result = await Swal.fire({
            title: '¿Confirmar retiro del equipo?',
            text: "Esto dará de baja el equipo y todos sus periféricos permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f85149',
            cancelButtonColor: '#504b38',
            confirmButtonText: 'Sí, retirar equipo',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return false;

        try {
            Swal.fire({
                title: 'Retirando hardware...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(`${API_URL}/equipos/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setAssets(prev => prev.filter(a => a.id_equipo !== id));
                Swal.fire({
                    icon: 'success',
                    title: '¡Baja Exitosa!',
                    text: 'El hardware ha sido retirado.',
                    confirmButtonColor: '#504b38'
                });
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Baja',
                    text: data.message || 'Ocurrió un error.',
                    confirmButtonColor: '#504b38'
                });
                return false;
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudo contactar al servidor.',
                confirmButtonColor: '#504b38'
            });
            return false;
        }
    };

    return {
        assets,
        loading,
        error,
        fetchEquipos,
        fetchEquipoDetalle,
        crearEquipo,
        actualizarEquipo,
        eliminarEquipo
    };
}
