/**
 * MATE-NEM · Bootstrap de la aplicación
 * ----------------------------------------------------
 * Define las vistas de la SPA y las conecta con el router. Cada vista es
 * una función que recibe los parámetros de la ruta y devuelve HTML (string)
 * o un HTMLElement ya armado (cuando necesita mantener estado interno,
 * como la vista de un PDA con sus fases).
 *
 * Diseño: cada FASE del recorrido de un PDA tiene su propio color de acento
 * (problematización=ámbar, tema=azul, repaso=violeta, reto=rosa,
 * resultado=oro, práctica extra=verde azulado), para que de un vistazo se
 * note en qué parte del recorrido estás — además de la marca general
 * índigo/violeta y el acento por grado (distinto en cada uno de los 3
 * grados) en las pantallas de navegación. Los íconos son SVG dibujados a
 * mano (sin librería externa) y las animaciones vienen de las clases
 * `mn-*` de styles.css.
 */

import { ruta, rutaPorDefecto, navegar, init } from './router.js';
import { guardarSesion, obtenerSesion, haySesion } from './session.js';
import { cargarListaPDAs, cargarPDAporId } from './pda-loader.js';
import { calcularResultado, combinarResultados, esRespuestaCorrecta } from './gamification.js';
import { enviarRegistroPDA, reintentarPendientes } from './webhook.js';
import { generarConstancia, descargarComoPDF } from './constancia.js';

// ============================================================
// Sistema visual: acento por grado (navegación) + acento por fase (PDA)
// ----------------------------------------------------------------
// Paleta "Aula NEM": original y deliberadamente distinta a la de Duolingo
// (evita su verde #58CC02, azul #1CB0F6, dorado #FFC800 y rojo #FF4B4B) —
// tonos más profundos y terrosos (azul pizarrón, cobre, verde bosque,
// grafito, vino, ocre) para una sensación "de estudio", no infantil.
// `pista` es el color (hex, para el trazo SVG del camino) de cada grado.
// ============================================================
// Cada tema agrega, además de sus clases originales, una versión PASTEL
// (pastelFondo/pastelBorde) del mismo tono para las tarjetas flotantes y
// paneles estilo "Profe Ponchito", y un `presionado` (hex) para el borde
// inferior del botón 3D pulsable — sigue siendo la paleta "Aula NEM", solo
// más suave, nunca los colores propios de Duolingo.
const TEMAS_GRADO = {
  '1°': {
    grad: 'from-blue-700 to-blue-900',
    texto: 'text-blue-700',
    chip: 'bg-blue-50 text-blue-800',
    borde: 'border-blue-200',
    pista: '#1d4ed8',
    pastelFondo: 'bg-blue-100',
    pastelBorde: 'border-blue-200',
    presionado: '#172554'
  },
  '2°': {
    grad: 'from-orange-700 to-amber-900',
    texto: 'text-orange-700',
    chip: 'bg-orange-50 text-orange-800',
    borde: 'border-orange-200',
    pista: '#c2410c',
    pastelFondo: 'bg-orange-100',
    pastelBorde: 'border-orange-200',
    presionado: '#431407'
  },
  '3°': {
    grad: 'from-emerald-800 to-teal-900',
    texto: 'text-emerald-800',
    chip: 'bg-emerald-50 text-emerald-800',
    borde: 'border-emerald-200',
    pista: '#065f46',
    pastelFondo: 'bg-emerald-100',
    pastelBorde: 'border-emerald-200',
    presionado: '#022c22'
  }
};

/** Acento propio de "Ejercítate" (grafito) — deliberadamente distinto del
 * de los 3 grados y del de `practicaExtra`, para que se distinga como su
 * propia sección, sin pertenecer a la ruta curricular de ningún grado. */
const COLOR_EJERCITATE = {
  grad: 'from-slate-600 to-slate-800',
  texto: 'text-slate-700',
  chip: 'bg-slate-100 text-slate-700',
  borde: 'border-slate-300',
  pista: '#334155',
  pastelFondo: 'bg-slate-100',
  pastelBorde: 'border-slate-300',
  presionado: '#020617'
};

/** "ejercitate" es un pseudo-grado: reutiliza todo el flujo de vistaPDA/
 * vistaListaPDA (camino, gamificación, webhook, constancia) sin pertenecer
 * a la ruta curricular de ningún grado — solo cambia el acento de color. */
function temaGrado_(grado) {
  if (grado === 'ejercitate') return COLOR_EJERCITATE;
  return TEMAS_GRADO[grado] || TEMAS_GRADO['1°'];
}

/** Texto legible para el encabezado/breadcrumb de un (pseudo-)grado. */
function etiquetaGrado_(grado) {
  return grado === 'ejercitate' ? 'Ejercítate' : `${grado} de secundaria`;
}

// Un color distinto por FASE del recorrido de un PDA: además de vistoso,
// ayuda a ubicarse ("¿en qué parte voy?") de un vistazo, sin leer texto.
const PASO_COLOR = {
  problematizacion: {
    chip: 'bg-amber-50 text-amber-800', texto: 'text-amber-700',
    grad: 'from-amber-700 to-orange-800', suave: 'bg-amber-50 border-amber-200',
    accent: 'accent-amber-700', hover: 'hover:bg-amber-50',
    inputBorder: 'border-amber-600', inputFocus: 'focus:border-orange-700 bg-amber-50/50',
    ring: 'focus:ring-amber-600',
    pastelFondo: 'bg-amber-100', pastelBorde: 'border-amber-200', presionado: '#431407'
  },
  subtema: {
    chip: 'bg-blue-50 text-blue-800', texto: 'text-blue-700',
    grad: 'from-blue-700 to-indigo-900', suave: 'bg-blue-50 border-blue-200',
    accent: 'accent-blue-700', hover: 'hover:bg-blue-50',
    inputBorder: 'border-blue-600', inputFocus: 'focus:border-indigo-800 bg-blue-50/50',
    ring: 'focus:ring-blue-600',
    pastelFondo: 'bg-blue-100', pastelBorde: 'border-blue-200', presionado: '#1e1b4b'
  },
  check: {
    chip: 'bg-violet-50 text-violet-800', texto: 'text-violet-700',
    grad: 'from-violet-700 to-purple-900', suave: 'bg-violet-50 border-violet-200',
    accent: 'accent-violet-700', hover: 'hover:bg-violet-50',
    inputBorder: 'border-violet-600', inputFocus: 'focus:border-purple-800 bg-violet-50/50',
    ring: 'focus:ring-violet-600',
    pastelFondo: 'bg-violet-100', pastelBorde: 'border-violet-200', presionado: '#3b0764'
  },
  reto: {
    chip: 'bg-rose-50 text-rose-800', texto: 'text-rose-700',
    grad: 'from-rose-800 to-red-900', suave: 'bg-rose-50 border-rose-200',
    accent: 'accent-rose-800', hover: 'hover:bg-rose-50',
    inputBorder: 'border-rose-700', inputFocus: 'focus:border-red-900 bg-rose-50/50',
    ring: 'focus:ring-rose-700',
    pastelFondo: 'bg-rose-100', pastelBorde: 'border-rose-200', presionado: '#450a0a'
  },
  resultado: {
    chip: 'bg-amber-50 text-amber-800', texto: 'text-amber-700',
    grad: 'from-amber-600 to-yellow-800', suave: 'bg-amber-50 border-amber-200',
    accent: 'accent-amber-600', hover: 'hover:bg-amber-50',
    inputBorder: 'border-amber-600', inputFocus: 'focus:border-yellow-700 bg-amber-50/50',
    ring: 'focus:ring-amber-600',
    pastelFondo: 'bg-amber-100', pastelBorde: 'border-amber-200', presionado: '#422006'
  },
  practicaExtra: {
    chip: 'bg-teal-50 text-teal-800', texto: 'text-teal-700',
    grad: 'from-teal-700 to-emerald-900', suave: 'bg-teal-50 border-teal-200',
    accent: 'accent-teal-700', hover: 'hover:bg-teal-50',
    inputBorder: 'border-teal-600', inputFocus: 'focus:border-emerald-800 bg-teal-50/50',
    ring: 'focus:ring-teal-600',
    pastelFondo: 'bg-teal-100', pastelBorde: 'border-teal-200', presionado: '#022c22'
  }
};

/** Etiqueta de dificultad de cada uno de los 4 subtemas "núcleo" de un PDA
 * (de menor a mayor), mostrada junto a su número para que se note la
 * progresión. Los subtemas de repaso opcionales que se agregan después
 * (índice 4 en adelante) usan su propia etiqueta "Repaso" — ver nivelChip_. */
const NIVEL_DIFICULTAD = ['Introductorio', 'Intermedio', 'Avanzado', 'Síntesis'];

/** Paleta de colores del confeti de la celebración final (toma un color de
 * cada tono de la paleta "Aula NEM", como un pequeño resumen de todas las
 * fases del recorrido). */
const CONFETI_COLORES = ['#1d4ed8', '#c2410c', '#065f46', '#b45309', '#9f1239', '#475569'];

/** Devuelve una copia de `arr` con sus elementos en orden aleatorio (Fisher–Yates). */
function barajar_(arr) {
  const copia = arr.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Devuelve una copia de un reactivo con sus opciones (opcion_multiple) o
 * columnaB (relacionar_columnas) en orden aleatorio, ajustando los índices
 * de respuesta correcta para que sigan apuntando al lugar correcto. Los
 * demás tipos (verdadero_falso, llenar_frase) no tienen opciones que mezclar. */
function variarOpciones_(reactivo) {
  if (reactivo.tipo === 'opcion_multiple') {
    const indices = barajar_(reactivo.opciones.map((_, i) => i));
    return {
      ...reactivo,
      opciones: indices.map((i) => reactivo.opciones[i]),
      respuestaCorrecta: indices.indexOf(reactivo.respuestaCorrecta)
    };
  }
  if (reactivo.tipo === 'relacionar_columnas') {
    const indices = barajar_(reactivo.columnaB.map((_, i) => i));
    return {
      ...reactivo,
      columnaB: indices.map((i) => reactivo.columnaB[i]),
      parejasCorrectas: reactivo.parejasCorrectas.map((idxOriginal) => indices.indexOf(idxOriginal))
    };
  }
  return reactivo;
}

/** Prepara los 5 reactivos de la mini-actividad de un subtema para un
 * intento: orden de las preguntas y de sus opciones mezclado, así rehacer
 * un subtema no se ve idéntico la segunda vez. */
function variarReactivos_(reactivos) {
  return barajar_(reactivos).map(variarOpciones_);
}

/** Íconos SVG originales (trazo, sin relleno) para cada tipo de paso.
 *
 * El bloque "set Profe Ponchito" (10 íconos nuevos, agregados en el
 * rediseño visual) sigue exactamente el mismo estilo de trazo simple que
 * los originales de arriba — sin ilustraciones detalladas de manos/caras,
 * que romperían la consistencia — referenciando los grupos del set de 9
 * íconos de la imagen que compartió el docente (pulgar+estrella,
 * pensativo+cubo de duda, aplausos, mano-ok+triángulo, foco+π,
 * Σ+π, reloj+X, compás, Σ+fracción) más el de "Graduación/Birrete"
 * (perfil/progreso) y "Soporte" (sobre) pedidos aparte. */
function icono_(nombre, clase = 'w-5 h-5') {
  const iconos = {
    foco: `<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.9 1 .9 1.7V16h5.4v-.5c0-.7.4-1.3.9-1.7A6 6 0 0 0 12 3Z"/>`,
    libro: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 0 4 23V5.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 1 2.5 2V5.5Z"/>`,
    lupa: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/>`,
    trofeo: `<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5a3 3 0 0 0 3 5"/><path d="M16 5h3a3 3 0 0 1-3 5"/><path d="M12 13v3"/><path d="M9 20h6"/><path d="M9.5 16.2h5l.7 2.8h-6.4l.7-2.8Z"/>`,
    medalla: `<circle cx="12" cy="14.5" r="6"/><path d="m9 8.5-3-5"/><path d="m15 8.5 3-5"/><path d="M12 12.2 13.2 14.6 15.8 15l-1.9 1.8.4 2.6-2.3-1.2-2.3 1.2.4-2.6L8.2 15l2.6-.4 1.2-2.4Z"/>`,
    chispas: `<path d="M12 3v4M12 17v4M4.5 12h4M15.5 12h4"/><path d="M7 7l2 2M17 7l-2 2M7 17l2-2M17 17l-2-2"/><circle cx="12" cy="12" r="2.2"/>`,
    salida: `<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h12"/>`,
    flecha: `<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`,
    descarga: `<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19.5h16"/>`,
    operaciones: `<path d="M6 4v6M3 7h6"/><path d="M4 17h6M4 20h6"/><path d="M15 8h6"/><circle cx="18" cy="4.5" r="0.7" fill="currentColor"/><circle cx="18" cy="11.5" r="0.7" fill="currentColor"/><path d="M15 15l6 6M21 15l-6 6"/>`,
    // --- Set "Profe Ponchito" (Paso 20) ---
    logroEstrella: `<path d="M12 3.5 14.1 8l4.9.6-3.6 3.4.9 4.9L12 14.4l-4.3 2.5.9-4.9-3.6-3.4L9.9 8 12 3.5Z"/><path d="M18.5 15.5v3.4M16.8 17.2h3.4"/>`,
    pensativo: `<path d="M12 3.2a7 7 0 0 0-7 7c0 2.5 1.2 4.4 3 5.7V19l2.7-1.4c.4.1.9.1 1.3.1a7 7 0 0 0 0-14Z"/><path d="M9.7 9.4a2.2 2.2 0 0 1 4.2-1c.5.9.1 1.6-.6 2.2-.6.4-1 .9-1 1.6"/><circle cx="12.3" cy="14.9" r="0.15" fill="currentColor"/>`,
    aplausos: `<path d="M6 15c0-3 2.3-5 3.8-5.3"/><path d="M18 15c0-3-2.3-5-3.8-5.3"/><path d="M6 15a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4"/><path d="M10 6.3 11 8M14 6.3 13 8M12 5.2v2.2"/>`,
    manoOk: `<path d="M4 13.2 7 16l6.5-7.4"/><path d="M14.5 19 18 13h-7l3.5 6Z"/>`,
    ideaPi: `<path d="M11.4 3.6a5 5 0 0 0-3 9c.4.3.6.8.6 1.3v.7h4.8v-.7c0-.5.2-1 .6-1.3a5 5 0 0 0-3-9Z"/><path d="M9.4 17.3h4M10.2 19.8c1 .5 2 .7 2.8.7v.7"/><path d="M17 6.2h4.3M17.7 6.2v4.4M20.2 6.2v4.4"/>`,
    operacionesAlgebra: `<path d="M16.3 4.8h-5.1l2.7 3.6-2.7 3.6h5.1"/><path d="M18.3 6h3.4M19 6v4M20.7 6v4"/>`,
    tiempoX: `<circle cx="10" cy="12" r="7"/><path d="M10 8v4l2.6 1.8"/><path d="m16.8 15.2 4.6 4.6m0-4.6-4.6 4.6"/>`,
    compas: `<circle cx="12" cy="4.3" r="1.1"/><path d="M12 6.4v1.8"/><path d="M12 8.2 7 20.6h2.3l1-2.7h3.4l1 2.7H17L12 8.2Z"/><path d="M9.6 15.4h4.8"/>`,
    operacionesFraccion: `<path d="M8.4 4.8H3.3L6 8.4l-2.7 3.6h5.1"/><path d="M12 6.6h8"/><path d="M15 4v2"/><path d="M15 9.2c1 0 1.9.5 1.9 1.4S16 12 15 12"/>`,
    graduacion: `<path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6.5 11.5V16c0 1.5 2.6 3 5.5 3s5.5-1.5 5.5-3v-4.5"/><path d="M21 9v5.6"/>`,
    soporte: `<rect x="3" y="6" width="18" height="13" rx="3.5"/><path d="m4.2 7.6 7.8 6 7.8-6"/>`,
    calculadora: `<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8 6.5h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h.01M16 18h.01"/>`,
    perfil: `<circle cx="12" cy="8.2" r="3.6"/><path d="M5 20c.8-3.8 3.7-6 7-6s6.2 2.2 7 6"/>`
  };
  return `<svg viewBox="0 0 24 24" class="${clase}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconos[nombre] || ''}</svg>`;
}

/** Genera `style="animation-delay:...ms"` para escalonar animaciones de listas. */
function retraso_(indice, pasoMs = 70) {
  return `style="animation-delay:${indice * pasoMs}ms"`;
}

// ============================================================
// Camino serpenteante estilo Duolingo (sin bloqueo de nodos: el docente
// puede pedir cualquier PDA/nivel en cualquier momento, así que TODOS los
// nodos se ven y son clickeables siempre — nunca hay candados).
// ============================================================

/** Calcula las posiciones (x,y) de `n` nodos en un sendero vertical
 * ondulante (onda seno, periodo de 4 filas: centro → derecha → centro →
 * izquierda → …), en el sistema de coordenadas `anchoBase`×(altoFila×n). */
function posicionesCamino_(n, anchoBase, altoFila, amplitud) {
  const centroX = anchoBase / 2;
  const puntos = [];
  for (let i = 0; i < n; i++) {
    const angulo = (i * Math.PI) / 2;
    puntos.push({
      x: centroX + Math.sin(angulo) * amplitud,
      y: altoFila * i + altoFila / 2
    });
  }
  return puntos;
}

/** Traza una curva SVG suave (tipo Catmull-Rom → Bézier cúbica) que pasa
 * por cada uno de los puntos dados, para dibujar el sendero como una línea
 * fluida en vez de un zigzag de segmentos rectos. */
function trazoSuave_(puntos) {
  if (puntos.length < 2) return '';
  let d = `M ${puntos[0].x},${puntos[0].y}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] || puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Renderiza la lista de PDAs de un grado como un camino serpenteante:
 * un trazo curvo (SVG) de fondo con un nodo circular numerado por PDA
 * (ninguno bloqueado) y su título como etiqueta. Las coordenadas de los
 * nodos se expresan en % (no en px) para que el camino sea responsive,
 * mientras que la proporción del contenedor se fija con `aspect-ratio`
 * para que esos % siempre coincidan con el trazo del SVG. */
/** Lista de "Lecciones" (subtemas) de un módulo (PDA), mostrada dentro de
 * su tarjeta flotante al desplegar el nodo — Paso 20: puramente visual,
 * `cargarListaPDAs` ya trae el PDA completo (con sus subtemas) para cada
 * nodo, así que no se necesita ninguna petición ni dato nuevo. */
function leccionesModulo_(pda, tema) {
  const subtemas = Array.isArray(pda.subtemas) ? pda.subtemas : [];
  if (subtemas.length === 0) return `<li class="text-xs text-slate-400">Sin lecciones registradas todavía.</li>`;
  return subtemas.map((st, si) => `
    <li class="flex items-center gap-2 text-sm text-slate-700">
      <span class="w-5 h-5 rounded-full ${tema.chip} flex items-center justify-center text-[11px] font-bold shrink-0">${si + 1}</span>
      <span class="mn-clamp-2">${escapeHTML_(st.titulo || `Lección ${si + 1}`)}</span>
    </li>
  `).join('');
}

/** Nodo del camino: círculo numerado + etiqueta, ahora dentro de
 * <details>/<summary> (Paso 20) — al presionarlo (o enfocarlo con teclado)
 * despliega una tarjeta flotante redondeada con sus "Lecciones" (subtemas)
 * y un botón real "Empezar" que navega al PDA; ya no navega directo al
 * tocar el círculo, para dar tiempo a previsualizar el contenido, como en
 * Duolingo. */
function nodoModulo_(pda, i, grado, tema, xPct, yPct) {
  return `
    <details class="mn-nodo group absolute" style="left:${xPct}%; top:${yPct}%; transform:translate(-50%,-50%);">
      <summary class="mn-tarjeta flex flex-col items-center" style="animation-delay:${i * 90}ms">
        <span class="mn-nodo-circulo mn-boton-3d w-16 h-16 rounded-full bg-gradient-to-br ${tema.grad} shadow-lg flex items-center justify-center font-heading font-extrabold text-white text-xl border-4 border-white group-open:scale-105 transition-transform"
              style="--mn-3d-borde:${tema.presionado || 'rgba(0,0,0,.3)'}">
          ${pda.numero ?? (i + 1)}
        </span>
        <span class="mt-2 w-28 text-center text-xs font-semibold ${tema.texto} bg-white/95 backdrop-blur px-2 py-1 rounded-full shadow-sm border ${tema.borde} mn-clamp-2">
          ${escapeHTML_(pda.titulo)}
        </span>
      </summary>
      <div class="mn-flotar-in absolute z-20 top-full mt-1 left-1/2 -translate-x-1/2 w-64 ${tema.pastelFondo || 'bg-white'} rounded-3xl shadow-2xl border ${tema.pastelBorde || tema.borde} p-4 text-left">
        <p class="font-heading font-bold text-slate-800 text-sm mb-0.5">${numeroChip_(pda.numero)}${escapeHTML_(pda.titulo)}</p>
        <p class="text-[11px] uppercase tracking-wide text-slate-400 font-bold mb-2">Lecciones de este módulo</p>
        <ul class="space-y-1.5 mb-3 max-h-40 overflow-y-auto pr-1">${leccionesModulo_(pda, tema)}</ul>
        <a href="#/pda/${encodeURIComponent(grado)}/${encodeURIComponent(pda.id)}"
           class="mn-boton-3d block text-center bg-gradient-to-r ${tema.grad} text-white font-heading font-bold text-sm px-4 py-2.5 rounded-xl"
           style="--mn-3d-borde:${tema.presionado || 'rgba(0,0,0,.3)'}">
          Empezar →
        </a>
      </div>
    </details>
  `;
}

function caminoPDAs_(pdas, grado, tema) {
  const ANCHO = 320;
  const ALTO_FILA = 136;
  const AMPLITUD = 92;
  const puntos = posicionesCamino_(pdas.length, ANCHO, ALTO_FILA, AMPLITUD);
  const alturaTotal = ALTO_FILA * pdas.length;
  const trazo = trazoSuave_(puntos);

  const nodos = pdas.map((pda, i) => {
    const xPct = (puntos[i].x / ANCHO) * 100;
    const yPct = (puntos[i].y / alturaTotal) * 100;
    return nodoModulo_(pda, i, grado, tema, xPct, yPct);
  }).join('');

  return `
    <p class="text-center text-xs text-slate-400 mb-3">Toca cualquier módulo para ver sus lecciones — nada está bloqueado.</p>
    <div class="relative mx-auto" style="max-width:${ANCHO}px; aspect-ratio:${ANCHO}/${alturaTotal};">
      <div class="mn-blob mn-blob-animado ${tema.pastelFondo || 'bg-slate-100'}" aria-hidden="true" style="width:150px;height:150px;left:-40px;top:10%;"></div>
      <div class="mn-blob ${tema.pastelFondo || 'bg-slate-100'}" aria-hidden="true" style="width:120px;height:120px;right:-30px;bottom:5%;opacity:0.35;"></div>
      <svg viewBox="0 0 ${ANCHO} ${alturaTotal}" class="absolute inset-0 w-full h-full" aria-hidden="true">
        <path d="${trazo}" fill="none" stroke="${tema.pista}" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 16" opacity="0.35"/>
      </svg>
      ${nodos}
    </div>
  `;
}

// ============================================================
// Vista: Registro (Nombre, Grado, Grupo)
// ============================================================
function vistaRegistro() {
  if (haySesion()) {
    navegar('/grados');
    return '';
  }

  // El formulario aún no existe en el DOM cuando este string se genera;
  // se engancha el listener en el siguiente ciclo de eventos.
  setTimeout(() => {
    const formulario = document.getElementById('form-registro');
    formulario?.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const datos = new FormData(formulario);
      const nombre = (datos.get('nombre') || '').toString().trim();
      const grado = (datos.get('grado') || '').toString();
      const grupo = (datos.get('grupo') || '').toString().trim();

      if (!nombre || !grado || !grupo) return;

      guardarSesion({ nombre, grado, grupo });
      navegar('/grados');
    });
  }, 0);

  return `
    <div class="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div class="mn-blob mn-blob-animado bg-blue-100" aria-hidden="true" style="width:220px;height:220px;left:-60px;top:-40px;"></div>
      <div class="mn-blob mn-blob-animado bg-amber-100" aria-hidden="true" style="width:180px;height:180px;right:-50px;bottom:-30px;animation-delay:2s;"></div>
      <div class="relative w-full max-w-md">
        <div class="text-center mb-6">
          <img src="assets/img/profe-ponchito-avatar.png" alt="Profe Ponchito, el mascota de MATE-NEM, saludando con el pulgar arriba"
               class="mn-tarjeta w-28 h-28 mx-auto rounded-[28px] object-cover shadow-lg shadow-indigo-300/40 border-4 border-white">
          <h1 class="font-heading text-4xl font-extrabold mt-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            MATE-NEM
          </h1>
          <p class="text-slate-500 mt-1">Matemáticas · Nueva Escuela Mexicana</p>
          <p class="text-slate-400 text-sm mt-0.5">¡Hola! Soy el Profe Ponchito y te voy a acompañar 👋</p>
        </div>
        <form id="form-registro" class="mn-panel bg-white/90 backdrop-blur rounded-3xl shadow-xl shadow-indigo-200/40 border border-white p-6 sm:p-7 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Nombre completo</label>
            <input name="nombre" type="text" required autocomplete="name"
                   class="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                   placeholder="Ej. María López Hernández">
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Grado</label>
            <select name="grado" required
                    class="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition bg-white">
              <option value="" disabled selected>Selecciona tu grado</option>
              <option value="1°">1° de secundaria</option>
              <option value="2°">2° de secundaria</option>
              <option value="3°">3° de secundaria</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Grupo</label>
            <input name="grupo" type="text" required
                   class="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                   placeholder="Ej. A">
          </div>
          <button type="submit"
                  class="mn-elevar mn-boton-3d w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white font-heading font-bold text-lg py-3 rounded-xl shadow-lg shadow-indigo-300/50 transition"
                  style="--mn-3d-borde:#4c0519">
            Comenzar →
          </button>
        </form>
      </div>
    </div>
  `;
}

// ============================================================
// Vista: Selección de grado
// ============================================================
function vistaSeleccionGrado() {
  const sesion = obtenerSesion();
  if (!sesion) { navegar('/'); return ''; }

  const grados = ['1°', '2°', '3°'];
  const trimestres = ['1', '2', '3'];
  const ej = COLOR_EJERCITATE;

  return `
    ${encabezado_(sesion)}
    <div class="max-w-3xl mx-auto px-4 py-8">
      ${imagenMascota_('grados-hero.png', 'Profe Ponchito frente a un pizarrón de álgebra, señalando la lista de módulos', 'max-h-40 mx-auto mb-5')}
      <h2 class="font-heading text-2xl font-bold text-slate-800 mb-1 text-center">Hola, ${escapeHTML_(sesion.nombre.split(' ')[0])} 👋</h2>
      <p class="text-slate-500 mb-6 text-center">Elige tu grado y trimestre para ver los PDAs disponibles, o practica cualquier tema de matemáticas de secundaria sin importar tu grado.</p>
      ${grados.map((grado) => {
        const tema = temaGrado_(grado);
        return `
        <div class="mb-8">
          <h3 class="font-heading text-lg font-bold ${tema.texto} mb-3">${grado} de secundaria</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            ${trimestres.map((trimestre, i) => `
              <a href="#/pda-lista/${encodeURIComponent(grado)}/${trimestre}" ${retraso_(i, 90)}
                 class="mn-tarjeta mn-elevar group block rounded-3xl p-[2px] bg-gradient-to-br ${tema.grad} shadow-lg">
                <div class="bg-white rounded-[calc(1.5rem-2px)] px-6 py-6 text-center h-full">
                  <span class="font-heading text-2xl font-extrabold bg-gradient-to-br ${tema.grad} bg-clip-text text-transparent">${grado}</span>
                  <p class="text-slate-500 mt-1 font-medium text-sm">Trimestre ${trimestre}</p>
                  <p class="mt-2 inline-flex items-center gap-1 text-xs font-semibold ${tema.texto}">
                    Ver PDAs ${icono_('flecha', 'w-3.5 h-3.5 group-hover:translate-x-1 transition-transform')}
                  </p>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
        `;
      }).join('')}
      <a href="#/pda-lista/ejercitate" class="mn-tarjeta mn-elevar group block rounded-3xl p-[2px] bg-gradient-to-br ${ej.grad} shadow-lg max-w-sm mx-auto">
        <div class="bg-white rounded-[calc(1.5rem-2px)] px-6 py-8 text-center h-full flex flex-col items-center justify-center">
          <span class="inline-flex items-center justify-center w-12 h-12 rounded-2xl ${ej.chip} mb-2">${icono_('operaciones', 'w-6 h-6')}</span>
          <span class="font-heading text-xl font-extrabold bg-gradient-to-br ${ej.grad} bg-clip-text text-transparent">Ejercítate</span>
          <p class="text-slate-500 mt-1 font-medium text-sm">40 temas, todos los grados</p>
          <p class="mt-3 inline-flex items-center gap-1 text-sm font-semibold ${ej.texto}">
            Practicar ${icono_('flecha', 'w-4 h-4 group-hover:translate-x-1 transition-transform')}
          </p>
        </div>
      </a>
    </div>
  `;
}

// ============================================================
// Vista: Lista de PDAs de un grado
// ============================================================
/** Las 4 categorías de "Ejercítate" (pseudo-grado), en el orden fijo del
 * usuario — cada una se dibuja como su propio mini-camino serpenteante,
 * con un encabezado, en vez de un solo camino de 36 nodos sin distinción. */
const CATEGORIAS_EJERCITATE = [
  { clave: 'basico', etiqueta: 'Temas básicos · 1°' },
  { clave: 'intermedio', etiqueta: 'Temas intermedios · 2°' },
  { clave: 'avanzado', etiqueta: 'Temas avanzados · 3°' },
  { clave: 'estadistica', etiqueta: 'Estadística y probabilidad' }
];

function caminoEjercitateAgrupado_(pdas, grado, tema) {
  return CATEGORIAS_EJERCITATE.map((cat) => {
    const items = pdas.filter((p) => p.categoria === cat.clave);
    if (items.length === 0) return '';
    return `
      <div class="mb-10">
        <h3 class="font-heading text-lg font-bold ${tema.texto} text-center mb-1">${escapeHTML_(cat.etiqueta)}</h3>
        ${caminoPDAs_(items, grado, tema)}
      </div>
    `;
  }).join('');
}

async function vistaListaPDA({ grado, trimestre }) {
  const sesion = obtenerSesion();
  if (!sesion) { navegar('/'); return ''; }

  const tema = temaGrado_(grado);
  const esEjercitate = grado === 'ejercitate';
  let pdas = [];
  let error = null;
  try {
    pdas = await cargarListaPDAs(grado);
    if (!esEjercitate && trimestre) {
      pdas = pdas.filter((p) => p.trimestre === trimestre);
    }
  } catch (e) {
    error = e.message;
  }

  const etiquetaTrimestre = !esEjercitate && trimestre ? ` · Trimestre ${trimestre}` : '';

  return `
    ${encabezado_(sesion)}
    <div class="max-w-2xl mx-auto px-4 py-8">
      <a href="#/grados" class="inline-flex items-center gap-1 text-sm font-semibold ${tema.texto} hover:underline">
        ${icono_('flecha', 'w-4 h-4 rotate-180')} ${esEjercitate ? 'Volver' : 'Cambiar de grado o trimestre'}
      </a>
      ${esEjercitate
        ? imagenMascota_('ejercitate-hero.png', 'Profe Ponchito frente a un pizarrón: Curso Online de Matemáticas', 'max-h-36 mx-auto mt-3 mb-1')
        : imagenMascota_('camino-crecimiento.png', 'Profe Ponchito plantando un árbol junto a una pirámide: tu camino va creciendo', 'max-h-28 mx-auto mt-3 mb-1')}
      <h2 class="font-heading text-2xl font-bold text-slate-800 mt-3 mb-1 text-center">${esEjercitate ? 'Ejercítate' : `PDAs de ${etiquetaGrado_(grado)}${etiquetaTrimestre}`}</h2>
      ${esEjercitate ? `<p class="text-slate-500 mb-6 text-center">40 temas de matemáticas de secundaria, disponibles para cualquier grado.</p>` : `<div class="mb-6"></div>`}
      ${error ? `<p class="text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">No se pudieron cargar los PDAs: ${escapeHTML_(error)}</p>` : ''}
      ${(!error && pdas.length === 0) ? `<p class="text-slate-500">Todavía no hay PDAs cargados para ${esEjercitate ? 'esta categoría' : 'este trimestre'}. Vuelve pronto.</p>` : ''}
      ${!error && pdas.length > 0 ? (esEjercitate ? caminoEjercitateAgrupado_(pdas, grado, tema) : caminoPDAs_(pdas, grado, tema)) : ''}
    </div>
  `;
}

// ============================================================
// Vista: un PDA completo
// (problematización → subtemas [con checks formativos] → reto → resultado)
// ============================================================
async function vistaPDA({ grado, id }) {
  const sesion = obtenerSesion();
  if (!sesion) { navegar('/'); return ''; }

  const tema = temaGrado_(grado);

  let pda;
  try {
    pda = await cargarPDAporId(grado, id);
  } catch (e) {
    const contenedorError = document.createElement('div');
    contenedorError.innerHTML = `
      ${encabezado_(sesion)}
      <div class="max-w-2xl mx-auto px-4 py-8">
        <p class="text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">No se pudo cargar el PDA: ${escapeHTML_(e.message)}</p>
        <a href="#/grados" class="${tema.texto} font-semibold hover:underline">← Volver</a>
      </div>
    `;
    return contenedorError;
  }

  // Aplana el PDA en una secuencia lineal de pasos: problematización, y por
  // cada subtema (de menor a mayor dificultad) su teoría, una o más RONDAS
  // de actividad calificada (5 reactivos cada una — Paso 16: un subtema con
  // 10 reactivos se presenta en 2 rondas consecutivas, ej. "paso 3" y
  // "paso 4" del recorrido, en vez de una sola pantalla de 10) y su
  // mini-resultado propio (suma de TODAS sus rondas); al final, el
  // resultado GLOBAL del PDA (suma de todos los mini-resultados).
  const pasos = [{ tipo: 'problematizacion' }];
  pda.subtemas.forEach((subtema, si) => {
    pasos.push({ tipo: 'subtema', subtemaIndex: si });
    const totalPartes = Math.ceil(subtema.reactivos.length / 5);
    for (let parte = 0; parte < totalPartes; parte++) {
      pasos.push({ tipo: 'actividad', subtemaIndex: si, parte, totalPartes });
    }
    pasos.push({ tipo: 'miniResultado', subtemaIndex: si });
  });
  pasos.push({ tipo: 'resultado' });

  const raiz = document.createElement('div');
  const estado = {
    pasoIndex: 0,
    resultadosSubtemas: new Array(pda.subtemas.length).fill(null),
    resultado: null, // resultado global, se calcula al terminar el último subtema
    codigoVerificacion: null,
    reactivosVariados: {}, // { [subtemaIndex]: TODOS los reactivos de ese subtema, ya barajados para este intento }
    respuestasParciales: {} // { [subtemaIndex]: respuestas acumuladas de las rondas ya enviadas, mientras faltan más rondas }
  };

  /** Reactivos (orden + opciones mezclados) de TODAS las rondas de un
   * subtema para el intento actual — se calculan una sola vez por intento
   * (barajando el arreglo completo, 5 o 10 reactivos) y se reutilizan en
   * repintados posteriores y entre rondas del mismo subtema. */
  function reactivosDeActividad_(subtemaIndex) {
    if (!estado.reactivosVariados[subtemaIndex]) {
      estado.reactivosVariados[subtemaIndex] = variarReactivos_(pda.subtemas[subtemaIndex].reactivos);
    }
    return estado.reactivosVariados[subtemaIndex];
  }

  /** Los 5 reactivos visibles en una ronda concreta (parte 0 = los primeros
   * 5 del arreglo ya barajado, parte 1 = los siguientes 5, etc.). */
  function reactivosDeParte_(subtemaIndex, parte) {
    return reactivosDeActividad_(subtemaIndex).slice(parte * 5, parte * 5 + 5);
  }

  function repintar() {
    const paso = pasos[estado.pasoIndex];
    const esResultado = paso.tipo === 'resultado';
    raiz.innerHTML = `
      ${encabezado_(sesion)}
      <div class="max-w-2xl mx-auto px-4 py-8">
        <a href="${grado === 'ejercitate' ? '#/pda-lista/ejercitate' : `#/pda-lista/${encodeURIComponent(grado)}/${encodeURIComponent(pda.trimestre || '1')}`}" class="inline-flex items-center gap-1 text-sm font-semibold ${tema.texto} hover:underline">
          ${icono_('flecha', 'w-4 h-4 rotate-180')} ${escapeHTML_(etiquetaGrado_(grado))}
        </a>
        ${caminoPasos_(estado.pasoIndex, pasos.length, tema)}
        <div class="mn-panel bg-white rounded-3xl shadow-lg shadow-slate-200/60 border border-slate-100 p-6 sm:p-7 mt-4">
          ${paso.tipo === 'problematizacion' ? panelProblematizacion_(pda, PASO_COLOR.problematizacion) : ''}
          ${paso.tipo === 'subtema' ? panelSubtema_(pda.subtemas[paso.subtemaIndex], paso.subtemaIndex, pda.subtemas.length, PASO_COLOR.subtema) : ''}
          ${paso.tipo === 'actividad' ? panelActividad_(pda.subtemas[paso.subtemaIndex], paso.subtemaIndex, pda.subtemas.length, reactivosDeParte_(paso.subtemaIndex, paso.parte), PASO_COLOR.reto, paso.parte, paso.totalPartes) : ''}
          ${paso.tipo === 'miniResultado' ? panelMiniResultado_(pda.subtemas[paso.subtemaIndex], estado.resultadosSubtemas[paso.subtemaIndex], paso.subtemaIndex === pda.subtemas.length - 1, PASO_COLOR.reto) : ''}
          ${esResultado ? panelResultado_(pda, estado, PASO_COLOR.resultado) : ''}
        </div>
        ${esResultado && Array.isArray(pda.practicaExtra) && pda.practicaExtra.length > 0 ? panelPracticaExtra_(pda, PASO_COLOR.practicaExtra) : ''}
        ${esResultado && estado.codigoVerificacion ? panelCelebracion_(pda, estado.resultado, grado, PASO_COLOR.resultado) : ''}
      </div>
    `;
    conectarEventos_();
  }

  function conectarEventos_() {
    // Avanza al siguiente paso (problematización → subtema, subtema → actividad,
    // y mini-resultado → siguiente subtema). Caso especial: al salir del
    // mini-resultado del ÚLTIMO subtema, primero calcula el resultado GLOBAL
    // del PDA (suma de los 4) y envía ese registro final antes de avanzar.
    raiz.querySelector('[data-accion="continuar"]')?.addEventListener('click', async () => {
      const paso = pasos[estado.pasoIndex];
      const esUltimoSubtema = paso.subtemaIndex === pda.subtemas.length - 1;

      if (paso.tipo === 'miniResultado' && esUltimoSubtema) {
        estado.resultado = combinarResultados(estado.resultadosSubtemas);
        estado.pasoIndex++; // avanza al paso 'resultado' (global)
        repintar();

        try {
          const respuestaServidor = await enviarRegistroPDA({
            nombre: sesion.nombre,
            grado: sesion.grado,
            grupo: sesion.grupo,
            pdaId: pda.id,
            pdaNombre: pda.titulo,
            eje: pda.eje,
            tipo: 'pda_completo',
            puntaje: estado.resultado.puntaje,
            estrellas: estado.resultado.estrellas
          });
          estado.codigoVerificacion = respuestaServidor.codigoVerificacion;
        } catch {
          // Sin conexión al webhook (aún no desplegado o sin internet): se genera
          // un folio provisional para no bloquear la constancia; el registro
          // queda guardado en localStorage por webhook.js para reintentar después.
          estado.codigoVerificacion = 'PENDIENTE-' + Date.now();
        }
        repintar();
        return;
      }

      estado.pasoIndex++;
      repintar();
    });

    // Envía las 5 respuestas de la ronda actual de un subtema. Si quedan más
    // rondas (Paso 16: subtema con 10 reactivos = 2 rondas), solo guarda esas
    // 5 respuestas y avanza a la siguiente ronda, sin calificar todavía. En
    // la ÚLTIMA ronda: junta las respuestas de todas las rondas del subtema,
    // califica el subtema completo de una vez, avanza al panel de
    // "mini-resultado" y lo registra en Sheets en segundo plano (no bloquea
    // la navegación).
    raiz.querySelector('[data-accion="enviar-actividad"]')?.addEventListener('click', () => {
      const paso = pasos[estado.pasoIndex];
      const subtema = pda.subtemas[paso.subtemaIndex];
      const reactivosRonda = reactivosDeParte_(paso.subtemaIndex, paso.parte);
      const respuestasRonda = reactivosRonda.map((reactivo, i) => leerRespuesta_(raiz, `act-${paso.subtemaIndex}-${i}`, reactivo.tipo));

      if (respuestasRonda.some((r) => r === null)) {
        alert('Responde los 5 reactivos antes de continuar.');
        return;
      }

      const previas = estado.respuestasParciales[paso.subtemaIndex] || [];
      const acumuladas = previas.concat(respuestasRonda);

      if (paso.parte < paso.totalPartes - 1) {
        estado.respuestasParciales[paso.subtemaIndex] = acumuladas;
        estado.pasoIndex++; // avanza a la siguiente ronda de este mismo subtema
        repintar();
        return;
      }

      delete estado.respuestasParciales[paso.subtemaIndex];
      const reactivosCompletos = reactivosDeActividad_(paso.subtemaIndex); // todas las rondas juntas, ya barajadas
      const resultado = calcularResultado(
        { reactivos: reactivosCompletos, puntosPorReactivo: subtema.puntosPorReactivo, estrellasMax: subtema.estrellasMax },
        acumuladas
      );
      estado.resultadosSubtemas[paso.subtemaIndex] = resultado;
      estado.pasoIndex++; // avanza a 'miniResultado'
      repintar();
      // Panel flotante de retroalimentación (Paso 20): resume el resultado
      // de ESTE subtema (no cambia la calificación, solo la muestra al vuelo).
      mostrarFeedbackFlotante_(
        resultado.correctas === resultado.total,
        `${resultado.correctas} de ${resultado.total} correctas en «${subtema.titulo}».`
      );

      enviarRegistroPDA({
        nombre: sesion.nombre,
        grado: sesion.grado,
        grupo: sesion.grupo,
        pdaId: pda.id,
        pdaNombre: pda.titulo,
        eje: pda.eje,
        tipo: 'subtema',
        subtema: subtema.numero,
        puntaje: resultado.puntaje,
        estrellas: resultado.estrellas
      }).catch(() => {}); // si falla, webhook.js ya lo dejó pendiente en localStorage
    });

    raiz.querySelector('[data-accion="ver-constancia"]')?.addEventListener('click', () => {
      const contenedorConstancia = raiz.querySelector('#contenedor-constancia');
      generarConstancia(contenedorConstancia, {
        nombre: sesion.nombre,
        grado: sesion.grado,
        grupo: sesion.grupo,
        pdaNombre: pda.titulo,
        eje: pda.eje,
        puntaje: estado.resultado.puntaje,
        puntajeMax: estado.resultado.puntajeMax,
        estrellas: estado.resultado.estrellas,
        estrellasMax: estado.resultado.estrellasMax,
        codigoVerificacion: estado.codigoVerificacion
      });
      raiz.querySelector('[data-accion="ver-constancia"]')?.classList.add('hidden');
      raiz.querySelector('[data-accion-contenedor="descargar-pdf"]')?.classList.remove('hidden');
    });

    raiz.querySelector('[data-accion="descargar-pdf"]')?.addEventListener('click', () => {
      descargarComoPDF('constancia', `constancia-${sesion.nombre.replace(/\s+/g, '_')}.pdf`);
    });

    // Práctica extra (opcional, no calificada): un botón "Verificar" por
    // reactivo, delegado porque hay varios con el mismo data-accion.
    raiz.querySelectorAll('[data-accion="verificar-practica"]').forEach((boton) => {
      boton.addEventListener('click', () => {
        const indice = Number(boton.dataset.indice);
        const pregunta = pda.practicaExtra[indice];
        const prefijo = `practica-${indice}`;
        const respuesta = leerRespuesta_(raiz, prefijo, pregunta.tipo);

        if (respuesta === null) {
          alert('Responde antes de verificar.');
          return;
        }

        const correcta = esRespuestaCorrecta(pregunta, respuesta);
        const feedback = raiz.querySelector(`[data-practica-feedback="${indice}"]`);
        feedback.classList.remove('hidden');
        feedback.innerHTML = `
          <div class="text-sm px-4 py-3 rounded-xl border ${correcta ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}">
            <span class="font-bold">${correcta ? '✓ ¡Correcto!' : '✗ No es correcto.'}</span> ${escapeHTML_(pregunta.retroalimentacion)}
          </div>
        `;
        boton.classList.add('hidden');
        mostrarFeedbackFlotante_(correcta, pregunta.retroalimentacion);
      });
    });
  }

  repintar();
  return raiz;
}

// ============================================================
// Paneles de cada paso (usados por vistaPDA)
// ============================================================
function overline_(texto, iconoNombre, color) {
  return `
    <p class="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide ${color.texto} font-bold mb-2 px-2.5 py-1 rounded-full ${color.chip}">
      ${icono_(iconoNombre, 'w-3.5 h-3.5')} ${texto}
    </p>
  `;
}

/** Insignia circular grande (Paso 21): un ícono distinto y bien visible al
 * inicio de cada pantalla del recorrido de un PDA (problematización, teoría,
 * actividad, mini-resultado, resultado, práctica extra), para que — al
 * avanzar o dar clic — el alumno vea cambiar el "emoji" de la pantalla y no
 * solo en la de registro. Reutiliza el mismo patrón visual del círculo del
 * panel flotante de retroalimentación (mostrarFeedbackFlotante_), pero con
 * los colores del propio PDA/tema en vez de verde/naranja fijos. */
function insigniaPaso_(iconoNombre, color, clase = 'mn-flotar-in') {
  return `
    <span class="${clase} inline-flex w-14 h-14 rounded-full ${color.pastelFondo || 'bg-slate-100'} ${color.texto} items-center justify-center mb-3 shadow-sm">
      ${icono_(iconoNombre, 'w-7 h-7')}
    </span>
  `;
}

/** Escena ilustrada real del "Profe Ponchito" (Paso 22 — a diferencia de
 * insigniaPaso_, que es un ícono SVG plano, este es un dibujo/foto real
 * del mascota que el profesor mandó para darle más vida visual a la
 * página, "donde tú gustes y sea visualmente creativo"). Vive en
 * `assets/img/mascota/` y se usa como acento decorativo — nunca sustituye
 * información, solo la acompaña — arriba del overline de cada pantalla
 * del recorrido y en vistas fuera del PDA (selección de grado, Ejercítate,
 * recursos, constancia). `clase` controla tamaño/alineación según el
 * contexto (banner ancho vs. ícono pequeño de acento). */
function imagenMascota_(archivo, alt, clase = 'max-h-28 mx-auto mb-4') {
  return `<img src="assets/img/mascota/${archivo}" alt="${escapeHTML_(alt)}" loading="lazy" draggable="false" class="${clase} rounded-2xl drop-shadow-sm select-none">`;
}

function botonPrimario_(texto, dataAccion, color) {
  return `
    <button data-accion="${dataAccion}"
            class="mn-elevar mn-boton-3d bg-gradient-to-r ${color.grad} text-white font-heading font-bold px-6 py-2.5 rounded-xl shadow-md transition"
            style="--mn-3d-borde:${color.presionado || 'rgba(0,0,0,.3)'}">
      ${texto}
    </button>
  `;
}

function botonSecundario_(texto, dataAccion) {
  return `
    <button data-accion="${dataAccion}"
            class="mn-elevar mn-boton-3d bg-white border-2 border-slate-300 text-slate-600 hover:bg-slate-50 font-heading font-bold px-5 py-2.5 rounded-xl transition"
            style="--mn-3d-borde:#cbd5e1">
      ${texto}
    </button>
  `;
}

/** Prefijo numerado ("Tema 3" / "3.2") mostrado antes de un título; vacío si no hay número. */
function numeroChip_(numero, etiqueta = 'Tema') {
  if (numero === undefined || numero === null) return '';
  return `<span class="inline-block">${etiqueta ? `${etiqueta} ${numero}.` : `${numero}`}</span> `;
}

function panelProblematizacion_(pda, color) {
  return `
    ${imagenMascota_('problematizacion-reto.png', 'Profe Ponchito pensando frente a un laberinto: ¿cómo resolvemos esto?')}
    ${insigniaPaso_('ideaPi', color)}
    ${overline_('Problematización', 'foco', color)}
    <h3 class="font-heading text-xl sm:text-2xl font-bold text-slate-800 mb-3">${numeroChip_(pda.numero)}${escapeHTML_(pda.titulo)}</h3>
    <p class="text-slate-700 leading-relaxed mb-4">${escapeHTML_(pda.problematizacion.contexto)}</p>
    <p class="text-slate-800 font-semibold mb-6 ${color.suave} border rounded-xl px-4 py-3">${escapeHTML_(pda.problematizacion.pregunta)}</p>
    ${botonPrimario_('Comenzar el tema →', 'continuar', color)}
  `;
}

/** Chip "Nivel N de 4 · <etiqueta>" que marca la dificultad creciente de los
 * 4 subtemas núcleo de un PDA. Si el PDA tiene subtemas de repaso extra
 * después de esos 4 (índice ≥ 4 — ver Paso 13), se muestran como
 * "Repaso N de R" en vez de continuar la escala de dificultad, ya que no
 * introducen contenido nuevo sino que repasan lo ya visto. Si el propio
 * subtema trae `nivelEtiqueta` (Paso 15: "tarjeta dividida" de un solo
 * subtema, donde el índice dentro del arreglo — siempre 0 — no revela su
 * posición real en el PDA de origen), esa etiqueta fija se usa tal cual en
 * vez de calcularla por índice/longitud. */
function nivelChip_(subtema, indice, total) {
  if (subtema && subtema.nivelEtiqueta) return subtema.nivelEtiqueta;
  if (indice < NIVEL_DIFICULTAD.length) {
    return `Nivel ${indice + 1} de ${Math.min(total, NIVEL_DIFICULTAD.length)} · ${NIVEL_DIFICULTAD[indice]}`;
  }
  const totalRepasos = total - NIVEL_DIFICULTAD.length;
  const indiceRepaso = indice - NIVEL_DIFICULTAD.length;
  return `Repaso ${indiceRepaso + 1} de ${totalRepasos}`;
}

function panelSubtema_(subtema, indice, total, color) {
  return `
    ${imagenMascota_('subtema-libro.png', 'Profe Ponchito sosteniendo un libro de Álgebra: ¡exploremos nuevos temas!')}
    ${insigniaPaso_('libro', color)}
    ${overline_(nivelChip_(subtema, indice, total), 'libro', color)}
    <h3 class="font-heading text-xl sm:text-2xl font-bold text-slate-800 mb-3">${numeroChip_(subtema.numero, '')}${escapeHTML_(subtema.titulo)}</h3>
    <p class="text-slate-700 leading-relaxed mb-3">${escapeHTML_(subtema.explicacion)}</p>
    ${subtema.formula ? `<p class="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-mono text-slate-800 mb-3">${escapeHTML_(subtema.formula)}</p>` : ''}
    <div class="space-y-1.5 mb-6">
      ${subtema.ejemplos.map((ejemplo) => `<p class="text-slate-600 text-sm ${color.suave.split(' ')[0]} rounded-lg px-3 py-2"><strong class="${color.texto}">Ejemplo:</strong> ${escapeHTML_(ejemplo)}</p>`).join('')}
    </div>
    ${botonPrimario_('Empezar las 5 preguntas →', 'continuar', color)}
  `;
}

/** Mini-actividad calificada de un subtema: una ronda de 5 reactivos (ya
 * barajados para este intento). Un subtema con más de 5 reactivos en total
 * se recorre en varias rondas consecutivas (Paso 16: `parte`/`totalPartes`,
 * ej. "Ronda 1 de 2" y "Ronda 2 de 2" — misma pantalla, mismo estilo, solo
 * el siguiente bloque de 5); todas las rondas de un subtema se califican
 * juntas al enviar la última (ver conectarEventos_). */
function panelActividad_(subtema, indice, total, reactivos, color, parte = 0, totalPartes = 1) {
  const etiquetaRonda = totalPartes > 1 ? ` · Ronda ${parte + 1} de ${totalPartes}` : '';
  return `
    ${imagenMascota_('actividad-quiz.png', 'Profe Ponchito señalando una pantalla de quiz interactivo con estrellas')}
    ${insigniaPaso_('compas', color)}
    ${overline_(nivelChip_(subtema, indice, total) + etiquetaRonda, 'trofeo', color)}
    <h3 class="font-heading text-xl sm:text-2xl font-bold text-slate-800 mb-4">${numeroChip_(subtema.numero, '')}${escapeHTML_(subtema.titulo)}</h3>
    <div class="space-y-6">
      ${reactivos.map((reactivo, i) => `
        <div class="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
          <p class="text-slate-400 text-xs font-bold mb-1">REACTIVO ${i + 1} DE ${reactivos.length}</p>
          ${renderizarPregunta_(reactivo, `act-${indice}-${i}`, color)}
        </div>
      `).join('')}
    </div>
    <div class="mt-6">
      ${botonPrimario_(parte < totalPartes - 1 ? 'Siguiente ronda →' : 'Enviar respuestas', 'enviar-actividad', color)}
    </div>
  `;
}

/** Mini-resultado de un subtema recién concluido: sus propios puntos y
 * estrellas, independiente de los otros 3 subtemas del PDA. */
function panelMiniResultado_(subtema, resultado, esUltimo, color) {
  const perfecto = resultado.estrellas >= resultado.estrellasMax;
  return `
    ${imagenMascota_('miniresultado-tupuedes.png', 'Profe Ponchito felicitando con confeti: ¡tú puedes!')}
    ${insigniaPaso_('aplausos', color)}
    ${overline_('¡Actividad concluida!', 'aplausos', color)}
    <h3 class="font-heading text-xl sm:text-2xl font-bold text-slate-800 mb-3">${numeroChip_(subtema.numero, '')}${escapeHTML_(subtema.titulo)}</h3>
    <p class="font-heading text-2xl font-bold text-slate-800 mb-2">${resultado.correctas} / ${resultado.total} correctas</p>
    <div class="relative inline-block mb-1">
      ${perfecto ? `<div class="mn-resplandor absolute inset-0 -m-3 rounded-full bg-amber-400/40 blur-xl"></div>` : ''}
      <p class="relative text-amber-600 text-xl">
        ${Array.from({ length: resultado.estrellas }).map((_, i) => `<span class="mn-estrella" ${retraso_(i, 120)}>★</span>`).join('')}${'☆'.repeat(Math.max(0, resultado.estrellasMax - resultado.estrellas))}
      </p>
    </div>
    ${perfecto ? `<p class="inline-flex items-center gap-1 text-xs font-bold ${color.texto} ${color.pastelFondo || 'bg-amber-50'} px-2.5 py-1 rounded-full mb-2">${icono_('graduacion', 'w-4 h-4')} ¡Medalla de subtema perfecto!</p><br>` : ''}
    <p class="text-slate-600 font-semibold mb-6">${resultado.puntaje} de ${resultado.puntajeMax} pts</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
      ${resultado.detalle.map((d) => `
        <div class="text-sm px-4 py-3 rounded-xl border ${d.esCorrecta ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}">
          <span class="font-bold">${d.esCorrecta ? '✓' : '✗'}</span> ${escapeHTML_(d.resumen)}
          ${d.retroalimentacion ? `<br><span class="text-xs opacity-80">${escapeHTML_(d.retroalimentacion)}</span>` : ''}
        </div>
      `).join('')}
    </div>
    ${botonPrimario_(esUltimo ? 'Ver resultado global →' : 'Siguiente subtema →', 'continuar', color)}
  `;
}

function panelResultado_(pda, estado, color) {
  const r = estado.resultado;
  const perfecto = r.estrellas >= r.estrellasMax;

  return `
    ${imagenMascota_('resultado-metalograda.png', 'Profe Ponchito celebrando con confeti: ¡meta lograda!')}
    ${insigniaPaso_('trofeo', color)}
    ${overline_('Resultado global del PDA', 'trofeo', color)}
    <p class="font-heading text-2xl sm:text-3xl font-bold text-slate-800 mb-2">${r.correctas} / ${r.total} correctas</p>
    <div class="relative inline-block mb-1">
      ${perfecto ? `<div class="mn-resplandor absolute inset-0 -m-3 rounded-full bg-amber-400/40 blur-xl"></div>` : ''}
      <p class="relative text-amber-600 text-2xl">
        ${Array.from({ length: r.estrellas }).map((_, i) => `<span class="mn-estrella" ${retraso_(i, 120)}>★</span>`).join('')}${'☆'.repeat(Math.max(0, r.estrellasMax - r.estrellas))}
      </p>
    </div>
    ${perfecto ? `<p class="inline-flex items-center gap-1 text-xs font-bold ${color.texto} ${color.pastelFondo || 'bg-amber-50'} px-2.5 py-1 rounded-full mb-2">${icono_('graduacion', 'w-4 h-4')} ¡Medalla de PDA perfecto!</p><br>` : ''}
    <p class="text-slate-600 font-semibold mb-4">${r.puntaje} de ${r.puntajeMax} pts</p>
    <p class="text-slate-400 text-xs mb-4">${pda.subtemas.length === 1 ? `Resultado de este tema (${r.total} preguntas).` : `Suma de los ${pda.subtemas.length} subtemas (${Math.round(r.total / pda.subtemas.length)} preguntas cada uno).`}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
      ${r.detalle.map((d) => `
        <div class="text-sm px-4 py-3 rounded-xl border ${d.esCorrecta ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}">
          <span class="font-bold">${d.esCorrecta ? '✓' : '✗'}</span> ${escapeHTML_(d.resumen)}
          ${d.retroalimentacion ? `<br><span class="text-xs opacity-80">${escapeHTML_(d.retroalimentacion)}</span>` : ''}
        </div>
      `).join('')}
    </div>

    ${!estado.codigoVerificacion ? '<p class="text-slate-400 text-sm">Guardando tu avance…</p>' : `
      ${imagenMascota_('constancia-certificado.png', 'Profe Ponchito mostrando un Certificado de Matemáticas A+', 'max-h-24 mx-auto mb-3')}
      ${botonPrimario_('Generar mi constancia', 'ver-constancia', color)}
      <div id="contenedor-constancia" class="mt-6"></div>
      <div data-accion-contenedor="descargar-pdf" class="hidden mt-4">
        <button data-accion="descargar-pdf" class="mn-elevar inline-flex items-center gap-2 bg-gradient-to-r ${color.grad} text-white font-heading font-bold px-6 py-3 rounded-xl transition shadow-lg">
          ${icono_('descarga', 'w-5 h-5')} Descargar constancia en PDF
        </button>
      </div>
    `}
  `;
}

function panelPracticaExtra_(pda, color) {
  return `
    <div class="mn-panel mt-4 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-6 sm:p-7">
      ${imagenMascota_('practicaextra-numeros.png', 'Profe Ponchito haciendo malabares con números y símbolos matemáticos', 'max-h-24 mx-auto mb-4')}
      ${insigniaPaso_('chispas', color)}
      ${overline_('Práctica extra', 'chispas', color)}
      <h3 class="font-heading text-xl font-bold text-slate-800 mb-1">¿Quieres seguir practicando?</h3>
      <p class="text-slate-600 text-sm mb-5">Estos reactivos son opcionales y no cambian tu calificación ni tus estrellas: son solo para reforzar lo que aprendiste.</p>
      <div class="space-y-5">
        ${pda.practicaExtra.map((pregunta, i) => `
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <p class="text-slate-400 text-xs font-bold mb-2">PRÁCTICA ${i + 1} DE ${pda.practicaExtra.length}</p>
            ${renderizarPregunta_(pregunta, `practica-${i}`, color)}
            <div data-practica-feedback="${i}" class="mt-3 hidden"></div>
            <button data-accion="verificar-practica" data-indice="${i}"
                    class="mt-4 mn-elevar bg-white border-2 border-teal-500 text-teal-700 hover:bg-teal-50 font-heading font-bold px-5 py-2 rounded-xl transition">
              Verificar
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/** Explosión de "confeti" decorativa (solo CSS, sin imágenes externas ni
 * dependencias): una fila de piezas de colores que caen con distinto
 * retraso y posición horizontal, en bucle. Posiciones/retrasos son
 * pseudo-aleatorios pero deterministas (mismo resultado en cada render). */
function confeti_(cantidad = 16) {
  return Array.from({ length: cantidad }).map((_, i) => {
    const color = CONFETI_COLORES[i % CONFETI_COLORES.length];
    const izquierda = (i * 61.8) % 96; // distribución dispersa (proporción áurea) en 0-96%
    const retraso = (i * 110) % 1800;
    const redondo = i % 2 === 0;
    return `<span class="mn-confeti" style="left:${izquierda}%; background:${color}; animation-delay:${retraso}ms; ${redondo ? 'border-radius:50%;' : ''}"></span>`;
  }).join('');
}

/** Pantalla de celebración estilo "nivel superado" de videojuego: cierra la
 * experiencia de un PDA/tema completo (después de la constancia y, si el
 * PDA la tiene, de la práctica extra) con una nota festiva. Puramente
 * decorativa — no repite el detalle del puntaje, que ya se mostró en el
 * resultado global; solo confirma el cierre e invita a elegir otro tema. */
function panelCelebracion_(pda, resultado, grado, color) {
  const perfecto = resultado.estrellas >= resultado.estrellasMax;
  return `
    <div class="relative overflow-hidden mn-panel mt-4 bg-gradient-to-br ${color.grad} rounded-3xl p-8 sm:p-10 text-center shadow-xl">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">${confeti_()}</div>
      <div class="relative">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-3">
          ${icono_('trofeo', 'w-11 h-11 text-white mn-trofeo')}
        </div>
        <p class="font-heading text-2xl sm:text-3xl font-extrabold text-white mb-1">${perfecto ? '¡Puntaje perfecto!' : '¡Nivel superado!'}</p>
        <p class="text-white/90 font-medium mb-6">Completaste «${escapeHTML_(pda.titulo)}» con ${resultado.puntaje} de ${resultado.puntajeMax} pts.</p>
        <a href="${grado === 'ejercitate' ? '#/pda-lista/ejercitate' : `#/pda-lista/${encodeURIComponent(grado)}/${encodeURIComponent(pda.trimestre || '1')}`}" class="mn-elevar inline-flex items-center gap-2 bg-white/95 hover:bg-white text-slate-800 font-heading font-bold px-6 py-3 rounded-xl transition shadow-lg">
          Elegir otro tema ${icono_('flecha', 'w-4 h-4')}
        </a>
      </div>
    </div>
  `;
}

// ============================================================
// Renderizador genérico de preguntas (4 tipos) + lectura del DOM
// ============================================================

/** Devuelve el HTML de una pregunta según su tipo, con el acento de color de
 * su fase. `prefijo` identifica sus inputs en el DOM. `valorPrevio` (opcional)
 * pre-llena la respuesta si el alumno ya la había capturado antes (por
 * ejemplo, al regresar a una página anterior del reto). */
function renderizarPregunta_(pregunta, prefijo, color, valorPrevio) {
  const c = color || PASO_COLOR.check;
  switch (pregunta.tipo) {
    case 'opcion_multiple':
      return `
        <p class="text-slate-800 font-medium mb-2">${escapeHTML_(pregunta.pregunta)}</p>
        <div class="space-y-1.5">
          ${pregunta.opciones.map((opcion, j) => `
            <label class="flex items-center gap-2 text-slate-700 cursor-pointer rounded-lg px-2 py-1.5 ${c.hover} transition">
              <input type="radio" name="preg-${prefijo}" value="${j}" data-preg="${prefijo}" class="${c.accent} w-4 h-4" ${Number(valorPrevio) === j ? 'checked' : ''}>
              ${escapeHTML_(opcion)}
            </label>
          `).join('')}
        </div>
      `;

    case 'verdadero_falso':
      return `
        <p class="text-slate-800 font-medium mb-2">${escapeHTML_(pregunta.enunciado)}</p>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 text-slate-700 cursor-pointer rounded-lg px-3 py-1.5 ${c.hover} transition">
            <input type="radio" name="preg-${prefijo}" value="true" data-preg="${prefijo}" class="${c.accent} w-4 h-4" ${valorPrevio === true ? 'checked' : ''}> Verdadero
          </label>
          <label class="flex items-center gap-2 text-slate-700 cursor-pointer rounded-lg px-3 py-1.5 ${c.hover} transition">
            <input type="radio" name="preg-${prefijo}" value="false" data-preg="${prefijo}" class="${c.accent} w-4 h-4" ${valorPrevio === false ? 'checked' : ''}> Falso
          </label>
        </div>
      `;

    case 'llenar_frase': {
      const [antes, despues] = pregunta.frase.split('___');
      const valor = valorPrevio != null ? escapeHTML_(String(valorPrevio)) : '';
      return `
        <p class="text-slate-800 font-medium mb-2">
          ${escapeHTML_(antes || '')}<input type="text" data-preg="${prefijo}" value="${valor}"
            class="inline-block border-b-2 ${c.inputBorder} focus:outline-none ${c.inputFocus} px-1 mx-1 w-24 text-center rounded-t">${escapeHTML_(despues || '')}
        </p>
      `;
    }

    case 'relacionar_columnas':
      return `
        <p class="text-slate-800 font-medium mb-3">${escapeHTML_(pregunta.instruccion || 'Relaciona cada elemento con su pareja correcta.')}</p>
        <div class="space-y-2">
          ${pregunta.columnaA.map((item, idx) => `
            <div class="flex items-center gap-3">
              <span class="text-slate-700 flex-1">${escapeHTML_(item)}</span>
              <select data-preg="${prefijo}" class="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 ${c.ring}">
                <option value="">Selecciona…</option>
                ${pregunta.columnaB.map((opcion, j) => `<option value="${j}" ${Array.isArray(valorPrevio) && valorPrevio[idx] === j ? 'selected' : ''}>${escapeHTML_(opcion)}</option>`).join('')}
              </select>
            </div>
          `).join('')}
        </div>
      `;

    case 'algoritmo_columnas':
      return renderizarAlgoritmoColumnas_(pregunta, prefijo, c, valorPrevio);

    default:
      return '';
  }
}

/** Nombre legible de la operación de un `algoritmo_columnas`, para el texto de apoyo. */
function nombreOperacion_(operacion) {
  if (operacion === 'resta') return 'resta';
  if (operacion === 'multiplicacion') return 'multiplicación';
  return 'suma';
}

/** Renderiza un algoritmo vertical (suma/resta/multiplicación) con casillas para
 * completar los dígitos que faltan, al estilo de una hoja de ejercicios de
 * cuaderno (Paso 18): cada fila de `pregunta.filas` se alinea a la derecha,
 * los dígitos ya dados se muestran como texto y los ocultos (`pregunta.ocultos`,
 * mismo índice de fila) como una casilla `<input>` de un solo carácter. La
 * fila con `esResultado:true` lleva una línea horizontal arriba, como en el
 * algoritmo escrito a mano. `valorPrevio` (si existe) es un arreglo paralelo a
 * `filas`, cada elemento un arreglo disperso indexado por columna con lo que
 * el alumno ya había escrito ahí. */
function renderizarAlgoritmoColumnas_(pregunta, prefijo, c, valorPrevio) {
  const filas = pregunta.filas;
  const ocultos = pregunta.ocultos || filas.map(() => []);
  const anchoTotal = Math.max(...filas.map((f) => f.valor.length));

  const filasHTML = filas.map((fila, fi) => {
    const ocultosFila = new Set(ocultos[fi] || []);
    const relleno = anchoTotal - fila.valor.length;
    const celdasRelleno = `<span class="inline-block w-7 h-9" aria-hidden="true"></span>`.repeat(relleno);
    const celdas = fila.valor.split('').map((ch, ci) => {
      if (ch === '.') {
        return `<span class="inline-flex items-end justify-center w-3 h-9 text-lg font-bold text-slate-700 pb-1.5">.</span>`;
      }
      if (ocultosFila.has(ci)) {
        const previo = (Array.isArray(valorPrevio) && valorPrevio[fi] && valorPrevio[fi][ci] != null)
          ? escapeHTML_(String(valorPrevio[fi][ci])) : '';
        return `<input type="text" inputmode="numeric" maxlength="1" data-preg="${prefijo}" data-fila="${fi}" data-col="${ci}"
          value="${previo}"
          class="w-7 h-9 text-center text-lg font-bold border-2 ${c.inputBorder} focus:outline-none ${c.inputFocus} rounded-md mx-0.5">`;
      }
      return `<span class="inline-flex items-center justify-center w-7 h-9 text-lg font-bold text-slate-800">${escapeHTML_(ch)}</span>`;
    }).join('');
    const signo = fila.signo
      ? `<span class="inline-flex items-center justify-center w-6 h-9 text-lg font-bold ${c.texto}">${escapeHTML_(fila.signo)}</span>`
      : `<span class="inline-block w-6 h-9" aria-hidden="true"></span>`;
    const claseResultado = fila.esResultado ? 'border-t-2 border-slate-700 pt-1.5 mt-1' : '';
    return `<div class="flex items-center justify-end ${claseResultado}" data-fila-idx="${fi}">${signo}${celdasRelleno}${celdas}</div>`;
  }).join('');

  return `
    <div class="mb-2">
      ${pregunta.operacion ? `<p class="text-slate-500 text-sm mb-2">Completa las casillas para que la ${nombreOperacion_(pregunta.operacion)} sea correcta.</p>` : ''}
      <div class="inline-flex flex-col items-end bg-white/70 rounded-xl px-3 py-2 border ${c.suave}" data-algoritmo-filas>
        ${filasHTML}
      </div>
    </div>
  `;
}

/** Lee del DOM la respuesta capturada para una pregunta, según su tipo. Devuelve null si falta algo. */
function leerRespuesta_(raiz, prefijo, tipo) {
  if (tipo === 'opcion_multiple' || tipo === 'verdadero_falso') {
    const marcado = raiz.querySelector(`input[data-preg="${prefijo}"]:checked`);
    if (!marcado) return null;
    return tipo === 'verdadero_falso' ? marcado.value === 'true' : Number(marcado.value);
  }

  if (tipo === 'llenar_frase') {
    const input = raiz.querySelector(`input[data-preg="${prefijo}"]`);
    const valor = input ? input.value.trim() : '';
    return valor === '' ? null : valor;
  }

  if (tipo === 'relacionar_columnas') {
    const selects = raiz.querySelectorAll(`select[data-preg="${prefijo}"]`);
    const valores = Array.from(selects).map((s) => (s.value === '' ? null : Number(s.value)));
    return valores.some((v) => v === null) ? null : valores;
  }

  if (tipo === 'algoritmo_columnas') {
    const inputs = raiz.querySelectorAll(`input[data-preg="${prefijo}"]`);
    if (inputs.length === 0) return null;
    const respuesta = [];
    let completo = true;
    inputs.forEach((input) => {
      const fi = Number(input.dataset.fila);
      const ci = Number(input.dataset.col);
      const valor = input.value.trim();
      if (valor === '') completo = false;
      if (!respuesta[fi]) respuesta[fi] = [];
      respuesta[fi][ci] = valor;
    });
    return completo ? respuesta : null;
  }

  return null;
}

/** Indicador de avance "en serpiente": una fila de puntos que ondulan
 * suavemente arriba/abajo (eco compacto del camino de PDAs) mientras se
 * baja de actividad en actividad dentro de un PDA — completados llenos,
 * el actual más grande y resaltado, los que faltan solo con contorno. */
function caminoPasos_(pasoIndex, totalPasos, tema) {
  const puntos = Array.from({ length: totalPasos }, (_, i) => {
    const completado = i < pasoIndex;
    const actual = i === pasoIndex;
    const offset = i % 4 === 1 ? -5 : i % 4 === 3 ? 5 : 0;
    const clase = actual
      ? `w-4 h-4 border-2 border-white shadow-md bg-gradient-to-br ${tema.grad}`
      : completado
        ? `w-2.5 h-2.5 bg-gradient-to-br ${tema.grad} opacity-45`
        : `w-2.5 h-2.5 bg-white border-2 border-slate-300`;
    return `<span class="rounded-full shrink-0 transition-all duration-300 ${clase}" style="transform:translateY(${offset}px)"></span>`;
  }).join('');

  const porcentaje = Math.round(((pasoIndex + 1) / totalPasos) * 100);
  return `
    <div class="mt-3">
      <div class="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-medium">
        <span class="inline-flex items-center gap-1.5">
          <img src="assets/img/mascota/camino-crecimiento.png" alt="" aria-hidden="true" loading="lazy" class="w-5 h-5 rounded-full object-cover">
          Tu camino
        </span>
        <span>Paso ${pasoIndex + 1} de ${totalPasos}</span>
      </div>
      <div class="mn-progreso-pill mb-2"><span style="width:${porcentaje}%; background:${tema.pista};"></span></div>
      <div class="flex items-center gap-2 flex-wrap">${puntos}</div>
    </div>
  `;
}

// ============================================================
// Vista: Recursos (Paso 20 — nueva, no toca datos existentes; Paso 24 — se
// quitó la tarjeta/canal de "Soporte" hacia el correo del docente)
// ============================================================
function vistaRecursos() {
  const sesion = obtenerSesion();
  if (!sesion) { navegar('/'); return ''; }

  setTimeout(() => {
    document.querySelector('[data-accion="abrir-calculadora"]')?.addEventListener('click', abrirModalCalculadora_);
  }, 0);

  return `
    ${encabezado_(sesion)}
    <div class="relative max-w-3xl mx-auto px-4 py-8 overflow-hidden">
      <div class="mn-blob bg-teal-100" aria-hidden="true" style="width:200px;height:200px;left:-60px;top:0;"></div>
      <a href="#/grados" class="relative inline-flex items-center gap-1 text-sm font-semibold ${COLOR_EJERCITATE.texto} hover:underline">
        ${icono_('flecha', 'w-4 h-4 rotate-180')} Volver
      </a>
      <h2 class="relative font-heading text-2xl font-bold text-slate-800 mt-3 mb-1">Recursos</h2>
      <p class="relative text-slate-500 mb-6">Herramientas de apoyo para tus actividades.</p>
      <div class="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button data-accion="abrir-calculadora" class="mn-tarjeta mn-elevar mn-boton-3d text-left bg-blue-100 border border-blue-200 rounded-3xl p-5" style="--mn-3d-borde:#172554">
          <span class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/70 text-blue-800 mb-2">${icono_('calculadora', 'w-6 h-6')}</span>
          <p class="font-heading font-bold text-slate-800">Calculadora</p>
          <p class="text-slate-600 text-sm mb-2">Para tus operaciones rápidas.</p>
          ${imagenMascota_('recursos-herramientas.png', 'Profe Ponchito sosteniendo una regla y un compás', 'max-h-16 ml-auto mb-0')}
        </button>
        <div ${retraso_(1, 90)} class="mn-tarjeta bg-amber-100 border border-amber-200 rounded-3xl p-5">
          <span class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/70 text-amber-800 mb-2">${icono_('descarga', 'w-6 h-6')}</span>
          <p class="font-heading font-bold text-slate-800">Materiales descargables</p>
          <p class="text-slate-600 text-sm">Próximamente: guías y hojas de trabajo para imprimir.</p>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// Capa flotante global (Paso 20): panel de retroalimentación, botón y
// modal de soporte, y modal de la calculadora. Se agregan UNA sola vez al
// <body> (ver capaGlobal_, llamada desde DOMContentLoaded) — no dependen
// de la ruta actual ni se destruyen al navegar, así flotan sobre
// cualquier pantalla, como en Duolingo.
// ============================================================
let temporizadorFeedback_ = null;

/** Muestra (o reemplaza) el panel flotante curvo de retroalimentación al pie
 * de la pantalla: verde pastel + ícono de logro si `correcta` es true,
 * naranja pastel + "Profe Ponchito pensativo" si es false — se usa tanto en
 * la práctica extra (por reactivo) como al terminar la actividad calificada
 * de un subtema (por ronda), sin cambiar la lógica ni los datos de
 * calificación, solo agregando esta capa visual. Se oculta sola a los
 * pocos segundos, o antes si se toca "Entendido". */
function mostrarFeedbackFlotante_(correcta, mensaje) {
  const contenedor = document.getElementById('mn-feedback-flotante');
  if (!contenedor) return;
  clearTimeout(temporizadorFeedback_);

  const paleta = correcta
    ? { fondo: 'bg-emerald-100', borde: 'border-emerald-300', texto: 'text-emerald-800', boton: 'bg-emerald-600 hover:bg-emerald-700', presionado: '#022c22', icono: 'logroEstrella', titulo: '¡Muy bien!' }
    : { fondo: 'bg-orange-100', borde: 'border-orange-300', texto: 'text-orange-900', boton: 'bg-orange-600 hover:bg-orange-700', presionado: '#431407', icono: 'pensativo', titulo: 'Vamos de nuevo' };

  contenedor.innerHTML = `
    <div class="mn-panel-flotante ${paleta.fondo} border-t-4 ${paleta.borde} px-4 sm:px-6 py-4">
      <div class="max-w-2xl mx-auto flex items-center gap-3">
        <span class="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center ${paleta.texto} shrink-0 ${correcta ? '' : 'mn-pensar'}">
          ${icono_(paleta.icono, 'w-7 h-7')}
        </span>
        <div class="flex-1 min-w-0">
          <p class="font-heading font-extrabold ${paleta.texto}">${paleta.titulo}</p>
          <p class="text-sm ${paleta.texto} opacity-90 mn-clamp-2">${escapeHTML_(mensaje || '')}</p>
        </div>
        <button data-accion="cerrar-feedback" class="mn-boton-3d shrink-0 ${paleta.boton} text-white font-heading font-bold text-sm px-4 py-2 rounded-xl" style="--mn-3d-borde:${paleta.presionado}">
          Entendido
        </button>
      </div>
    </div>
  `;
  contenedor.classList.remove('hidden');
  contenedor.querySelector('[data-accion="cerrar-feedback"]')?.addEventListener('click', ocultarFeedbackFlotante_);
  temporizadorFeedback_ = setTimeout(ocultarFeedbackFlotante_, 5000);
}

function ocultarFeedbackFlotante_() {
  const contenedor = document.getElementById('mn-feedback-flotante');
  if (contenedor) { contenedor.classList.add('hidden'); contenedor.innerHTML = ''; }
  clearTimeout(temporizadorFeedback_);
}

/** Abre un modal genérico (fondo oscuro + tarjeta blanca redondeada) dentro
 * de uno de los contenedores fijos agregados por capaGlobal_. */
function abrirModal_(idContenedor, contenidoHTML) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="mn-modal-fondo" data-accion="cerrar-modal">
      <div class="mn-panel bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 max-h-[85vh] overflow-y-auto" onclick="event.stopPropagation()">
        ${contenidoHTML}
      </div>
    </div>
  `;
  contenedor.classList.remove('hidden');
  contenedor.querySelector('[data-accion="cerrar-modal"]')?.addEventListener('click', () => cerrarModal_(idContenedor));
}

function cerrarModal_(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (contenedor) { contenedor.classList.add('hidden'); contenedor.innerHTML = ''; }
}

/** Calculadora básica de la biblioteca de recursos: solo botones (sin campo
 * de texto libre), para que la expresión evaluada esté siempre compuesta
 * únicamente por los dígitos y operadores que la propia UI permite. */
function abrirModalCalculadora_() {
  const teclas = ['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=', '⌫'];
  abrirModal_('mn-modal-calculadora', `
    ${overline_('Recursos', 'calculadora', COLOR_EJERCITATE)}
    <h3 class="font-heading text-xl font-bold text-slate-800 mb-3">Calculadora</h3>
    <div id="calc-pantalla" class="bg-slate-800 text-white rounded-2xl px-4 py-4 text-right font-mono text-2xl mb-3 overflow-x-auto">0</div>
    <div id="calc-botones" class="grid grid-cols-4 gap-2">
      ${teclas.map((b) => `
        <button data-tecla="${b}"
                class="mn-boton-3d font-heading font-bold py-3 rounded-xl ${b === '=' ? 'bg-teal-600 text-white' : /^[0-9.]$/.test(b) ? 'bg-white border-2 border-slate-200 text-slate-800' : 'bg-slate-100 text-slate-700'}"
                style="--mn-3d-borde:${b === '=' ? '#022c22' : '#cbd5e1'}">${b}</button>
      `).join('')}
    </div>
  `);

  const pantalla = document.getElementById('calc-pantalla');
  const simbolos = { '÷': '/', '×': '*' };
  let expresion = '';
  document.getElementById('calc-botones')?.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-tecla]');
    if (!boton || !pantalla) return;
    const tecla = boton.dataset.tecla;
    if (tecla === 'C') {
      expresion = '';
    } else if (tecla === '⌫') {
      expresion = expresion.slice(0, -1);
    } else if (tecla === '=') {
      const limpia = expresion.replace(/[÷×]/g, (s) => simbolos[s]);
      if (/^[0-9+\-*/(). ]+$/.test(limpia)) {
        try {
          const resultado = Function(`"use strict"; return (${limpia});`)();
          expresion = Number.isFinite(resultado) ? String(resultado) : 'Error';
        } catch {
          expresion = 'Error';
        }
      }
    } else {
      expresion += tecla;
    }
    pantalla.textContent = expresion === '' ? '0' : expresion;
  });
}

/** Agrega, una sola vez, los contenedores fijos de la capa flotante global
 * (retroalimentación y modal de la calculadora) al final de <body>, y
 * conecta el cierre por clic-afuera de las tarjetas de módulo abiertas y
 * por tecla Escape — todo puramente de UI, sin tocar el router ni los
 * datos. (Paso 24: se retiró el botón/modal de "Soporte" — el `mailto:`
 * hacia el docente — para que la app no ofrezca un canal directo por el
 * que un alumno pudiera adjuntar contenido inapropiado a su correo; ver
 * `data/README.md`.) */
function capaGlobal_() {
  const capa = document.createElement('div');
  capa.innerHTML = `
    <div id="mn-feedback-flotante" class="hidden"></div>
    <div id="mn-modal-calculadora" class="hidden"></div>
  `;
  document.body.append(...capa.childNodes);

  document.addEventListener('click', (evento) => {
    document.querySelectorAll('details.mn-nodo[open]').forEach((detalle) => {
      if (!detalle.contains(evento.target)) detalle.removeAttribute('open');
    });
  });
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') {
      ocultarFeedbackFlotante_();
      cerrarModal_('mn-modal-calculadora');
    }
  });
}

// ============================================================
// Vista: 404
// ============================================================
function vista404() {
  return `
    <div class="max-w-md mx-auto px-4 py-16 text-center">
      <p class="text-6xl mb-4">🤔</p>
      <p class="text-slate-600">No encontramos esa página.</p>
      <a href="#/" class="text-indigo-700 font-semibold hover:underline">Volver al inicio</a>
    </div>
  `;
}

// ============================================================
// Utilidades compartidas
// ============================================================
/** Iniciales (1 o 2 letras) del nombre del alumno, para el avatar circular
 * del encabezado — sin fotos ni datos nuevos, solo texto ya capturado en
 * el registro. */
function iniciales_(nombre = '') {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const letras = partes.slice(0, 2).map((p) => p[0].toUpperCase());
  return letras.join('') || '?';
}

function encabezado_(sesion) {
  return `
    <header class="mn-puntos bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-3 flex items-center justify-between no-imprimir shadow-md rounded-b-[28px]">
      <a href="#/grados" class="flex items-center gap-2 font-heading font-extrabold text-white">
        <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/20">M</span>
        <span class="hidden xs:inline">MATE-NEM</span>
      </a>
      <div class="text-sm text-white/90 flex items-center gap-2 sm:gap-3">
        <a href="#/recursos" title="Recursos"
           class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 transition" aria-label="Recursos">
          ${icono_('soporte', 'w-4 h-4')}
        </a>
        <span class="hidden sm:inline">${escapeHTML_(sesion.nombre)} · ${escapeHTML_(sesion.grado)} ${escapeHTML_(sesion.grupo)}</span>
        <span class="mn-avatar bg-white/20 text-white border-2 border-white/40" title="${escapeHTML_(sesion.nombre)}">${iniciales_(sesion.nombre)}</span>
        <button onclick="localStorage.removeItem('mateNemSesion'); location.hash='#/'; location.reload();"
                class="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg font-semibold transition">
          ${icono_('salida', 'w-4 h-4')} <span class="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  `;
}

function escapeHTML_(texto = '') {
  const div = document.createElement('div');
  div.textContent = String(texto);
  return div.innerHTML;
}

// ============================================================
// Registro de rutas e inicio de la app
// ============================================================
ruta('/', vistaRegistro);
ruta('/grados', vistaSeleccionGrado);
ruta('/pda-lista/:grado', vistaListaPDA);
ruta('/pda-lista/:grado/:trimestre', vistaListaPDA);
ruta('/pda/:grado/:id', vistaPDA);
ruta('/recursos', vistaRecursos);
rutaPorDefecto(vista404);

document.addEventListener('DOMContentLoaded', () => {
  init('app');
  capaGlobal_();

  // Si en una sesión anterior no había internet o el webhook aún no estaba
  // desplegado, aquí se reintenta en silencio (no bloquea el uso de la app).
  reintentarPendientes().catch(() => {});
});
