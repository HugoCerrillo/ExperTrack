import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function useResetPassword() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetPassword = async (token, newPassword) => {
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Enlace inválido',
                text: 'Falta el token de seguridad en la URL.',
                confirmButtonColor: '#504b38'
            }).then(() => {
                navigate('/', { replace: true });
            });
            return false;
        }

        if (!newPassword || newPassword.length < 8) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña muy corta',
                text: 'Por favor, asegúrate de que tu nueva contraseña tenga al menos 8 caracteres.',
                confirmButtonColor: '#504b38'
            });
            return false;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/restablecer-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    nueva_contraseña: newPassword
                })
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                Swal.fire({
                    icon: 'success',
                    title: '¡Contraseña Actualizada!',
                    text: data.message || 'Ya puedes iniciar sesión con tu nueva contraseña.',
                    confirmButtonColor: '#504b38'
                }).then(() => {
                    navigate('/', { replace: true });
                });
                return true;

            } else {
                // Si el token es invalido o expiró, el servidor retorna 401
                if (response.status === 401) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Enlace caducado',
                        text: 'El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.',
                        confirmButtonColor: '#504b38'
                    }).then(() => {
                        navigate('/', { replace: true });
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al restablecer',
                        text: data.message || 'Ocurrió un error inesperado al actualizar tu contraseña.',
                        confirmButtonColor: '#504b38'
                    });
                }
                return false;
            }
        } catch (error) {
            console.error('Aviso de error en el Fetch:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'No se pudo contactar al servidor. Revisa tu conexión de internet.',
                confirmButtonColor: '#504b38'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        handleResetPassword
    };
}
