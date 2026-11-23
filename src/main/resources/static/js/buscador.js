const URL_BUSCAR = "/api/avistamientos/buscar";
const ESPERA_MS = 300;

const formBuscador = document.getElementById("form-buscador");
const inputBusqueda = document.getElementById("texto-busqueda");
const estadoBusqueda = document.getElementById("estado-busqueda");
const tablaResultados = document.getElementById("tabla-resultados");
const cuerpoResultados = document.getElementById("cuerpo-resultados");

let temporizador = null;
let numeroBusqueda = 0;

const mostrarEstado = (mensaje) => {
    estadoBusqueda.textContent = mensaje;
};

const limpiarResultados = () => {
    cuerpoResultados.textContent = "";
    tablaResultados.hidden = true;
};

const normalizar = (texto) => {
    let resultado = "";
    for (const letra of texto) {
        const base = letra.normalize("NFD").replace(/[̀-ͯ]/g, "");
        resultado += (base.length === 1 ? base : letra).toLowerCase();
    }
    return resultado;
};

const resaltar = (texto, patron) => {
    const fragmento = document.createDocumentFragment();
    const textoNormal = normalizar(texto);
    const patronNormal = normalizar(patron);
    if (patronNormal.length === 0 || textoNormal.length !== texto.length) {
        fragmento.appendChild(document.createTextNode(texto));
        return fragmento;
    }
    let desde = 0;
    let pos = textoNormal.indexOf(patronNormal, desde);
    while (pos !== -1) {
        fragmento.appendChild(document.createTextNode(texto.substring(desde, pos)));
        const mark = document.createElement("mark");
        mark.textContent = texto.substring(pos, pos + patronNormal.length);
        fragmento.appendChild(mark);
        desde = pos + patronNormal.length;
        pos = textoNormal.indexOf(patronNormal, desde);
    }
    fragmento.appendChild(document.createTextNode(texto.substring(desde)));
    return fragmento;
};

const formatearNota = (nota) => {
    return nota === null ? "-" : nota.toFixed(1);
};

const crearCelda = (etiqueta) => {
    const td = document.createElement("td");
    td.dataset.etiqueta = etiqueta;
    return td;
};

const crearCeldaResaltada = (etiqueta, texto, patron) => {
    const td = crearCelda(etiqueta);
    td.appendChild(resaltar(texto, patron));
    return td;
};

const crearFila = (resultado, patron) => {
    const tr = document.createElement("tr");
    tr.appendChild(crearCeldaResaltada("Voluntario", resultado.voluntario, patron));

    const celdaDia = crearCelda("Día");
    celdaDia.textContent = resultado.dia;
    tr.appendChild(celdaDia);

    tr.appendChild(crearCeldaResaltada("Ave", resultado.ave, patron));
    tr.appendChild(crearCeldaResaltada("Comuna", resultado.comuna, patron));

    const celdaNota = crearCelda("Nota");
    celdaNota.className = "celda-nota";
    celdaNota.textContent = formatearNota(resultado.nota);
    tr.appendChild(celdaNota);

    tr.appendChild(crearCeldaEvaluar(resultado.id, celdaNota));
    return tr;
};

const dibujarResultados = (resultados, patron) => {
    limpiarResultados();
    if (resultados.length === 0) {
        mostrarEstado("No se encontraron avistamientos para \"" + patron + "\".");
        return;
    }
    for (let i = 0; i < resultados.length; i++) {
        cuerpoResultados.appendChild(crearFila(resultados[i], patron));
    }
    tablaResultados.hidden = false;
    mostrarEstado(resultados.length + " avistamiento(s) encontrado(s).");
};

const buscar = (patron) => {
    numeroBusqueda++;
    const miNumero = numeroBusqueda;
    mostrarEstado("Buscando...");

    fetch(URL_BUSCAR + "?q=" + encodeURIComponent(patron))
        .then(function (response) {
            if (response.status !== 200) {
                throw new Error("error " + response.status);
            }
            return response.json();
        })
        .then(function (resultados) {
            if (miNumero !== numeroBusqueda) {
                return;
            }
            dibujarResultados(resultados, patron);
        })
        .catch(function (err) {
            if (miNumero === numeroBusqueda) {
                limpiarResultados();
                mostrarEstado("No se pudo realizar la búsqueda (" + err.message + ").");
            }
        });
};

inputBusqueda.addEventListener("input", function () {
    clearTimeout(temporizador);
    const patron = inputBusqueda.value.trim();
    if (patron.length === 0) {
        numeroBusqueda++;
        limpiarResultados();
        mostrarEstado("Escribe para comenzar a buscar.");
        return;
    }
    temporizador = setTimeout(function () {
        buscar(patron);
    }, ESPERA_MS);
});

formBuscador.addEventListener("submit", function (event) {
    event.preventDefault();
});

const urlNotas = (id) => "/api/avistamientos/" + encodeURIComponent(id) + "/notas";

const esNotaValida = (valor) => /^[1-7]$/.test(valor);

const mostrarMensajeEvaluar = (celda, mensaje, tipo) => {
    let span = celda.querySelector(".mensaje-evaluar");
    if (!span) {
        span = document.createElement("span");
        celda.appendChild(span);
    }
    span.className = "mensaje-evaluar " + tipo;
    span.textContent = mensaje;
};

const crearBotonEvaluar = (id, celdaNota, celda) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-evaluar";
    boton.textContent = "Evaluar";
    boton.addEventListener("click", function () {
        mostrarFormEvaluar(id, celdaNota, celda);
    });
    return boton;
};

const crearCeldaEvaluar = (id, celdaNota) => {
    const celda = crearCelda("Evaluar");
    celda.appendChild(crearBotonEvaluar(id, celdaNota, celda));
    return celda;
};

const restaurarCeldaEvaluar = (id, celdaNota, celda, mensaje, tipo) => {
    celda.textContent = "";
    celda.appendChild(crearBotonEvaluar(id, celdaNota, celda));
    if (mensaje) {
        mostrarMensajeEvaluar(celda, mensaje, tipo);
    }
};

const mostrarFormEvaluar = (id, celdaNota, celda) => {
    celda.textContent = "";

    const form = document.createElement("form");
    form.className = "form-evaluar";

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Nota del 1 al 7");
    const opcionVacia = document.createElement("option");
    opcionVacia.value = "";
    opcionVacia.textContent = "Nota";
    select.appendChild(opcionVacia);
    for (let n = 1; n <= 7; n++) {
        const opcion = document.createElement("option");
        opcion.value = String(n);
        opcion.textContent = String(n);
        select.appendChild(opcion);
    }

    const guardar = document.createElement("button");
    guardar.type = "submit";
    guardar.textContent = "Guardar";

    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.textContent = "Cancelar";
    cancelar.addEventListener("click", function () {
        restaurarCeldaEvaluar(id, celdaNota, celda);
    });

    form.appendChild(select);
    form.appendChild(guardar);
    form.appendChild(cancelar);
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        enviarNota(id, select.value, celdaNota, celda, guardar);
    });

    celda.appendChild(form);
    select.focus();
};

const enviarNota = (id, valor, celdaNota, celda, botonGuardar) => {
    if (!esNotaValida(valor)) {
        mostrarMensajeEvaluar(celda, "Selecciona una nota entera entre 1 y 7.", "error-evaluar");
        return;
    }
    botonGuardar.disabled = true;

    fetch(urlNotas(id), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ nota: valor })
    })
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (mensaje) {
                    throw new Error(mensaje || ("error " + response.status));
                });
            }
            return response.json();
        })
        .then(function (respuesta) {
            celdaNota.textContent = formatearNota(respuesta.promedio);
            restaurarCeldaEvaluar(id, celdaNota, celda, "¡Nota " + valor + " guardada!", "exito");
        })
        .catch(function (err) {
            botonGuardar.disabled = false;
            mostrarMensajeEvaluar(celda, "No se pudo guardar: " + err.message, "error-evaluar");
        });
};