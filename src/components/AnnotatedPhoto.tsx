import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type RefObject } from 'react'
import { figures, type FigureId } from '../content/annotations'
import type { Annotation, Figure, Pt } from '../content/types'
import { useElementSize } from '../lib/hooks'
import { usePresentation } from '../lib/presentation'
import { useStripMode } from '../lib/strip'
import { LABEL_CLASS, layoutLabels, type Place } from './labelLayout'
import { Photo, type PhotoProps } from './Media'

/* ==========================================================================
   Sistema de anotación anatómica — capa SVG independiente sobre la foto.
   Lenguaje gráfico único para todo el proyecto:
   · líneas finas 1px marfil · acento arcilla para hallazgos principales
   · puntos de referencia con anillo · etiquetas mono en versalitas
   ========================================================================== */

const INK = '#F7EAD4'
const ACC = '#FFBC6A'
const EASE = [0.22, 1, 0.36, 1] as const

function smooth(pts: [number, number][], closed = false) {
  if (pts.length < 3) return `M${pts.map((p) => p.join(' ')).join(' L')}`
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]]
  let d = `M${P[1][0]} ${P[1][1]}`
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`
  }
  return closed ? d + ' Z' : d
}

function Label({ x, y, children, align = 'left', emphasis, rotate, maxW, fontPx }: { x: number; y: number; children: string; align?: 'left' | 'right' | 'center'; emphasis?: boolean; rotate?: boolean; maxW?: number; fontPx?: number }) {
  const tx = align === 'right' ? '-100%' : align === 'center' ? '-50%' : '0'
  const style: CSSProperties = {
    left: x,
    top: y,
    transform: rotate ? `translate(-50%, -50%) rotate(-90deg)` : `translate(${tx}, -100%)`,
    color: emphasis ? ACC : INK,
    textShadow: '0 0 6px rgba(20,18,16,.85), 0 0 2px rgba(20,18,16,.9)',
    whiteSpace: maxW ? 'normal' : 'nowrap',
    ...(fontPx ? { fontSize: fontPx } : {}),
    // mismo ajuste que la medición: ancho real del texto, con tope
    ...(maxW ? { width: 'max-content', maxWidth: maxW, textAlign: align === 'right' ? 'right' : 'left' } : {}),
  }
  return (
    <span className={LABEL_CLASS} style={style}>
      {children}
    </span>
  )
}

/** Extremo externo del subrayado (la etiqueta se extiende desde place.x hacia afuera) */
const under = (p: Place) => (p.align === 'right' ? p.x - p.W : p.x + p.W)
/** Guía sin cruces: baja al punto del subrayado más cercano al punto anatómico */
const leader = (px: number, py: number, p: Place) => {
  const a = Math.min(p.x, under(p))
  const b = Math.max(p.x, under(p))
  const tx = Math.min(b, Math.max(a, px))
  return `M${px} ${py} L${tx} ${p.y} M${a} ${p.y} L${b} ${p.y}`
}

function Layer({ a, w, h, i, on, place }: { a: Annotation; w: number; h: number; i: number; on: boolean; place?: Place }) {
  const calm = useReducedMotion()
  const X = (v: number) => (v / 100) * w
  const Y = (v: number) => (v / 100) * h
  const P = (p: Pt): [number, number] => [X(p[0]), Y(p[1])]
  const stroke = a.emphasis ? ACC : INK
  const dashed = 'dashed' in a && a.dashed
  const base = { fill: 'none', stroke, strokeWidth: a.emphasis ? 1.5 : 1, strokeDasharray: dashed ? '4 4' : undefined, strokeLinecap: 'round' as const }
  const delay = 0.25 + i * 0.07
  const draw = calm || dashed
    ? { initial: { opacity: 0 }, animate: { opacity: on ? 1 : 0 }, transition: { duration: 0.6, delay: on ? delay : 0 } }
    : { initial: { pathLength: 0, opacity: 0 }, animate: on ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }, transition: { duration: 1.1, ease: EASE, delay: on ? delay : 0 } }
  const fade = { initial: { opacity: 0 }, animate: { opacity: on ? 1 : 0 }, transition: { duration: 0.5, delay: on ? delay + 0.4 : 0 } }

  switch (a.type) {
    case 'hline':
      return (
        <>
          <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
            <motion.line x1={X(4)} x2={X(96)} y1={Y(a.y)} y2={Y(a.y)} {...base} strokeDasharray="2 5" {...draw} />
          </svg>
          <motion.div {...fade}>
            <Label x={X(4)} y={place?.y ?? Y(a.y)} maxW={place?.maxW}>
              {a.label}
            </Label>
          </motion.div>
        </>
      )
    case 'vline':
      return (
        <>
          <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
            <motion.line x1={X(a.x)} x2={X(a.x)} y1={Y(4)} y2={Y(96)} {...base} strokeDasharray="2 5" {...draw} />
          </svg>
          {a.label && (
            <motion.div {...fade}>
              <Label x={X(a.x) + 6} y={Y(8)}>{a.label}</Label>
            </motion.div>
          )}
        </>
      )
    case 'bracket': {
      const x = X(a.x)
      return (
        <>
          <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
            <motion.path d={`M${x - 6} ${Y(a.y1) + 2} H${x} V${Y(a.y2) - 2} H${x - 6}`} {...base} {...draw} />
          </svg>
          <motion.div {...fade}>
            {(() => {
              // El rótulo girado no puede ser más largo que su tramo (si no, se encima con el vecino)
              const seg = Y(a.y2) - Y(a.y1) - 6
              const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
              const basePx = Math.min(0.74 * rem, Math.max(0.56 * rem, 0.0066 * window.innerWidth))
              const perChar = 0.74 // ancho aprox. de un carácter mono + interletrado, en em
              let text = a.label
              let px = Math.min(basePx, seg / (text.length * perChar))
              if (px < basePx * 0.72) {
                text = text.slice(0, 3) + '.'
                px = Math.min(basePx, seg / (text.length * perChar))
              }
              return (
                <Label x={x + 12} y={(Y(a.y1) + Y(a.y2)) / 2} rotate emphasis={a.emphasis} fontPx={px}>
                  {text}
                </Label>
              )
            })()}
          </motion.div>
        </>
      )
    }
    case 'line':
      return (
        <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
          <motion.line x1={X(a.from[0])} y1={Y(a.from[1])} x2={X(a.to[0])} y2={Y(a.to[1])} {...base} {...draw} />
        </svg>
      )
    case 'ellipse':
      return (
        <>
          <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
            <motion.ellipse cx={X(a.c[0])} cy={Y(a.c[1])} rx={X(a.rx)} ry={Y(a.ry)} {...base} {...draw} />
          </svg>
          {a.label && place && (
            <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
              <motion.path d={leader(X(a.c[0] + (place.align === 'right' ? -a.rx : a.rx) * 0.7), Y(a.c[1] - a.ry * 0.7), place)} {...base} strokeDasharray={undefined} strokeWidth={0.9} {...draw} />
            </svg>
          )}
          {a.label && (
            <motion.div {...fade}>
              <Label x={place?.x ?? X(a.labelAt?.[0] ?? a.c[0])} y={place?.y ?? Y(a.labelAt?.[1] ?? a.c[1] - a.ry)} align={place?.align ?? 'center'} maxW={place?.maxW ? place.W : undefined} emphasis={a.emphasis}>
                {a.label}
              </Label>
            </motion.div>
          )}
        </>
      )
    case 'path':
      return (
        <>
          <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
            <motion.path d={smooth(a.d.map(P), a.closed)} {...base} {...draw} />
          </svg>
          {a.label && a.labelAt && (
            <motion.div {...fade}>
              <Label x={X(a.labelAt[0])} y={Y(a.labelAt[1])} emphasis={a.emphasis}>{a.label}</Label>
            </motion.div>
          )}
        </>
      )
    case 'callout': {
      const [px, py] = P(a.at)
      if (place?.num) {
        // Modo leyenda: número sobre el punto, texto numerado debajo del rostro (sin líneas cruzadas)
        return (
          <>
            <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
              <motion.circle cx={px} cy={py} r={9} fill="rgba(20,22,24,0.82)" stroke={stroke} strokeWidth={1} {...fade} />
              <motion.text x={px} y={py} textAnchor="middle" dominantBaseline="central" fill={stroke} fontSize={11} fontFamily="'Fragment Mono', monospace" {...fade}>
                {place.num}
              </motion.text>
            </svg>
            <motion.div {...fade}>
              {place.plate && (
                <div className="pointer-events-none absolute rounded-[3px] bg-[rgba(16,17,19,0.78)]" style={{ left: place.x - 7, top: place.y - (place.H ?? 16) - 5, width: place.W + 14, height: (place.H ?? 16) + 9 }} />
              )}
              <Label x={place.x} y={place.y} align="left" emphasis={a.emphasis} maxW={place.maxW ? place.W : undefined}>
                {`${place.num}  ${a.label}`}
              </Label>
            </motion.div>
          </>
        )
      }
      let d: string
      let lx: number
      let ly: number
      let align: 'left' | 'right'
      if (place) {
        // Etiqueta fuera del rostro: guía desde el punto hasta el extremo interno + subrayado
        lx = place.x
        ly = place.y
        align = place.align
        d = leader(px, py, place)
      } else {
        align = a.side === 'right' ? 'right' : 'left'
        ly = py + Y(a.dy ?? 0)
        lx = a.side === 'left' ? X(3) : X(97)
        const kx = align === 'left' ? Math.min(px - 14, lx + (px - lx) * 0.55) : Math.max(px + 14, px + (lx - px) * 0.45)
        d = `M${px} ${py} L${kx} ${ly} L${lx} ${ly}`
      }
      return (
        <>
          <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
            <motion.path d={d} {...base} strokeWidth={0.9} {...draw} />
            <motion.circle cx={px} cy={py} r={2.6} fill={stroke} {...fade} />
            <motion.circle cx={px} cy={py} r={6} fill="none" stroke={stroke} strokeWidth={0.75} {...fade} />
          </svg>
          <motion.div {...fade}>
            <Label x={lx} y={ly} align={align} emphasis={a.emphasis} maxW={place?.maxW ? place.W : undefined}>
              {a.label}
            </Label>
          </motion.div>
        </>
      )
    }
    case 'angle': {
      const [ax, ay] = P(a.a)
      const [vx, vy] = P(a.vertex)
      const [bx, by] = P(a.b)
      const r = Math.min(w, h) * 0.07
      const ang = (x: number, y: number) => Math.atan2(y - vy, x - vx)
      const a1 = ang(ax, ay)
      const a2 = ang(bx, by)
      const s = [vx + r * Math.cos(a1), vy + r * Math.sin(a1)]
      const e = [vx + r * Math.cos(a2), vy + r * Math.sin(a2)]
      return (
        <>
          <svg className="absolute inset-0 overflow-visible" width={w} height={h}>
            <motion.path d={`M${ax} ${ay} L${vx} ${vy} L${bx} ${by}`} {...base} {...draw} />
            <motion.path d={`M${s[0]} ${s[1]} A${r} ${r} 0 0 1 ${e[0]} ${e[1]}`} {...base} strokeWidth={1} {...draw} />
            <motion.circle cx={vx} cy={vy} r={2.6} fill={stroke} {...fade} />
            {place && (
              <motion.path
                d={leader(vx, vy, place)}
                {...base}
                strokeWidth={0.9}
                {...draw}
              />
            )}
          </svg>
          <motion.div {...fade}>
            <Label x={place?.x ?? X(97)} y={place?.y ?? vy + 4} align={place?.align ?? 'right'} emphasis={a.emphasis} maxW={place?.maxW ? place.W : undefined}>
              {a.label}
            </Label>
          </motion.div>
        </>
      )
    }
  }
}

/* "¿La página de esta foto llegó a la ventana de lectura?" — sin IntersectionObserver,
   que dentro de las páginas plegadas en 3D no siempre dispara. Se considera vista cuando
   su centro está en pantalla y su ancho proyectado es ≥ 60 % del real (página casi plana). */
function useSeen(ref: RefObject<HTMLElement | null>) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (seen) return
    const id = window.setInterval(() => {
      const el = ref.current
      if (!el || !el.offsetWidth) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      if (cx > 0 && cx < window.innerWidth && cy > 0 && cy < window.innerHeight && r.width >= el.offsetWidth * 0.6) setSeen(true)
    }, 250)
    return () => clearInterval(id)
  }, [ref, seen])
  return seen
}

function Overlay({ fig, visible }: { fig: FigureId; visible: Set<string> }) {
  const [ref, { w, h }] = useElementSize<HTMLDivElement>()
  const inView = useSeen(ref)
  const { calibrate } = usePresentation()
  const [cursor, setCursor] = useState<Pt | null>(null)
  const [copied, setCopied] = useState('')
  const f = figures[fig]
  // Recalcula la ubicación de etiquetas al cambiar el tamaño de la foto (página, hoja ampliada, móvil)
  // Se recalcula al cambiar tamaño/capas y cuando termina de cargar la tipografía real
  const [fontsTick, setFontsTick] = useState(0)
  useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => alive && setFontsTick((n) => n + 1))
    const on = () => alive && setFontsTick((n) => n + 1)
    document.fonts?.addEventListener?.('loadingdone', on)
    return () => {
      alive = false
      document.fonts?.removeEventListener?.('loadingdone', on)
    }
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { places, scale: labelScale } = useMemo(() => layoutLabels(f as Figure, visible, w, h), [f, visible, w, h, fontsTick])

  const rel = (e: MouseEvent): Pt => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    return [Math.round(((e.clientX - r.left) / r.width) * 1000) / 10, Math.round(((e.clientY - r.top) / r.height) * 1000) / 10]
  }

  return (
    <div ref={ref} style={{ ['--ls' as string]: labelScale }} className={`absolute inset-0 annot-shadow ${calibrate ? 'cursor-crosshair' : 'pointer-events-none'}`}
      onMouseMove={calibrate ? (e) => setCursor(rel(e)) : undefined}
      onMouseLeave={() => setCursor(null)}
      onClick={calibrate ? (e) => {
        e.stopPropagation()
        const p = rel(e)
        const txt = `[${p[0]}, ${p[1]}]`
        navigator.clipboard?.writeText(txt).catch(() => {})
        setCopied(txt)
      } : undefined}
    >
      {w > 0 && f.annotations.map((a, i) => <Layer key={a.id} a={a} w={w} h={h} i={i} on={inView && visible.has(a.layer)} place={places.get(a.id)} />)}
      {calibrate && (
        <>
          <div className="pointer-events-none absolute inset-0 border border-accent-2/70" />
          {cursor && (
            <>
              <div className="pointer-events-none absolute inset-y-0 w-px bg-accent-2/60" style={{ left: `${cursor[0]}%` }} />
              <div className="pointer-events-none absolute inset-x-0 h-px bg-accent-2/60" style={{ top: `${cursor[1]}%` }} />
            </>
          )}
          <div className="t-data pointer-events-none absolute bottom-2 right-2 rounded bg-ink/85 px-2 py-1 text-[0.93rem] text-annot">
            {cursor ? `[${cursor[0]}, ${cursor[1]}]` : 'Calibración'} {copied && `· copiado ${copied}`}
          </div>
        </>
      )}
    </div>
  )
}

interface Props extends Omit<PhotoProps, 'overlay' | 'guide'> {
  figure: FigureId
  showChips?: boolean
}

/** Fotografía + capas de anotación conmutables. */
export function AnnotatedPhoto({ figure, showChips = true, active, ...photo }: Props & { active?: string[] }) {
  const f = figures[figure]
  const [own, setVisible] = useState(() => new Set<string>(f.layers.map((l) => l.id)))
  const [override, setOverride] = useState(false)
  const activeKey = active?.join('|')
  // Cuando el relato (scroll) controla las capas, vuelve a tomar el control al cambiar de paso
  useEffect(() => setOverride(false), [activeKey])
  const visible = active && !override ? new Set(active) : own
  const toggle = (id: string) => {
    const n = new Set(visible)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    setVisible(n)
    setOverride(true)
  }
  const wrap = useRef<HTMLDivElement>(null)
  const stripMode = useStripMode()
  return (
    <div ref={wrap} className={photo.fill && stripMode === "h" ? "flex h-full min-h-0 flex-col" : undefined}>
      <Photo {...photo} guide={(f as Figure).guide} overlay={<Overlay fig={figure} visible={visible} />} />
      {showChips && f.layers.length > 0 && (
        <div className="mt-3 flex shrink-0 flex-wrap items-center gap-1.5" role="group" aria-label="Capas de anotación">
          <span className="t-label mr-1 text-[0.84rem] text-stone">Capas</span>
          <AnimatePresence initial={false}>
            {f.layers.map((l) => {
              const on = visible.has(l.id)
              return (
                <button
                  key={l.id}
                  onClick={() => toggle(l.id)}
                  aria-pressed={on}
                  className={`t-label flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.84rem] transition-colors duration-300 ${on ? 'border-ink bg-ink text-paper' : 'border-line text-stone hover:border-stone'}`}
                >
                  <span className={`size-1.5 rounded-full ${on ? 'bg-accent-2' : 'border border-stone-2'}`} />
                  {l.label}
                </button>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
