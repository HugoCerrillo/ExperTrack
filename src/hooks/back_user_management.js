import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

//url base de la api en aws ec2 pasando por vercel 
const API_URL = '/api';

//mapeamos los campos del backend a camelCase del frontend
//camelCase es para que el frontend pueda entender los campos
const mapUsuario = (u) => ({
    id: u.id_usuario || u.id,
    nombre: u.nombre || '',
    apellidoPaterno: u.apellido_paterno || u.apellidoPaterno || '',
    apellidoMaterno: u.apellido_materno || u.apellidoMaterno || '',
    rol: u.rol || 'Usuario Solicitante',
    telefono: u.telefono || '',
    correo: u.correo || '',
    estatus: u.estatus === true || u.estatus === 1 || u.estatus === "true",
    fechaRegistro: u.fecha_registro || null
});

//funcion que maneja los usuarios
export function useUserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //solicutd get para traer todos los usuarios de la bd
    const fetchUsuarios = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'GET',
                credentials: 'include', //importante mandar el jwt 
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

    //al cargar el componente se ejecuta fetchUsuarios
    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    //solicitud post para crear un usuario
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

            //convertimos la respuesta a json
            const data = await response.json();

            //analizamos la respuesta 
            if (response.ok && data.status === 'success') {
                //traemos nuevamente los usuarios actualizados para reflejar el cambio en la tabla
                await fetchUsuarios();
                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario Registrado!',
                    text: 'La cuenta ha sido dada de alta exitosamente en ExperTrack.',
                    confirmButtonColor: '#504b38'
                });
                return true;
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

    //solicitus put para actualizar un usuario
    const actualizarUsuario = async (id, formData) => {
        try {
            Swal.fire({
                title: 'Actualizando datos...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            //construimos el nuestro json con los datos del usuario, la contraseña solo se envía si el usuario la cambió
            const payload = {
                nombre: formData.nombre.trim(),
                apellido_paterno: formData.apellidoPaterno.trim(),
                apellido_materno: formData.apellidoMaterno.trim(),
                rol: formData.rol,
                telefono: formData.telefono,
                correo: formData.correo.trim(),
                estatus: formData.estatus
            };

            //solo enviamos la contraseña si el usuario la cambió
            if (formData.contrasena && formData.contrasena.trim() !== '') {
                payload.contraseña = formData.contrasena;
            }

            //se hace la solicitud put para actualizar el usuario
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            //convertimos la respuesta a json
            const data = await response.json();

            //analizamos la respuesta 
            if (response.ok && data.status === 'success') {
                //actualizamos localmente por ahora para mas veelocidad
                setUsers(prev =>
                    //usamos el .map para recorrer el array de usuarios y actualizar el que coincida con el id
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

    //solicitud delete para eliminar un usuario
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

        //si el usuario no confirma la eliminación, se retorna false
        if (!result.isConfirmed) return false;

        try {
            Swal.fire({
                title: 'Eliminando cuenta...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            //se hace la solicitud delete para eliminar el usuario
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            //convertimos la respuesta a json
            const data = await response.json();

            //analizamos la respuesta
            if (response.ok && data.status === 'success') {
                //quitamos el usuario de la lista local
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

    //retornamos para el componente
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
