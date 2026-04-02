import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function useLogin() {
    const [email, setEmail] = useState(''); // email del usuario
    const [password, setPassword] = useState(''); // contraseña del usuario
    const navigate = useNavigate();

    //Gestiona todo el flujo asincrono para separar el Backend del Frontend
    const handleLogin = async (e) => {
        e.preventDefault();

        //sirve para evitar que se envie el formulario si los campos estan vacios
        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: '¡Campos vacíos!',
                text: 'Por favor, ingresa tu correo y contraseña.',
                confirmButtonColor: '#504b38'
            });
            return;
        }

        try {
            //Eviamos los datos del formulario al backend mediante la api
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', //guardamos la cookie
                body: JSON.stringify({
                    correo: email,
                    contraseña: password
                })
            });

            //obtenemos la respuesta del backend en una constante
            const data = await response.json();

            //trabajamos la respuesta de la api
            if (response.ok && data.status === "success") {
                Swal.fire({
                    icon: 'success',
                    title: '¡Acceso Concedido!',
                    text: data.message,
                    timer: 2000,
                    showConfirmButton: false
                });

                //como Flask ya inyecto las galletas JWT, usamos el almacenamiento local para 
                // guardar datos públicos (ej. Nombre para la barra del menú)
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                //redirigimos al dashaboard
                navigate('/dashboard');

            } else {
                //error en caso de que las credenciales sean invalidas
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso Denegado',
                    text: data.message || 'Correo o contraseña incorrectos',
                    confirmButtonColor: '#504b38'
                });
            }
        } catch (error) {
            //ejecutar el catch si el servidor esta apagado o CORS bloquea la peticion
            console.error('Aviso de error en el Fetch:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error en el sistema',
                text: 'No se pudo contactar al servidor. Revisa tu conexión de internet o avisa a soporte técnico.',
                confirmButtonColor: '#504b38'
            });
        }
    };

    //retornamos lo necesario a la interfaz
    return {
        email,
        setEmail,
        password,
        setPassword,
        handleLogin
    };
}