const nombreAve = new URLSearchParams(window.location.search).get("ave");
const imagenAve = document.getElementById("imagen-ave");

imagenAve.src = `../static/uploads/avistamientos/${encodeURIComponent(nombreAve)}.jpg`;
imagenAve.alt = nombreAve;