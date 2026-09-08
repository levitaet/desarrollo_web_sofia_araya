
let selectRegiones = document.getElementById("regiones");

RegionesYcomunas.regiones.forEach((region) => {
    let nuevaOpcion = document.createElement("option");
    nuevaOpcion.value = region.NombreRegion;
    nuevaOpcion.textContent = region.NombreRegion;
    selectRegiones.appendChild(nuevaOpcion);
});

let selectComunas = document.getElementById("comunas");

selectRegiones.addEventListener("change", (evento) => {
    selectComunas.innerHTML = '<option value="">-- Seleccione comuna --</option>';

    let regionSeleccionada = evento.target.value;

    let datosRegion = RegionesYcomunas.regiones.find(
        (region) => region.NombreRegion === regionSeleccionada
    );

    if (datosRegion) {
        datosRegion.comunas.forEach((comuna) => {
            let nuevaOpcion = document.createElement("option");
            nuevaOpcion.value = comuna;
            nuevaOpcion.textContent = comuna;
            selectComunas.appendChild(nuevaOpcion);
        })
    }
})

// validacion formulario
const validarForm = () => {

    const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // funciones auxiliares
    function validadorMail(mail) {
        return mailRegex.test(mail)
    }
    const validadorUserName = (username) => username && username.length > 9 && username.length < 156;
    const tieneNumeros = (str) => /\d/.test(str);
    const validadorContrasena = (pswd) => {
        const malas = ["1234"];
        return tieneNumeros(pswd) && !malas.includes(pswd);
    };

    // obtener inputs del DOM por el ID
    let emailInput = document.getElementById("email");
    let userNameInput = document.getElementById("nombre-completo");
    let pswdInput = document.getElementById("contrasenna");

    const error_email = document.getElementById("error-email");
    const error_nombre = document.getElementById("error-nombre");
    const error_contrasenna = document.getElementById("error-contrasenna");
    const error_region = document.getElementById("error-region");
    const error_comuna = document.getElementById("error-comuna");

    let esValido = true;

    error_email.classList.remove("visible");
    error_nombre.classList.remove("visible");
    error_contrasenna.classList.remove("visible");
    error_region.classList.remove("visible");
    error_comuna.classList.remove("visible");

    if (!validadorMail(emailInput.value)) {
        error_email.classList.add("visible");
        esValido = false;
    }

    if (!validadorUserName(userNameInput.value)) {
        error_nombre.classList.add("visible");
        esValido = false;
    }

    if (!validadorContrasena(pswdInput.value)) {
        error_contrasenna.classList.add("visible");
        esValido = false;
    }

    if (selectRegiones.value === "") {
        error_region.classList.add("visible");
        esValido = false;
    }

    if (selectComunas.value === "") {
        error_comuna.classList.add("visible");
        esValido = false;
    }

    if (esValido === false) {
        return;
    }

    alert("Felicidades ya tienes una cuenta!");
    // loginForm.submit();

    // no contamos con un backend, asi que de momento
    // utilizaremos el localStorage para dar la
    // sensacion de que nos hemos autentificado.
    let username = userNameInput.value;
    localStorage.setItem("username", username);

    window.location.href = "./listado-avistamiento.html";
};

// recuperamos el boton que envia el form
let submitBtn = document.getElementById("envio");
submitBtn.addEventListener("click", validarForm);
