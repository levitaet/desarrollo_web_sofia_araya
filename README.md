# Tarea 2 - Plataforma de Avistamientos de Aves 🐦

Aplicación web dinámica desarrollada en Flask y conectada a una base de datos MySQL, permitiendo a los usuarios registrarse como voluntarios, informar avistamientos con imágenes reales, y consultar un listado interactivo.

## Páginas y Rutas

| Ruta (app.py) | Función |
| --- | --- |
| `/` (`index.html`) | Página principal y navegación, muestra los dos últimos avistamientos registrados en la BDD. |
| `/registro-voluntario` | Registro de voluntarios (Inserción en tabla `Voluntario`). Selector dependiente de comunas. |
| `/informar-avistamiento` | Formulario multiparte para reportar un avistamiento. Incluye guardado físico de imágenes y registro en las tablas `Avistamiento` y `Registro`. |
| `/listado-avistamiento` | Listado paginado desde el backend con filtros dinámicos reales por ave y lugar/fecha. |
| `/avistamiento/<id>` | Vista detallada de un avistamiento y visualización de sus imágenes asociadas. |
| `/metricas` | Vista estática (heredada de Tarea 1) con gráficos de Chart.js. |

## Decisiones


1. **Sincronización de Nomenclatura para el Dropdown (Regiones y Comunas)**: 
   Detecté una inconsistencia entre los nombres de las regiones y comunas provistas en la base de datos y las requeridas por el archivo `region-comuna.js` que usaba anteriormente (creo que la diferencia principale estaba en que el .sql dice "Región de"), entonces edité el `.js`.

2. **Nombre de archivo de Imágenes Subidas**: 
   Los nombres de las imágenes están en formato timestamp - nombre-original-imagen (`YYYYMMDDHHMMSSFFFFFF_nombre.ext`) para que sean únicos y no se repitan :) 

---

## Declaración de uso de IA

En esta tarea se utilizó IA Generativa para:
- Generación de datos mock (creo que no se suben)
- Ayuda con edición de archivos `.css`
- Redacción de este README


El [ícono](https://www.svgrepo.com/svg/64059/cute-bird) fue obtenido de SVG Repo, mientras que la mayoría de las imágenes de prueba provienen de [Pexels](https://www.pexels.com/es-es/), plataforma de fotos de stock de uso libre.