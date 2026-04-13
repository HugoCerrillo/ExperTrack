import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

//url base de la api pasando por vercel
const API_URL = '/api';

export function useAssetManagement() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //solicitud get para traer todos los equipos registrados
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

    //cargar al entrar al sistema
    useEffect(() => {
        fetchEquipos();
    }, [fetchEquipos]);

    //solicitud get para obtener el detalle completo de un equipo incluyendo los perifericos y especificaciones
    const fetchEquipoDetalle = async (id) => {
        try {
            const response = await fetch(`${API_URL}/equipos/${id}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                return data; //contiene data.equipo, data.perifericos, data.especificacion
            }
            return null;
        } catch (err) {
            console.error("Error al obtener detalle del equipo:", err);
            return null;
        }
    };

    //solicitud post para registrar un nuevo equipo
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
                await fetchEquipos();
                Swal.fire({
                    icon: 'success',
                    title: '¡Equipo Registrado!',
                    text: 'El equipo se integró al sistema.',
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

    //solicitud put para actualizar un equipo y sus especificaciones y perifericos
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
                await fetchEquipos(); //actualiza la lista de equipos
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Cambios guardados exitosamente.',
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

    //solicitud delete para eliminar un equipo
    const eliminarEquipo = async (id) => {
        const result = await Swal.fire({
            title: '¿Confirmar eliminación del equipo?',
            text: "Esto dará de baja el equipo y todos sus periféricos permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f85149',
            cancelButtonColor: '#504b38',
            confirmButtonText: 'Sí, eliminar equipo',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return false;

        try {
            Swal.fire({
                title: 'Eliminando equipo...',
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
                    title: '¡Eliminación Exitosa!',
                    text: 'El equipo ha sido eliminado.',
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

    //retornar los valores
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
