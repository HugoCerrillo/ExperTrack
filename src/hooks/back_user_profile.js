import { useState, useCallback } from "react";
import Swal from "sweetalert2";

//url de la api pasando por vercel
const API_URL = '/api';

//funcion que maneja el perfil del usuario
export function useUserProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //obtener el id del usuario desde localStorage
    const getStoredUser = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error("Error al obtener usuario de localStorage", e);
                return null;
            }
        }
        return null;
    };

    //solicitud get para traer los datos del usuario
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
            //solicitud
            const response = await fetch(`${API_URL}/usuarios/${storedUser.id_usuario}`, {
                method: 'GET',
                credentials: 'include',
            });

            //convertimos la respuesta a json
            const data = await response.json();

            //analizamos la respuesta
            if (response.ok && data.status === 'success') {
                setProfile(data.user);
                //modificamos tambien en localStorage por si las dudas
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

    //solicitud put para actualizar el perfil del usuario
    const updateProfile = async (formData) => {
        const storedUser = getStoredUser();
        if (!storedUser || !storedUser.id_usuario) return false; //si no hay usuario no se puede actualizar

        try {
            Swal.fire({
                title: 'Guardando cambios...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            //solicitud
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
                    //solo se envia la contraseña si el usuario la cambio
                    ...(formData.contrasena ? { contraseña: formData.contrasena } : {}),
                    //se mantiene el rol y estatus actuales (no se cambian desde el perfil)
                    rol: storedUser.rol,
                    estatus: storedUser.estatus
                })
            });

            //convertimos la respuesta a json
            const data = await response.json();

            //analizamos la respuesta
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

    //retornamos al front
    return {
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile
    };
}
