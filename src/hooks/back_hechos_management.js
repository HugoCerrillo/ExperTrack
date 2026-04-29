import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';

const API_URL = '/api';

export function useHechosManagement() {
    const [sintomas, setSintomas] = useState([]);
    const [fallas, setFallas] = useState([]);
    const [categorias, setCategorias] = useState([]); // Mocked until GET /categorias_hechos is added
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //llamada para cargar sintomas (manifestaciones de falla)
    const fetchSintomas = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/sintomas`, { credentials: 'include' });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                setSintomas(data.sintomas || []);
            }
        } catch (err) {
            console.error("Error fetching sintomas:", err);
        }
    }, []);

    //llamada para cargar las fallas
    const fetchFallas = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/fallas_hechos`, { credentials: 'include' });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                setFallas(data.fallas || []);
            }
        } catch (err) {
            console.error("Error fetching fallas:", err);
        }
    }, []);

    //llamada para cargar las categirias de fallas
    const fetchCategorias = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/categorias_hechos`, { credentials: 'include' });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                setCategorias(data.categorias || []);
            }
        } catch (err) {
            console.error("Error fetching categorias:", err);
        }
    }, []);

    //cargamos datos iniciales
    useEffect(() => {
        fetchSintomas();
        fetchFallas();
        fetchCategorias();
    }, [fetchSintomas, fetchFallas, fetchCategorias]);

    //llamada para crear una nueva categoria
    const createCategoria = async (nombre) => {
        try {
            Swal.fire({ title: 'Guardando Categoría...', allowEscapeKey: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await fetch(`${API_URL}/categorias_hechos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ nombre })
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                Swal.fire('¡Éxito!', 'Categoría registrada.', 'success');
                await fetchCategorias();
                return true;
            } else {
                Swal.fire('Error', data.message || 'Error al guardar categoría.', 'error');
                return false;
            }
        } catch (err) {
            Swal.fire('Error', 'Error de conexión', 'error');
            return false;
        }
    };

    //llamda para crear un nuevo sintoma (manifestación de falla) 
    const createSintomaConFalla = async (formData) => {
        try {
            Swal.fire({ title: 'Guardando Síntoma y Regla...', allowEscapeKey: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await fetch(`${API_URL}/sintomas_hechos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                Swal.fire('¡Éxito!', 'Síntoma y Falla inicial registrados correctamente y sincronizados con Prolog.', 'success');
                await fetchSintomas();
                await fetchFallas();
                return true;
            } else {
                Swal.fire('Error', data.message || 'Error al guardar síntoma.', 'error');
                return false;
            }
        } catch (err) {
            Swal.fire('Error', 'Error de conexión', 'error');
            return false;
        }
    };

    //llamada para crear una nueva falla
    const createFalla = async (formData) => {
        try {
            Swal.fire({ title: 'Registrando Inferencia...', allowEscapeKey: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await fetch(`${API_URL}/fallas_hechos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok && data.status === 'success') {
                Swal.fire('¡Éxito!', 'Inferencia diagnóstica añadida.', 'success');
                await fetchFallas();
                return true;
            } else {
                Swal.fire('Error', data.message || 'Error al guardar inferencia.', 'error');
                return false;
            }
        } catch (err) {
            Swal.fire('Error', 'Error de conexión', 'error');
            return false;
        }
    };

    //llamdada para descargar hechos.pl
    const descargarPrologBase = async () => {
        try {
            Swal.fire({ title: 'Descargando...', allowEscapeKey: false, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await fetch(`${API_URL}/exportar_hechos`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'hechos.pl');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                Swal.close();
            } else {
                const data = await response.json().catch(() => ({}));
                Swal.fire('Error', data.message || 'Error descargando archivo.', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Error de red al descargar.', 'error');
        }
    };

    return {
        sintomas,
        fallas,
        categorias,
        loading,
        error,
        createCategoria,
        createSintomaConFalla,
        createFalla,
        descargarPrologBase
    };
}
