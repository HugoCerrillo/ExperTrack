import { useState } from "react";
import Swal from "sweetalert2";

//este hook es para enviar correo de recuperación de contraseña
export function useForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        //primero validacion de que el correo no este vacio
        if (!email.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor, ingresa un correo electrónico.',
                confirmButtonColor: '#504b38'
            });
            return;
        }

        //despues validamos que el formato del correo sea correcto
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: 'warning',
                title: 'Formato inválido',
                text: 'Ingresa un correo con formato válido (ej. correo@ejemplo.com)',
                confirmButtonColor: '#504b38'
            });
            return;
        }

        try {
            //bloqueamos la interfaz mientras se envia el correo    
            setIsLoading(true);
            Swal.fire({
                title: 'Enviando correo...',
                text: 'Por favor espera. Esto puede tomar unos segundos.',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            //hacemos la peticion al backend con el correo ingresado
            const response = await fetch('/api/recuperar-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    correo: email.trim()
                })
            });

            //obtenemos los datos de la respuesta del backend
            const data = await response.json();

            //analizamos la respuesta del backend 
            if (response.ok && data.status === "success") {
                Swal.fire({
                    icon: 'success',
                    title: '¡Correo enviado!',
                    text: data.message || 'Revisa tu bandeja de entrada o de spam para continuar.',
                    confirmButtonColor: '#504b38',
                    confirmButtonText: 'Entendido'
                });
                setEmail(''); //limpiamos el input
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'No se procesó la solicitud',
                    text: data.message || 'El correo no existe en la base de datos.',
                    confirmButtonColor: '#504b38'
                });
            }
        } catch (error) {
            //error en caso de que falle la peticion al backend
            console.error('Error al solicitar recuperación:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'Problemas de conexión con los servidores de ExperTrack. Intenta más tarde.',
                confirmButtonColor: '#504b38'
            });
        } finally {
            setIsLoading(false); //desbloqueamos la interfaz
        }
    };

    //retornamos las variables y la funcion para usarlas en el componente
    return {
        email,
        setEmail,
        handleResetPassword,
        isLoading
    };
}
