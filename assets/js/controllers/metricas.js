const dibujarGrafico = (datos, canvasId, tipo, titulo, colores) => {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const etiquetas = datos.map(d => d.etiqueta);
    const valores = datos.map(d => d.valor);

    new Chart(ctx, {
        type: tipo,
        data: {
            labels: etiquetas,
            datasets: [{
                label: titulo,
                data: valores,
                backgroundColor: colores,
                borderColor: colores.map(color => color.replace("0.6", "1")),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: tipo === 'bar' ? {
                y: {
                    beginAtZero: true
                }
            } : {}
        }
    });
};

document.addEventListener("DOMContentLoaded", () => {

    const coloresVoluntarios = metricasVoluntarios.map(() => 'rgba(54, 162, 235, 0.6)');
    dibujarGrafico(metricasVoluntarios, "grafico-voluntarios", "bar", "Voluntarios Registrados", coloresVoluntarios);

    const coloresAvistamientos = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 205, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
    ];
    dibujarGrafico(metricasAvistamientos, "grafico-avistamientos", "pie", "Cantidad de Avistamientos", coloresAvistamientos);

});
