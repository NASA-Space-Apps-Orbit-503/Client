# Selección de librerías: calendario armonizado de actividad de quemas

Este documento explica por qué se eligió cada herramienta para las dos partes principales de la aplicación web: **mapa y selección de área**, y **calendario y gráficos**. La fuente de datos en todo el proyecto es el registro armonizado de NASA FIRMS (puntos calientes de MODIS + VIIRS).

---

## 1. Mapa y selección de área

**Conjunto elegido:** datos de WorldCover, Leaflet, Leaflet.draw, Turf.js y Nominatim

### Cómo encajan las piezas

1. La persona usuaria escribe el nombre de un lugar (**Nominatim**) o dibuja una forma en el mapa (**Leaflet.draw** sobre **Leaflet**).
2. La aplicación convierte esa selección en un polígono y usa **Turf.js** para encontrar qué celdas de la cuadrícula preagregada o qué puntos calientes caen dentro.
3. Los resultados alimentan el calendario y los gráficos. La cobertura del suelo (**WorldCover**) ya está asociada a cada punto caliente, por lo que puede usarse como filtro o desglose.

---

### WorldCover (datos de cobertura del suelo)

**Qué es:** un ráster global de cobertura del suelo a 10 m de la ESA, con 11 clases (cobertura arbórea, matorral, pastizal, cultivos, áreas construidas, vegetación escasa o suelo desnudo, agua, humedales y otras), producido con un único método en todo el mundo.

**Por qué se eligió**

- **Consistencia.** Cada píxel tiene una clase y el método es el mismo en todas partes. No existe el estado "sin mapear", así que las diferencias entre regiones reflejan el territorio y no el esfuerzo de mapeo. Esto importa en una herramienta cuyo objetivo es ofrecer un panorama consistente y comparable.
- **Ayuda a interpretar los puntos calientes.** La cobertura del suelo permite separar los probables incendios forestales (bosque, matorral, pastizal) de las quemas agrícolas (cultivos) y de las fuentes de calor industriales o urbanas (áreas construidas).
- **Bajo costo en tiempo de ejecución.** La clase de cobertura se muestrea una sola vez en el pipeline de datos y se guarda como una columna de cada punto caliente. El navegador solo filtra y agrega, y la exportación CSV incluye la clase sin costo adicional.

**Cómo usarlo**

- Pipeline: muestrear el ráster en las coordenadas de cada punto caliente (por ejemplo, con `rasterio`).
- Como un píxel de MODIS (~1 km) o de VIIRS (~375 m) abarca muchas celdas de 10 m, conviene asignar la **clase dominante** o guardar las **fracciones por clase**, en lugar de un valor puntual.
- Opcionalmente, mostrarlo como capa superpuesta en el mapa para dar contexto.

**Salvedades**

- Es una instantánea (versiones de 2020 y 2021) y no captura el cambio de cobertura entre 2000 y 2026. Como alternativa consistente en el tiempo, considera la cobertura del suelo de MODIS (MCD12Q1, ~500 m, anual, desde 2001), que es más gruesa.
- Su exactitud es buena pero no perfecta, así que conviene presentar los desgloses por cobertura como indicativos.

---

### Leaflet (mapa base)

**Qué es:** una librería de JavaScript ligera y muy usada para mapas.

**Por qué se eligió**

- **Sencilla y rápida de usar.** La curva de aprendizaje es corta, algo ideal para los tiempos de un hackatón.
- **Gran ecosistema de plugins.** Herramientas de dibujo, controles de geocodificación y capas superpuestas tienen plugins maduros.
- **Suficiente para el volumen de datos.** Como los puntos calientes se preagregan en celdas o conteos mensuales, el navegador no necesita dibujar millones de puntos, por lo que el renderizado de Leaflet (canvas/SVG) alcanza.
- **Funciona de inmediato con teselas de OpenStreetMap**, con la atribución requerida ("© OpenStreetMap contributors").

**Compromiso:** si más adelante necesitas dibujar capas de puntos muy grandes con fluidez, MapLibre GL JS (WebGL) es la mejor opción, aunque requiere más configuración.

---

### Leaflet.draw (área de interés)

**Qué es:** un plugin de Leaflet que añade herramientas para dibujar rectángulos, polígonos y círculos, y para editarlos o eliminarlos.

**Por qué se eligió**

- **Cumple directamente con el reto.** El planteamiento sugiere permitir que las personas dibujen un área de interés en el mapa.
- **Se integra de forma nativa con Leaflet.** Las formas dibujadas se convierten en GeoJSON, que Turf.js y el resto de la aplicación pueden usar de inmediato.
- **Interacción conocida.** Las herramientas de rectángulo y polígono son intuitivas para responsables de emergencias y de manejo de tierras.

**Compromiso:** Leaflet.draw ha tenido poco desarrollo activo en los últimos años. Si encuentras errores o quieres más funciones (ajuste a vértices, modos de edición), **Leaflet-Geoman** es una alternativa directa. Revisa su estado de mantenimiento antes de decidirte.

---

### Turf.js (geometría en el navegador)

**Qué es:** una librería modular de análisis geoespacial en JavaScript que trabaja con GeoJSON.

**Por qué se eligió**

- **Resuelve la lógica espacial sin backend.** El punto dentro de polígono (`booleanPointInPolygon`), las cajas envolventes (`bbox`) y el área (`area`) son las operaciones necesarias para pasar de una forma dibujada a "qué puntos calientes o celdas están dentro".
- **Mismo formato que el resto del conjunto.** Consume el GeoJSON producido por Leaflet.draw y los polígonos de límites de Nominatim.
- **Útil como salvaguarda.** Calcular el área de la selección permite advertir cuando la región es demasiado grande o demasiado pequeña para obtener estadísticas significativas.
- **Modular.** Solo se importan las funciones necesarias, lo que mantiene pequeño el paquete.

**Consejo:** filtra primero con la caja envolvente del polígono y luego aplica punto dentro de polígono, para que las selecciones respondan rápido.

---

### Nominatim (búsqueda de lugares y límites)

**Qué es:** el servicio de geocodificación de OpenStreetMap (una API web, no requiere librería).

**Por qué se eligió**

- **Coincide con cómo piensa la gente.** Quienes responden a emergencias buscan "Parque Nacional Kruger" o "Condado de Los Ángeles", no coordenadas.
- **Límites como área de interés.** Con `polygon_geojson=1`, Nominatim puede devolver el límite administrativo, de modo que se puede seleccionar una región por nombre en lugar de dibujarla.
- **Gratuito y fácil de consultar** con una simple solicitud `fetch`.

**Salvedades**

- La instancia pública tiene límites de uso (aproximadamente una solicitud por segundo, y se espera un User-Agent o Referer que identifique a la aplicación). Está bien para una demostración, pero una herramienta en producción debería usar una instancia propia o un geocodificador comercial.
- La calidad de los límites varía según la región y los polígonos grandes pueden ser pesados, así que conviene simplificarlos (por ejemplo, con `simplify` de Turf) antes de usarlos.
- Se requiere atribución a los colaboradores de OpenStreetMap.

---

## 2. Calendario y gráficos

**Librería elegida:** Apache ECharts

### Por qué se eligió ECharts

- **Calendario y mapa de calor integrados.** ECharts incluye un sistema de coordenadas de calendario y series de mapa de calor, por lo que la visualización central del reto no hay que construirla desde cero.
- **Rampas de color mediante `visualMap`.** Un solo componente asigna colores a los conteos, con escalas continuas o por tramos. Esto facilita aplicar paletas accesibles (viridis, cividis, ColorBrewer) y usar una paleta **divergente** para las anomalías respecto a la mediana histórica.
- **Una sola librería para todos los gráficos.** La misma herramienta cubre las demás salidas que menciona el reto: barras y líneas de puntos calientes por año, gráficos de anomalías frente a promedios de varios años y conteos de incendios detectados.
- **Interactividad lista para usar.** Las descripciones emergentes, leyendas, zoom y eventos de clic permiten pasar el cursor sobre un mes para ver su conteo, o hacer clic en una celda para filtrar el mapa y la tabla.
- **Ayudas de exportación incluidas.** Los gráficos pueden guardarse como imagen (`getDataURL`), lo que apoya el objetivo de descargar análisis y visualizaciones.
- **Más rápido de entregar.** En comparación con D3, que ofrece más control pero exige mucho más código, ECharts permite que un equipo pequeño entregue un resultado pulido en el tiempo de un hackatón.

### Notas de diseño

- **Cuadrícula mes por año.** El componente de calendario nativo se organiza por día. Para un calendario de quemas con "años hacia abajo y meses a lo ancho", usa una **serie de mapa de calor sobre dos ejes categóricos** (x = mes, y = año). Usa la vista de calendario nativa si quieres una vista diaria de un año seleccionado.
- **Dos escalas de color.** Usa una rampa secuencial para los conteos brutos y una rampa divergente (centrada en cero) para las anomalías. No dependas solo del color: muestra el conteo en la descripción emergente y considera imprimir los valores dentro de las celdas.
- **Mes actual frente a mediana histórica.** Calcula la mediana de cada mes calendario a lo largo de los años armonizados y grafica el conteo del mes actual frente a ella (por ejemplo, con una barra más una línea de mediana, o como anomalía porcentual).
- **Accesibilidad.** Elige paletas aptas para daltonismo, asegura un contraste suficiente y mantén etiquetas de texto en las cifras clave.

### Compromisos

- ECharts genera un paquete más grande que otras alternativas. Importa solo los tipos de gráfico y componentes que uses (tree-shaking) para mantenerlo manejable.
- Si necesitas visualizaciones muy personalizadas que ECharts no puede expresar, D3 es la alternativa, a costa de más tiempo de desarrollo.

---

## Tabla resumen

| Componente | Función | Razón principal de la elección |
|---|---|---|
| WorldCover | Clase de cobertura del suelo por punto caliente | Clasificación global consistente, calculada una vez en el pipeline |
| Leaflet | Mapa base | Simple, maduro, con muchos plugins y suficiente para datos preagregados |
| Leaflet.draw | Dibujar el área de interés | Herramientas de dibujo nativas que generan GeoJSON |
| Turf.js | Operaciones espaciales en el navegador | Punto en polígono, caja envolvente y área, sin necesidad de backend |
| Nominatim | Búsqueda de lugares y límites | Seleccionar regiones por nombre, con polígonos para el área de interés |
| Apache ECharts | Mapa de calor del calendario, anomalías y gráficos | Mapa de calor/calendario integrado, rampas de color flexibles, rápido de implementar |

> Antes de finalizar, verifica el estado actual de Leaflet.draw, la política de uso de Nominatim y la disponibilidad de WorldCover (alojamiento o teselas), ya que estos detalles pueden cambiar.
