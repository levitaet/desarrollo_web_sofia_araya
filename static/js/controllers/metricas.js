const mostrarMensajeGrafico = (idContenedor, mensaje) => {
    const contenedor = document.getElementById(idContenedor);
    contenedor.textContent = "";
    const p = document.createElement("p");
    p.className = "mensaje-grafico";
    p.appendChild(document.createTextNode(mensaje));
    contenedor.appendChild(p);
};

const pedirDatos = (url, idContenedor, dibujar) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.timeout = 5000;
    xhr.onload = function () {
        if (xhr.status === 200) {
            const datos = JSON.parse(xhr.responseText);
            if (datos.length === 0) {
                mostrarMensajeGrafico(idContenedor, "Aún no hay datos para este gráfico.");
            } else {
                dibujar(datos);
            }
        } else {
            mostrarMensajeGrafico(idContenedor, "No se pudieron cargar los datos (error " + xhr.status + ").");
        }
    };
    xhr.onerror = function () {
        mostrarMensajeGrafico(idContenedor, "No se pudo conectar con el servidor.");
    };
    xhr.ontimeout = function () {
        mostrarMensajeGrafico(idContenedor, "El servidor tardó demasiado en responder.");
    };
    xhr.send();
};

const dibujarPorDia = (datos) => {
    Highcharts.chart("grafico-dia", {
        chart: { type: "line" },
        title: { text: null },
        xAxis: { type: "category", title: { text: "Día" } },
        yAxis: { title: { text: "Cantidad de avistamientos" }, allowDecimals: false, min: 0 },
        legend: { enabled: false },
        series: [{ name: "Avistamientos", data: datos }]
    });
};

const dibujarPorAve = (datos) => {
    Highcharts.chart("grafico-ave", {
        chart: { type: "pie" },
        title: { text: null },
        tooltip: { pointFormat: "{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)" },
        series: [{ name: "Avistamientos", data: datos }]
    });
};

const dibujarPorComuna = (datos) => {
    Highcharts.chart("grafico-comuna", {
        chart: { type: "column" },
        title: { text: null },
        xAxis: { type: "category", title: { text: "Comuna" } },
        yAxis: { title: { text: "Cantidad de voluntarios" }, allowDecimals: false, min: 0 },
        legend: { enabled: false },
        series: [{ name: "Voluntarios", data: datos }]
    });
};

const aplicarTema = () => {
    const estilos = getComputedStyle(document.body);
    const colorTexto = estilos.color;
    const colorLineas = "rgba(237, 241, 214, 0.25)";
    Highcharts.setOptions({
        colors: ["#f2c14e", "#9dc08b", "#f78154", "#5fb3b3", "#e9d8a6",
                 "#b388eb", "#4d9de0", "#e86a92", "#c2e812", "#ff9f1c"],
        chart: { backgroundColor: "transparent", style: { fontFamily: estilos.fontFamily } },
        xAxis: {
            lineColor: colorLineas,
            tickColor: colorLineas,
            labels: { style: { color: colorTexto, fontSize: "13px" } },
            title: { style: { color: colorTexto } }
        },
        yAxis: {
            gridLineColor: colorLineas,
            labels: { style: { color: colorTexto, fontSize: "13px" } },
            title: { style: { color: colorTexto } }
        },
        tooltip: { backgroundColor: "rgba(0, 0, 0, 0.85)", style: { color: colorTexto } },
        plotOptions: {
            pie: {
                borderColor: "rgb(64, 81, 59)",
                dataLabels: { color: colorTexto, style: { textOutline: "none", fontSize: "13px" } }
            },
            column: { borderWidth: 0 }
        },
        credits: { style: { color: "rgba(237, 241, 214, 0.6)" } }
    });
};

window.addEventListener("DOMContentLoaded", function () {
    if (typeof Highcharts === "undefined") {
        ["grafico-dia", "grafico-ave", "grafico-comuna"].forEach((id) => {
            mostrarMensajeGrafico(id, "No se pudo cargar la biblioteca de gráficos (Highcharts).");
        });
        return;
    }
    aplicarTema();
    pedirDatos("/datos-avistamientos-dia", "grafico-dia", dibujarPorDia);
    pedirDatos("/datos-avistamientos-ave", "grafico-ave", dibujarPorAve);
    pedirDatos("/datos-voluntarios-comuna", "grafico-comuna", dibujarPorComuna);
});