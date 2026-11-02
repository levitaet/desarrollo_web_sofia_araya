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