import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";


export function useRegister() {
    const navigate = useNavigate();

    //objeto centralizado para gestionar los 6 input sin tenermútliples states
    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        telefono: '',
        correo: '',
        contrasena: ''
    });

    const handleChange = (e) => {
        //bloquear activamente inserción de más de 10 figitos del telefono
        if (e.target.name === 'telefono') {
            const rawValue = e.target.value.replace(/[^0-9]/g, '');
            if (rawValue.length > 10) return;
            setFormData({ ...formData, telefono: rawValue });
            return;
        }

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        const { nombre, apellidoPaterno, apellidoMaterno, telefono, correo, contrasena } = formData;

        //validamos letras y espacios
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (!nameRegex.test(nombre)) return "El nombre solo debe contener letras.";
        if (!nameRegex.test(apellidoPaterno)) return "El apellido paterno solo debe contener letras.";

        //campo opcional pero si se escribe debe ser valido
        if (apellidoMaterno.trim() !== '' && !nameRegex.test(apellidoMaterno)) {
            return "El apellido materno solo debe contener letras.";
        }

        //telefono estrictamente 10 digitos
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(telefono)) return "El teléfono debe contener exactamente 10 números.";

        //validamos formato de correo basico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) return "El formato del correo es inválido.";

        //contraseña minimo 8 caracteres
        if (contrasena.length < 8) return "La contraseña es muy corta. Ingresa por favor entre 8 y 12 caracteres.";

        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        //en caso de error en la validación se muestra un mensaje
        const validationError = validateForm();
        if (validationError) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos inválidos',
                text: validationError,
                confirmButtonColor: '#504b38'
            });
            return;
        }

        try {
            //mostramos modal de carga mientras se procesa la solicitud
            Swal.fire({
                title: 'Creando cuenta...',
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            //hacemos la peticion al backend con los datos del formulario
            const response = await fetch('http://18.207.179.123:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: formData.nombre.trim(),
                    apellido_paterno: formData.apellidoPaterno.trim(),
                    apellido_materno: formData.apellidoMaterno.trim(),
                    rol: "Usuario Solicitante", //obligatorio para todos los registros nuevos
                    telefono: formData.telefono,
                    correo: formData.correo.trim(),
                    contraseña: formData.contrasena
                })
            });

            //convertimos la respuesta a json
            const data = await response.json();

            if (response.ok && data.status === "success") {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro Exitoso!',
                    text: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión con tus credenciales.',
                    showConfirmButton: true,
                    confirmButtonColor: '#504b38',
                    confirmButtonText: 'Ir a Iniciar Sesión'
                }).then(() => {
                    navigate('/'); // Redirige al Login
                });
            } else {
                //en caso de error se muestra un mensaje
                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo crear la cuenta',
                    text: data.message || 'Ocurrió un problema, verifica tus datos de nuevo.',
                    confirmButtonColor: '#504b38'
                });
            }
        } catch (error) {
            //en caso de error de red se muestra un mensaje
            console.error('Error en Fetch de registro:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'No pudimos contactar a ExperTrack. Si el problema persiste avisa a soporte.',
                confirmButtonColor: '#504b38'
            });
        }
    };

    return {
        formData,
        handleChange,
        handleRegister
    };
}
