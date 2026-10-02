const selectTipoAve = document.getElementById("tipo-ave");
const selectSubdivision = document.getElementById("subdivision-ave");
const selectRegion = document.getElementById("region");

TiposDeAves.tipos.forEach((tipo) => {
    let option = document.createElement("option");
    option.value = tipo.TipoAve;
    option.textContent = tipo.TipoAve;
    selectTipoAve.appendChild(option);
});

RegionesYcomunas.regiones.forEach((region) => {
    let option = document.createElement("option");
    option.value = region.NombreRegion;
    option.textContent = region.NombreRegion;
    selectRegion.appendChild(option);
});

selectTipoAve.addEventListener("change", (e) => {
    const tipoSeleccionado = e.target.value;
    selectSubdivision.innerHTML = '<option value="">-- Seleccione subdivisión --</option>';

    const datosTipo = TiposDeAves.tipos.find((t) => t.TipoAve === tipoSeleccionado);

    if (datosTipo && datosTipo.Subdivision.length > 0) {
        datosTipo.Subdivision.forEach((sub) => {
            let option = document.createElement("option");
            option.value = sub;
            option.textContent = sub;
            selectSubdivision.appendChild(option);
        });
        selectSubdivision.disabled = false;
    } else {
        // si hay subdivision o no depende del tipo de ave
        selectSubdivision.disabled = true;
    }
});

selectSubdivision.disabled = true;

const validarFormAvistamiento = () => {
    let nombreAveInput = document.getElementById("nombre-ave");
    let lugarInput = document.getElementById("lugar");
    let fechaInput = document.getElementById("fecha");
    let horaInput = document.getElementById("hora");
    let archivoInput = document.getElementById("archivo");

    const error_tipo = document.getElementById("error-tipo");
    const error_subdivision = document.getElementById("error-subdivision");
    const error_nombre = document.getElementById("error-nombre");
    const error_region = document.getElementById("error-region");
    const error_lugar = document.getElementById("error-lugar");
    const error_fecha = document.getElementById("error-fecha");
    const error_hora = document.getElementById("error-hora");
    const error_archivo = document.getElementById("error-archivo");

    let esValido = true;

    error_tipo.classList.remove("visible");
    error_subdivision.classList.remove("visible");
    error_nombre.classList.remove("visible");
    error_region.classList.remove("visible");
    error_lugar.classList.remove("visible");
    error_fecha.classList.remove("visible");
    error_hora.classList.remove("visible");
    error_archivo.classList.remove("visible");

    if (selectTipoAve.value === "") {
        error_tipo.classList.add("visible");
        esValido = false;
    }

    if (selectSubdivision.options.length > 1 && selectSubdivision.value === "") {
        error_subdivision.classList.add("visible");
        esValido = false;
    }

    if (nombreAveInput.value.trim() === "") {
        error_nombre.classList.add("visible");
        esValido = false;
    }

    if (selectRegion.value === "") {
        error_region.classList.add("visible");
        esValido = false;
    }

    if (lugarInput.value.trim() === "") {
        error_lugar.classList.add("visible");
        esValido = false;
    }

    const fechaRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const fechaMatch = fechaInput.value.match(fechaRegex);

    if (!fechaMatch) {
        error_fecha.classList.add("visible");
        esValido = false;
    } else {
        const dia = parseInt(fechaMatch[1], 10);
        const mes = parseInt(fechaMatch[2], 10);
        const anio = parseInt(fechaMatch[3], 10);

        const fechaIngresada = new Date(anio, mes - 1, dia);
        const hoy = new Date();

        if (fechaIngresada.getFullYear() !== anio || fechaIngresada.getMonth() !== mes - 1 || fechaIngresada.getDate() !== dia) {
            error_fecha.classList.add("visible");
            esValido = false;
        } else if (fechaIngresada > hoy) {
            error_fecha.classList.add("visible");
            esValido = false;
        } else {
            const hace50Anios = new Date();
            hace50Anios.setFullYear(hoy.getFullYear() - 50);
            if (fechaIngresada < hace50Anios) {
                error_fecha.classList.add("visible");
                esValido = false;
            }
        }
    }

    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!horaRegex.test(horaInput.value)) {
        error_hora.classList.add("visible");
        esValido = false;
    }

    if (archivoInput.files.length === 0) {
        error_archivo.classList.add("visible");
        esValido = false;
    }

    if (esValido === false) {
        return;
    }

    alert("Avistamiento informado correctamente!");
    document.getElementById("form-avistamiento").reset();
};

const btnEnviar = document.getElementById("btn-enviar");
btnEnviar.addEventListener("click", validarFormAvistamiento);
