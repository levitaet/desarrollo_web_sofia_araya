const listaComentarios = document.getElementById("lista-comentarios");
const estadoComentarios = document.getElementById("estado-comentarios");

const mostrarEstado = (mensaje) => {
    estadoComentarios.textContent = mensaje;
};

const crearItemComentario = (comentario) => {
    const li = document.createElement("li");
    li.className = "comentario";

    const cabecera = document.createElement("p");
    cabecera.className = "comentario-cabecera";
    const nombre = document.createElement("strong");
    nombre.appendChild(document.createTextNode(comentario.nombre));
    cabecera.appendChild(nombre);
    cabecera.appendChild(document.createTextNode(" — " + comentario.fecha));

    const texto = document.createElement("p");
    texto.className = "comentario-texto";
    texto.appendChild(document.createTextNode(comentario.texto));

    li.appendChild(cabecera);
    li.appendChild(texto);
    return li;
};

const dibujarComentarios = (comentarios) => {
    listaComentarios.textContent = "";
    if (comentarios.length === 0) {
        mostrarEstado("Aún no hay comentarios.");
        return;
    }
    mostrarEstado(comentarios.length + " comentario(s), del más reciente al más antiguo:");
    for (let i = 0; i < comentarios.length; i++) {
        listaComentarios.appendChild(crearItemComentario(comentarios[i]));
    }
};

const cargarComentarios = () => {
    fetch(urlComentarios)
        .then(function (response) {
            if (response.status !== 200) {
                mostrarEstado("No se pudieron cargar los comentarios (error " + response.status + ").");
                return;
            }
            response.json().then(function (comentarios) {
                dibujarComentarios(comentarios);
            });
        })
        .catch(function (err) {
            mostrarEstado("Error de conexión al cargar los comentarios.");
        });
};

document.addEventListener("DOMContentLoaded", cargarComentarios);

const formComentario = document.getElementById("form-comentario");
const inputNombre = document.getElementById("comentario-nombre");
const inputTexto = document.getElementById("comentario-texto");
const errorNombre = document.getElementById("error-comentario-nombre");
const errorTexto = document.getElementById("error-comentario-texto");
const mensajeComentario = document.getElementById("mensaje-comentario");
const botonComentario = document.getElementById("btn-comentario");

const MSG_NOMBRE = "El nombre es obligatorio y debe tener entre 3 y 50 caracteres.";
const MSG_TEXTO = "El comentario es obligatorio y debe tener entre 5 y 300 caracteres.";

const mostrarMensajeComentario = (mensaje, tipo) => {
    mensajeComentario.textContent = mensaje;
    mensajeComentario.className = "mensaje-comentario " + tipo;
};

const mostrarErrorCampo = (span, mensaje) => {
    span.textContent = mensaje;
    span.classList.add("visible");
};

const limpiarErrores = () => {
    errorNombre.classList.remove("visible");
    errorTexto.classList.remove("visible");
    mostrarMensajeComentario("", "");
};

const validarComentario = () => {
    limpiarErrores();
    const nombre = inputNombre.value.trim();
    const texto = inputTexto.value.trim();
    let esValido = true;

    if (nombre.length < 3 || nombre.length > 50) {
        mostrarErrorCampo(errorNombre, MSG_NOMBRE);
        esValido = false;
    }
    if (texto.length < 5 || texto.length > 300) {
        mostrarErrorCampo(errorTexto, MSG_TEXTO);
        esValido = false;
    }
    return esValido;
};

const procesarRespuesta = (status, respuesta) => {
    if (status === 201) {
        formComentario.reset();
        mostrarMensajeComentario("¡Comentario agregado!", "exito");
        cargarComentarios();
        return;
    }
    const errores = respuesta.errores || {};
    if (errores.nombre) {
        mostrarErrorCampo(errorNombre, errores.nombre);
    }
    if (errores.texto) {
        mostrarErrorCampo(errorTexto, errores.texto);
    }
    if (errores.general) {
        mostrarMensajeComentario(errores.general, "fallo");
    } else {
        mostrarMensajeComentario("Revisa los datos del comentario.", "fallo");
    }
};

const enviarComentario = () => {
    if (!validarComentario()) {
        return;
    }
    const datos = new FormData();
    datos.append("nombre", inputNombre.value.trim());
    datos.append("texto", inputTexto.value.trim());

    botonComentario.disabled = true;
    fetch(urlComentarios, { method: "POST", body: datos })
        .then(function (response) {
            return response.json().then(function (respuesta) {
                procesarRespuesta(response.status, respuesta);
            });
        })
        .catch(function (err) {
            mostrarMensajeComentario("No se pudo enviar el comentario. Revisa tu conexión.", "fallo");
        })
        .then(function () {
            botonComentario.disabled = false;
        });
};

formComentario.addEventListener("submit", function (e) {
    e.preventDefault();
    enviarComentario();
});