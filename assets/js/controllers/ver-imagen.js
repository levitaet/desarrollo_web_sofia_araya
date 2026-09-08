const nombreAve = new URLSearchParams(window.location.search).get("ave");
const imagenAve = document.getElementById("imagen-ave");

imagenAve.src = `./assets/img/avistamientos/${encodeURIComponent(nombreAve)}.jpg`;
imagenAve.alt = nombreAve;