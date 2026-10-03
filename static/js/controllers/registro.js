document.addEventListener('DOMContentLoaded', () => {
    let selectRegiones = document.getElementById("regiones");
    let selectComunas = document.getElementById("comunas");

    const todasLasComunas = Array.from(selectComunas.options);

    function actualizarComunas() {
        const regionNombre = selectRegiones.options[selectRegiones.selectedIndex].text.trim();
        selectComunas.innerHTML = '<option value="">-- Seleccione comuna --</option>';

        if (!selectRegiones.value) return;

        const regionData = RegionesYcomunas.regiones.find(r => r.NombreRegion.trim() === regionNombre);

        if (regionData) {
            for (let i = 1; i < todasLasComunas.length; i++) {
                const opt = todasLasComunas[i];
                if (regionData.comunas.includes(opt.text.trim())) {
                    selectComunas.appendChild(opt.cloneNode(true));
                }
            }
        }
    }

    selectRegiones.addEventListener("change", actualizarComunas);
    if (selectRegiones.value) {
        const comunaPreseleccionada = todasLasComunas.find(opt => opt.selected);
        actualizarComunas();
        if (comunaPreseleccionada) {
            selectComunas.value = comunaPreseleccionada.value;
        }
    }
});

const validarForm = () => {

    const mailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    function validadorMail(mail) {
        return mailRegex.test(mail)
    }
    const validadorUserName = (username) => username && username.length > 9 && username.length < 156;
    const tieneNumeros = (str) => /\d/.test(str);
    const validadorContrasena = (pswd) => {
        const malas = ["1234"];
        return tieneNumeros(pswd) && !malas.includes(pswd);
    };

    let emailInput = document.getElementById("email");
    let userNameInput = document.getElementById("nombre");
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

    if (!esValido) {
        return false;
    }

    return true;

};

let submitBtn = document.getElementById("envio");
submitBtn.addEventListener("click", (e) => {
    const valido = validarForm();
    if (!valido) {
        e.preventDefault();
    }
})