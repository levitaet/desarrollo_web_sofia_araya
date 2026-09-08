const filtroTipo = document.getElementById("filtro-tipo");
const ordenarPor = document.getElementById("ordenar-por");
const tbody = document.querySelector("#tabla-avistamientos tbody");
const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const infoPagina = document.getElementById("info-pagina");

let avistamientos = [...AvistamientosData];
let paginaActual = 1;
const itemsPorPagina = 3;

// poblar tipos de aves
TiposDeAves.tipos.forEach(t => {
    let opt = document.createElement("option");
    opt.value = t.TipoAve;
    opt.textContent = t.TipoAve;
    filtroTipo.appendChild(opt);
});

const renderizarTabla = () => {
    let filtrados = avistamientos;
    if (filtroTipo.value !== "") {
        filtrados = filtrados.filter(a => a.tipo === filtroTipo.value);
    }

    filtrados.sort((a, b) => {
        const val = ordenarPor.value;
        if (val === "fecha-desc") return b.fechaObj - a.fechaObj;
        if (val === "fecha-asc") return a.fechaObj - b.fechaObj;
        if (val === "lugar-asc") return a.lugar.localeCompare(b.lugar);
        return 0;
    });

    const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina) || 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;

    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const paginados = filtrados.slice(inicio, fin);

    tbody.innerHTML = "";
    if (paginados.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7' style='text-align: center;'>No hay resultados para este filtro.</td></tr>";
    } else {
        paginados.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.fecha}</td>
                <td>${item.hora}</td>
                <td>${item.lugar}</td>
                <td>${item.region}</td>
                <td>${item.tipo}</td>
                <td>${item.subdivision || "-"}</td>
                <td>${item.nombre}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    btnAnterior.disabled = paginaActual === 1;
    btnSiguiente.disabled = paginaActual === totalPaginas;
};

filtroTipo.addEventListener("change", () => { paginaActual = 1; renderizarTabla(); });
ordenarPor.addEventListener("change", () => { paginaActual = 1; renderizarTabla(); });

btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        renderizarTabla();
    }
});
btnSiguiente.addEventListener("click", () => {
    const total = Math.ceil((filtroTipo.value !== "" ? avistamientos.filter(a => a.tipo === filtroTipo.value).length : avistamientos.length) / itemsPorPagina) || 1;
    if (paginaActual < total) {
        paginaActual++;
        renderizarTabla();
    }
});

renderizarTabla();
