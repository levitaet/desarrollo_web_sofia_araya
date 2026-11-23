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
    td.textContent = texto;
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

    tr.appendChild(crearCelda("Evaluar"));
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