# MATE-NEM

Aplicación web pública y gamificada para la enseñanza de Matemáticas en
Educación Secundaria, alineada a la Nueva Escuela Mexicana (NEM). Acceso
libre por enlace (sin contraseñas), registro ligero del alumno, PDAs
divididos en subtemas de menor a mayor dificultad (cada uno con su propia
mini-actividad gamificada de 5 o 10 preguntas —en una o dos rondas—, con
puntos y estrellas), un resultado global por PDA, y constancias
descargables con fecha, hora y código QR de verificación. Incluye además
"Ejercítate", un apartado de 40 temas de práctica libre disponible para
cualquier alumno de cualquier grado.

## Estado del proyecto

Este repositorio se construye por pasos. Ya está completo el flujo principal:
registro del alumno → selección de grado (con acceso, además, al apartado
"Ejercítate" de 40 temas de práctica libre) → PDA (problematización →
subtemas de menor a mayor dificultad, cada uno con su propia mini-actividad
calificada de 5 reactivos y su propio mini-resultado → resultado GLOBAL del
PDA, suma de todos los subtemas → práctica extra opcional) → envío a Sheets
(uno por subtema y uno por el resultado global) → constancia con fecha,
hora y QR → **pantalla de celebración final** estilo videojuego. Los
**3 trimestres completos** en los 3 grados (38 PDAs curriculares: 14 en 1°,
13 en 2°, 11 en 3°, repartidos entre los ejes "Sentido numérico y
pensamiento algebraico", "Forma, espacio y medida" y "Análisis de datos y
probabilidad" — ver "Paso 23" más abajo) llegaron a tener **10 lecciones
de menor a mayor dificultad** cada uno (Paso 25) y, desde el **Paso 27**,
cada una de esas 10 lecciones es **su propia serie independiente**, con su
propio resultado y su propia constancia (id con sufijo `-01`.._`-10`,
títulos "…1.1"…"…1.10"): **380 series en total** (140 en 1°, 130 en 2°,
110 en 3°). (El Paso 26, que agrupaba las lecciones en 3 series de 3-4
cada una, quedó superado por este diseño de 1 lección = 1 serie — ver
"Paso 27" más abajo.) Los 40 temas de Ejercítate (con 4 lecciones cada
uno, sin dividir) ya están cargados con este diseño, mezclando los 4
tipos de reactivo soportados (opción múltiple, verdadero/falso, llenar
frase, relacionar columnas); en cada intento, el orden de las preguntas y
el de sus opciones se mezcla aleatoriamente, así que repetir un subtema
no se ve idéntico la segunda vez. Cada PDA/tema y cada subtema tiene su
propio número (`Tema N`, `N.1`…) mostrado junto a su título. Una sección
de práctica extra opcional (sin calificar) aparece después del resultado
global para quien quiera seguir practicando, y justo después de ella (o
del resultado, si el PDA no tiene práctica extra) aparece la celebración
final.

Cada una de las 380 series de grado (ver "Paso 27") tiene **exactamente 1
subtema** (la lección completa, tal cual venía del Paso 25), con su propia
mini-actividad calificada de **5 o 10 reactivos** (1 o 2 rondas de 5,
según la lección) que termina en su propio mini-resultado — y, al ser la
única lección de la serie, ese mini-resultado se convierte de inmediato
en el resultado global de la serie: **5 o 6 pasos** hasta la constancia
(problematización + subtema + 1-2 rondas de actividad + mini-resultado +
resultado), en vez de los 42 de un PDA sin dividir o los 14-18 de una
serie del Paso 26. Además, cada serie trae su propia porción de
**práctica extra** opcional y sin calificar (repartida en 10 partes
proporcionales entre las lecciones de cada PDA original), para quien
quiera seguir practicando después de ver su resultado. Su `nivelEtiqueta`
se conserva igual que en el Paso 25 ("Nivel N de 10 · <etiqueta>") para no
perder el contexto de qué tan avanzada es dentro del tema completo. Los
temas de Ejercítate siguen con sus propios 4 subtemas (20 reactivos, una
sola ronda de 5 cada uno) y su propia práctica extra más breve (3-4
reactivos): no se tocaron en ninguno de estos ajustes. Desde el Paso 17,
Ejercítate tiene **40 temas** (36 originales + 4 nuevos de "completar
dígitos del algoritmo" y números con signo, ver más abajo). Al terminar
la constancia y la práctica extra (si la serie/tema la tiene), aparece
una pantalla de **celebración estilo "nivel superado" de videojuego** —
confeti animado, trofeo y un botón para elegir otro tema — como cierre
festivo de cada recorrido.

*(Entre el Paso 15 y el Paso 20 el camino de cada grado se probó también
como 49/42/28 "tarjetas" de un solo subtema cada una, una por cada nivel y
repaso de los 17 PDAs originales, para alargar visualmente el recorrido.
El Paso 21 revirtió esa división: el docente pidió que cada PDA de grado
tomara una cantidad de pasos similar a la de un tema de Ejercítate en vez
de resolverse en muy pocos clics, así que las 119 tarjetas volvieron a
fusionarse en los 17 PDAs completos descritos arriba — ver "Paso 21" en
`data/README.md` para el detalle completo.)*

"Ejercítate" (40 temas, agrupados en básicos/intermedios/avanzados/
estadística y probabilidad) reutiliza el 100% del motor de PDAs: se trata
como un "grado" sintético que recorre exactamente las mismas rutas, vistas
y lógica de gamificación que un grado real, solo con su propia carpeta de
datos (`data/ejercitate/`) y su propio color de acento — ver `data/README.md`
para el detalle de esta arquitectura y el listado completo de los 40 temas.

La interfaz tiene un diseño visual propio e intuitivo: tipografía Baloo 2
para encabezados e Inter para texto, marca índigo/violeta en la navegación,
y una paleta propia **"Aula NEM"** — original y deliberadamente distinta a
la de Duolingo (azul pizarrón, cobre, verde bosque y grafito por grado/
Ejercítate; ámbar/ocre, azul, vino y verde azulado por fase del recorrido)
— para que sea más fácil distinguir en qué parte del PDA está el alumno de
un vistazo. La lista de PDAs de cada grado se muestra como un **camino
serpenteante** (curva SVG suave con un nodo numerado por PDA, ninguno
bloqueado — el docente puede pedir cualquier PDA en cualquier momento); en
Ejercítate ese mismo camino se repite una vez por categoría (4 mini-caminos
con su propio encabezado). Dentro de cada PDA/tema el avance también se ve
"en serpiente" al bajar de actividad en actividad. Incluye íconos dibujados
a mano por tipo de pantalla (sin librería externa de íconos), animaciones
de entrada suaves y estrellas con efecto "pop" en los resultados, y una
constancia con fecha y hora de generación, código QR y descarga en PDF.
Falta la página de verificación de folios y el despliegue real del backend.

## Árbol del repositorio

```
mate-nem/
├── README.md
├── index.html                     ✅ incluido — registro + arranque de la SPA + fuentes Baloo 2/Inter
├── assets/
│   ├── css/
│   │   └── styles.css             ✅ incluido — diseño visual, animaciones y estilos de la constancia
│   ├── img/
│   │   └── mascota/                ✅ incluido — 12 ilustraciones reales del "Profe Ponchito" (Paso 22), usadas por `imagenMascota_`
│   └── js/
│       ├── app.js                 ✅ incluido — vistas y flujo completo de la SPA
│       ├── router.js              ✅ incluido — router por hash, sin dependencias
│       ├── session.js             ✅ incluido — datos del alumno en localStorage
│       ├── pda-loader.js          ✅ incluido — lee data/grado-X (o data/ejercitate) + index.json
│       ├── gamification.js        ✅ incluido — cálculo de puntaje y estrellas
│       ├── webhook.js             ✅ incluido — POST al backend + reintento automático
│       └── constancia.js          ✅ incluido — diploma dinámico + QR + PDF
├── components/
│   └── constancia.html            ✅ incluido — demo aislado de la constancia
├── data/
│   ├── README.md                  ✅ incluido — cómo agregar PDAs + fuente curricular
│   ├── schema/
│   │   └── pda.schema.json        ✅ incluido — esquema formal de un PDA
│   ├── grado-1/                   ✅ 7 PDAs completos — Trimestre 1 (4 subtemas núcleo + práctica extra de 34 c/u)
│   ├── grado-2/                   ✅ 6 PDAs completos — Trimestre 1 (4 subtemas núcleo + práctica extra de 34 c/u)
│   ├── grado-3/                   ✅ 4 PDAs completos — Trimestre 1 (4 subtemas núcleo + práctica extra de 34 c/u)
│   └── ejercitate/                ✅ 40 temas — básicos/intermedios/avanzados/estadística (EJ-01…40)
└── backend/
    └── google-apps-script/
        ├── Code.gs                ✅ incluido — Web Endpoint (doPost/doGet)
        └── README.md              ✅ incluido — esquema de columnas y despliegue
```

## Stack técnico

- **Frontend:** HTML5, CSS3 (Tailwind CSS vía CDN), JavaScript Vanilla ES6+ modular (sin build step, compatible con GitHub Pages tal cual).
- **QR y PDF:** `qrcode.js` y `html2pdf.js`, cargados por CDN.
- **Backend / DB:** Google Apps Script (Web App) + Google Sheets.
- **Hosting:** GitHub Pages (repositorio público, rama `main` o carpeta `/docs`).

## Cómo probar lo ya construido

Toda la app usa `import`/`export` (ES Modules) y los navegadores bloquean
módulos cargados con doble clic (`file://`) por política CORS. Sírvela con
un servidor local:

```bash
cd mate-nem
python3 -m http.server 8000
```

Y abre `http://localhost:8000/`. En GitHub Pages esto no es problema, porque
el sitio ya se sirve por `https://`.

1. **Flujo completo:** regístrate con cualquier nombre/grado/grupo, elige tu
   grado y trimestre — los 3 grados ya tienen sus 3 trimestres completos —
   o entra a "Ejercítate" para cualquiera de sus 40 temas; resuelve
   cualquier PDA/tema y genera tu constancia. Sin el Web Endpoint desplegado,
   el envío a Sheets fallará
   silenciosamente y el folio dirá `PENDIENTE-...`: es el comportamiento
   esperado hasta que sigas el paso 2.
2. **Backend:** sigue `backend/google-apps-script/README.md` para desplegar
   el Web Endpoint, prueba la URL `.../exec` en el navegador y pégala en
   `assets/js/webhook.js` (`WEBHOOK_URL`).
3. **Datos:** revisa `data/README.md` — incluye la fuente curricular usada
   y cómo agregar más PDAs; valida contra `data/schema/pda.schema.json`.

## Hoja de ruta (según se acordó en el proyecto)

1. ✅ Archivos de configuración y backend (Apps Script) + constancia + esquema de PDAs.
2. ✅ Interfaz web: `index.html`, registro del alumno, navegación por grado.
3. ✅ Router + carga dinámica de PDAs (`pda-loader.js`) y motor de gamificación.
4. ✅ Integración final: flujo completo PDA → actividad → envío a Sheets → constancia (probado de punta a punta).
5. ✅ Trimestre 1 completo en los 3 grados (17 PDAs, transcritos del Programa Sintético Fase 6 — ver `data/README.md` sobre la distribución por grado).
6. ✅ Rediseño de los PDA: tema explicado en subtemas (con ejemplos y checks formativos de 4 tipos de pregunta), barra de % de avance y reto final con reactivos mixtos — aplicado a los 17 PDAs existentes y probado de punta a punta.
7. ✅ Título y explicación teórica al inicio de cada pantalla del recorrido, problematización redactada en lenguaje sencillo.
8. ✅ Reto ampliado a 5 reactivos, sección de práctica extra opcional después del resultado, y diseño visual propio (tipografía, colores por grado, íconos, animaciones, constancia rediseñada) — aplicado a los 17 PDAs y probado de punta a punta.
9. ✅ Reto ampliado de 5 a **20 reactivos por PDA**, presentados en 4 páginas de 5 con navegación Atrás/Siguiente que conserva las respuestas, y un color distinto por fase del recorrido para hacer la interfaz más intuitiva — aplicado a los 17 PDAs y probado de punta a punta (incluida la restauración de respuestas al navegar hacia atrás).
10. ✅ Constancia con comparación de puntaje ("X de Y pts") y botón de descarga en PDF reubicado justo debajo del diploma; numeración de Temas y subtemas (`Tema N`, `N.1`…) en toda la app; manifiesto y numeración propia (`E.1`…`E.4`) para el futuro apartado "Ejercítate".
11. ✅ Rediseño Duolingo (primera etapa): cada PDA pasó de "3 subtemas + 1 reto de 20 preguntas paginado" a **4 subtemas de menor a mayor dificultad, cada uno con su propia mini-actividad calificada de 5 preguntas** (20 en total) con orden de preguntas/opciones aleatorio en cada intento, más un **resultado global** (suma de los 4 mini-resultados) que alimenta la constancia; constancia con fecha y hora; acceso a "Ejercítate" ya visible en la pantalla de selección de grado (contenido interactivo aún pendiente) — aplicado a los 17 PDAs y probado de punta a punta.
12. ✅ Camino de PDAs en forma de "serpiente" (curva SVG suave con nodos numerados, ninguno bloqueado — el docente puede pedir cualquier PDA en cualquier momento), un indicador de avance también "en serpiente" al bajar de actividad en actividad dentro de un PDA, y una paleta de colores propia ("Aula NEM": azul pizarrón, cobre, verde bosque, grafito, vino, ocre) deliberadamente distinta a la de Duolingo — aplicado a los 3 grados y probado de punta a punta.
13. ✅ Contenido interactivo completo del apartado "Ejercítate": 36 temas (10 básicos, 10 intermedios, 10 avanzados, 6 de estadística y probabilidad), con la misma dinámica que un PDA (problematización + 4 subtemas × 5 reactivos + práctica extra). Arquitectura de "pseudo-grado" (`'ejercitate'` reutiliza el 100% del motor de PDAs — rutas, carga de datos, gamificación, webhook, constancia — con su propia carpeta `data/ejercitate/` y su propio color de acento, ver `data/README.md`) y camino agrupado en 4 mini-caminos por categoría, cada uno con su propio encabezado. Los 36 temas (864 reactivos) están validados contra el esquema, sin duplicados semánticos, y probados de punta a punta con Playwright.
14. ✅ Subtemas de repaso y pantalla de celebración final. Los 17 PDAs del Trimestre 1 ganaron 3 subtemas de repaso cada uno (`N.5`-`N.7`, 15 reactivos más, sin contenido nuevo — refuerzan los 4 subtemas núcleo con ejercicios distintos), pasando de 4 a 7 subtemas y de 20 a 35 reactivos calificados por PDA; el motor de PDAs ya soportaba cualquier número de subtemas de forma dinámica, así que solo hizo falta generalizar la etiqueta de nivel (`nivelChip_`: "Repaso N de 3" para los subtemas extra) y el esquema (`maxItems` de 4 a 7). Además, al terminar la constancia (y la práctica extra, si la hay) aparece una pantalla de celebración estilo "nivel superado" de videojuego (`panelCelebracion_`: confeti animado, trofeo y botón para elegir otro tema). Los 255 reactivos nuevos (17 PDAs × 3 subtemas × 5) están validados contra el esquema, sin duplicados semánticos en todo el archivo de cada PDA (no solo por subtema — 663 reactivos revisados en total entre los 17 PDAs, sumando los ya existentes), y probados de punta a punta con Playwright junto con los 36 temas de Ejercítate (53/53 pruebas).
15. ✅ Cada PDA curricular del Trimestre 1 (17 en total) se dividió en tantas tarjetas de camino como subtemas tenía (7 cada uno): el recorrido de cada grado pasó de 7/6/4 paradas a **49/42/28**, sin escribir temario nuevo — reutiliza tal cual la explicación, ejemplos y los 5 reactivos de cada subtema, solo con una problematización nueva y breve por tarjeta (redactada por separado para cada una de las 119, con un contexto real distinto ligado específicamente a esa habilidad). El motor de PDAs ya soportaba cualquier número de subtemas (ver Paso 14), así que una tarjeta de 1 solo subtema funciona sin cambios de fondo; se agregó `nivelEtiqueta` (esquema y `nivelChip_` en `app.js`) para que cada tarjeta muestre su nivel de dificultad real ("Nivel 3 de 4 · Avanzado", "Repaso 2 de 3"…) en vez de recalcularlo por su posición (que en una tarjeta de 1 subtema siempre sería "1 de 1"). La práctica extra de cada PDA original se conserva en la última de sus 7 tarjetas (la de "Repaso integral"), sin duplicarla en las demás. Los 17 PDAs monolíticos originales se reemplazaron por las 119 tarjetas (`data/grado-N/index.json` reconstruido); las 119 problematizaciones nuevas están validadas contra el esquema, sin duplicados exactos entre sí, y las 119 tarjetas + los 36 temas de Ejercítate (155 en total) están probados de punta a punta con Playwright (155/155).
16. ✅ Segunda ronda de reactivos en las 119 tarjetas del camino (Paso 16): cada una de las 119 tarjetas de grado-1/2/3 pasó de 5 a **10 reactivos** en su único subtema, presentados como **dos rondas consecutivas de 5** ("Ronda 1 de 2" → "Ronda 2 de 2", equivalentes a un "paso 3" y un "paso 4" del recorrido) que se califican juntas en un solo mini-resultado al terminar la segunda ronda — el reto ya no termina en la primera pantalla de 5 preguntas. El motor deriva el número de rondas de `Math.ceil(reactivos.length / 5)`, así que sigue siendo 100% compatible con los 36 temas de Ejercítate (5 reactivos = 1 sola ronda, sin cambio visible). El orden de las preguntas y, si son de opción múltiple, el de sus opciones se vuelve a barajar cada vez que se entra tanto en la Ronda 1 como en la Ronda 2 (mecanismo ya existente, ahora extendido a las 10). Se agregaron 595 reactivos nuevos (119 tarjetas × 5), validados contra el esquema, sin duplicados reales (0 tras revisión por firma completa de contenido, no solo por texto inicial), y las 155 tarjetas/temas están probados de punta a punta con Playwright (155/155).
17. ✅ 4 temas nuevos en "Ejercítate" (Paso 17), categoría básico: **"Completar dígitos del algoritmo de la suma y resta"** (acarreo y préstamo, incluido préstamo a través de ceros), **"Suma y resta de números con signo"** (regla de signos, resta como suma del opuesto, dobles negativos, aplicaciones reales), **"Completar dígitos del algoritmo de la multiplicación y división"** (acarreos, productos parciales, bajar dígitos, residuos) y **"Completar dígitos del algoritmo de la multiplicación y división con decimales"** (conteo/colocación de cifras decimales, recorrer el punto decimal al dividir). A diferencia de los temas de "calcular el resultado final" que ya existían, estos ponen el foco en el *proceso* del algoritmo escrito: cada reactivo describe un paso concreto (en prosa, no en una cuadrícula vertical — el motor de reactivos solo soporta un hueco `___` por línea) y pide el dígito o número que falta en ese paso. Ejercítate pasó de 36 a **40 temas** (EJ-37…EJ-40); los 36 originales no se tocaron. Los 160 reactivos nuevos (4 temas × 4 subtemas × 5 + 4 de práctica extra cada uno) están validados contra el esquema, sin duplicados reales, y probados de punta a punta con Playwright junto con el resto del banco (159/159).
18. ✅ Rediseño visual "casillero" de 3 de los 4 temas de algoritmos (Paso 18) y renumeración de Ejercítate. Un quinto tipo de reactivo, **`algoritmo_columnas`**, dibuja el algoritmo vertical (suma, resta o multiplicación) tal como se ve en papel — filas alineadas a la derecha, con dígitos ya dados como texto fijo y las posiciones a completar como casillas de una sola cifra — igual que las hojas de trabajo de "completar los espacios en blanco" que usa el docente en clase. Se aplicó a los 3 temas de "Completar dígitos del algoritmo..." que sí tienen una forma de columna reconocible: **suma y resta**, **multiplicación y división**, y **multiplicación y división con decimales** (72 reactivos rediseñados en total). El tema de **suma y resta de números con signo** se dejó tal cual (en prosa, Paso 17): no tiene acarreo/préstamo ni una forma de columna que dibujar, así que el formato de casillero no aplica conceptualmente. La división, que no tiene una relación de columna tan directa como la suma/resta/multiplicación, se representa verificando el algoritmo inverso (cociente × divisor = dividendo) con el mismo widget, y la retroalimentación de cada reactivo aclara qué se está comprobando. No se implementó el formato más complejo de tablas encadenadas con flechas que también aparecía en las hojas de referencia — queda pendiente como una posible ampliación futura, al ser un widget estructuralmente distinto. Aprovechando el rediseño, los 40 temas de Ejercítate se renumeraron para quedar contiguos por categoría (básicos 1-14, intermedios 15-24, avanzados 25-34, estadística y probabilidad 35-40) — antes los 4 temas del Paso 17 rompían la secuencia apareciendo como 37-40 después del 10. Es una reordenación pura, sin tocar contenido. Validado contra el esquema (0 errores, 0 duplicados) y probado de punta a punta con Playwright junto con el resto del banco (159/159) — ver `data/README.md` para el detalle del formato y la arquitectura del nuevo tipo de reactivo.
19. ✅ Corrección de `algoritmo_columnas` a partir de 5 hojas reales de "criptograma numérico" (Paso 19). El docente compartió ejemplos reales de la web mostrando que "criptograma" es el mismo mecanismo que el widget de casillero del Paso 18 — confirmó que no hacía falta un tipo de reactivo nuevo, pero al compararlos contra el contenido ya generado se encontró un bug real: varios reactivos de `EJ-11`/`EJ-13`/`EJ-14` tenían **dos cifras ocultas en la misma columna** del algoritmo, lo que hace que esa columna no tenga una solución matemáticamente única (dos incógnitas, una sola ecuación) aunque el motor solo aceptara la respuesta "correcta" registrada. Se corrigieron 75 conflictos de este tipo en los 84 reactivos de los 3 temas (calificados + práctica extra), garantizando que cada columna del algoritmo tenga como máximo una casilla vacía — igual que en las hojas de referencia — sin tocar los números ni la retroalimentación de ningún reactivo. Se enriquecieron con casillas adicionales los pocos reactivos que quedaron demasiado simples tras la corrección. Como bonus (extensión condicional del pedido), se agregaron 2 reactivos de `algoritmo_columnas` a la práctica extra opcional de `EJ-02` (Operaciones básicas). Verificado con un script propio de análisis por columnas (0 columnas ambiguas en los 72 reactivos de EJ-11/13/14) y probado de punta a punta con Playwright junto con el resto del banco (159/159) — ver `data/README.md` para el detalle técnico.
20. ✅ Rediseño visual "Profe Ponchito" (Paso 20) — capa de interfaz sobre lo ya construido, sin tocar ningún dato. El docente pidió adoptar la estructura/forma de Duolingo (curvas orgánicas, tarjetas muy redondeadas, botones con relieve 3D, paneles flotantes) manteniendo la paleta propia "Aula NEM" en versión pastel (nunca los colores propios de Duolingo). Se implementaron los 5 puntos pedidos: **(1)** cada nodo del camino de módulos ahora es un `<details>/<summary>` que se despliega en una tarjeta flotante con sus "Lecciones" (subtemas) y un botón "Empezar →"; **(2)** un panel flotante curvo de retroalimentación (verde pastel/logro o naranja pastel/"Profe Ponchito pensativo") aparece en la práctica extra y al terminar cada ronda de una actividad calificada; **(3)** encabezado con esquinas inferiores redondeadas, avatar circular con iniciales, barra de progreso curva y una insignia de "Graduación/Birrete" en resultados perfectos; **(4)** botones y nodos con el efecto "pulsable" 3D (`.mn-boton-3d`); **(5)** botón flotante de soporte (abre un formulario que arma un `mailto:` al docente, sin backend nuevo) y una nueva sección `/recursos` con una calculadora funcional y una tarjeta de materiales marcada honestamente como "próximamente". Se construyeron a mano, como SVG de trazo simple (mismo patrón `icono_()` de siempre), los 9 íconos del set de referencia que compartió el docente más el de graduación y el de soporte; la imagen de mascota se usó tal cual (completa y en un recorte de retrato). Validado con `node --check` y, para poder probar de verdad con Playwright en un sandbox sin acceso a internet, con un build local de Tailwind usado solo para las pruebas de esta sesión (el `index.html` real sigue usando el CDN sin build step) — la suite completa pasó **159/159** tras corregir 2 fragilidades reales que esa prueba más rigurosa dejó ver (ver `data/README.md`).
21. ✅ Más íconos por pantalla y PDAs de grado con la misma extensión que Ejercítate (Paso 21). El docente notó que solo la pantalla de registro mostraba un ícono/emoji distinto y pidió variedad en cada pantalla del recorrido; se agregó `insigniaPaso_`, una insignia circular grande con un ícono propio por tipo de pantalla (problematización, teoría, actividad, mini-resultado, resultado, práctica extra), de paso corrigiendo un bug real (mini-resultado y resultado global compartían el mismo ícono "medalla"). Por separado, el docente pidió que los PDAs de grado tomaran una cantidad de pasos similar a la de un tema de Ejercítate (~14) en vez de resolverse en muy pocos clics; se revirtió la división del Paso 15 fusionando las 119 tarjetas de un solo subtema de vuelta en los 17 PDAs completos de 4 subtemas + práctica extra (ver punto 15 y "Paso 21" en `data/README.md`), sin escribir contenido nuevo y sin tocar Ejercítate. Resultado: **18 pasos** obligatorios hasta la constancia por PDA de grado (más que los 14 de Ejercítate) más 34 reactivos opcionales de práctica extra. Probado de punta a punta con Playwright y un build local de Tailwind (20/20, 0 fallidos, 0 errores de consola).
22. ✅ Fotos reales del "Profe Ponchito" en toda la página (Paso 22). El docente confirmó que el Paso 21 ya cumplía lo que pedía y mandó 14 imágenes nuevas del mascota (dos de ellas hojas con varios stickers), pidiendo agregarlas "en toda la página, donde tú gustes y sea visualmente creativo". A diferencia de `insigniaPaso_` (un ícono SVG plano), estas son ilustraciones reales con escena y texto propio; se recortaron las 2 hojas de stickers, se eligieron las 12 imágenes que mejor encajan con una pantalla concreta (evitando duplicados entre sí), se optimizaron a `assets/img/mascota/` (~480 KB en total) y se agregaron con un nuevo helper `imagenMascota_` como acento adicional — arriba de `insigniaPaso_` en cada panel del recorrido de un PDA, y también en la selección de grado, Ejercítate, recursos y junto a la etiqueta "Tu camino". Probado de punta a punta con Playwright y un build local de Tailwind, confirmando además que el recorrido efectivamente muestra "Paso 1 de 18"… "Paso 18 de 18" (ver "Paso 22" en `data/README.md` para el mapeo completo pantalla→imagen).
23. ✅ Trimestres 2 y 3 completos, navegación por periodo y reetiquetado curricular real (Paso 23). El docente reportó que su grupo veía "solo 6 o 7 temas" por grado y pidió llegar a 20, además de separar los temas nuevos en tarjetas propias de "2do periodo" en vez de amontonarlos en el camino de un solo grado. Investigar la fuente oficial (SEP, Programa Sintético Fase 6) mostró que **toda la Fase 6 (los 3 años de secundaria juntos) tiene solo 14 Contenidos**, no 20 por grado — 7 ya cubiertos en Trimestre 1 ("Sentido numérico y pensamiento algebraico"), 4 de "Forma, espacio y medida" y 3 de "Análisis de datos y probabilidad" sin usar todavía; se lo planteamos honestamente al docente junto con una dosificación trimestral real ya publicada para 1° (que reparte los 7 PDAs de álgebra entre Trimestre 1 y 2, en vez de dejarlos todos en el Trimestre 1 como estaba la app), y eligió la opción recomendada: reetiquetar el contenido existente según esa fuente y escribir 21 PDAs nuevos de geometría/estadística/probabilidad para llegar a un total honesto de **14/13/11 PDAs por grado** (1°/2°/3°). Se reutilizó el campo `trimestre` que ya existía en el esquema (antes sin usar por `app.js`) en vez de inventar uno nuevo: se reetiquetaron los 17 PDAs originales (3 se quedan en Trimestre 1, 14 pasan a Trimestre 2 repartidos por grado) y se escribieron 6 PDAs nuevos de geometría para Trimestre 2 (Rectas y ángulos; Construcción y propiedades de las figuras planas y cuerpos — 2 por grado, con dificultad creciente: ángulos y clasificación de triángulos en 1°, congruencia y semejanza en 2°, Pitágoras y trigonometría en 3°) y 15 para Trimestre 3 (Circunferencia/círculo/esfera, Medición y cálculo, Obtención y representación de información, Medidas de tendencia central y dispersión, Azar e incertidumbre — 5 por grado). Para la navegación, la pantalla de selección de grado pasó de 3 tarjetas (1°/2°/3°) a **9 tarjetas agrupadas por grado** (cada una "1°/2°/3° · Trimestre N") más Ejercítate, con una nueva ruta `/pda-lista/:grado/:trimestre` que filtra los PDAs ya cargados por su campo `trimestre` (mismo patrón que ya usaba Ejercítate para agrupar por categoría) — exactamente lo que pidió el docente ("separa los nuevos temas en nuevos cuadros que digan 2 periodo primer año"). Los 21 PDAs nuevos (840 reactivos calificados + práctica extra) se generaron con agentes en paralelo, cada uno verificando su propia aritmética/geometría/probabilidad con Python antes de entregar, y se revalidaron de forma independiente contra el esquema (0 errores) y por muestreo aritmético manual. Toda la app (38 PDAs curriculares × 3 grados × 3 trimestres, más Ejercítate) se probó de punta a punta con Playwright y un build local de Tailwind: conteo de tarjetas por grado/trimestre, un recorrido completo por cada grado en Trimestre 2 y en Trimestre 3, y verificación de que los enlaces "volver"/"cambiar de grado"/"elegir otro tema" regresan siempre al trimestre correcto — 0 errores.
24. ✅ Se retiró el canal de "Soporte" / mailto al docente (Paso 24). El docente preguntó cómo evitar que le llegara contenido ofensivo (archivos adjuntos de índole sexual o grotesca) a su correo real, y — al no existir en Gmail personal ni en Workspace una forma de filtrar el *contenido* de una imagen adjunta (solo el tipo de archivo o palabras del asunto/cuerpo) — la opción más simple y segura fue **quitar el botón que abría ese canal**, en vez de intentar filtrarlo. Se eliminó por completo: el botón flotante "¿Necesitas ayuda?" (`mn-boton-soporte-flotante`) que aparecía en todas las pantallas, la tarjeta "Soporte" de la pantalla `/recursos`, su modal (`abrirModalSoporte_`, que armaba un enlace `mailto:docentealfonsomatematicas@gmail.com` con lo que el alumno escribiera) y las referencias a "soporte" en el cierre por tecla Escape. La pantalla `/recursos` se renombró de "Recursos y soporte" a **"Recursos"** (igual el título del enlace en el encabezado) y ahora solo conserva la Calculadora y la tarjeta de "Materiales descargables", sin tocar ninguna otra funcionalidad, dato o PDA. Nada de esto afecta el webhook de Google Apps Script (que sigue siendo la única vía de datos hacia el docente, vía la hoja de cálculo, y no admite adjuntos). Probado de punta a punta con Playwright: el botón y el modal ya no existen en el DOM, la Calculadora y "Materiales descargables" siguen funcionando, y la navegación general (`/grados` con las 9 tarjetas de grado×trimestre + Ejercítate) no se vio afectada — 0 errores.
25. ✅ De 4 a 10 lecciones por PDA, de menor a mayor dificultad (Paso 25). El docente notó que cada PDA de cada trimestre traía "pocas lecciones" y pidió expandir cada uno a al menos 10, desglosadas de menor a mayor dificultad, aceptando que hiciera falta crear más ejercicios. Los 38 PDAs curriculares (los 17 originales del Trimestre 1/2 y los 21 nuevos del Paso 23) tenían los mismos 4 subtemas núcleo (Introductorio/Intermedio/Avanzado/Síntesis) — se agregaron **6 lecciones nuevas por PDA** (Aplicación → Aplicación avanzada → Reto → Reto avanzado → Integración → Dominio, numeradas `<N>.5` a `<N>.10`), cada una con su propia mini-actividad de 10 reactivos (2 rondas de 5), llevando los 38 PDAs a **10 lecciones cada uno** (228 lecciones nuevas, ~2,280 reactivos nuevos en total). Cada subtema (existente y nuevo) ahora trae un `nivelEtiqueta` explícito ("Nivel N de 10 · <etiqueta>") en vez de calcularse por índice, para que la escala completa de 10 niveles se vea coherente de principio a fin. El esquema (`maxItems` de subtemas) se amplió de 7 a 12. Contenido generado con 38 agentes en paralelo (uno por PDA, en lotes para evitar límites de tasa de la API), cada uno leyendo primero el PDA real para no duplicar nada de los 4 subtemas ni de la práctica extra existente, y verificando su propia aritmética/geometría/probabilidad con Python antes de entregar. Validación independiente posterior: 0 errores de esquema en los 38 archivos fusionados, 4 reactivos `llenar_frase` corregidos (les faltaba el hueco `___`), 0 duplicados de contenido detectados contra el material ya existente. Probado de punta a punta con Playwright: las 38 tarjetas de PDA en las 9 combinaciones grado×trimestre muestran exactamente 10 lecciones al desplegarse, y un recorrido completo de un PDA (10 lecciones × 2 rondas = 20 rondas de actividad) llega correctamente al resultado global — 0 errores.
26. ✅ Cada PDA de 10 lecciones se dividió en 3 series más cortas (Paso 26). El docente vio el camino de 42 pasos que dejó el Paso 25 y pidió más PDAs pero más cortos cada uno, renombrando por ejemplo "Expresión de fracciones 1.1", "1.2". Se dividió mecánicamente cada uno de los 38 PDAs curriculares en 3 series (Serie A: las 4 lecciones núcleo — Introductorio/Intermedio/Avanzado/Síntesis; Serie B: 3 lecciones de aplicación; Serie C: 3 lecciones de reto/dominio), sin tocar ningún subtema, reactivo ni explicación existente — solo se repartió la `practicaExtra` proporcionalmente entre las 3 y se recalculó el `nivelEtiqueta` de cada lección sobre el total local de su serie. Cada serie recibió además su propia problematización nueva (114 en total, redactadas por 3 agentes — uno por grado — ligadas específicamente a las lecciones de esa serie), y su título quedó con el sufijo "N.1"/"N.2"/"N.3" que pidió el docente (p. ej. "Expresión de fracciones como decimales... 1.1"). Los 38 PDAs se convirtieron en **114 series** (42 en 1°, 39 en 2°, 33 en 3°); el motor de la app no necesitó ningún cambio (ya soportaba cualquier número de subtemas desde el Paso 14). Validado contra el esquema (0 errores) y contra el conteo exacto de reactivos originales (ningún reactivo se perdió ni se duplicó). Probado de punta a punta con Playwright: conteo de tarjetas por trimestre en los 3 grados, y un recorrido completo de una serie corta confirmando que ahora toma 14-18 pasos (antes 42) hasta el resultado global — 0 errores.
27. ✅ Cada lección se volvió su propia serie independiente, con su propia constancia (Paso 27). Antes de que el docente subiera siquiera el Paso 26 (sus capturas seguían mostrando el sitio viejo), pidió ir más allá: separar las series en constancias por lección — aclarado con el mensaje "separalas en lecciones". Se volvió a dividir mecánicamente cada uno de los 38 PDAs curriculares, esta vez en **10 series de 1 sola lección cada una** (no 3 series de 3-4 como en el Paso 26), partiendo de nuevo de los 38 PDAs originales de 10 lecciones del Paso 25 para no arrastrar metadatos ya recalculados. Cada lección conserva su teoría y sus reactivos sin tocar, su `nivelEtiqueta` se dejó igual que en el Paso 25 (sobre la escala de 10, no recalculado a "1 de 1", para no perder el contexto de dificultad), su `practicaExtra` se repartió en 10 partes proporcionales, y recibió su propia problematización nueva (380 en total, redactadas por 6 agentes en paralelo — 2 por grado). Los 38 PDAs (114 series del Paso 26) se convirtieron en **380 series** (140 en 1°, 130 en 2°, 110 en 3°); el motor de la app no necesitó ningún cambio de código. Validado contra el esquema (0 errores) y contra el conteo exacto de reactivos originales (0 discrepancias). Probado de punta a punta con Playwright: conteo de tarjetas por trimestre en los 3 grados (10× el número de PDAs originales), un recorrido completo de una lección individual confirmando "Paso 1 de 5" o "Paso 1 de 6" según la lección (antes 42 para el PDA completo), y verificación de que cada lección genera su propia constancia independiente con su propio título y folio — 0 errores.
28. ⏳ Página de verificación de folios (`verificar.html`) enlazada desde el QR.
29. ⏳ Desplegar el Web Endpoint real, configurar `WEBHOOK_URL` y subir a GitHub Pages.
29. ⏳ Pruebas en dispositivos móviles reales.
