
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

    // obtener el fomulario del DOM por el ID
    // let loginForm = document.getElementById("login-form");

    // obtener inputs del DOM por el ID
    let emailInput = document.getElementById("email");
    let userNameInput = document.getElementById("nombre-completo");
    let pswdInput = document.getElementById("contrasenna");

    let isValid = false;
    let msg = "";

    if (!validadorMail(emailInput.value)) {
        msg += "Mail inválido\n";
        emailInput.style.borderColor = "red"; // cambiar estilo con JS!!
    } else {
        emailInput.style.borderColor = "";
    }

    if (!validadorUserName(userNameInput.value)) {
        msg += "Nombre inválido\n";
        userNameInput.style.borderColor = "red";
    } else {
        userNameInput.style.borderColor = "";
    }

    if (!validadorContrasena(pswdInput.value)) {
        msg += "Contraseña inválida\n";
        pswdInput.style.borderColor = "red";
    } else {
        pswdInput.style.borderColor = "";
    }

    if (selectRegiones.value === "") {
        msg += "Debes seleccionar una región\n";
        selectRegiones.style.borderColor = "red";
    } else {
        selectRegiones.style.borderColor = "";
    }

    if (selectComunas.value === "") {
        msg += "Debes seleccionar una comuna\n";
        selectComunas.style.borderColor = "red";
    } else {
        selectComunas.style.borderColor = "";
    }

    if (msg === "") {
        msg = "Felicidades ya tienes una cuenta!";
        isValid = true;
        // loginForm.submit();

        // no contamos con un backend, asi que de momento
        // utilizaremos el localStorage para dar la
        // sensacion de que nos hemos autentificado.
        let username = userNameInput.value;
        localStorage.setItem("username", username);
    }
    alert(msg); // alertas JS

    if (isValid) {
        window.location.href = "./listado-avistamiento.html";
    }
};

// recuperamos el boton que envia el form
let submitBtn = document.getElementById("envio");
submitBtn.addEventListener("click", validarForm);
