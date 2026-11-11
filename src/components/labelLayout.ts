import type { Annotation, Figure } from '../content/types'

/* ==========================================================================
   UBICACIÓN DE ETIQUETAS — nunca sobre el rostro, nunca encimadas ni cortadas
   --------------------------------------------------------------------------
   Sobre la cara sólo va el trazo (línea guía) hasta el punto anatómico.
   La foto se divide en ZONAS EXCLUSIVAS (no comparten espacio):
     · columna izquierda y derecha, sólo a la altura del rostro
     · franja superior (fondo libre sobre la cabeza)
     · franja inferior (debajo del mentón)
   1. Cada etiqueta va a la columna de su lado, a la altura de su punto
      (2–3 renglones si hace falta; ninguna palabra se corta).
   2. En cada zona se empujan entre sí para no encimarse.
   3. Lo que no entra en su columna pasa a la franja superior o inferior.
   4. Toda etiqueta queda dentro de la foto (margen de seguridad).
   Las medidas se toman con el MISMO estilo con el que se dibuja la etiqueta.
   ========================================================================== */

/** Estilo único de etiqueta (se usa para dibujar y para medir) */
export const LABEL_CLASS = 't-label pointer-events-none absolute pb-1 text-[calc(clamp(0.56rem,0.66vw,0.74rem)*var(--ls,1))] leading-[1.2] tracking-[0.12em]'

export type Place = {
  /** extremo de la etiqueta más cercano a la cara (donde llega la guía) */
  x: number
  /** línea base (borde inferior) de la etiqueta */
  y: number
  align: 'left' | 'right'
  W: number
  maxW?: number
  H?: number
  /** número del punto cuando la figura usa leyenda */
  num?: number
  plate?: boolean
}

let probe: HTMLSpanElement | null = null
let probeScale = 1
function measure(text: string, maxW?: number) {
  if (!probe) {
    probe = document.createElement('span')
    probe.className = LABEL_CLASS
    probe.setAttribute('aria-hidden', 'true')
    Object.assign(probe.style, { visibility: 'hidden', left: '-99999px', top: '0', position: 'absolute' })
    document.body.appendChild(probe)
  }
  probe.style.setProperty('--ls', String(probeScale))
  probe.style.whiteSpace = maxW ? 'normal' : 'nowrap'
  probe.style.width = maxW ? 'max-content' : 'auto'
  probe.style.maxWidth = maxW ? `${maxW}px` : 'none'
  probe.textContent = text
  const r = probe.getBoundingClientRect()
  let width = r.width
  if (maxW) {
    // Texto en varios renglones: el ancho que importa es el del renglón más largo, no el de la caja
    const range = document.createRange()
    range.selectNodeContents(probe)
    const lines = [...range.getClientRects()]
    if (lines.length) width = Math.max(...lines.map((l) => l.right)) - Math.min(...lines.map((l) => l.left))
  }
  // margen de seguridad contra redondeos y diferencias de render
  return { w: Math.ceil(width * 1.03) + 2, h: Math.ceil(r.height) }
}

type Item = { id: string; text: string; px: number; py: number; want: number; side: 'left' | 'right' }
type Box = { it: Item; W: number; H: number; maxW?: number; tooNarrow?: boolean }

/** Ubica las etiquetas; si la foto es tan chica que no entran, prueba con letra al 90 % y al 80 %. */
export function layoutLabels(f: Figure, visible: Set<string>, w: number, h: number): { places: Map<string, Place>; scale: number } {
  let last = { places: new Map<string, Place>(), scale: 1 }
  for (const scale of [1, 0.9, 0.8]) {
    probeScale = scale
    const places = layoutAt(f, visible, w, h)
    last = { places, scale }
    if (!crowded(places, f, w, h)) break
  }
  probeScale = 1
  return last
}

function crowded(places: Map<string, Place>, f: Figure, w: number, h: number) {
  const face = f.face
  if (!face) return false
  const r = [...places.entries()].map(([id, p]) => {
    const ww = p.W || p.maxW || 0
    return { id, x0: p.align === 'right' ? p.x - ww : p.x, x1: p.align === 'right' ? p.x : p.x + ww, y0: p.y - (p.H ?? 0), y1: p.y }
  })
  const hline = new Set((f.annotations as readonly Annotation[]).filter((a) => a.type === 'hline').map((a) => a.id))
  const fx0 = (face.x0 / 100) * w, fx1 = (face.x1 / 100) * w, fy0 = (face.y0 / 100) * h, fy1 = (face.y1 / 100) * h
  for (const a of r) {
    if (a.x0 < -1 || a.x1 > w + 1 || a.y0 < -1 || a.y1 > h + 1) return true
    if (!hline.has(a.id) && a.x0 < fx1 - 1 && a.x1 > fx0 + 1 && a.y0 < fy1 - 1 && a.y1 > fy0 + 1) return true
  }
  for (let i = 0; i < r.length; i++)
    for (let j = i + 1; j < r.length; j++) {
      const a = r[i], b = r[j]
      if (a.x0 < b.x1 - 1 && a.x1 > b.x0 + 1 && a.y0 < b.y1 - 1 && a.y1 > b.y0 + 1) return true
    }
  return false
}

function layoutAt(f: Figure, visible: Set<string>, w: number, h: number): Map<string, Place> {
  const out = new Map<string, Place>()
  const face = f.face
  if (!face || !w || !h) return out
  const X = (v: number) => (v / 100) * w
  const Y = (v: number) => (v / 100) * h
  const gap = 5
  const edge = X(2.5) // margen contra el borde de la foto
  const fT = Y(face.y0)
  const fB = Y(face.y1)
  const topLimit = Y(8) // libre para "FIG." y la etiqueta de la línea media
  const botLimit = h - 4
  const cx = X((face.x0 + face.x1) / 2)
  const colL = { inner: X(face.x0) - 8, outer: edge }
  const colR = { inner: X(face.x1) + 8, outer: w - edge }

  const anns = (f.annotations as readonly Annotation[]).filter((a) => visible.has(a.layer))
  const items: Item[] = []
  for (const a of anns) {
    if (a.type === 'callout') {
      const x = X(a.at[0])
      const y = Y(a.at[1])
      items.push({ id: a.id, text: a.label, px: x, py: y, want: y + Y(a.dy ?? 0), side: a.side })
    } else if (a.type === 'angle') {
      const x = X(a.vertex[0])
      const y = Y(a.vertex[1])
      items.push({ id: a.id, text: a.label, px: x, py: y, want: y, side: x < cx ? 'left' : 'right' })
    } else if ((a.type === 'ellipse' || a.type === 'path') && a.label) {
      const at = a.type === 'ellipse' ? (a.labelAt ?? [a.c[0], a.c[1] - a.ry]) : a.labelAt
      if (!at) continue
      const side = X(at[0]) < cx - 4 ? 'left' : 'right'
      const ax = a.type === 'ellipse' ? X(a.c[0] + (side === 'left' ? -a.rx : a.rx) * 0.7) : X(at[0])
      const ay = a.type === 'ellipse' ? Y(a.c[1] - a.ry * 0.7) : Y(at[1])
      items.push({ id: a.id, text: a.label, px: ax, py: ay, want: ay, side })
    }
  }

  // Obstáculos ya ocupados (rótulos de tercios) que el resto debe esquivar
  type Rect = { x0: number; x1: number; y0: number; y1: number }
  const obstacles: Rect[] = []
  const hits = (r: Rect) => obstacles.find((o) => r.x0 < o.x1 && r.x1 > o.x0 && r.y0 < o.y1 && r.y1 > o.y0)

  const fitIn = (it: Item, width: number): Box => {
    const single = measure(it.text)
    if (single.w <= width) return { it, W: single.w, H: single.h }
    const longest = Math.max(...it.text.split(/\s+/).map((word) => measure(word).w))
    const wrapped = measure(it.text, width)
    return { it, W: Math.min(width, wrapped.w), H: wrapped.h, maxW: width, tooNarrow: longest > width }
  }
  const one = measure('M').h

  // 0 · Rótulos de las líneas de tercios: ancho libre de la izquierda, varios renglones si hace falta.
  //     Preferencia: encima de su línea; si choca con el rótulo anterior, justo debajo de la línea.
  const hW = Math.max(56, X(face.x0) - X(4) - 8)
  let prevBottom = -Infinity
  for (const a of anns
    .filter((x): x is Extract<Annotation, { type: 'hline' }> => x.type === 'hline')
    .sort((p, q) => p.y - q.y)) {
    const m = measure(a.label, hW)
    const line = Y(a.y)
    let base = line
    if (line - m.h < prevBottom + gap) base = Math.max(line + m.h + 3, prevBottom + m.h + gap)
    prevBottom = base
    out.set(a.id, { x: X(4), y: base, align: 'left', W: 0, maxW: hW, H: m.h })
    obstacles.push({ x0: X(4), x1: X(4) + hW, y0: base - m.h, y1: base })
  }


  let legendEnd = fB + gap
  // Modo leyenda: cada callout lleva un número en su punto y su texto va en una lista bajo el rostro
  if (f.legend) {
    const ord = (it: Item) => {
      const z = (f.annotations as readonly Annotation[]).find((a) => a.id === it.id)
      return z?.type === 'callout' && z.order != null ? z.order * 1e4 : it.py
    }
    const calls = items.filter((it) => (f.annotations as readonly Annotation[]).find((z) => z.id === it.id)?.type === 'callout').sort((p, q) => ord(p) - ord(q) || p.px - q.px)
    let y = Math.max(fB, ...obstacles.map((o) => o.y1)) + gap
    calls.forEach((it, k) => {
      const text = `${k + 1}  ${it.text}`
      const b = fitIn({ ...it, text }, w - 2 * edge)
      y += b.H
      out.set(it.id, { x: edge, y, align: 'left', W: b.W, maxW: b.maxW, H: b.H, num: k + 1, plate: f.plate })
      y += gap
    })
    legendEnd = y
    for (const it of calls) items.splice(items.indexOf(it), 1)
  }

  // 1 · Columnas laterales: sólo dentro de la altura del rostro
  const overflow: Item[] = []
  for (const side of ['left', 'right'] as const) {
    const col = side === 'left' ? colL : colR
    const width = Math.abs(col.inner - col.outer)
    const list = items
      .filter((it) => it.side === side)
      .map((it) => fitIn(it, width))
      .sort((a, b) => a.it.want - b.it.want)
    let lastBase = fT
    for (const b of list) {
      if (width < 44 || b.tooNarrow || b.H > one * 3.3) {
        overflow.push(b.it)
        continue
      }
      let base = Math.max(b.it.want + b.H / 2, lastBase + b.H + gap)
      const xs = side === 'left' ? [col.inner - b.W, col.inner] : [col.inner, col.inner + b.W]
      for (let o = hits({ x0: xs[0], x1: xs[1], y0: base - b.H, y1: base }); o; o = hits({ x0: xs[0], x1: xs[1], y0: base - b.H, y1: base })) base = o.y1 + b.H + gap
      if (base > fB) {
        overflow.push(b.it)
        continue
      }
      lastBase = base
      out.set(b.it.id, { x: col.inner, y: base, align: side === 'left' ? 'right' : 'left', W: b.W, maxW: b.maxW, H: b.H })
    }
  }

  // 2 · Franjas superior e inferior (ancho completo de la foto, una etiqueta por renglón)
  const bandW = w - 2 * edge
  const upper: Item[] = []
  const lower: Item[] = []
  for (const it of overflow) (it.py < (fT + fB) / 2 ? upper : lower).push(it)
  // Arriba: el renglón más cercano a la cara es para el punto más alto (guías sin cruzarse)
  let top = fT - gap
  for (const it of upper.sort((a, b) => a.py - b.py)) {
    const b = fitIn(it, bandW)
    for (let o = hits({ x0: edge, x1: w - edge, y0: top - b.H, y1: top }); o; o = hits({ x0: edge, x1: w - edge, y0: top - b.H, y1: top })) top = o.y0 - gap
    if (top - b.H < topLimit) {
      lower.push(it)
      continue
    }
    place(b, top)
    top -= b.H + gap
  }
  let bottom = legendEnd
  for (const it of lower.sort((a, b) => a.py - b.py)) {
    const b = fitIn(it, bandW)
    bottom += b.H
    for (let o = hits({ x0: edge, x1: w - edge, y0: bottom - b.H, y1: bottom }); o; o = hits({ x0: edge, x1: w - edge, y0: bottom - b.H, y1: bottom })) bottom = o.y1 + gap + b.H
    if (bottom > botLimit) {
      // Abajo ya no hay lugar: usa lo que quede de la franja superior
      bottom -= b.H
      for (let o = hits({ x0: edge, x1: w - edge, y0: top - b.H, y1: top }); o; o = hits({ x0: edge, x1: w - edge, y0: top - b.H, y1: top })) top = o.y0 - gap
      place(b, Math.max(topLimit + b.H, top))
      top -= b.H + gap
      continue
    }
    place(b, bottom)
    bottom += gap
  }
  function place(b: Box, base: number) {
    const left = b.it.px < cx
    // El extremo interno queda del lado del punto; la etiqueta nunca sale de la foto
    const x = left ? edge + b.W : w - edge - b.W
    out.set(b.it.id, { x: Math.min(w - edge, Math.max(edge, x)), y: base, align: left ? 'right' : 'left', W: b.W, maxW: b.maxW, H: b.H })
  }

  return out
}
