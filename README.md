# Tarea 3 - Plataforma de Avistamientos de Aves 🐦

Aplicación web en Flask conectada a MySQL (SQLAlchemy). Sobre la Tarea 2, esta entrega agrega una **página de estadísticas con 3 gráficos** y **comentarios en cada avistamiento**. Ambas funciones usan llamadas asíncronas desde el navegador.

## Cómo ejecutar

1. Crear y activar un ambiente virtual e instalar las dependencias:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Copiar `.env.example` con el nombre `.env` y completar los datos de MySQL y la `SECRET_KEY`.
3. Usar la base de datos `tarea2` de la Tarea 2 y crear la tabla nueva:
   ```bash
   mysql -u <usuario> -p < sql/tabla-comentario.sql
   ```
4. Ejecutar `python app.py` y abrir <http://127.0.0.1:5000>

## Páginas y rutas

| Ruta (app.py) | Método | Función |
| --- | --- | --- |
| `/` | GET | Portada con los dos últimos avistamientos. |
| `/registro-voluntario` | GET, POST | Registro de voluntarios (tabla `voluntario`). |
| `/informar-avistamiento` | GET, POST | Formulario para informar un avistamiento con fotos o videos (tablas `avistamiento` y `registro`). |
| `/listado-avistamiento` | GET | Listado paginado con filtro por ave y orden. |
| `/avistamiento/<id>` | GET | Detalle de un avistamiento, su galería y sus **comentarios** (nuevo en la Tarea 3). |
| `/metricas` | GET | **Estadísticas**: los 3 gráficos y un enlace a la portada. |
| `/datos-avistamientos-dia` | GET | JSON `[["DD-MM-AAAA", total], ...]` para el gráfico de líneas. |
| `/datos-avistamientos-ave` | GET | JSON `[["nombre ave", total], ...]` para el gráfico de torta. |
| `/datos-voluntarios-comuna` | GET | JSON `[["comuna", total], ...]` para el gráfico de barras (solo comunas con voluntarios). |
| `/avistamiento/<id>/comentarios` | GET | JSON con los comentarios del avistamiento (`fecha`, `nombre`, `texto`), del más reciente al más antiguo. |
| `/avistamiento/<id>/comentarios` | POST | Agrega un comentario (campos `nombre` y `texto`). Responde 201 si se guarda, 400 con `errores` por campo si falla la validación, y 404 si el avistamiento no existe. |

## Decisiones de la Tarea 3

1. **Gráficos en el cliente con Highcharts.** La página `/metricas` pide los datos a las URLs `/datos-...` con `XMLHttpRequest` y dibuja los gráficos con Highcharts: línea, torta y barras (`column`, que son barras verticales). Elegí Highcharts porque dibuja los 3 tipos sin plugins. Flot, la otra biblioteca vista en clases, necesita un plugin aparte para la torta.
2. **XHR para los gráficos y `fetch` para los comentarios.** Ambos son asíncronos. Los comentarios se envían con `FormData` en un POST.
3. **JSON desde el servidor.** Las respuestas se arman con `json.dumps` y `make_response`, con las mismas cabeceras del ejemplo de estadísticas de la clase (`Content-type` y `Cache-Control`). `json.dumps` escapa comillas y caracteres especiales, así que un comentario con `"` no rompe el JSON.
4. **Conteos en la base de datos.** Cada gráfico se calcula con una consulta SQL con `GROUP BY` (usando `text()` de SQLAlchemy). Ninguna de esas consultas recibe datos del usuario.
5. **"Tipo de ave"** corresponde a cada registro de la tabla `ave`, porque la tabla no tiene una columna de tipo aparte.
6. **Avistamientos por día** usa la fecha del avistamiento (`fecha_hora`) y muestra solo los días que tienen al menos uno, del más antiguo al más reciente.
7. **Comentarios.** Se validan dos veces, en el cliente (JS) y en el servidor (Flask), con las mismas reglas. Primero se quitan los espacios del inicio y del final; el nombre debe tener entre 3 y 50 caracteres y el texto entre 5 y 300. El máximo de 300 viene de la columna `VARCHAR(300)`. La fecha la asigna el servidor. Si la validación falla, el formulario queda visible con el error en cada campo. Si el comentario se guarda, la lista se vuelve a pedir al servidor.
8. **Seguridad:**
   - **Inyección SQL:** las consultas usan el ORM o SQL sin datos del usuario, y SQLAlchemy envía los valores como parámetros.
   - **XSS:** Jinja escapa los valores de las plantillas, y los comentarios se insertan en la página con `createTextNode` (nunca `innerHTML`), así que un `<script>` se muestra como texto.
   - **Parámetros de URL:** se validan con el convertidor `<int:id>` y con la función `a_entero`, más una lista de valores permitidos para `ordenar` y un rango para `page`. Antes, un valor como `?ave_id=abc` producía un error 500.
   - **Largos máximos:** se validan los largos de los campos que van a la base de datos.
   - **Configuración:** la `SECRET_KEY` y el modo debug se leen desde `.env`.
   - **CSRF:** no se implementó un token. Según OWASP, CSRF fuerza acciones de un usuario *autenticado*, y esta aplicación no tiene inicio de sesión.
9. **Responsive:** se agregó `<meta name="viewport">` y estilos `@media` para el menú y la tabla en pantallas chicas.
10. **Limpieza:** se eliminaron los archivos JS de datos falsos (mock) y los scripts de la Tarea 1 que ningún template usaba.

### Decisiones de la Tarea 2 (se mantienen)

1. **Regiones y comunas:** edité `region-comuna.js` para que los nombres coincidan con los de la base de datos (el `.sql` usa "Región de ...").
2. **Nombre de las imágenes subidas:** formato `YYYYMMDDHHMMSSFFFFFF_nombre.ext`, para que sean únicos.

## Bibliotecas externas

- **Highcharts 12.6.2** (<https://www.highcharts.com>), cargada desde `code.highcharts.com`, para los gráficos. Es gratuita para uso no comercial o educativo según la licencia de Highsoft: <https://www.highcharts.com/license>
- **Flask, SQLAlchemy, PyMySQL y python-dotenv** (versiones en `requirements.txt`).
- **Fuente "Cause"** de Google Fonts.

## Declaración de uso de IA

- Tarea 3: Se utilizó IA para: 
   - generar datos de prueba
   - arreglar/crear archivos de estilo (css) y el estilo de los gráficos en el archivo metricas.js
   - comprobar correctitud de los .html para el validador
   - para crear este README

El [ícono](<https://www.svgrepo.com/svg/64059/cute-bird>) es de SVG Repo, y la mayoría de las imágenes de prueba son de [Pexels](<https://www.pexels.com/es-es/>), una plataforma de fotos de uso libre.