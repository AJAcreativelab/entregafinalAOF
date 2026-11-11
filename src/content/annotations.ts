/* ==========================================================================
   ANOTACIONES ANATÓMICAS
   --------------------------------------------------------------------------
   Coordenadas en % de la fotografía: [x, y] (0–100).
   Las anotaciones son una capa SVG independiente: nunca alteran la foto.

   CALIBRADAS sobre las fotografías reales del protocolo (1125 × 2000):
     frontal-serio.jpg · tres-cuartos.jpg · perfil-derecho.jpg
   Puntos medidos con una grilla al 1 % (public/calib.html):
     Frontal  → implantación (borde del gorro) 30,5 · glabela 39,5 · base nasal 46 ·
                comisuras 48,8 · mentón 54,5 · línea media x 52 · contorno x 34–69
     3/4      → punta nasal (66,7; 45,6) · oreja (32,5; 47) · jowl (56,5; 54)
     Perfil   → punta nasal (70,4; 49,3) · pogonion (67,6; 57,8) · mentón (66; 60,5) ·
                vértice cervicomental (56,5; 63,4) · cuello (49,8; 69,5) · gonion (47,5; 55)
   Pendientes (sin foto todavía): piel (acercamiento frontal) y nariz.
   Para retocar: tecla C → clic sobre el punto → se copia [x, y].
   ========================================================================== */

import type { Figure } from './types'

const JAW_FRONTAL: [number, number][] = [
  [34.8, 45.5],
  [36.4, 49.5],
  [39.5, 52.6],
  [45, 54.4],
  [52, 54.9],
  [59, 54.4],
  [64.5, 52.6],
  [67.6, 49.5],
  [68.9, 45.5],
]

export const figures = {
  /* 03.1 A — Simetría facial (frontal en reposo) */
  symmetry: {
    face: { x0: 32.5, x1: 71.5, y0: 25.5, y1: 58.5 },
    guide: 'frontal',
    layers: [
      { id: 'media', label: 'Línea media' },
      { id: 'zonas', label: 'Zonas de asimetría' },
    ],
    annotations: [
      { id: 'mid', layer: 'media', type: 'vline', x: 52, label: 'Línea media' },
      { id: 'malar-l-e', layer: 'zonas', type: 'ellipse', c: [40.5, 43.6], rx: 4.2, ry: 1.7, dashed: true },
      { id: 'malar-r-e', layer: 'zonas', type: 'ellipse', c: [63.6, 43.6], rx: 4.2, ry: 1.7, dashed: true },
      { id: 'malar-l', layer: 'zonas', type: 'callout', at: [36.4, 43.6], side: 'left', label: 'Región malar' },
      { id: 'nl-l', layer: 'zonas', type: 'path', d: [[47.6, 45.4], [46.1, 47.2], [45.2, 48.6]] },
      { id: 'nl-r', layer: 'zonas', type: 'path', d: [[57.2, 45.4], [58.8, 47.2], [59.8, 48.6]] },
      { id: 'nl', layer: 'zonas', type: 'callout', at: [46.1, 47.2], side: 'left', label: 'Surcos nasolabiales', dy: 1.5 },
      { id: 'com-l', layer: 'zonas', type: 'ellipse', c: [45.3, 48.8], rx: 1.3, ry: 0.6 },
      { id: 'com-r', layer: 'zonas', type: 'ellipse', c: [59.6, 48.8], rx: 1.3, ry: 0.6 },
      { id: 'com', layer: 'zonas', type: 'callout', at: [60.9, 48.8], side: 'right', label: 'Expresión de comisuras', emphasis: true },
    ],
  },

  /* 03.1 B + C — Tercios faciales y contorno (misma fotografía frontal) */
  thirds: {
    legend: true,
    face: { x0: 32.5, x1: 71.5, y0: 25.5, y1: 58.5 },
    guide: 'frontal',
    layers: [
      { id: 'tercios', label: 'Tercios faciales' },
      { id: 'contorno', label: 'Forma y contorno' },
      { id: 'inferior', label: 'Tercio inferior' },
    ],
    annotations: [
      { id: 'h1', layer: 'tercios', type: 'hline', y: 30.5, label: 'Implantación del cabello' },
      { id: 'h2', layer: 'tercios', type: 'hline', y: 39.5, label: 'Glabela' },
      { id: 'h3', layer: 'tercios', type: 'hline', y: 46, label: 'Base nasal' },
      { id: 'h4', layer: 'tercios', type: 'hline', y: 54.6, label: 'Mentón' },
      { id: 'b1', layer: 'tercios', type: 'bracket', y1: 30.5, y2: 39.5, x: 80, label: 'Superior' },
      { id: 'b2', layer: 'tercios', type: 'bracket', y1: 39.5, y2: 46, x: 80, label: 'Medio' },
      { id: 'b3', layer: 'tercios', type: 'bracket', y1: 46, y2: 54.6, x: 80, label: 'Inferior', emphasis: true },

      { id: 'oval', layer: 'contorno', type: 'ellipse', c: [52, 42.6], rx: 17.6, ry: 12.4, dashed: true, label: 'Ovalado-ancho · tendencia redondeada', labelAt: [52, 29.2] },

      { id: 'width', layer: 'inferior', type: 'line', from: [36.2, 49.6], to: [67.8, 49.6], emphasis: true },
      { id: 'width-c', layer: 'inferior', type: 'callout', at: [36.2, 49.6], side: 'left', label: 'Mayor amplitud visual', emphasis: true },
      { id: 'jaw', layer: 'inferior', type: 'path', d: JAW_FRONTAL, emphasis: true },
      { id: 'jaw-c', layer: 'inferior', type: 'callout', at: [65.2, 52.2], side: 'right', label: 'Contorno mandibular poco definido', emphasis: true },
      { id: 'chin-c', layer: 'inferior', type: 'callout', at: [52, 54.9], side: 'left', label: 'Mentón · proyección moderada', dy: 1.8 },
      { id: 'sub', layer: 'inferior', type: 'ellipse', c: [52, 56.7], rx: 7.5, ry: 1.5, dashed: true },
      { id: 'sub-c', layer: 'inferior', type: 'callout', at: [59.5, 56.7], side: 'right', label: 'Transición submentoniana', dy: 1.8 },
    ],
  },

  /* 03.2 — Piel · calibrada sobre piel-frontal (recorte del frontal del protocolo); puntos numerados + leyenda */
  skin: {
    face: { x0: 24, x1: 76, y0: 26, y1: 78 },
    legend: true,
    plate: true,
    guide: 'frontal',
    layers: [{ id: 'piel', label: 'Hallazgos cutáneos' }],
    annotations: [
      { id: 'io-l', layer: 'piel', type: 'path', d: [[35.5, 48.7], [40.6, 49.9], [45.7, 49.2]] },
      { id: 'io-r', layer: 'piel', type: 'path', d: [[65.3, 48.5], [59.8, 49.7], [55.1, 49.0]] },
      { id: 'ojeras', layer: 'piel', type: 'callout', at: [40.6, 49.9], side: 'left', label: 'Ojeras · surco lagrimal', order: 2 },
      { id: 'nl-l', layer: 'piel', type: 'path', d: [[45.3, 54.5], [43.6, 58.6], [41.9, 62]] },
      { id: 'nl-r', layer: 'piel', type: 'path', d: [[56, 54.5], [57.7, 58.6], [59.4, 62]] },
      { id: 'nl', layer: 'piel', type: 'callout', at: [57.7, 58.6], side: 'right', label: 'Surcos nasolabiales', order: 3 },
      { id: 'zt', layer: 'piel', type: 'path', d: [[35.5, 31.3], [65.3, 31.3], [65.3, 39.4], [55.1, 39.4], [55.1, 54.8], [46.2, 54.8], [46.2, 39.4], [35.5, 39.4]], closed: true, dashed: true },
      { id: 'zt-c', layer: 'piel', type: 'callout', at: [50.5, 35.3], side: 'right', label: 'Zona T', order: 1 },
    ],
  },

  /* 03.3 — Tejido adiposo · frontal */
  adiposeFrontal: {
    face: { x0: 32.5, x1: 71.5, y0: 25.5, y1: 58.5 },
    guide: 'frontal',
    layers: [{ id: 'adiposo', label: 'Adiposidad localizada' }],
    annotations: [
      { id: 'mej-l', layer: 'adiposo', type: 'ellipse', c: [40.6, 49.4], rx: 4, ry: 1.9, dashed: true },
      { id: 'mej-r', layer: 'adiposo', type: 'ellipse', c: [63.8, 49.4], rx: 4, ry: 1.9, dashed: true },
      { id: 'mej-c', layer: 'adiposo', type: 'callout', at: [67.8, 49.4], side: 'right', label: '1 · Plenitud inferior de mejillas' },
      { id: 'sub', layer: 'adiposo', type: 'ellipse', c: [52, 56.6], rx: 9, ry: 1.9, emphasis: true },
      { id: 'sub-c', layer: 'adiposo', type: 'callout', at: [43, 56.6], side: 'left', label: '2 · Submentoniana', emphasis: true },
      { id: 'cont', layer: 'adiposo', type: 'path', d: JAW_FRONTAL, dashed: true },
      { id: 'cont-c', layer: 'adiposo', type: 'callout', at: [39.5, 52.6], side: 'left', label: '4 · Contorno', dy: -1.4 },
    ],
  },

  /* 03.3 — Tejido adiposo · tres cuartos */
  adiposeThreeQuarter: {
    face: { x0: 27, x1: 70, y0: 25.5, y1: 60.5 },
    guide: 'three-quarter',
    layers: [{ id: 'adiposo', label: 'Región jowl' }],
    annotations: [
      { id: 'jowl', layer: 'adiposo', type: 'ellipse', c: [56.6, 54.2], rx: 3.6, ry: 1.6, emphasis: true },
      { id: 'jowl-c', layer: 'adiposo', type: 'callout', at: [60.2, 54.2], side: 'right', label: '3 · Jowl · mandibular lateral', emphasis: true },
      { id: 'sm', layer: 'adiposo', type: 'ellipse', c: [51, 57], rx: 7, ry: 1.8, dashed: true },
      { id: 'sm-c', layer: 'adiposo', type: 'callout', at: [44, 57], side: 'left', label: '1 · Submandibular' },
      { id: 'borde', layer: 'adiposo', type: 'path', d: [[35, 51], [42, 54.4], [50, 56.8], [56.5, 56.6], [61.2, 55]], dashed: true },
    ],
  },

  /* 03.3 — Tejido adiposo · perfil derecho */
  adiposeProfile: {
    face: { x0: 29, x1: 73.5, y0: 27, y1: 71 },
    guide: 'profile',
    layers: [{ id: 'adiposo', label: 'Perfil' }],
    annotations: [
      { id: 'sub', layer: 'adiposo', type: 'ellipse', c: [61.4, 61.8], rx: 5.4, ry: 1.9, emphasis: true },
      { id: 'sub-c', layer: 'adiposo', type: 'callout', at: [56, 61.8], side: 'left', label: '2 · Papada', emphasis: true, dy: 2 },
      { id: 'jm', layer: 'adiposo', type: 'path', d: [[47.5, 55], [56.5, 58.4], [66, 60.6]], dashed: true },
      { id: 'jm-c', layer: 'adiposo', type: 'callout', at: [47.5, 55], side: 'left', label: '4 · Mandíbula–cuello', dy: -1.6 },
    ],
  },

  /* 03.5 — Mandíbula y papada · frontal */
  mandibleFrontal: {
    face: { x0: 32.5, x1: 71.5, y0: 25.5, y1: 58.5 },
    guide: 'frontal',
    layers: [
      { id: 'borde', label: 'Borde mandibular' },
      { id: 'volumen', label: 'Volumen / jowl' },
    ],
    annotations: [
      { id: 'borde', layer: 'borde', type: 'path', d: JAW_FRONTAL, dashed: true },
      { id: 'borde-c', layer: 'borde', type: 'callout', at: [36.4, 49.5], side: 'left', label: 'Borde mandibular · disminuido' },
      { id: 'jl', layer: 'volumen', type: 'ellipse', c: [39.6, 52], rx: 3, ry: 1.4 },
      { id: 'jr', layer: 'volumen', type: 'ellipse', c: [64.6, 52], rx: 3, ry: 1.4 },
      { id: 'jr-c', layer: 'volumen', type: 'callout', at: [67.6, 52], side: 'right', label: 'Región jowl' },
      { id: 'sub', layer: 'volumen', type: 'ellipse', c: [52, 56.6], rx: 9, ry: 1.9, emphasis: true },
      { id: 'sub-c', layer: 'volumen', type: 'callout', at: [61, 56.6], side: 'right', label: 'Submentoniano · Dedo III', emphasis: true, dy: 1.6 },
    ],
  },

  /* 03.5 — Mandíbula y papada · perfil derecho */
  mandibleProfile: {
    face: { x0: 29, x1: 73.5, y0: 27, y1: 71 },
    guide: 'profile',
    layers: [
      { id: 'angulo', label: 'Ángulo cervicomental' },
      { id: 'borde', label: 'Borde mandibular' },
    ],
    annotations: [
      { id: 'ang', layer: 'angulo', type: 'angle', a: [66, 60.6], vertex: [56.5, 63.4], b: [49.8, 69.5], label: 'Ángulo cervicomental · aumentado', emphasis: true },
      { id: 'borde', layer: 'borde', type: 'line', from: [47.5, 55], to: [66, 60.6], dashed: true },
      { id: 'borde-c', layer: 'borde', type: 'callout', at: [47.5, 55], side: 'left', label: 'Continuidad alterada', dy: -1.6 },
      { id: 'sub', layer: 'borde', type: 'ellipse', c: [61.4, 61.8], rx: 5.4, ry: 1.9 },
    ],
  },

  /* 03.6 — Nariz · calibradas sobre los acercamientos nariz-frontal (260×325) y nariz-perfil (360×450) */
  noseFrontal: {
    guide: 'nose-frontal',
    face: { x0: 30, x1: 70, y0: 24, y1: 62 },
    legend: true,
    plate: true,
    layers: [{ id: 'nariz', label: 'Vista frontal' }],
    annotations: [
      { id: 'mid', layer: 'nariz', type: 'vline', x: 50 },
      { id: 'mid-c', layer: 'nariz', type: 'callout', at: [50, 30], side: 'right', label: 'Simetría frontal · centrada' },
      { id: 'base', layer: 'nariz', type: 'line', from: [34, 56], to: [66, 56] },
      { id: 'base-c', layer: 'nariz', type: 'callout', at: [66, 56], side: 'right', label: 'Base · amplitud moderada' },
      { id: 'tip', layer: 'nariz', type: 'ellipse', c: [50, 51.5], rx: 12, ry: 7.5, emphasis: true },
      { id: 'tip-c', layer: 'nariz', type: 'callout', at: [38, 51.5], side: 'left', label: 'Punta ligeramente redondeada', emphasis: true },
    ],
  },
  noseProfile: {
    guide: 'nose-profile',
    face: { x0: 25, x1: 70, y0: 28, y1: 77 },
    legend: true,
    plate: true,
    layers: [{ id: 'nariz', label: 'Vista de perfil' }],
    annotations: [
      { id: 'dorso', layer: 'nariz', type: 'path', d: [[61.4, 27.6], [61.1, 29.3], [60.3, 31.1], [59.2, 32.9], [58.6, 34.7], [56.9, 36.4], [55, 38.2], [52.5, 40], [49.7, 41.8], [47.5, 43.6], [45.6, 45.3], [43.6, 47.1], [41.7, 48.9], [39.7, 50.7], [38.1, 52.4], [35.8, 54.2], [33.9, 56], [31.9, 57.8], [30.8, 59.6], [29.7, 61.3], [29.4, 63.1]], emphasis: true },
      { id: 'dorso-c', layer: 'nariz', type: 'callout', at: [45.6, 45.3], side: 'right', label: 'Giba nasal en el dorso de la nariz', emphasis: true, order: 1 },
      { id: 'ref', layer: 'nariz', type: 'line', from: [61.4, 27.6], to: [29.4, 63.1], dashed: true },
      { id: 'tip-c', layer: 'nariz', type: 'callout', at: [29.4, 63.1], side: 'left', label: 'Proyección de punta · moderada', order: 2 },
      { id: 'radix-c', layer: 'nariz', type: 'callout', at: [61.4, 27.6], side: 'right', label: 'Radix bajo', order: 4 },
      { id: 'nf', layer: 'nariz', type: 'callout', at: [46, 73], side: 'right', label: 'Columela retraída', order: 3 },
    ],
  },
  /* 06.1 — Lipólisis · marcación de zonas sobre la foto de procedimiento (vista submental) */
  lipoMap: {
    face: { x0: 20, x1: 80, y0: 36, y1: 74 },
    legend: true,
    plate: true,
    layers: [{ id: 'zonas', label: 'Zonas' }],
    annotations: [
      { id: 'borde', layer: 'zonas', type: 'callout', at: [45.8, 42.5], side: 'right', label: 'Borde inferior de la mandíbula', order: 1 },
      { id: 'sin', layer: 'zonas', type: 'callout', at: [50.1, 47.3], side: 'right', label: 'Zona sin tratamiento', order: 2 },
      { id: 'zona', layer: 'zonas', type: 'callout', at: [42.5, 58.1], side: 'left', label: 'Zona de tratamiento · papada', emphasis: true, order: 3 },
      { id: 'puntos', layer: 'zonas', type: 'callout', at: [51.7, 56], side: 'right', label: 'Mallado · puntos de inyección', order: 4 },
    ],
  },
} satisfies Record<string, Figure>

export type FigureId = keyof typeof figures
