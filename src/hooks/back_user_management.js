import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

//----------------------------------------------------
// URL base de la API en AWS EC2
const API_URL = '/api';
//----------------------------------------------------

//----------------------------------------------------
// Mapea los campos del backend a camelCase del frontend
const mapUsuario = (u) => ({
    // Buscamos id_usuario o id (para ser compatibles con cualquier version del to_dict)
    id: u.id_usuario || u.id, 
    nombre: u.nombre || '',
    apellidoPaterno: u.apellido_paterno || u.apellidoPaterno || '',
    apellidoMaterno: u.apellido_materno || u.apellidoMaterno || '',
    rol: u.rol || 'Usuario Solicitante',
    telefono: u.telefono || '',
    correo: u.correo || '',
    // Convertimos estatus a booleano real por si llega como 1/0 o "true"/"false"
    estatus: u.estatus === true || u.estatus === 1 || u.estatus === "true",
    fechaRegistro: u.fecha_registro || null
});
//----------------------------------------------------

export function useUserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //----------------------------------------------------
    // GET /usuarios — Traer todos los usuarios del servidor
    //----------------------------------------------------
    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'GET',
                credentials: 'include', // envía la cookie JWT automáticamente
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                setUsers(data.users.map(mapUsuario));
            } else {
                setError(data.message || 'Error al cargar usuarios.');
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar',
                    text: data.message || 'No se pudieron obtener los usuarios.',
                    confirmButtonColor: '#504b38'
                });
            }
        } catch (err) {
            const msg = 'No se pudo contactar al servidor. Revisa tu conexión.';
            setError(msg);
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: msg,
                confirmButtonColor: '#504b38'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    //----------------------------------------------------
    // POST /usuarios — Crear un nuevo usuario (admin)
    // Recibe objeto con campos en camelCase del formulario
    //----------------------------------------------------
    const crearUsuario = async (formData) => {
        try {
            Swal.fire({
                title: 'Registrando usuario...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    nombre: formData.nombre.trim(),
                    apellido_paterno: formData.apellidoPaterno.trim(),
                    apellido_materno: formData.apellidoMaterno.trim(),
                    rol: formData.rol,
                    telefono: formData.telefono,
                    correo: formData.correo.trim(),
                    contraseña: formData.contrasena,
                    estatus: formData.estatus
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                // Refrescamos la lista desde el servidor para coherencia
                await fetchUsuarios();
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Registrado!',
                    text: 'La cuenta ha sido dada de alta exitosamente en ExperTrack.',
                    confirmButtonColor: '#504b38'
                });
                return true; // indica éxito al componente
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo crear la cuenta',
                    text: data.message || 'Verifica los datos e inténtalo de nuevo.',
                    confirmButtonColor: '#504b38'
                });
                return false;
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'No pudimos contactar a ExperTrack. Avisa a soporte si persiste.',
                confirmButtonColor: '#504b38'
            });
            return false;
        }
    };

    //----------------------------------------------------
    // PUT /usuarios/<id> — Actualizar datos de un usuario
    //----------------------------------------------------
    const actualizarUsuario = async (id, formData) => {
        try {
            Swal.fire({
                title: 'Actualizando datos...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // Construimos el payload, la contraseña solo se envía si fue tocada
            const payload = {
                nombre: formData.nombre.trim(),
                apellido_paterno: formData.apellidoPaterno.trim(),
                apellido_materno: formData.apellidoMaterno.trim(),
                rol: formData.rol,
                telefono: formData.telefono,
                correo: formData.correo.trim(),
                estatus: formData.estatus
            };

            // Solo enviamos contraseña si el admin la llenó
            if (formData.contrasena && formData.contrasena.trim() !== '') {
                payload.contraseña = formData.contrasena;
            }

            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                // Actualizamos localmente sin hacer otro fetch para mayor velocidad
                setUsers(prev =>
                    prev.map(u => u.id === id ? mapUsuario({ ...data.user, id_usuario: data.user.id_usuario || id }) : u)
                );
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'Los datos del usuario han sido actualizados correctamente.',
                    confirmButtonColor: '#504b38'
                });
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: data.message || 'Ocurrió un problema al guardar los cambios.',
                    confirmButtonColor: '#504b38'
                });
                return false;
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'No se pudo contactar al servidor.',
                confirmButtonColor: '#504b38'
            });
            return false;
        }
    };

    //----------------------------------------------------
    // DELETE /usuarios/<id> — Eliminar usuario del sistema
    //----------------------------------------------------
    const eliminarUsuario = async (id) => {
        const result = await Swal.fire({
            title: '¿Confirmar eliminación?',
            text: 'Se dará de baja esta cuenta del sistema ExperTrack y no podrá revertirse.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f85149',
            cancelButtonColor: '#504b38',
            confirmButtonText: 'Sí, eliminar cuenta',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return false;

        try {
            Swal.fire({
                title: 'Eliminando cuenta...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                // Quitamos el usuario de la lista local
                setUsers(prev => prev.filter(u => u.id !== id));
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El usuario ya no tiene acceso al sistema.',
                    icon: 'success',
                    confirmButtonColor: '#504b38'
                });
                return true;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo eliminar',
                    text: data.message || 'Ocurrió un error al intentar eliminar el usuario.',
                    confirmButtonColor: '#504b38'
                });
                return false;
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'No se pudo contactar al servidor.',
                confirmButtonColor: '#504b38'
            });
            return false;
        }
    };

    //----------------------------------------------------
    // Retornamos todo lo que necesita el componente
    //----------------------------------------------------
    return {
        users,
        loading,
        error,
        fetchUsuarios,
        crearUsuario,
        actualizarUsuario,
        eliminarUsuario
    };
}
