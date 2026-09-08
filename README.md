# Tarea 1

Sitio web estático para registrar voluntarios, informar avistamientos de aves, revisar avistamientos recientes y consultar métricas del proyecto.

## Páginas

| Página | Función |
| --- | --- |
| `index.html` | Página principal y navegación |
| `registro-voluntario.html` | Registro de voluntarios |
| `informar-avistamiento.html` | Formulario para informar un avistamiento |
| `listado-avistamiento.html` | Listado filtrable y ordenable |
| `metricas.html` | Gráficos de voluntarios y avistamientos |
| `ver-imagen.html` | Vista simple de imágenes |

## Decisiones

- **Archivos de datos separados:** Las regiones, aves, avistamientos y métricas están en archivos JavaScript independientes para reutilizarlos en distintas páginas.
- **Selector dependiente de comuna:** Las comunas se cargan después de elegir una región para mostrar solo opciones relacionadas.
- **Chart.js:** Se utiliza una biblioteca especializada para crear los gráficos en lugar de dibujarlos manualmente.

## Declaración de uso de IA

En esta tarea se utilizó IA Generativa para:
- Ayudar a insertar Chart.js para la vista de métricas.
- Generación de datos mock
- Correcciones menores de CSS

El [ícono](https://www.svgrepo.com/svg/64059/cute-bird) fue obtenido de SVG Repo, mientras que las imágenes vienen de [Pexels](https://www.pexels.com/es-es/), una plataforma de fotos de stock gratis.