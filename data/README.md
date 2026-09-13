# Estructura de datos de los PDAs

Cada Proceso de Desarrollo de Aprendizaje (PDA) vive en su propio archivo
JSON, agrupado por grado escolar. El Trimestre 1 completo (eje "Sentido
numérico y pensamiento algebraico") ya está construido para los 3 grados, y
además hay un apartado independiente de práctica libre ("Ejercítate") con
40 temas — ver la sección dedicada más abajo:

```
data/
├── schema/
│   └── pda.schema.json     # Esquema formal (JSON Schema draft-07)
├── grado-1/
│   ├── index.json
│   └── 1S-B1-PDA01-S1.json … 1S-B1-PDA07-S7.json   (49 tarjetas)
├── grado-2/
│   ├── index.json
│   └── 2S-B1-PDA01-S1.json … 2S-B1-PDA06-S7.json   (42 tarjetas)
├── grado-3/
│   ├── index.json
│   └── 3S-B1-PDA01-S1.json … 3S-B1-PDA04-S7.json   (28 tarjetas)
└── ejercitate/
    ├── index.json
    └── EJ-01.json … EJ-40.json               (40 temas)
```

Desde el Paso 15, cada carpeta `grado-N/` no contiene ya los 7/6/4 PDAs
"monolíticos" originales (uno por Contenido/PDA oficial, con sus 7
subtemas dentro), sino **una tarjeta de camino por cada subtema** de esos
PDAs — ver "Tarjetas divididas de camino" más abajo para el detalle
completo de por qué y cómo. `data/ejercitate/` no cambió: sigue con sus 36
temas de 4 subtemas cada uno.

Los contenidos y PDA se basan en el Programa Sintético de la Fase 6 (SEP,
2022) — ver la sección "Fuente curricular" más abajo para el detalle y las
limitaciones de esta transcripción.

## ¿Por qué un `index.json` por grado?

GitHub Pages sirve archivos estáticos: no hay backend que pueda "listar"
el contenido de una carpeta. Por eso cada carpeta `grado-X/` incluye un
`index.json` con la lista de archivos PDA disponibles. `pda-loader.js`
(próximo paso del frontend) leerá primero ese manifiesto y después hará
`fetch` de cada PDA individual.

## Convención de nombres e IDs

Un PDA curricular de origen se identifica como
`<grado>S-B<bloque/trimestre>-PDA<consecutivo>`, por ejemplo `2S-B1-PDA03`
= 2° de secundaria, bloque/trimestre 1, PDA número 3. Ese id ya **no**
corresponde a un archivo: desde el Paso 15, cada uno de sus subtemas es su
propia tarjeta, con id `<id del PDA de origen>-S<consecutivo del subtema>`
— por ejemplo `2S-B1-PDA03-S5` es la tarjeta del 5.º subtema (el primero de
repaso) del PDA `2S-B1-PDA03`. Ese id compuesto es también el nombre de
archivo (`2S-B1-PDA03-S5.json`) y el campo `id` dentro del JSON.
`cargarPDAporId` (`pda-loader.js`) busca el archivo por coincidencia de
prefijo (`startsWith`), por eso el sufijo `-S<n>` (1-7, un solo dígito) no
genera ambigüedad entre tarjetas del mismo PDA de origen.

## Numeración de temas y subtemas

Cada tarjeta tiene un campo `numero` (entero) — el número de tema **dentro
de su grado**, en el orden en que aparece en `index.json`: 1 a 49 en 1°, 1
a 42 en 2°, 1 a 28 en 3° (recorriendo los PDAs de origen en orden y, dentro
de cada uno, sus 7 subtemas en orden). `app.js` lo muestra como "Tema N."
antes del título en la lista de tarjetas y en la problematización.

El único `subtema` dentro de cada tarjeta conserva su campo `numero`
(string) **del PDA de origen**, formato jerárquico `<numero del PDA de
origen>.<consecutivo>` — por ejemplo `3.2` es el subtema Intermedio del
PDA de origen número 3 (no de la tarjeta, que tiene su propio `numero`
global distinto). Se conserva a propósito: deja ver de un vistazo de qué
PDA/Contenido oficial de la NEM viene cada tarjeta, aunque ahora se
recorra como una parada independiente del camino. Si el subtema es de
repaso, su número sigue desde `.5` (`3.5`, `3.6`, `3.7`) como antes.

## Fuente curricular

Los 38 PDAs incluidos (los 3 trimestres, en los 3 grados) se transcribieron
o redactaron a partir de fuentes derivadas del **Programa Sintético de la
Fase 6** (SEP, 2022 — la Fase 6 cubre toda la secundaria). Un hallazgo
importante de la investigación: la SEP define los Contenidos y PDA a nivel
de toda la Fase 6, **no separados oficialmente por grado** — y son solo
**14 Contenidos en total** para los 3 años (7 de "Sentido numérico y
pensamiento algebraico", 4 de "Forma, espacio y medida", 3 de "Análisis de
datos y probabilidad"). Cada escuela distribuye esos 14 Contenidos entre
1°, 2° y 3°, y entre trimestres, en su propio Programa Analítico — la
distribución usada aquí (qué PDA va en qué grado y en qué trimestre) sigue
una dosificación trimestral real y bien documentada encontrada para 1° de
secundaria (ver "Paso 23" más abajo), extrapolada de forma consistente a
2° y 3°; no es la única distribución posible.

**Si tu escuela ya tiene su Programa Analítico** con una distribución
distinta por grado/trimestre, avísame para ajustar los archivos y que
coincidan exactamente con lo que se enseña en tu plantel.

Fuentes consultadas:
- [Programa Sintético de la Fase 6 (SEP)](https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf)
- [Avance del Programa Sintético Fase 6 — Matemáticas (SEP)](https://educacionbasica.sep.gob.mx/wp-content/uploads/2022/12/Avance-Programa-Sintetico-Fase-6.pdf)
- Dosificaciones derivadas (Studocu): 1er grado, y el documento combinado "Matemáticas 1er, 2do y 3er Grado"; 3er grado ("Álgebra y Geometría")
- Dosificación trimestral real "Dosificación Matemáticas 1° Sec. 6ta Fase - Programa Sintético 2023 - NEM" (Studocu — Paso 23), usada para decidir qué PDAs de Trimestre 1 pasan a Trimestre 2 en 1° de secundaria, y extrapolada con la misma lógica a 2° y 3°.

## Cómo agregar un PDA nuevo

1. Copia cualquier archivo existente, por ejemplo `grado-2/2S-B1-PDA03.json`, como plantilla.
2. Completa los campos siguiendo `schema/pda.schema.json`
   (puedes validar con cualquier validador de JSON Schema online).
3. Reemplaza `contenido` y `pda` con el enunciado oficial del fascículo
   NEM correspondiente — los textos de `problematizacion`, `subtemas` y
   `reto` son responsabilidad del docente y deben mantener el enfoque
   situacional/activo característico de la NEM.
4. Agrega el nombre del archivo al arreglo `archivos` en el `index.json`
   de esa carpeta de grado.

## Estructura de un PDA (v5)

Cada PDA sigue este flujo lineal, que es el que recorre `app.js` mostrando
una barra de avance (%) en todo momento:

- **problematizacion** → desafío o contexto real que engancha al alumno antes
  de explicar el tema (contexto + pregunta).
- **subtemas** (arreglo, mínimo 1, de menor a mayor dificultad) → el tema
  explicado a profundidad, dividido en niveles "núcleo": Introductorio,
  Intermedio, Avanzado y Síntesis (el 4.º subtema es una síntesis/aplicación
  de todo el tema, no un tema nuevo). Cada subtema tiene `titulo`,
  `explicacion`, `ejemplos` (uno o más resueltos) y, opcionalmente,
  `formula` — y es, a la vez, su propia **mini-actividad calificada**:
  `puntosPorReactivo`, `estrellasMax` y un arreglo `reactivos` de **5 o 10**
  preguntas (múltiplo de 5 — ver "Rondas de actividad" abajo). Cada subtema se califica de forma
  **independiente** (su propio resultado: correctas/total, puntaje,
  estrellas) y, al terminar todos, `app.js` calcula además un **resultado
  GLOBAL** (suma de todos los mini-resultados vía `combinarResultados()` en
  `gamification.js`), que es el que alimenta la constancia final. Un PDA
  curricular por grado trae 4-7 subtemas (ver "Subtemas de repaso" abajo);
  una tarjeta dividida de camino (Paso 15, ver sección dedicada) trae
  exactamente 1.

  **Subtemas de repaso (opcionales, Paso 14):** un PDA "completo" puede
  tener hasta 3 subtemas adicionales después de los 4 núcleo (`maxItems: 7`
  en el schema), numerados `<N>.5`, `<N>.6`, `<N>.7`. No introducen
  contenido nuevo — repasan lo ya visto en los 4 anteriores, con ejercicios
  usando números/escenarios distintos — pero se califican igual que
  cualquier otro subtema y cuentan para el resultado global. La app los
  distingue en la UI con la etiqueta "Repaso N de R" en vez de "Nivel N de
  4 · <dificultad>" (`nivelChip_` en `app.js`, ver `NIVEL_DIFICULTAD`). Los
  17 PDAs de Trimestre 1 tenían sus 3 subtemas de repaso (7 subtemas cada
  uno, 35 reactivos calificados en total) antes de dividirse en tarjetas
  (Paso 15) — ese contenido de 7 subtemas por PDA es justamente lo que se
  reparte, uno por tarjeta.

  **`nivelEtiqueta` (opcional, Paso 15):** en una tarjeta de un solo
  subtema, `nivelChip_` no puede deducir el nivel real por índice (el único
  subtema del arreglo está siempre en el índice 0, así que daría "Nivel 1
  de 1" sin importar si en realidad es Avanzado o un repaso). Por eso el
  subtema trae su propia `nivelEtiqueta` fija — el mismo texto que hubiera
  mostrado el PDA de origen para esa posición, ej. `"Nivel 3 de 4 ·
  Avanzado"` o `"Repaso 2 de 3"` — y `nivelChip_` la usa tal cual en vez de
  calcularla. Si el campo se omite, se calcula como siempre por
  índice/longitud (así siguen funcionando sin cambios los PDAs de 4-7
  subtemas y los 36 temas de Ejercítate).
- **practicaExtra** (opcional) → arreglo de reactivos adicionales, ungraded
  (no calificados), mostrados en una sección aparte después del resultado
  global del PDA, para quien quiera seguir practicando el mismo tema. No
  afectan el puntaje ni las estrellas de ningún subtema. Cada uno de los 17
  PDAs de origen tenía entre 3 y 4; desde el Paso 15 ese arreglo no se
  reparte ni se duplica entre las 7 tarjetas de un mismo PDA — se conserva
  completo solo en la última (la del subtema "Repaso integral", `.7`), que
  ya funciona como cierre/síntesis de las 7. Las otras 6 tarjetas de ese
  PDA simplemente no traen el campo.
- **Celebración final** (Paso 14, no es parte del JSON — puramente de la
  interfaz) → después de generar la constancia y, si el PDA la tiene, de
  la práctica extra, `app.js` muestra un panel de cierre estilo "nivel
  superado" de videojuego (`panelCelebracion_`): confeti animado, un
  trofeo y un botón para elegir otro tema. No requiere ningún campo nuevo
  en el JSON del PDA.

No existe ya un objeto `reto` a nivel de PDA — se eliminó al pasar de "3
subtemas + 1 reto de 20 preguntas paginado" a "4 subtemas, cada uno con su
propia mini-actividad de 5 preguntas".

En el navegador, cada intento de un subtema baraja el orden de sus
preguntas y el de las opciones dentro de cada pregunta (`variarReactivos_`/
`variarOpciones_` en `app.js`), así que rehacer un subtema no se ve idéntico
la segunda vez — el JSON fuente no necesita (ni debe) tener el orden
"correcto"; el que importa es el que arma `app.js` en cada intento. Este
barajado se repite cada vez que se entra a CUALQUIER ronda de un subtema
(ver "Rondas de actividad" abajo), no solo la primera.

Cada pantalla del recorrido muestra un título claro y una explicación antes
de la parte interactiva: la problematización usa `pda.titulo` y su propio
`contexto` (redactado de forma sencilla, como gancho); cada subtema usa su
`titulo` y `explicacion` antes de sus 5 preguntas.

### Los 4 tipos de pregunta

Los `reactivos` de cada subtema (y los de `practicaExtra`) usan la misma
estructura de pregunta (`definitions.pregunta` en el schema), con `tipo`
igual a uno de estos 4 valores:

- `opcion_multiple` — `pregunta`, `opciones[]`, `respuestaCorrecta` (índice).
- `verdadero_falso` — `enunciado`, `respuestaCorrecta` (booleano).
- `llenar_frase` — `frase` (con un hueco marcado `___`), `respuestaCorrecta` (texto).
- `relacionar_columnas` — `instruccion`, `columnaA[]`, `columnaB[]`,
  `parejasCorrectas[]` (índice en `columnaB` de la pareja de cada fila de
  `columnaA`; usa valores únicos en `columnaB` para que no haya ambigüedad).

Todas requieren `retroalimentacion` (se muestra tras responder, sea correcta
o no).

**Importante al redactar los 5 reactivos de un mismo subtema:** aunque
varios reactivos compartan un enunciado "plantilla" (por ejemplo, cuatro
`relacionar_columnas` con la misma instrucción, o varios `opcion_multiple`
con la misma pregunta pero distintos números), cada uno debe representar
contenido genuinamente distinto — mismo texto de pregunta/instrucción está
bien, pero los datos concretos (números, opciones, pares correctos) deben
diferir. Dos reactivos idénticos en el mismo subtema hacen que el alumno
vea, en los hechos, la misma pregunta dos veces dentro de una actividad de
solo 5 preguntas.

Este es el flujo que renderiza `app.js`: problematización → (por cada
subtema: teoría → 5 preguntas → mini-resultado) → resultado GLOBAL (suma de
todos) → práctica extra (opcional, si la tarjeta la incluye) → constancia
(con fecha y hora de generación).

## Tarjetas divididas de camino (Paso 15)

El pedido original era simple: que el recorrido de cada grado se sintiera
más largo, "como si fueran más temarios", pero **sin inventar contenido
nuevo** — solo dividiendo lo que ya existía. La solución: cada uno de los
17 PDAs curriculares (7 subtemas cada uno desde el Paso 14) se partió en 7
tarjetas independientes del camino, una por subtema. El contenido
matemático de cada subtema (`explicacion`, `ejemplos`, `reactivos`) se
reutiliza **exactamente igual** que antes — nada de eso cambió una sola
palabra. Lo único nuevo por tarjeta es una `problematizacion` corta y
propia (1-3 oraciones de contexto real + una pregunta), porque ahora cada
tarjeta se recorre como su propia experiencia completa (problematización →
teoría → actividad → resultado), no como un paso intermedio de un PDA más
grande.

**Resultado:** el camino de cada grado pasó de 7/6/4 paradas a **49 en 1°,
42 en 2° y 28 en 3°** (119 tarjetas en total) — un recorrido mucho más
largo, con el mismo temario de siempre repartido en pasos más pequeños y
concretos, en vez de 4-7 subtemas empujados dentro de un solo PDA.

**Por qué fue posible sin tocar el motor:** desde el Paso 14, `vistaPDA` ya
recorre `pda.subtemas` con `.forEach()` y `combinarResultados()` sencillamente
suma con `.reduce()` — ninguno de los dos asume una cantidad fija de
subtemas, así que un arreglo de un solo elemento funciona sin cambios de
fondo. Solo hicieron falta tres ajustes:

1. **Esquema:** `subtemas.minItems` bajó de 4 a 1.
2. **`nivelEtiqueta`:** una tarjeta de 1 subtema no puede saber por su
   índice (siempre 0) si ese subtema era Introductorio, Avanzado o un
   repaso — así que el subtema trae su propia etiqueta fija (ver
   "Estructura de un PDA" arriba). `nivelChip_` en `app.js` la usa si está
   presente y, si no, calcula como siempre por índice/longitud (así los 36
   temas de Ejercítate y cualquier PDA de 4-7 subtemas futuro no necesitan
   tocarse).
3. **`practicaExtra`:** se conserva completo solo en la última tarjeta de
   cada PDA de origen (la de "Repaso integral", `.7`) en vez de repetirse
   o repartirse en las 7.

**Id, numeración y manifiesto:** el id de cada tarjeta es
`<id del PDA de origen>-S<consecutivo 1-7>` (ver "Convención de nombres e
IDs" arriba); su `numero` es la posición global dentro del camino de su
grado (1-49/42/28, no reinicia por PDA de origen); el `numero` del propio
subtema (`3.2`, `3.5`…) se conserva igual que en el PDA de origen, como
rastro de qué Contenido/PDA oficial de la NEM viene. Los 17 archivos
monolíticos originales (uno por PDA, con sus 7 subtemas adentro) ya no
existen — se reemplazaron por las 119 tarjetas, y cada `index.json` de
`grado-N/` lista únicamente esas 119 (repartidas 49/42/28), ordenadas por
`numero`.

**Autoría de las 119 problematizaciones:** se redactaron con 6 agentes en
paralelo (uno por lote de 2-4 PDAs de origen), cada uno con instrucciones
de variar el escenario real entre las 7 tarjetas de un mismo PDA (para que
no se sientan como el mismo problema repetido 7 veces) y enfocar el
contexto en la habilidad específica de cada subtema, no en el tema general
del PDA completo. Las 119 se validaron después de forma centralizada:
contra el esquema, sin duplicados exactos entre sí (ni de contexto ni de
pregunta, en las 119 completas, no solo dentro de cada lote), y con
verificación de que el contenido de cada subtema (explicación/ejemplos/
reactivos) coincide byte a byte con el del PDA de origen — es decir, que
la división no alteró por accidente ningún reactivo ya existente.

**QA de punta a punta:** las 119 tarjetas + los 36 temas de Ejercítate
(155 en total) están probados con Playwright (`qa-full-sweep-v6.mjs`), que
ahora también verifica que la `nivelEtiqueta` fija de una tarjeta de 1
subtema se muestre tal cual (en vez de la "Nivel 1 de 1" que daría el
cálculo por índice) y que el camino de un grado con hasta 49 nodos
renderice sus `Promise.all` de fetches completos antes de contar los
nodos (se cambió `waitForTimeout` fijo por una espera activa, igual que ya
se hacía para el camino de Ejercítate).

## Rondas de actividad (Paso 16)

El pedido: que cada una de las 119 tarjetas de camino (Paso 15) tuviera un
"paso 4" después del "paso 3" — una segunda pantalla de actividad con 5
reactivos más, distintos de los primeros 5, antes de seguir con el resto
del recorrido (mini-resultado → resultado global → constancia) — y que
tanto la primera como la segunda pantalla barajaran el orden de sus
preguntas (y el de las opciones, si son de opción múltiple) cada vez que
el alumno entra.

**Cómo se implementó:** en vez de tratar la segunda pantalla como un paso
nuevo y distinto, el arreglo `reactivos` de un subtema ahora puede traer
**10** elementos en vez de 5 (`reactivos.maxItems` subió de 5 a 10 en el
esquema). El motor (`vistaPDA` en `app.js`) calcula
`totalPartes = Math.ceil(subtema.reactivos.length / 5)` y genera esa
cantidad de pasos `actividad` consecutivos para el subtema — 1 si tiene 5
reactivos (como siempre), 2 si tiene 10 ("Ronda 1 de 2" / "Ronda 2 de 2",
con esa etiqueta visible junto al nivel). Las respuestas de cada ronda se
guardan en `estado.respuestasParciales` hasta terminar la última ronda del
subtema; ahí se combinan las 10 y se califican **juntas en un solo
mini-resultado** (no dos mini-resultados separados). El botón de envío
dice "Siguiente ronda →" en toda ronda que no sea la última, y "Enviar
respuestas" en la última — igual que antes.

**Por qué es compatible hacia atrás sin tocar Ejercítate:** un subtema de
exactamente 5 reactivos sigue dando `totalPartes = 1`, es decir, el mismo
comportamiento de siempre (una sola pantalla de actividad, sin etiqueta de
ronda visible). Los 36 temas de Ejercítate no se modificaron y siguen así.
Solo las 119 tarjetas de `data/grado-1/2/3/` (las que salieron de la
división del Paso 15, cada una con un único subtema) pasaron de 5 a 10
reactivos.

**Barajado en cada ronda:** el mecanismo de barajado ya existente
(`variarReactivos_`/`variarOpciones_`, ver arriba) no necesitó lógica
nueva — ya se ejecuta cada vez que se construye la vista de una actividad,
así que aplicarlo por ronda (sobre el sub-arreglo de 5 que le toca a esa
ronda, vía el helper `reactivosDeParte_`) cumplió el segundo requisito sin
cambios adicionales.

**Los 595 reactivos nuevos** (119 tarjetas × 5) se redactaron con 9 agentes
en paralelo (agrupados por pares de PDA de origen), cada uno editando
directamente el arreglo `reactivos` de sus archivos vía Python
(`extend()` + `json.dump`) para no arriesgar corromper el resto del JSON.
Se validaron de forma centralizada: 119/119 archivos con exactamente 10
reactivos, 0 errores contra el esquema, 0 duplicados reales (comparando la
firma completa de cada reactivo — tipo + todos sus campos de contenido —
no solo el texto inicial de la pregunta, que producía falsos positivos con
el patrón ya documentado de `relacionar_columnas` con `instruccion`
compartida pero `columnaA`/`columnaB` distintas). `qa-full-sweep-v6.mjs`
se actualizó para recorrer las rondas de cada subtema, verificar la
etiqueta "Ronda N de M" y el texto del botón en cada una, y calificar el
subtema completo contra su total real de reactivos (ya no fijo en 5); las
155 tarjetas/temas pasan de punta a punta (155/155).

## Apartado "Ejercítate" (40 temas de práctica libre) — completo

Independiente de los PDAs por grado, "Ejercítate" es un apartado de
práctica libre con **40 temas** de matemáticas de secundaria, agrupados en
4 categorías, disponible para cualquier alumno sin importar su grado. Cada
tema sigue exactamente la misma dinámica que un PDA (problematización → 4
subtemas de menor a mayor dificultad, cada uno con su propia mini-actividad
calificada de 5 reactivos → resultado global → práctica extra → constancia)
y no bloquea ni pertenece a la ruta curricular de ningún grado en
particular: el docente puede pedir cualquier tema, a cualquier alumno, en
cualquier momento.

### El "pseudo-grado" `ejercitate`

Técnicamente, Ejercítate reutiliza el 100% del motor de PDAs: en vez de
crear un sistema paralelo, `'ejercitate'` se trata como un **grado
sintético** que fluye por exactamente las mismas rutas, carga de datos y
vistas que un grado real (`#/pda-lista/:grado`, `#/pda/:grado/:id`,
`vistaListaPDA`, `vistaPDA`, gamificación, webhook, constancia). Solo
difiere en dos puntos, ambos ya resueltos en el código:

- **Carpeta de datos:** `pda-loader.js` resuelve `'ejercitate'` a la
  carpeta `data/ejercitate/` en vez de `data/grado-N/` (función
  `carpetaDeGrado_`).
- **Color y etiqueta:** `app.js` usa `COLOR_EJERCITATE` (paleta "Aula NEM",
  tono grafito) en vez del color del grado, y muestra la etiqueta
  "Ejercítate" en vez de "N° de secundaria" (`temaGrado_`/`etiquetaGrado_`).

El campo `grado` dentro del JSON de cada tema es literalmente el string
`"Ejercítate"` (con acento) — así lo exige `pda.schema.json` — y cada
archivo agrega además el campo `categoria` (uno de `basico`, `intermedio`,
`avanzado`, `estadistica` — es un enum cerrado en el esquema, no admite
categorías nuevas), que la pantalla de Ejercítate usa para agrupar los 40
temas en **4 mini-caminos** (uno por categoría, cada uno con su propio
encabezado y su propio trazo serpenteante), en vez de un solo camino plano
de 40 nodos.

### Los 36 temas originales del docente + 4 temas de algoritmos (Paso 17) — numeración actual (Paso 18)

Los 36 temas que definió el docente originalmente y los 4 temas de
algoritmos agregados después (Paso 17) están numerados de forma
**contigua por categoría** desde el Paso 18 — ver "Por qué se renumeraron"
más abajo si buscas la numeración anterior (37-40) usada solo entre el
Paso 17 y el Paso 18:

**Básicos (1-14):** Números naturales y enteros · Operaciones básicas (suma,
resta, multiplicación y división) · Jerarquía de operaciones · Múltiplos y
divisores · Máximo Común Divisor (MCD) · Mínimo Común Múltiplo (MCM) ·
Fracciones: concepto y tipos · Fracciones equivalentes · Suma y resta de
fracciones · Decimales y su relación con fracciones · **Completar dígitos
del algoritmo de la suma y resta** (EJ-11) · **Suma y resta de números con
signo** (EJ-12) · **Completar dígitos del algoritmo de la multiplicación y
división** (EJ-13) · **Completar dígitos del algoritmo de la
multiplicación y división con decimales** (EJ-14).

**Intermedios (15-24):** Números racionales e irracionales · Potencias y
raíces · Leyes de los exponentes · Proporcionalidad directa ·
Proporcionalidad inversa · Razones y proporciones · Porcentajes y
aplicaciones en la vida diaria · Expresiones algebraicas · Monomios y
polinomios · Perímetro y área de figuras planas.

**Avanzados (25-34):** Ecuaciones de primer grado · Sistemas de ecuaciones ·
Plano cartesiano · Funciones lineales · Gráficas y su interpretación ·
Congruencia de triángulos · Semejanza de triángulos · Teorema de Tales ·
Teorema de Pitágoras · Volumen y área de cuerpos geométricos.

**Estadística y probabilidad (35-40):** Población y muestra · Tablas de
frecuencia · Gráficas (barras, circulares y lineales) · Media, mediana y
moda · Probabilidad simple · Experimentos aleatorios.

Los 36 temas originales (864 reactivos: 720 calificados + 144 de práctica
extra) están validados contra `pda.schema.json`, revisados uno por uno con
el flujo completo en Playwright (`qa-full-sweep-v6.mjs`), y pasados por un
escáner de duplicados semánticos. Los 4 temas de algoritmos (EJ-11 a
EJ-14) se describen en la sección "Paso 18" más abajo, junto con el nuevo
formato de reactivo que usan.

### Por qué se renumeraron (Paso 18)

Al agregar los 4 temas de algoritmos en el Paso 17, se les dio `numero`
37-40 (para no reordenar nada) — pero como los 4 son de categoría
`basico`, dentro del mini-camino "Temas básicos" quedaban pegados después
del 10 con un salto directo a 37, mientras las demás categorías seguían
en 11-20/21-30/31-36. El docente pidió que la numeración fuera contigua.
Se corrigió así: los 4 temas de algoritmos pasaron a `numero` 11-14
(justo después de los 10 básicos originales), y los demás 26 temas
recorrieron su `numero` original **+4** para dejarles el espacio:
intermedios 11-20 → 15-24, avanzados 21-30 → 25-34, estadística 31-36 →
35-40. El resultado: los 40 temas quedan numerados 1-40 sin huecos ni
saltos, con cada categoría en un bloque contiguo.

**Qué cambió exactamente:** en cada uno de los 40 archivos, el campo
`numero` de nivel superior y el prefijo del campo `numero` de cada
subtema (ej. `"37.1"` → `"11.1"`) se recalcularon con la tabla de arriba;
el archivo se renombró (`EJ-37.json` → `EJ-11.json`, etc., desplazando los
demás) y el campo `id` se actualizó para que siga coincidiendo con el
nombre de archivo (`cargarPDAporId` busca por `startsWith` del `id`). El
contenido matemático de cada tema (título, problematización, subtemas,
reactivos) **no cambió** por la renumeración — es un reordenamiento puro.
`data/ejercitate/index.json` se reconstruyó para listar los 40 archivos en
el nuevo orden numérico.

## Paso 18: nuevo tipo de reactivo `algoritmo_columnas` y rediseño visual de los 3 temas de algoritmos

El docente compartió imágenes de hojas de ejercicios de cuaderno
("Resuelve las sumas y completa los espacios en blanco", "Encuentra las
cifras a colocar en los casilleros para que las sustracciones sean
correctas") y pidió que las actividades de evaluación de los 4 temas de
algoritmos usaran ese mismo diseño: el algoritmo vertical dibujado con
casillas vacías para los dígitos que faltan, en vez de una frase de texto
describiendo el paso.

### El nuevo tipo de reactivo

Se agregó un 5.º tipo de reactivo al esquema (`data/schema/pda.schema.json`,
`definitions.pregunta`), `algoritmo_columnas`:

```json
{
  "tipo": "algoritmo_columnas",
  "operacion": "suma",
  "filas": [
    { "valor": "267", "signo": "+" },
    { "valor": "158", "signo": "+" },
    { "valor": "425", "esResultado": true }
  ],
  "ocultos": [[1], [0, 2], [0]],
  "retroalimentacion": "267 + 158 = 425: en las unidades 7+8=15..."
}
```

- `filas`: cada fila del algoritmo vertical, de arriba hacia abajo (los
  operandos, y en una multiplicación con multiplicador de 2+ cifras
  también sus productos parciales, seguidos de la fila `esResultado`).
  Todas se alinean a la derecha automáticamente.
- `valor`: el número COMPLETO y correcto de esa fila (puede llevar un
  punto decimal). De ahí se derivan tanto los dígitos ya dados como los
  correctos de las casillas vacías — no hay un campo `respuestaCorrecta`
  separado en este tipo.
- `ocultos`: mismo largo que `filas`; para cada fila, la lista de
  posiciones (índice de carácter en `valor`, 0 = el dígito más a la
  izquierda) que se muestran como casilla `<input>` vacía en vez de texto
  ya escrito. El punto decimal nunca se marca como oculto.
- `operacion`: `suma` | `resta` | `multiplicacion` — solo determina el
  texto de apoyo mostrado ("Completa las casillas para que la X sea
  correcta."); la calificación siempre compara dígito por dígito contra
  `valor`, columna por columna, sin importar qué dice `operacion`.

**Motor (`app.js`):** `renderizarAlgoritmoColumnas_` dibuja las filas
alineadas a la derecha (dígitos dados como texto, ocultos como
`<input maxlength="1">`, línea horizontal arriba de la fila `esResultado`);
`leerRespuesta_` junta lo escrito en cada casilla (por fila/columna) y
devuelve `null` si falta alguna; `esRespuestaCorrecta` (`gamification.js`)
compara cada casilla oculta contra el dígito real de `valor` en esa
posición — todas deben coincidir para que el reactivo cuente como
correcto. El barajado de posición del reactivo dentro del subtema (Paso
11) sigue aplicando igual que a cualquier otro tipo; el contenido interno
del reactivo (qué casillas están ocultas) no se baraja, es fijo por
diseño (igual que `llenar_frase` o `verdadero_falso`).

**QA (`qa-full-sweep-v6.mjs`):** como el texto de apoyo genérico
("Completa las casillas para que la suma sea correcta.") se repite entre
varios reactivos de la misma operación dentro de un subtema, la
identificación del reactivo barajado se desambigua con la **firma de las
cifras ya dadas** (las que nunca se ocultan ni se barajan) — mismo
principio que ya se usaba para `relacionar_columnas` (columnaA) y
`opcion_multiple` (conjunto de opciones).

### División representada como verificación por multiplicación

El esquema de `algoritmo_columnas` no incluye una operación `division`
porque el algoritmo de la división larga no tiene la misma relación
directa "columna por columna" entre operandos y resultado que sí tienen
suma, resta y multiplicación (los dígitos del cociente no se alinean con
los del dividendo de forma posicional simple) — intentar forzarlo hubiera
significado un widget genuinamente distinto, no una variación del mismo.

En vez de eso, los reactivos "de división" de EJ-13 y EJ-14 muestran la
**multiplicación que verifica la división** (cociente × divisor =
dividendo), con `operacion: "multiplicacion"` y la aclaración explícita
en `retroalimentacion` (ej. *"Esto verifica que 156 ÷ 4 = 39, porque 39 ×
4 = 156."*). Es una simplificación deliberada, no un intento fallido de
dibujar la división — comprobar una división multiplicando el cociente
por el divisor es una técnica válida y común en la escuela.

### Los 3 temas rediseñados (EJ-11, EJ-13, EJ-14) — EJ-12 se queda en prosa

**EJ-11 (suma y resta)** y **EJ-13/EJ-14 (multiplicación y división,
entero y decimal)** se reescribieron por completo: sus 20 reactivos
calificados + 4 de práctica extra (24 por tema, 72 en total) ahora son
`algoritmo_columnas`. **EJ-12 (números con signo) se dejó tal como estaba
en el Paso 17**, en el formato de prosa (`llenar_frase`/`opcion_multiple`/
etc.) — no tiene un "algoritmo vertical" que dibujar (no hay acarreos ni
préstamos en la regla de signos), así que el nuevo widget no le
correspondía; forzarlo ahí no habría representado nada real.

Progresión de dificultad conservada en los 3 temas rediseñados
(Introductorio/Intermedio/Avanzado/Síntesis, ver los propios archivos para
el detalle exacto de cada subtema):
- **EJ-11**: de sumas/restas de 2 cifras con 1 acarreo/préstamo, hasta
  restas de 5-6 cifras con préstamo encadenado a través de varios ceros.
- **EJ-13**: de multiplicación por 1 dígito (y su verificación de división
  correspondiente), hasta multiplicador/divisor de 2 cifras con productos
  parciales.
- **EJ-14**: igual que EJ-13 pero con decimales — los productos parciales
  se escriben como enteros sin punto (el corrimiento de posición ya
  incluido en el valor) y el punto decimal se coloca solo en la fila
  final, contando las cifras decimales de los factores originales — así
  es como se hace el algoritmo en papel.

**Autoría:** 3 agentes en paralelo, uno por archivo, cada uno con el
formato exacto documentado arriba, 2 ejemplos completos ya resueltos
(incluido el caso de productos parciales con corrimiento), y la
instrucción de verificar la aritmética de cada reactivo con
`decimal.Decimal` de Python (nunca `float`, para evitar errores de
redondeo en los decimales) antes de fijar las posiciones ocultas.

**Validación centralizada** (independiente de la de cada agente): 72/72
reactivos con aritmética correcta (suma/resta/multiplicación, y en los de
5 filas también que los productos parciales sumen exactamente al
resultado), 0 errores de esquema, ninguna fila con el 100% de sus dígitos
ocultos, entre 2 y 7 casillas ocultas por reactivo, el punto decimal
nunca marcado como oculto, y 0 duplicados reales introducidos al
comparar contra el resto del banco (159 archivos) por firma completa de
contenido. Probado de punta a punta con Playwright junto con el resto del
banco: **159/159**.

## Paso 19: corrección de `algoritmo_columnas` — casillas únicamente resolubles ("criptogramas")

El docente compartió 5 hojas de trabajo reales de la web (liveworksheets.com)
tituladas explícitamente "Criptograma de suma/resta/multiplicación" y pidió
que los 3 temas de algoritmos (`EJ-11`, `EJ-13`, `EJ-14`) del Paso 18 se
corrigieran con ese mismo diseño. Analizando las imágenes se confirmó que
un "criptograma numérico" (término usado en material escolar de habla
hispana, sobre todo en Perú) **es exactamente el mismo mecanismo que
`algoritmo_columnas`** — el algoritmo vertical con casillas vacías — así
que no hizo falta ningún tipo de reactivo nuevo ni cambio de motor
(`app.js`/`gamification.js` no se tocaron en este paso).

### El bug real que las imágenes dejaron ver

Comparando el diseño de las imágenes de referencia contra el contenido ya
generado en el Paso 18, se detectó un problema de fondo: en varios
reactivos, **dos celdas de la misma columna** del algoritmo estaban
ocultas a la vez (por ejemplo, la cifra de las decenas de un sumando Y la
cifra de las decenas del resultado, ambas ocultas en el mismo reactivo).
Aritméticamente, una columna con dos incógnitas y una sola ecuación
(`cifra_A + cifra_B + acarreo = cifra_resultado`) no tiene una solución
única — un alumno podía completar las casillas con una combinación
distinta a la registrada como correcta y aun así ser matemáticamente
consistente con lo que se veía en pantalla, pero el motor lo habría
calificado como error. Se confirmó el mismo problema en las
multiplicaciones (`EJ-13`/`EJ-14`): columnas con la cifra del
multiplicando Y la cifra correspondiente del resultado ocultas a la vez.
En las imágenes de referencia, en cambio, **cada columna del algoritmo
tiene como máximo una casilla vacía** — es lo que garantiza que el
alumno pueda deducir cada cifra con aritmética pura, sin adivinar.

### La corrección

Se escribió un script de verificación/corrección que, para cada reactivo
de `EJ-11`/`EJ-13`/`EJ-14` (calificados y de práctica extra — 84 en
total), reconstruye las "columnas" del algoritmo según el tipo de
operación:
- **Suma/resta**: una sola ecuación por columna entre los 2 operandos y
  el resultado.
- **Multiplicación de 1 cifra**: una ecuación por columna entre el
  multiplicando y el resultado (el multiplicador, al ser un solo dígito
  reutilizado en todas las columnas, nunca se oculta — igual que en las
  imágenes de referencia, donde el operador siempre está dado).
- **Multiplicación de 2 cifras (productos parciales)**: tres ecuaciones
  encadenadas — multiplicando×unidades del multiplicador = producto
  parcial 1; multiplicando×decenas del multiplicador = producto parcial 2
  (con su corrimiento); producto parcial 1 + producto parcial 2 =
  resultado. El multiplicador tampoco se oculta nunca.

Donde una columna tenía más de una celda oculta, el script conservó solo
una (revelando las demás) siguiendo un orden de prioridad fijo, sin tocar
los números originales del reactivo (`filas`) ni su `retroalimentacion` —
es una corrección quirúrgica de **qué** se oculta, no de la aritmética ni
de la narrativa pedagógica. También se detectó y corrigió que algunos
reactivos de multiplicación de 2 cifras tenían el propio multiplicador
parcialmente oculto (rompiendo la regla anterior); en esos casos se
revelaron sus cifras.

**Resultado de la corrección**: 75 celdas en conflicto resueltas en total
(16 en `EJ-11`, 29 en `EJ-13`, 30 en `EJ-14`). Tras la corrección, 5
reactivos de `EJ-14` quedaron con muy pocas casillas (algunos con solo 1,
por ser verificaciones de división con decimales donde el resultado
simplifica ceros finales — p. ej. `15 × 0.4 = 6` en vez de `= 6.0` — un
caso donde el modelo de "columnas" no aplica igual porque el resultado
tiene menos dígitos que el multiplicando). Se enriquecieron esos 5 casos
agregando casillas en columnas que habían quedado sin ninguna oculta,
verificando en cada caso que la solución seguía siendo única (en los 2
casos de "resultado con ceros simplificados", ocultando el multiplicando
completo en vez de un solo dígito, porque ahí la ecuación es una división
directa con solución real única, no una cadena de columnas modulares).

Se verificó el resultado final con un script independiente: **0
columnas con más de una casilla oculta** en los 72 reactivos de los 3
temas (228 casillas ocultas en total, entre 1 y 6 por reactivo), 0
errores de esquema, y el mismo resultado de siempre en el resto del
contenido (numeros y `retroalimentacion` sin cambios). Probado de punta a
punta con Playwright junto con el resto del banco: **159/159**.

### Extensión a otro tema ("si es posible en otras actividades")

El pedido incluía, de forma condicional, extender el estilo de
criptograma a otras actividades donde aplicara. Ningún otro tema de
Ejercítate tiene una estructura de "algoritmo escrito verticalmente"
como para justificar un rediseño completo, pero **`EJ-02` (Operaciones
básicas)** sí encaja de forma natural como bonus: se agregaron 2
reactivos `algoritmo_columnas` (una suma de 3 cifras, una multiplicación
por 1 dígito) a su `practicaExtra` — contenido opcional y no calificado,
sin tocar los 20 reactivos calificados existentes de ese tema. Ambos
verificados con el mismo criterio de "una sola casilla oculta por
columna".

## Paso 20: rediseño visual "Profe Ponchito" (capa de interfaz — sin tocar datos)

El docente pidió un rediseño visual/UX grande bajo una nueva marca
mascota, "Profe Ponchito" (un maestro caricaturizado que comparte su
propio apodo), inspirado en la estructura y las formas de Duolingo:
camino de módulos desplegable, paneles flotantes de retroalimentación,
botones "pulsables" con relieve 3D, barra de progreso curva y una
sección de soporte/recursos. **Es puramente una capa de interfaz sobre
lo que ya existía**: no se modificó ningún archivo de `data/` en este
paso, ni el esquema, ni la lógica de calificación/gamificación — todos
los cambios están en `assets/css/styles.css`, `assets/js/app.js` y
`index.html`.

### Decisiones de alcance (aclaradas con el docente antes de construir)

1. **Convivir, no reemplazar** — se adoptó la forma/estructura de
   Duolingo (curvas orgánicas, tarjetas muy redondeadas, botones con
   relieve 3D, paneles flotantes), pero la paleta de color sigue siendo
   la propia "Aula NEM" (azul pizarrón, cobre, verde bosque, grafito,
   vino, ocre) en una versión **pastel** — nunca los colores propios de
   Duolingo (verde `#58CC02`, azul `#1CB0F6`, dorado `#FFC800`, rojo
   `#FF4B4B`), que el propio código documenta desde el Paso 1 como
   deliberadamente evitados.
2. **La estructura de datos no cambia** — "Módulo" en la nueva interfaz
   es el PDA/Tema que ya existía; "Lección" es el subtema que ya
   existía. Ningún archivo de `data/` se tocó.
3. **Set de 9 íconos hecho a mano** — el docente compartió una imagen de
   referencia con un set de 9 íconos temáticos (pulgar+estrella,
   pensativo+cubo de duda, aplausos, mano-ok+triángulo, foco+π, Σ+π,
   reloj+X, compás, Σ+fracción) y su propia imagen de mascota. Como este
   proyecto no cuenta con una herramienta de generación de imágenes, los
   9 íconos se construyeron a mano como SVG de trazo simple —
   extendiendo el mismo patrón `icono_()` que ya existía desde el Paso 1
   (sin librería externa) — y la imagen de mascota se usó tal cual,
   recortada a un retrato limpio (`assets/img/profe-ponchito-avatar.png`)
   además de conservarse completa (`assets/img/profe-ponchito.png`).

### Cambios de interfaz, uno por punto del pedido

1. **Camino de módulos desplegable**: cada nodo del camino serpenteante
   (`caminoPDAs_`) pasó de ser un simple `<a>` a un `<details>/<summary>`
   — al tocar o enfocar el círculo numerado se despliega una tarjeta
   flotante redondeada con la lista de "Lecciones" (subtemas) del
   módulo y un botón real "Empezar →" que navega al PDA. Es HTML nativo
   (sin JavaScript de por medio para abrir/cerrar), así que funciona con
   teclado y lectores de pantalla; un pequeño listener global cierra el
   nodo abierto al tocar fuera.
2. **Panel flotante de retroalimentación**: un panel curvo en la parte
   inferior de la pantalla (verde pastel + ícono de logro si la
   respuesta es correcta, naranja pastel + "Profe Ponchito pensativo" si
   no) aparece al verificar un reactivo de práctica extra, y al terminar
   cada ronda de la actividad calificada de un subtema (resumiendo el
   resultado de esa ronda) — sin cambiar la lógica ni los datos de
   calificación, es una capa visual añadida (`mostrarFeedbackFlotante_`).
3. **Perfil y progreso**: el encabezado ahora tiene esquinas inferiores
   redondeadas y un avatar circular con las iniciales del alumno; el
   indicador de avance dentro de un PDA (`caminoPasos_`) ganó una barra
   de progreso curva/píldora además de los puntos existentes; se agregó
   el ícono de "Graduación/Birrete" como insignia junto a un subtema o
   PDA con puntaje perfecto.
4. **Botones y tarjetas pulsables**: `botonPrimario_`/`botonSecundario_`
   y los nodos del camino ganaron la clase `.mn-boton-3d` (borde
   inferior más oscuro y grueso que se "hunde" al presionar) con el
   color de cada fase/tema ya existente, no uno nuevo.
5. **Soporte y recursos**: un botón flotante circular (ícono de sobre)
   visible en toda la app abre un modal con un formulario breve que arma
   un correo (`mailto:`) dirigido al docente — no se envía nada
   automáticamente ni se guarda en ningún servidor nuevo. Se agregó
   también una nueva ruta `/recursos` con una calculadora funcional (solo
   botones, sin entrada libre de teclado) y una tarjeta de "Materiales
   descargables" marcada honestamente como próximamente (no existen
   materiales descargables reales todavía).

### Validación

`node --check` en los 3 archivos JS modificados; visualmente se generó
un build local de Tailwind (herramienta de esta sesión únicamente, para
poder probar en un sandbox sin acceso a internet — el `index.html` real
sigue usando el CDN, sin build step) para correr Playwright con el CSS
real aplicado, lo que además destapó y permitió corregir 2 fragilidades
reales: un problema de z-index donde un nodo del camino recién abierto
podía quedar tapado por nodos siguientes, y una peculiaridad conocida de
Chromium (inserta saltos de línea en `innerText()` alrededor de
cualquier caja `flex`/`inline-flex`, aunque se vean en una sola línea)
que afectaba solo al script de QA, no a la app. Corregido ambos, la
suite completa (`qa-full-sweep-v6.mjs`, actualizada para abrir el
`<details>` antes de tocar su enlace) pasó **159/159**.

## Paso 21: más íconos por pantalla + PDAs de grado con la misma extensión que Ejercítate

Dos pedidos del docente tras ver la página ya publicada en GitHub Pages:
"en la página solo se ve el emoji en la primera pantalla... quiero que
aparezcan en distintas pantallas cada que se avanza" y "la dinámica de
[pasos de] Ejercítate está bien... quiero que suceda lo mismo en los PDA
de primero, segundo y tercero ya que se obtiene la constancia en muy
pocos pasos... no modifique la extensión del apartado Ejercítate, solo
de los otros".

### 1. Insignia grande por pantalla (`insigniaPaso_`)

El Paso 20 agregó 13 íconos nuevos pero solo 2 quedaron realmente
conectados a pantallas del recorrido (el panel flotante de
retroalimentación y la insignia de "perfecto"); el resto del recorrido
seguía mostrando siempre los mismos íconos pequeños del Paso 1
(`foco`/`libro`/`trofeo`/`medalla`) dentro del overline, y la mascota
en imagen solo aparece en la pantalla de registro — de ahí que el
docente solo "viera el emoji" en la primera pantalla. Se agregó
`insigniaPaso_(iconoNombre, color)` en `app.js`: un círculo grande
(56px) con el color pastel del tema/fase actual y un ícono a mayor
tamaño, mostrado al inicio de cada pantalla del recorrido de un PDA,
con un ícono **distinto por tipo de pantalla**:

- Problematización → `ideaPi`
- Teoría de un subtema → `libro`
- Actividad (rondas de reactivos) → `compas`
- Mini-resultado de un subtema → `aplausos` (antes compartía `medalla`
  con el resultado global — una duplicación real, ya corregida también
  en el overline pequeño de esa pantalla)
- Resultado global del PDA → `trofeo` (antes `medalla`, duplicado)
- Práctica extra → `chispas`

No se agregaron íconos nuevos (los 13 del Paso 20 ya alcanzaban) ni se
tocó la imagen de mascota — sigue siendo, por ahora, solo la de
registro; si el docente quiere más imágenes ilustradas de la mascota
(no solo íconos de trazo), puede compartirlas para una siguiente
iteración.

### 2. Los PDAs de 1°, 2° y 3° vuelven a tener 4 subtemas + práctica extra (se fusionan las 119 tarjetas divididas del Paso 15)

**El problema real:** el Paso 15 dividió cada PDA curricular de 7
subtemas en 7 tarjetas de camino de 1 solo subtema, para alargar el
*camino visual* de cada grado (49/42/28 nodos) sin inventar contenido.
Pero eso significó que cada tarjeta, por sí sola, llega a su propia
constancia en muy pocos pasos (problematización → teoría → 2 rondas de
actividad → mini-resultado → resultado — 6 pantallas), muchos menos que
un tema de Ejercítate (4 subtemas propios → problematización → 4 ×
[teoría → actividad → mini-resultado] → resultado global — 14
pantallas). Es justo la queja del docente.

**La solución, sin inventar contenido nuevo (mismo espíritu que el Paso
15) ni tocar Ejercítate:** se revirtió la división del Paso 15 —los 17
PDAs curriculares (7 en 1°, 6 en 2°, 4 en 3°) volvieron a ser un solo
archivo cada uno, con:

- **4 subtemas núcleo** (`Nivel 1-4 de 4`: Introductorio/Intermedio/
  Avanzado/Síntesis) como `subtemas[]` — el mismo contenido exacto de
  las 4 primeras tarjetas de cada PDA de origen (`-S1` a `-S4`), sin
  cambiar una palabra ni un reactivo.
- **`practicaExtra`** con los reactivos de las 3 tarjetas de "Repaso"
  (`-S5` a `-S7`, 10 reactivos cada una) más los 3-4 reactivos de
  práctica extra que ya traía la última tarjeta (`-S7`) — en total 34
  reactivos opcionales y no calificados por PDA. El repaso deja de ser
  un tramo obligatorio del camino y pasa a ser refuerzo opcional para
  quien quiera seguir practicando, exactamente la función que ya
  cumplía `practicaExtra` en el esquema.
- **`problematizacion`**: se conserva la de la tarjeta `-S1` (Nivel 1,
  Introductorio) como gancho de apertura de todo el PDA; las
  problematizaciones propias de `-S2` a `-S7` (escritas para
  contextualizar un solo subtema, Paso 15) ya no se usan, porque un PDA
  de varios subtemas solo muestra una problematización al principio
  (igual que Ejercítate).
- **`titulo`**: pasa a ser el `contenido` oficial de la NEM de ese PDA
  (ya existía en cada tarjeta, idéntico en las 7), en vez del título
  específico de la tarjeta `-S1` (que describía solo su subtema).
- **`id`/`numero`**: el id vuelve a ser el del PDA de origen sin el
  sufijo `-S<n>` (ej. `1S-B1-PDA01`); `numero` vuelve a ser la posición
  del PDA dentro de su grado (1-7/1-6/1-4) en vez de la posición global
  que tenía como tarjeta (1-49/1-42/1-28).
- **`index.json`** de cada grado ahora lista 7/6/4 archivos en vez de
  49/42/28.

**Resultado:** el camino de cada grado volvió a tener 7/6/4 nodos (uno
por PDA curricular, cada uno bastante más "grueso" ahora), y completar
un PDA hasta la constancia toma **18 pasos** obligatorios
(problematización + 4 × [teoría + 2 rondas de actividad + mini-
resultado] + resultado global) más 34 reactivos opcionales de práctica
extra — más cerca, e incluso un poco más completo, que los 14 pasos +
4 opcionales de un tema de Ejercítate. Ejercítate no se tocó (no se
modificó ni un archivo de `data/ejercitate/`).

**Por qué fue posible sin tocar el motor ni el esquema:** desde el
Paso 14 `vistaPDA` ya recorre `pda.subtemas` de forma genérica
(`.forEach()`) y el esquema (`pda.schema.json`) ya documentaba esta
forma de 4-7 subtemas + `practicaExtra` opcional como la forma
"completa"/curricular de un PDA — la tarjeta de 1 solo subtema del
Paso 15 era la alternativa "corta". Fusionar de vuelta es, en los
hechos, volver a la forma que el esquema ya consideraba canónica;
`nodoModulo_`/`leccionesModulo_` (Paso 20) ya iteran `pda.subtemas`
genéricamente también, así que ahora muestran las 4 lecciones reales
de cada módulo en vez de mostrar siempre "1 lección".

**Validación:** las 17 fusiones se validaron cada una contra
`data/schema/pda.schema.json` (con `jsonschema` en Python) al momento
de generarse. Con un build local de Tailwind (misma técnica del Paso
20, solo para pruebas) se corrió un recorrido completo de extremo a
extremo de los 17 PDAs de grado (camino → problematización → 4
subtemas con sus 2 rondas cada uno, con respuestas correctas reales →
resultado global → constancia → los 34 reactivos de práctica extra,
verificando que cada uno se marque correcto → celebración final) más
una muestra de Ejercítate (camino agrupado + 3 temas) — **20/20
pasaron, 0 fallidos, 0 errores de consola**. `qa-full-sweep-v6.mjs` no
necesitó cambios de lógica (ya recorría `pda.subtemas`/`practicaExtra`
de forma genérica y compara el número de nodos contra el manifiesto,
sea cual sea su tamaño); solo se le agregó un paso para cerrar el panel
flotante de retroalimentación entre reactivos de práctica extra, porque
un banco de 34 (antes 3-4) hace mucho más probable que el siguiente
botón "Verificar" quede momentáneamente bajo ese panel si no se cierra
entre uno y otro.

## Paso 22: fotos reales del "Profe Ponchito" en toda la página

El profesor confirmó que el conteo de pasos del Paso 21 ya cumplía lo
que pedía ("me parece bien") y mandó 14 imágenes nuevas del mascota
"Profe Ponchito" (dos de ellas hojas con varios stickers cada una), con
instrucciones abiertas: agregarlas "en todo la página web donde tú
gustes y sea visualmente creativo". A diferencia del Paso 21
(`insigniaPaso_`, un ícono SVG plano dentro de un círculo de color),
estas son ilustraciones/fotos reales del mascota, con escenas y texto
propio (pizarrones, certificados, quizzes, etc.).

**Qué se hizo:**
- Las 2 hojas de stickers (cuadrículas de 3×3 y 3×4) se recortaron con
  ImageMagick en celdas individuales; de las ~33 imágenes resultantes
  (14 originales + los recortes) se eligieron las **12 que mejor
  encajan semánticamente** con una pantalla concreta de la app, evitando
  duplicados casi idénticos entre sí. Cada una se redimensionó/optimizó
  (ancho máximo 240-720px según el uso, PNG de 256 colores) y se guardó
  en `assets/img/mascota/` (12 archivos, ~480 KB en total).
- Nuevo helper `imagenMascota_(archivo, alt, clase)` en `app.js` (justo
  después de `insigniaPaso_`), que simplemente inserta un `<img>` con
  la ruta a `assets/img/mascota/`. No reemplaza `insigniaPaso_` en
  ningún panel — se agrega arriba de él, como un acento adicional.
- Mapeo final (screen → imagen, todas con `alt` descriptivo):
  problematización → "¿Cómo resolvemos esto?" (laberinto); teoría de
  subtema → "¡Exploremos nuevos temas con un libro!"; actividad → quiz
  interactivo con estrellas; mini-resultado → "¡Tú puedes!" con
  confeti; resultado global → "¡Meta lograda!" con confeti; práctica
  extra → números/símbolos haciendo malabares; justo antes del botón
  "Generar mi constancia" → "Certificado de Matemáticas A+" (se dejó
  fuera del diploma exportable en sí, para no restarle formalidad al
  PDF); selección de grado (`/grados`) → banner ancho con el pizarrón
  "Profe Ponchito" y la lista de módulos; lista de PDAs de un grado →
  "plantando un árbol junto a una pirámide" (metáfora de crecimiento,
  a propósito en la pantalla de "tu camino"); Ejercítate → banner
  "Curso Online de Matemáticas"; recursos → "¿Dudas?" junto al botón de
  Soporte y "regla y compás" junto al de Calculadora; y una miniatura
  circular de 20×20px del árbol, siempre visible junto a la etiqueta
  "Tu camino" en el indicador de avance (`caminoPasos_`) de cada
  pantalla del recorrido.
- Las otras ~21 imágenes recortadas (variantes/duplicados de las
  mismas poses: grupos trabajando en equipo, calculadora, gráficas
  interactivas, fórmula de ecuación, etc.) se dejaron sin usar por
  ahora — no se descartaron, pero integrar más habría significado
  repetir la misma idea visual en más de una pantalla sin agregar
  claridad. Si el profesor quiere más variedad, ya están recortadas y
  lo único que falta es decidir dónde.

**Validación:** con el mismo build local de Tailwind (el CDN sigue
bloqueado en este entorno de pruebas) se corrió un recorrido de
extremo a extremo — registro → selección de grado → lista de PDAs de
1° → un PDA completo de 18 pasos (problematización, los 4 subtemas con
sus 2 rondas y mini-resultado cada uno, resultado global, constancia,
práctica extra) → Ejercítate → recursos — confirmando en cada pantalla
que las imágenes nuevas cargan (`naturalWidth > 0`) y revisando
capturas de pantalla del layout real. Se encontraron 0 errores de
consola reales; el único hallazgo (dos imágenes reportadas como "no
cargadas" justo al llegar a la pantalla de resultado global) resultó
ser un falso positivo de la propia prueba, no un bug: esas imágenes
usan `loading="lazy"` y todavía estaban fuera de la vista cuando se
revisó, cargando normalmente al hacer scroll — se confirmó con una
segunda pasada y con las capturas de pantalla. De paso, esta misma
prueba reconfirmó que el PDA recorrido efectivamente muestra
"Paso 1 de 18" … "Paso 18 de 18", el resultado ya entregado en el
Paso 21.

## Paso 23: Trimestres 2 y 3 completos, navegación por periodo y reetiquetado curricular real

El docente reportó (con capturas de pantalla) que en su grupo el camino de
cada grado se veía reducido a "6 o 7 temas" y pidió llegar a 20 por grado,
además de que el contenido nuevo apareciera en **tarjetas separadas de
"2do periodo"** en vez de mezclarse en el camino del Trimestre 1. Esto
llevó a dos decisiones de diseño explícitas, ambas confirmadas con el
docente antes de escribir contenido nuevo (ver el hilo de preguntas en la
conversación):

### 1. De dónde salió el contenido nuevo (y por qué no son 20 por grado)

Investigar el **Programa Sintético de la Fase 6** (SEP) mostró que toda la
Fase 6 —los 3 años de secundaria juntos, no cada grado por separado— tiene
solo **14 Contenidos**: los 7 de "Sentido numérico y pensamiento
algebraico" ya usados en el Trimestre 1 de esta app, 4 de "Forma, espacio y
medida" (Rectas y ángulos; Construcción y propiedades de las figuras
planas y cuerpos; Circunferencia, círculo y esfera; Medición y cálculo en
diferentes contextos) y 3 de "Análisis de datos y probabilidad" (Obtención
y representación de información; Interpretación de la información a
través de medidas de tendencia central y de dispersión; Azar e
incertidumbre en la ocurrencia de eventos cotidianos) que la app todavía
no usaba. Eso se le explicó honestamente al docente: no hay 20 Contenidos
oficiales por grado para llegar a 20 sin inventar temario fuera del
currículo. Se le presentaron 3 opciones (cubrir Trimestres 2 y 3 completos,
solo Trimestre 2, o un mix) y, tras encontrar además una dosificación
trimestral real y bien documentada para 1° de secundaria que reparte los 7
PDAs de álgebra entre Trimestre 1 (3 PDAs) y Trimestre 2 (4 PDAs, junto con
2 temas nuevos de geometría) —distinto a como estaba organizada la app
hasta el Paso 22, con los 7 PDAs completos en el Trimestre 1—, se le
presentó esa fuente y eligió explícitamente "usar esta fuente real,
reacomodando" en vez de forzar un conteo redondo. Resultado acordado:
**14 PDAs en 1°, 13 en 2°, 11 en 3°** (38 en total), no 20/20/20.

### 2. Reetiquetado del contenido existente (sin reescribir nada)

El esquema (`pda.schema.json`) ya tenía un campo `trimestre` (`"1"|"2"|"3"`)
que los 17 PDAs originales traían fijo en `"1"` pero que `app.js` nunca
usaba para nada — se reutilizó ese campo en vez de inventar uno nuevo
(`periodo` u otro nombre). Aplicando la misma lógica de la dosificación de
1° a 2° y 3° (con el subconjunto de PDAs de álgebra que cada uno ya tenía),
quedó:

| Grado | Trimestre 1 (sin cambio de contenido) | Trimestre 2 (reetiquetados) |
|---|---|---|
| 1° | PDA01-03 | PDA04-07 |
| 2° | PDA01-03 | PDA04-06 |
| 3° | PDA01 | PDA02-04 |

Ningún archivo cambió de contenido, título, ejemplos ni reactivos — solo el
valor del campo `trimestre` (de `"1"` a `"2"` en los que correspondía).

### 3. Los 21 PDAs nuevos

Se escribieron 6 PDAs para Trimestre 2 (2 por grado, mismo eje "Forma,
espacio y medida" que faltaba) y 15 para Trimestre 3 (5 por grado, entre
"Forma, espacio y medida" y "Análisis de datos y probabilidad"), cada uno
con la estructura ya establecida desde el Paso 14 (problematización + 4
subtemas de dificultad creciente, 10 reactivos cada uno en 2 rondas de 5, +
práctica extra de 20-24 reactivos). El **alcance de cada tema crece por
grado** (currículo en espiral): por ejemplo "Rectas y ángulos" va de
clasificar ángulos y ángulos entre paralelas en 1°, a congruencia de
triángulos y rectas notables en 2°, a Teorema de Pitágoras y razones
trigonométricas en 3°.

**Trimestre 2 — eje "Forma, espacio y medida" (2 PDAs × 3 grados = 6):**
- **Rectas y ángulos:** 1° "Ángulos y Rectas" (clasificación de ángulos,
  complementarios/suplementarios, ángulos entre paralelas cortadas por una
  transversal) → 2° "Ángulos y Congruencia de Triángulos" (suma de ángulos
  internos de un polígono, rectas notables, criterios LLL/LAL/ALA) → 3°
  "Teorema de Pitágoras y Trigonometría" (Pitágoras con ternas limpias,
  seno/coseno/tangente, ángulos notables 30°/45°/60°, ángulos de
  elevación/depresión).
- **Construcción y propiedades de las figuras planas y cuerpos:** 1°
  "Figuras Planas: Triángulos y Cuadriláteros" (clasificación por lados y
  ángulos, suma de ángulos internos, perímetro) → 2° "Semejanza y Cuerpos
  Geométricos" (semejanza AA, Teorema de Thales, áreas de figuras
  compuestas, prismas/pirámides y relación de Euler) → 3° "Áreas y
  Volúmenes de Cuerpos Geométricos" (desarrollo plano, área total de
  prismas, volumen de prismas/pirámides/cilindros, vistas frontal/lateral/
  superior).

**Trimestre 3 — 5 PDAs × 3 grados = 15:**
- **Circunferencia, círculo y esfera** (eje Forma, espacio y medida): 1°
  "El Círculo y sus Elementos" (elementos, perímetro, área) → 2° "Arcos y
  Sectores Circulares" (ángulo central, longitud de arco, área de sector)
  → 3° "Área y Volumen de la Esfera".
- **Medición y cálculo en diferentes contextos** (eje Forma, espacio y
  medida): 1° "Conversión de Unidades de Medida" (longitud, capacidad,
  masa) → 2° "Escalas y Razones de Cambio" (escala en planos/mapas,
  velocidad) → 3° "Densidad, Rapidez y Costos" (densidad, rapidez media en
  varios tramos, costo por unidad).
- **Obtención y representación de información** (eje Análisis de datos y
  probabilidad): 1° "Recolección y Gráficas de Datos" (variables,
  frecuencia absoluta, gráfica de barras/circular) → 2° "Tablas y Gráficas
  Estadísticas" (frecuencia relativa/porcentual, histogramas, gráficas de
  línea) → 3° "Muestras y Análisis Crítico de Gráficas" (población/muestra,
  diseño de encuestas, gráficas engañosas).
- **Medidas de tendencia central y de dispersión** (eje Análisis de datos y
  probabilidad): 1° "Media, Mediana y Moda" → 2° "Rango y Comparación de
  Datos" (rango, datos atípicos) → 3° "Estadística con Datos Agrupados"
  (marca de clase, media ponderada, clase modal/mediana, desviación media).
- **Azar e incertidumbre en la ocurrencia de eventos cotidianos** (eje
  Análisis de datos y probabilidad): 1° "Probabilidad de Eventos Simples"
  (espacio muestral, probabilidad clásica, fracción/decimal/porcentaje) →
  2° "Eventos Compuestos y Diagramas de Árbol" (regla del producto,
  eventos independientes) → 3° "Probabilidad de la Unión de Eventos"
  (eventos mutuamente excluyentes vs. no excluyentes, regla de la suma).

### 4. Navegación por periodo en `app.js`

La pantalla `/grados` pasó de 3 tarjetas (una por grado, llevando a un solo
camino largo) a **9 tarjetas agrupadas por grado** — cada grado muestra un
encabezado ("1° de secundaria") y 3 tarjetas debajo, una por trimestre—,
más la tarjeta de Ejercítate sin cambios. Cada tarjeta enlaza a una nueva
ruta `ruta('/pda-lista/:grado/:trimestre', vistaListaPDA)` (registrada
junto a la ya existente `ruta('/pda-lista/:grado', vistaListaPDA)`, que
sigue usándose tal cual para Ejercítate, que no tiene trimestre).
`vistaListaPDA` ahora filtra los PDAs ya cargados por `p.trimestre ===
trimestre` — el mismo patrón que `caminoEjercitateAgrupado_` ya usaba para
agrupar por `categoria` — y muestra el trimestre actual en su encabezado
("PDAs de 1° · Trimestre 2"); un trimestre sin contenido todavía (caso que
no ocurre ya en la versión final, pero se probó explícitamente) muestra el
mismo mensaje de estado vacío que ya existía, sin romperse. Los 3
enlaces internos que antes solo llevaban `#/pda-lista/:grado` (el botón
"← Volver" dentro de un PDA, el enlace superior "Cambiar de grado" del
recorrido, y "Elegir otro tema" en la pantalla de celebración) ahora
incluyen el `trimestre` del PDA actual (`pda.trimestre`), leído del propio
PDA ya cargado — así "volver" siempre regresa al trimestre correcto, no al
Trimestre 1 por defecto.

### 5. Generación y validación del contenido

Los 21 PDAs nuevos se generaron con agentes en paralelo (uno por PDA), cada
uno con instrucciones explícitas del alcance pedagógico exacto de sus 4
subtemas (para no traslaparse con el grado anterior/siguiente ni con otro
PDA del mismo trimestre) y la instrucción de verificar su propia
aritmética/geometría/probabilidad con Python antes de reportar terminado.
Al recibir los 21 archivos se hizo una segunda ronda de validación
independiente: `jsonschema.Draft7Validator` contra `schema/pda.schema.json`
sobre los 38 archivos del repositorio (0 errores), una revisión estructural
genérica de cada reactivo (rango de índices en `opcion_multiple`, tipo
booleano en `verdadero_falso`, hueco `___` en `llenar_frase`, e índices
válidos en `relacionar_columnas` — sin asumir que `columnaA` y `columnaB`
deben tener el mismo tamaño: varios reactivos clasifican más elementos que
categorías hay, algo que la interfaz sí soporta porque cada fila es un
`<select>` independiente con las mismas opciones), y un muestreo manual
recalculando a mano decenas de reactivos de los temas más sensibles a
error de redondeo (Pitágoras/trigonometría, áreas/volúmenes con π,
densidad/rapidez, medias ponderadas) — 0 discrepancias reales.

**Prueba de punta a punta** (Playwright + build local de Tailwind, igual
que en pasos anteriores): conteo exacto de tarjetas por cada una de las 9
combinaciones grado×trimestre (3/6/5 en 1°, 3/5/5 en 2°, 1/5/5 en 3°) más
las 40 de Ejercítate; un recorrido completo (problematización → 4 subtemas
× 2 rondas → resultado global → constancia) de un PDA de Trimestre 2 y uno
de Trimestre 3 en cada grado, confirmando que el back-link siempre apunta
al trimestre correcto — 0 errores.

## Paso 24: se retiró el canal de "Soporte" (mailto al docente)

El docente preguntó si existía forma de evitar que le llegara contenido
ofensivo — archivos adjuntos de índole sexual o grotesca — a su correo
real a través de las asesorías. Investigando las opciones de Gmail/Google
Workspace se confirmó que **no hay manera de filtrar el contenido de una
imagen adjunta**: los filtros de Gmail (personales o de Workspace,
`support.google.com/a/answer/1346934`) solo pueden actuar sobre el tipo
de archivo o palabras del asunto/cuerpo, nunca sobre lo que muestra una
imagen — eso requeriría una integración externa (p. ej. Cloud Vision
SafeSearch) fuera del alcance de lo que se había construido. En vez de
prometer un filtro que no existe, el docente eligió la opción más simple
y segura: **quitar por completo el botón que abría ese canal**, ya que la
app nunca necesitó un canal de correo directo para funcionar (el webhook
de Google Apps Script hacia la hoja de cálculo es, y sigue siendo, la
única vía real de datos del alumno hacia el docente, y no admite
adjuntos).

Se eliminó de `assets/js/app.js`:

- El botón flotante circular "¿Necesitas ayuda?" (`#mn-boton-soporte-flotante`)
  que aparecía sobre cualquier pantalla (agregado en el Paso 20).
- La tarjeta "Soporte" de la pantalla `/recursos` (`data-accion="abrir-soporte"`).
- La función `abrirModalSoporte_` completa (el formulario que armaba un
  enlace `mailto:docentealfonsomatematicas@gmail.com` con el mensaje del
  alumno) y su contenedor de modal `#mn-modal-soporte`.
- La referencia a cerrar ese modal con la tecla Escape en `capaGlobal_`.

La pantalla `/recursos` se renombró a **"Recursos"** (antes "Recursos y
soporte", tanto en el `<h2>` como en el `title`/`aria-label` del ícono del
encabezado que enlaza a ella) y ahora solo muestra dos tarjetas:
Calculadora y "Materiales descargables" (sin cambios en ninguna de las
dos). Ningún dato, PDA, ruta de navegación o mecánica de gamificación se
tocó — es puramente la eliminación de una capa de interfaz, igual de
quirúrgica que su adición en el Paso 20.

**Prueba de punta a punta** (Playwright + build local de Tailwind):
confirma que `#mn-boton-soporte-flotante` y `#mn-modal-soporte` ya no
existen en el DOM en ninguna pantalla, que el título "Recursos y soporte"
no aparece en ningún lado, que la Calculadora sigue funcionando (prueba de
una operación real) y que la navegación general (`/grados` con las 9
tarjetas grado×trimestre + Ejercítate) no se vio afectada — 0 errores.

## Paso 25: de 4 a 10 lecciones por PDA (menor a mayor dificultad)

El docente reportó que, al revisar la app ya con los 38 PDAs de los 3
trimestres (Paso 23), notó que "en cada pda de cada trimestre hay pocas
lecciones" y pidió expandir cada uno a **al menos 10 lecciones**,
desglosadas de menor a mayor dificultad, aceptando explícitamente que
haría falta escribir más ejercicios ("tendrás que crear más ejercicios").

### 1. Diagnóstico: los 38 PDAs tenían 4 lecciones, no 7

Antes de generar nada se auditó el estado real de los datos (no la
memoria de pasos anteriores): pese a que el Paso 14 había agregado 3
subtemas de "repaso" a los 17 PDAs originales (llevándolos de 4 a 7), el
Paso 21 **revirtió eso** — fusionó esos subtemas extra de vuelta en la
`practicaExtra` (no calificada) para igualar la extensión de un PDA de
grado a la de un tema de Ejercítate. Resultado: los 38 PDAs curriculares
(los 17 originales reetiquetados por trimestre + los 21 nuevos del Paso
23) tenían, sin excepción, **4 subtemas núcleo** (Introductorio/
Intermedio/Avanzado/Síntesis) más una `practicaExtra` de 20-34 reactivos
sin estructurar en lecciones. Se confirmó programáticamente contando
`len(subtemas)` en los 78 archivos de PDA (38 de grado + 40 de
Ejercítate): los 78 tenían exactamente 4.

### 2. Alcance acordado con el docente

Se preguntó al docente, antes de generar nada, cómo repartir un trabajo de
este tamaño (se estimaron 1,500-2,280 reactivos nuevos): eligió que se
generaran **los 3 grados a la vez** (no por partes) y que el número final
de lecciones **podía variar entre 10 y 12** según lo que tuviera más
sentido pedagógico. Se optó, por simplicidad y consistencia entre los 38
PDAs, por un objetivo uniforme de **10 lecciones por PDA** (dentro del
rango aprobado): se agregan exactamente **6 lecciones nuevas** a cada uno
de los 4 subtemas ya existentes. Ejercítate (pseudo-grado, sin
trimestres) se quedó sin cambios en 4 lecciones — el pedido del docente
fue específicamente sobre "cada pda de cada trimestre".

### 3. Las 6 lecciones nuevas: escala de dificultad de 10 niveles

Se diseñó una escala canónica de 10 niveles, reutilizada tal cual en los
38 PDAs, que continúa después de los 4 núcleo:

1. Nivel 1 de 10 · Introductorio *(ya existía)*
2. Nivel 2 de 10 · Intermedio *(ya existía)*
3. Nivel 3 de 10 · Avanzado *(ya existía)*
4. Nivel 4 de 10 · Síntesis *(ya existía)*
5. Nivel 5 de 10 · Aplicación
6. Nivel 6 de 10 · Aplicación avanzada
7. Nivel 7 de 10 · Reto
8. Nivel 8 de 10 · Reto avanzado
9. Nivel 9 de 10 · Integración
10. Nivel 10 de 10 · Dominio

Cada una de las 6 lecciones nuevas (numeradas `<N>.5` a `<N>.10`) trae los
mismos campos que un subtema normal (`titulo`, `explicacion`, `formula`
opcional, `ejemplos`, `puntosPorReactivo`, `estrellasMax`, `reactivos`) y
una mini-actividad calificada de **10 reactivos en 2 rondas de 5** —
exactamente el mismo formato que ya usaban los subtemas 1-4, así que el
motor de PDAs (`vistaPDA`, `panelSubtema_`, `panelActividad_`,
`panelMiniResultado_`) no necesitó ningún cambio: ya soportaba cualquier
número de subtemas desde el Paso 14/16.

**Cambio real de motor, mínimo y quirúrgico:** en vez de dejar que
`nivelChip_` calculara la etiqueta por índice (lo que habría mostrado
"Nivel 1 de 4" para los primeros 4 y luego "Repaso 1 de 6" para el resto,
mezclando dos escalas distintas), se fijó el campo `nivelEtiqueta` de
**los 10 subtemas** de cada PDA — se actualizó el de los 4 ya existentes
(de "Nivel N de 4" a "Nivel N de 10") y se agregó el de los 6 nuevos —
para que la interfaz muestre una sola escala de 10 niveles, coherente de
principio a fin, usando el mismo mecanismo de override que el esquema ya
preveía (`nivelEtiqueta`, agregado en el Paso 15) en vez de tocar la
lógica de `nivelChip_` en `app.js`. El único cambio real de código fue
`data/schema/pda.schema.json`: `subtemas.maxItems` de 7 a 12 (para dejar
margen hasta 12 lecciones, aunque los 38 PDAs quedaron en 10 exactas).

### 4. Generación de contenido: 38 agentes en paralelo, uno por PDA

Cada PDA se encargó a un agente independiente con un prompt que incluía:
el contexto oficial del PDA (eje, Contenido NEM, PDA NEM, problematización),
un resumen de sus 4 subtemas existentes (para no repetir teoría), la
instrucción de leer el archivo real completo antes de escribir (formato
exacto + los 20-34 reactivos de práctica extra, para no duplicar
números/contextos exactos), la escala de 10 niveles con las 6 etiquetas
que le tocaban, y la exigencia de verificar toda la aritmética con un
script de Python (borrado al terminar) antes de entregar. Cada agente
guardó su resultado como un array JSON de exactamente 6 subtemas en un
archivo temporal separado (no tocó el archivo real del PDA).

**Nota operativa (rate limiting):** lanzar los 38 agentes esta vez se
hizo en lotes de 1 a 8 según la disponibilidad de la API en cada momento
de la sesión (se alternó entre lotes paralelos y llamadas individuales
según qué tan seguido aparecía el error de límite de tasa), en vez de un
solo lote grande — la lección del Paso 23 (revisar disco antes de
relanzar) se aplicó de nuevo cada vez que un lote fallaba a medias.

### 5. Fusión y validación independiente

Una vez completados los 38 archivos temporales, se corrió (sin fusionar
todavía) una validación de esquema simulando la fusión (`jsonschema.
Draft7Validator` sobre cada PDA con sus 4 subtemas + los 6 nuevos, 10 en
total): 0 errores. Una revisión estructural genérica adicional (índices
de `opcion_multiple`/`relacionar_columnas` dentro de rango, booleano en
`verdadero_falso`, hueco `___` presente en `llenar_frase`, tipo válido en
cada reactivo) encontró **4 reactivos reales con un defecto**: 3 en
`1S-B1-PDA11` y 1 en `2S-B1-PDA04`, donde el agente redactó la pregunta
como pregunta directa ("¿Cuánto...?") en vez de una frase con hueco
`___`, aunque marcó el tipo como `llenar_frase` — se corrigieron
reescribiendo la frase para incluir el hueco, sin tocar la aritmética ni
la respuesta correcta. Una comparación de texto exacto contra los 4
subtemas núcleo y la práctica extra de cada PDA no encontró duplicados
reales. Tras las 4 correcciones, se fusionaron los 38 archivos
(actualizando `nivelEtiqueta` de los 4 subtemas existentes y anexando los
6 nuevos) y se corrió la validación de esquema una vez más sobre los
archivos reales ya fusionados: **0 errores**, los 38 con exactamente 10
subtemas.

**Prueba de punta a punta** (Playwright + build local de Tailwind): se
desplegó cada uno de los 38 nodos de PDA en las 9 combinaciones
grado×trimestre y se contó su lista de "Lecciones" — las 38 muestran
exactamente 10. Se recorrió además un PDA completo (10 lecciones × 2
rondas = 20 rondas de actividad) de principio a fin, confirmando que
llega correctamente al resultado global (con el texto "Suma de los 10
subtemas") y a la constancia — 0 errores.

## Paso 26: cada PDA de 10 lecciones se dividió en 3 series más cortas

El docente vio el camino de un PDA con el nuevo diseño del Paso 25
("Paso 1 de 42") y pidió lo contrario de lo que parecía a primera vista:
no menos contenido, sino **más PDAs y cada uno más corto** — verbatim:
"quisiera que fueran mas pdas y que el camino sea mas corto en cada pda,
con ello quiero decir que cambies las estructuras manten la cantidad de
reactivos pero dividelos en varios pdas renombra si quieres como por
ejemplo expresion de fracciones 1.1, expresion de fracciones 1.2". Es
decir: mismo contenido total, reorganizado en más unidades curriculares
más pequeñas.

### 1. Alcance acordado con el docente

Antes de tocar datos se hicieron 3 preguntas de aclaración (con el
tamaño real del cambio ya estimado: dividir 38 PDAs de 10 lecciones
multiplicaría el número de PDAs por trimestre):

- **Tamaño de cada serie**: el docente eligió "3 lecciones por parte
  (Recomendado)" — cada PDA de 10 lecciones se reparte en 3 series de
  tamaño 4+3+3, en vez de, por ejemplo, 5 series de 2.
- **Práctica extra**: eligió que se reparta **proporcionalmente entre
  las 3 series** (no que se quede completa solo en la última).
- **Problematización**: eligió que **cada serie tenga su propia
  problematización corta**, en vez de que solo la primera la conserve.

### 2. División mecánica (4+3+3), sin tocar contenido existente

Los subtemas, reactivos, explicaciones y ejemplos de cada PDA **no se
reescribieron**: la división es un reagrupamiento puramente mecánico,
hecho con un script de Python, no con agentes de generación. Para cada
uno de los 38 PDAs de 10 subtemas (Paso 25):

- **Serie A** (id `<original>A`): subtemas 1-4, las 4 lecciones núcleo
  del diseño original (Introductorio/Intermedio/Avanzado/Síntesis). Su
  `nivelEtiqueta` se recalculó de "Nivel N de 10" a "Nivel N de 4" —
  volviendo, coincidentemente, a la escala que tenían antes del Paso 25.
- **Serie B** (id `<original>B`): subtemas 5-7 (Aplicación/Aplicación
  avanzada/Reto), con `nivelEtiqueta` recalculado a "Nivel N de 3".
- **Serie C** (id `<original>C`): subtemas 8-10 (Reto avanzado/
  Integración/Dominio), también "Nivel N de 3".

El campo `numero` (interno, usado para el chip "Tema N" y el número
dentro del círculo del camino) se reasignó de forma secuencial dentro de
cada grado, en el mismo orden curricular de siempre (1, 2, 3… hasta 42 en
1°, 39 en 2°, 33 en 3°) — es un contador de posición en el camino, no
tiene que ver con la numeración "N.1"/"N.2" del título. El título de cada
serie es el título original del PDA más el sufijo que pidió el docente,
usando el número ORIGINAL del PDA (1-14/1-13/1-11) y la posición de la
serie (1, 2 o 3): p. ej. el PDA 1 de 1° ("Expresión de fracciones como
decimales y de decimales como fracciones") generó los títulos "...
1.1", "... 1.2" y "... 1.3" para sus Series A, B y C — el ejemplo textual
que dio el docente. La `practicaExtra` de cada PDA original se repartió
en 3 bloques contiguos, proporcionales al tamaño de cada serie (≈40%/
30%/30%), conservando el orden original de los reactivos sin recortar ni
duplicar ninguno.

Resultado: los 38 PDAs se convirtieron en **114 series** (42 en 1°, 39 en
2°, 33 en 3°). El motor de la app (`vistaPDA`, `panelSubtema_`,
`panelActividad_`, `leccionesModulo_`, `caminoPDAs_`) no necesitó ningún
cambio de código: ya deriva el número de pasos y de lecciones de
`pda.subtemas.length` desde el Paso 14, y el camino de la pantalla
`/pda-lista/:grado/:trimestre` ya soportaba cualquier cantidad de nodos.
El único cambio real de esquema fue de documentación (`pda.schema.json`:
las descripciones de `description` y `subtemas.description` se
reescribieron para explicar el modelo de series; `maxItems` se dejó en
12, sin cambio funcional).

### 3. 114 problematizaciones nuevas, una por serie

A diferencia de los subtemas (reagrupados tal cual), la problematización
de cada serie **sí es contenido nuevo**: la del PDA completo ya no tiene
sentido repartida en 3 (haría que las Series B y C empezaran con un gancho
que no corresponde a sus lecciones). Se generaron 114 problematizaciones
(3 por cada uno de los 38 PDAs) con **3 agentes, uno por grado** — no uno
por PDA ni uno por serie, ya que una problematización es mucho más corta
que una lección completa con reactivos, así que un solo agente pudo
redactar con calidad las 33-42 problematizaciones de su grado en una sola
pasada, revisando la variedad de escenarios y personajes de principio a
fin (evitando repetir "Ana" o "el equipo de baloncesto" del PDA original
en más de un lugar). Cada agente recibió, por cada serie, los títulos de
las lecciones que le tocaban específicamente, para calibrar la pregunta
de la problematización al contenido real de esa serie (una Serie C, por
ejemplo, plantea algo resoluble solo con las lecciones de reto/dominio,
no con las lecciones núcleo de la Serie A del mismo PDA). El formato es
idéntico al de siempre (`contexto` + `pregunta`), con escenarios
mexicanos variados (mercados, kermés, deportes, comercio, dinero,
oficios) y sin depender de verificación aritmética (una problematización
es un gancho motivador, no un reactivo calificado).

### 4. Fusión y validación

Las 114 problematizaciones se fusionaron en los 114 archivos con un
script (sin tocar ningún otro campo). Validación posterior:
`jsonschema.Draft7Validator` sobre los 114 archivos reales: **0
errores**. Revisión estructural genérica (igual que en pasos anteriores:
rango de índices en `opcion_multiple`/`relacionar_columnas`, booleano en
`verdadero_falso`, hueco `___` en `llenar_frase`): **0 errores**. Se
comparó además, PDA por PDA, la suma de reactivos de las 3 series contra
el conteo original antes de dividir (subtemas + práctica extra): **0
discrepancias** — ningún reactivo se perdió ni se duplicó al repartir. Se
verificó también que el campo `numero` quedara secuencial sin huecos ni
repetidos en cada grado (1…42, 1…39, 1…33) y que ninguna etiqueta de nivel
conservara el texto obsoleto "de 10".

**Prueba de punta a punta** (Playwright + build local de Tailwind):
conteo exacto de nodos por trimestre en los 3 grados (por ejemplo, 1° ·
Trimestre 1 pasó de 3 a **9** nodos, Trimestre 2 de 6 a **18**, Trimestre
3 de 5 a **15**; 2° · Trimestre 1 de 3 a **9**; 3° · Trimestre 1 de 1 a
**3**); un recorrido completo de una serie corta (`1S-B1-PDA01B`, 3
lecciones) confirmando que ahora toma **"Paso 1 de 14"** (antes "Paso 1
de 42" para el PDA completo) y que llega correctamente al resultado
global; y un recorrido de una Serie A (4 lecciones) confirmando **"Paso 1
de 18"** — la misma duración que un PDA completo tenía antes del Paso 25.
Ejercítate (40 temas, sin dividir) se verificó sin cambios — 0 errores en
toda la suite.

## Paso 27: cada lección se volvió su propia serie independiente (con su propia constancia)

El docente todavía no había subido el Paso 26 a GitHub Pages (las capturas
que envió seguían mostrando el sitio viejo, "Paso 1 de 42" y solo 3
tarjetas por trimestre) cuando pidió ir un paso más allá: "divide las
lecciones del modulo en lugar de poner todos los pasos para obtener una
sola constancia separa para obtener varias contancias de un solo pda".
Mientras se investigaba el código de constancias/webhook para responder,
llegó el mensaje que aclaró el alcance real: **"separalas en lecciones"**
— es decir, no basta con las 3 series de 3-4 lecciones del Paso 26: **cada
lección individual debe ser su propia serie**, con su propio resultado y
su propia constancia al terminarla. Esto superó por completo el diseño de
"series" del Paso 26.

### 1. División mecánica (1 lección = 1 serie), desde la fuente sin agrupar

Para evitar arrastrar metadatos ya recalculados por el Paso 26, la
división partió de nuevo de los 38 PDAs originales de 10 lecciones del
Paso 25 (no de las 114 series del Paso 26). El script de división, por
cada uno de los 38 PDAs y cada una de sus 10 lecciones (`i` = 0..9):

- **id**: `<original>-01` … `<original>-10` (sufijo de 2 dígitos, para que
  `cargarPDAporId` — que hace `archivo.startsWith(id)` — nunca confunda
  `-01` con `-010` ni con otro PDA).
- **título**: el título original del PDA + el número de la lección tal
  cual (p. ej. "Expresión de fracciones como decimales y de decimales
  como fracciones 1.5"), usando el mismo patrón "N.M" que pidió el
  docente desde el Paso 26.
- **subtemas**: un arreglo de **un solo elemento** — esa lección completa,
  sin recortar ni tocar su teoría ni sus reactivos.
- **nivelEtiqueta**: se conservó **sin recalcular**, tal cual traía la
  lección desde el Paso 25 ("Nivel N de 10 · <etiqueta>"). A diferencia
  del Paso 26 (que sí recalculaba la etiqueta sobre el total local de
  cada serie), aquí una lección sola mostrando "Nivel 1 de 1" habría
  perdido toda referencia de qué tan avanzada es dentro del tema
  completo — se prefirió conservar el contexto original.
- **practicaExtra**: la práctica extra del PDA original se repartió en
  **10 partes proporcionales** (una por lección), en el mismo orden,
  sin recortar ni duplicar ningún reactivo.
- **numero**: recontado de forma secuencial por grado (1, 2, 3… hasta 140
  en 1°, 130 en 2°, 110 en 3°).
- **problematización**: marcada temporalmente como pendiente, para
  redactarse de cero por lección (ver siguiente sección).

El resultado: los 38 PDAs (antes 114 series del Paso 26) se convirtieron
en **380 series de 1 sola lección** (140 en 1°, 130 en 2°, 110 en 3°). Los
114 archivos del Paso 26 se borraron y los 3 `index.json` se regeneraron
con la nueva lista. Igual que en el Paso 26, el motor de la app
(`vistaPDA`, `panelSubtema_`, `panelActividad_`, `panelResultado_`,
`caminoPDAs_`) no necesitó **ningún cambio de código**: ya deriva pasos y
lecciones de `pda.subtemas.length` desde el Paso 14, y `panelResultado_`
ya distinguía desde el Paso 15 entre "resultado de este tema" (1 subtema)
y "suma de los N subtemas" (varios) para mostrar el texto correcto según
el caso.

### 2. 380 problematizaciones nuevas, una por lección

Igual que en el Paso 26, la problematización de cada lección es contenido
nuevo — la del PDA completo ya no corresponde a una sola lección
específica. Se generaron 380 problematizaciones cortas (`contexto` +
`pregunta`) con **6 agentes en paralelo** (2 por grado, cada uno con la
mitad de las lecciones de ese grado — 380 problematizaciones ligeras no
caben con calidad y variedad en un solo agente por grado como en el Paso
26, así que se subdividió un nivel más sin llegar a 1 agente por lección).
Cada agente recibió, por cada lección, su título, su explicación teórica
y su número jerárquico ("N.M"), para calibrar la pregunta exactamente al
contenido de ESA lección — ni antes ni después — y calibrar la dificultad
según qué tan avanzada es dentro del tema (una lección "N.9" plantea algo
más integrador que una "N.2"). Se pidió variedad fuerte de escenarios y
personajes tanto dentro de cada archivo como entre las lecciones
hermanas de un mismo tema original. Los 6 archivos de salida se
verificaron como JSON válido con el número exacto de claves esperado
antes de fusionarse; la fusión final (380 problematizaciones, 0
duplicados, 0 faltantes) se hizo con un script que solo toca el campo
`problematizacion` de cada archivo.

### 3. Validación y prueba de punta a punta

Validación programática sobre los 380 archivos reales: `jsonschema.
Draft7Validator`: **0 errores**. Revisión estructural genérica (índices
de `opcion_multiple`/`relacionar_columnas`, booleano en
`verdadero_falso`, hueco `___` en `llenar_frase`): **0 errores**. Se
comparó, PDA por PDA, la suma de reactivos de las 10 series contra el
conteo original de las 10 lecciones antes de dividir (subtemas + práctica
extra): **0 discrepancias** — ningún reactivo se perdió ni se duplicó al
independizar cada lección. Se verificó también que `numero` quedara
secuencial sin huecos en cada grado (1…140, 1…130, 1…110), que los 380
ids fueran únicos, y que los 3 `index.json` coincidieran exactamente con
los archivos en disco.

**Prueba de punta a punta** (Playwright + build local de Tailwind):
conteo exacto de nodos por trimestre en los 3 grados (1° · Trimestre 1:
**30** nodos, Trimestre 2: **60**, Trimestre 3: **50**; 2° · Trimestre 1:
**30**; 3° · Trimestre 1: **10** — siempre 10× el número de PDAs
originales de ese trimestre); Ejercítate sin cambios (**40** nodos); un
recorrido completo de una lección individual (`1S-B1-PDA01-05`, una de
las 6 lecciones "de expansión" del Paso 25 con 10 reactivos en 2 rondas)
confirmando que ahora toma **"Paso 1 de 6"** (problematización + subtema +
2 rondas de actividad + mini-resultado + resultado global — las lecciones
1-4, con 5 reactivos en 1 sola ronda, toman "Paso 1 de 5") y que llega
correctamente a su propio resultado global; y verificación de que, al
terminar, el botón "Generar mi constancia" produce una constancia propia
que muestra el título de esa lección específica ("… 1.5") y su propio
folio. (Nota de depuración: la primera versión de la prueba automatizada
detectaba un falso positivo — el botón "Ver resultado global →" del
mini-resultado de una lección única comparte la subcadena "resultado
global" con el panel de resultado real, y un clic "forzado" en
coordenadas puede caer sobre el encabezado fijo si el botón real queda
tapado; ambos problemas eran del script de prueba, no de la aplicación,
y se corrigieron antes de dar por buena la suite.) Ejercítate (40 temas,
sin dividir) se verificó sin cambios — 0 errores en toda la suite.
