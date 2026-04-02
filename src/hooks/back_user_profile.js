import { useState, useCallback } from "react";
import Swal from "sweetalert2";

//----------------------------------------------------
// URL base de la API (proxy Vercel)
const API_URL = '/api';
//----------------------------------------------------

export function useUserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtener ID del usuario desde localStorage
    const getStoredUser = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error("Error al parsear usuario de localStorage", e);
                return null;
            }
        }
        return null;
    };

    //----------------------------------------------------
    // GET /usuarios/<id> — Traer datos del perfil actual
    //----------------------------------------------------
    const fetchProfile = useCallback(async () => {
        const storedUser = getStoredUser();
        if (!storedUser || !storedUser.id_usuario) {
            setError("No se encontró una sesión activa.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/usuarios/${storedUser.id_usuario}`, {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setProfile(data.user);
                // Actualizamos localStorage por si cambiaron datos en el servidor
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                setError(data.message || 'Error al cargar el perfil.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    //----------------------------------------------------
    // PUT /usuarios/<id> — Actualizar mis datos
    //----------------------------------------------------
    const updateProfile = async (formData) => {
        const storedUser = getStoredUser();
        if (!storedUser || !storedUser.id_usuario) return false;

        try {
            Swal.fire({
                title: 'Guardando cambios...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(`${API_URL}/usuarios/${storedUser.id_usuario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nombre: formData.nombre.trim(),
                    apellido_paterno: formData.apellidoPaterno.trim(),
                    apellido_materno: formData.apellidoMaterno.trim(),
                    telefono: formData.telefono,
                    correo: formData.correo.trim(),
                    // Solo enviamos contraseña si el usuario escribió algo
                    ...(formData.contrasena ? { contraseña: formData.contrasena } : {}),
                    // Mantenemos el rol y estatus actuales (no se cambian desde el perfil)
                    rol: storedUser.rol,
                    estatus: storedUser.estatus
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setProfile(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Perfil Actualizado!',
                    text: 'Tus cambios se han guardado correctamente.',
                    confirmButtonColor: '#504b38'
                });
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: data.message || 'No se pudieron guardar los cambios.',
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
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile
    };
}
