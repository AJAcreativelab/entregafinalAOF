import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { usePresentation } from '../lib/presentation'
import type { LipoSession } from '../content/case'

/* Gráficos técnicos del expediente (dosis, técnicas, esquemas). Sólo representan
   datos documentados; los esquemas anatómicos están rotulados como tales. */

const EASE = [0.22, 1, 0.36, 1] as const
const MAX = 3 // ml — escala común a ambas sesiones

/* ─── Gráficos de dosis ─────────────────────────────────────────────────── */
export function DoseBars({ s }: { s: LipoSession }) {
  return (
    <div className="space-y-4">
      {s.doses.map((d, i) => (
        <div key={d.name}>
          <div className="mb-1.5 flex items-baseline justify-between text-[1.16rem]">
            <span>{d.name}</span>
            <span className="t-data text-[1.16rem]">{d.label}</span>
          </div>
          <div className="h-2 bg-paper-3">
            <motion.div
              className={`h-full origin-left ${i === 0 ? 'bg-ink' : 'bg-accent-2'}`}
              style={{ width: `${(d.ml / MAX) * 100}%` }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.12 }}
            />
          </div>
        </div>
      ))}
      <div className="t-label flex justify-between pt-1 text-[0.72rem] text-stone-2">
        {[0, 1, 2, 3].map((v) => (
          <span key={v}>{v} ml</span>
        ))}
      </div>
    </div>
  )
}

/** Esquema de distribución (no anatómico): papada central + jowls laterales.
 *  Volúmenes como esferas con luz y sombra, sobre un plano inclinado que oscila (3D por capas). */
export function DistributionMap({ s }: { s: LipoSession }) {
  const calm = useReducedMotion()
  const r = (ml: number) => 8 + ml * 9
  const [papada, jl, jr] = s.distribution
  const pts = [
    [120, 112, papada],
    [56, 72, jl],
    [184, 72, jr],
  ] as const
  const id = `dm${s.n}`
  const layer = (z: number, children: ReactNode) => (
    <svg viewBox="0 0 240 150" className="absolute inset-0 size-full overflow-visible" style={{ transform: `translateZ(${z}px)` }}>
      {children}
    </svg>
  )
  return (
    <div className="relative aspect-[240/150] w-full" style={{ perspective: 800 }} role="img" aria-label={`Distribución ${s.label}`}>
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateX: 18, rotateY: calm ? 0 : -10 }}
        animate={calm ? { rotateX: 18, rotateY: 0 } : { rotateX: 18, rotateY: [-10, 10] }}
        transition={calm ? { duration: 0 } : { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      >
        {/* Plano: contorno mandibular con flujo */}
        {layer(
          -30,
          <>
            <motion.path
              d="M30 16 Q34 74 76 100 Q120 124 164 100 Q206 74 210 16"
              fill="none"
              stroke="var(--color-stone-2)"
              strokeDasharray="3 4"
              initial={{ strokeDashoffset: 0 }}
              animate={calm ? {} : { strokeDashoffset: [0, -28] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
            />
            <path d="M92 114 L88 148 M148 114 L152 148" fill="none" stroke="var(--color-line)" />
          </>,
        )}
        {/* Sombras en el plano */}
        {layer(
          -18,
          pts.map(([cx, cy, z], i) => (
            <motion.ellipse
              key={z.zone}
              cx={cx}
              cy={cy + r(z.ml) + 4}
              rx={r(z.ml) * 0.9}
              ry={3}
              fill="var(--color-ink)"
              initial={{ opacity: 0.18 }}
              animate={calm ? {} : { opacity: [0.22, 0.1] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: i * 0.35 }}
            />
          )),
        )}
        {/* Volúmenes: esferas con luz */}
        {layer(
          10,
          <>
            <defs>
              <radialGradient id={`${id}-ink`} cx="0.35" cy="0.3" r="0.75">
                <stop offset="0" stopColor="#6b6f75" />
                <stop offset="0.55" stopColor="var(--color-ink)" />
                <stop offset="1" stopColor="#0d0e10" />
              </radialGradient>
              <radialGradient id={`${id}-acc`} cx="0.35" cy="0.3" r="0.75">
                <stop offset="0" stopColor="#ffe2b8" />
                <stop offset="0.55" stopColor="var(--color-accent-2)" />
                <stop offset="1" stopColor="#c9873f" />
              </radialGradient>
            </defs>
            {pts.map(([cx, cy, z], i) => (
              <motion.g
                key={z.zone}
                initial={{ y: 0 }}
                animate={calm ? {} : { y: [0, -4] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: i * 0.35 }}
              >
                {!calm && (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    fill="none"
                    stroke={i === 0 ? 'var(--color-ink)' : 'var(--color-accent-2)'}
                    initial={{ r: r(z.ml), opacity: 0.5 }}
                    animate={{ r: [r(z.ml), r(z.ml) + 12], opacity: [0.5, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 + i * 0.5 }}
                  />
                )}
                <circle cx={cx} cy={cy} r={r(z.ml)} fill={`url(#${id}-${i === 0 ? 'ink' : 'acc'})`} />
                <text x={cx} y={cy + 3.5} textAnchor="middle" className={`${i === 0 ? 'fill-paper' : 'fill-night'} font-mono text-[9px]`}>
                  {z.label}
                </text>
              </motion.g>
            ))}
          </>,
        )}
        {/* Rótulos al frente */}
        {layer(
          26,
          pts.map(([cx, cy, z], i) => (
            <text key={z.zone} x={cx} y={i === 0 ? cy - r(z.ml) - 7 : cy + r(z.ml) + 14} textAnchor="middle" className="fill-stone font-mono text-[7px] uppercase tracking-[0.14em]">
              {z.zone}
            </text>
          )),
        )}
      </motion.div>
    </div>
  )
}


export function SessionCard({ s }: { s: LipoSession }) {
  const { calibrate } = usePresentation()
  const sum = s.doses.reduce((a, d) => a + d.ml, 0)
  return (
    <div className="grid h-full gap-8 rounded-[3px] border border-ink bg-paper p-7 sm:grid-cols-2">
      <div className="flex flex-col">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-[3rem] leading-none">{s.label}</span>
          <span className="t-label text-[0.78rem] text-stone">0{s.n} / 02</span>
        </div>
        <div className="mt-7">
          <DoseBars s={s} />
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-ink pt-4">
          <span className="t-label text-[0.84rem] text-stone">Total aplicado</span>
          <span className="font-display text-[2.6rem] leading-none">{s.totalDocumented.label}</span>
        </div>
        {calibrate && Math.abs(sum - s.totalDocumented.ml) > 0.001 && (
          <div className="t-label mt-3 rounded bg-accent-soft px-3 py-2 text-[0.78rem] leading-relaxed text-accent">
            ⚑ Revisión: la suma de componentes ({String(sum).replace('.', ',')} ml) difiere del total documentado ({s.totalDocumented.label}).
          </div>
        )}
      </div>
      <div className="flex flex-col border-t border-line pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
        <div className="t-label mb-2 text-[0.78rem] text-stone">Distribución · esquema</div>
        <div className="my-auto">
          <DistributionMap s={s} />
        </div>
        <ul className="mt-4 space-y-1.5 text-[1.14rem]">
          {s.distribution.map((d) => (
            <li key={d.zone} className="flex justify-between border-t border-line pt-1.5">
              <span className="text-ink-2">{d.zone}</span>
              <span className="t-data">{d.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function TechniqueGlyph({ kind }: { kind: 'mallado' | 'abanico' }) {
  return (
    <svg viewBox="0 0 80 60" className="h-14 w-20 text-ink" aria-hidden>
      {kind === 'mallado'
        ? Array.from({ length: 4 }).flatMap((_, r) =>
            Array.from({ length: 5 }).map((_, c) => <circle key={`${r}${c}`} cx={10 + c * 15} cy={10 + r * 13} r={1.8} fill="currentColor" />),
          )
        : [-50, -25, 0, 25, 50].map((a) => (
            <line key={a} x1="40" y1="56" x2={40 + 46 * Math.sin((a * Math.PI) / 180)} y2={56 - 46 * Math.cos((a * Math.PI) / 180)} stroke="currentColor" strokeWidth="1" />
          ))}
      {kind === 'abanico' && <circle cx="40" cy="56" r="2.5" fill="var(--color-accent)" />}
    </svg>
  )
}

/** Jeringa con volumen (vidrio, émbolo y producto) que oscila en 3D; el producto
 *  se carga hasta la mitad documentada (½) y el émbolo acompaña. */
export function Syringe() {
  const calm = useReducedMotion()
  const FILL = 85 // ½ de 170
  const layer = (z: number, children: ReactNode) => (
    <svg viewBox="0 0 260 60" className="absolute inset-0 size-full overflow-visible" style={{ transform: `translateZ(${z}px)` }}>
      {children}
    </svg>
  )
  return (
    <div className="relative aspect-[260/60] w-full" style={{ perspective: 700 }} role="img" aria-label="Media jeringa">
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateX: 14, rotateY: calm ? 0 : -14 }}
        animate={calm ? { rotateX: 14, rotateY: 0 } : { rotateX: 14, rotateY: [-14, 14] }}
        transition={calm ? { duration: 0 } : { duration: 6.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      >
        {/* Sombra */}
        {layer(-24, <ellipse cx="130" cy="56" rx="112" ry="3.5" fill="currentColor" fillOpacity=".14" />)}
        {/* Cuerpo trasero del vidrio */}
        {layer(
          -8,
          <>
            <defs>
              <linearGradient id="syr-glass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity=".1" />
                <stop offset="0.5" stopColor="currentColor" stopOpacity=".02" />
                <stop offset="1" stopColor="currentColor" stopOpacity=".12" />
              </linearGradient>
            </defs>
            <rect x="40" y="18" width="170" height="24" rx="3" fill="url(#syr-glass)" stroke="currentColor" strokeOpacity=".35" />
          </>,
        )}
        {/* Producto + émbolo */}
        {layer(
          0,
          <>
            <defs>
              <linearGradient id="syr-fluid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffe2b8" />
                <stop offset="0.45" stopColor="var(--color-accent-2)" />
                <stop offset="1" stopColor="#c9873f" />
              </linearGradient>
            </defs>
            <motion.rect
              x="40"
              y="18"
              height="24"
              rx="3"
              fill="url(#syr-fluid)"
              initial={{ width: calm ? FILL : 0 }}
              animate={calm ? { width: FILL } : { width: [0, FILL, FILL] }}
              transition={calm ? { duration: 0 } : { duration: 5, times: [0, 0.45, 1], repeat: Infinity, ease: EASE }}
            />
            {!calm &&
              [0, 1, 2].map((k) => (
                <motion.circle
                  key={k}
                  r={1.4}
                  fill="#fff"
                  initial={{ cx: 48 + k * 22, cy: 38, opacity: 0 }}
                  animate={{ cy: [38, 22], opacity: [0, 0.7, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: 2.4 + k * 0.45, ease: 'easeOut' }}
                />
              ))}
            {/* Émbolo: avanza con la carga */}
            <motion.g initial={{ x: calm ? FILL : 0 }} animate={calm ? { x: FILL } : { x: [0, FILL, FILL] }} transition={calm ? { duration: 0 } : { duration: 5, times: [0, 0.45, 1], repeat: Infinity, ease: EASE }}>
              <rect x="38" y="19" width="4" height="22" rx="1" fill="currentColor" fillOpacity=".8" />
            </motion.g>
          </>,
        )}
        {/* Frente: brillo del vidrio, escala, aguja y rótulo */}
        {layer(
          10,
          <>
            <rect x="44" y="21" width="160" height="3" rx="1.5" fill="#fff" fillOpacity=".25" />
            <rect x="40" y="18" width="170" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={i} x1={40 + i * 17} x2={40 + i * 17} y1="42" y2={i % 5 === 0 ? 50 : 46} stroke="currentColor" strokeWidth="0.75" />
            ))}
            <path d="M210 22 H226 V38 H210 M226 30 H256 M14 14 V46 M14 30 H40" fill="none" stroke="currentColor" strokeWidth="1" />
            {!calm && (
              <motion.circle
                cx="257"
                cy="30"
                fill="var(--color-accent-2)"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: [0, 2.2, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.2 }}
              />
            )}
            <text x="125" y="12" textAnchor="middle" className="fill-current font-mono text-[8px] uppercase tracking-[0.18em]">
              ½ · 50%
            </text>
          </>,
        )}
      </motion.div>
    </div>
  )
}


/** Esquema técnico de perfil nasal: puntos de soporte documentados. */
/* Esquema nasal de perfil en capas con profundidad (3D por paralaje):
   el conjunto oscila suavemente en Y y cada capa vive a otra profundidad (translateZ).
   Es un ESQUEMA didáctico rotulado como tal: no representa medidas de la paciente. */
const NOSE = 'M40 14 Q46 30 50 40 Q66 72 92 100 Q104 114 96 122 Q86 128 74 126 L70 136 Q66 150 70 160'
const ALA = 'M74 126 Q64 118 68 108 Q74 102 84 108'
const TIP_DOWN = 'M50 40 Q66 72 92 100 Q104 114 96 122 Q86 128 74 126'
const TIP_UP = 'M50 40 Q67 70 95 95 Q109 107 100 118 Q89 125 74 126'
const DORSUM_HUMP = 'M44 26 Q50 36 54 44 Q62 50 64 60 Q74 80 92 100'
const DORSUM_FLAT = 'M44 26 Q50 36 54 44 Q60 52 64 60 Q74 80 92 100'

const LOOP = { duration: 3.6, repeat: Infinity, repeatType: 'reverse' as const, ease: [0.45, 0, 0.55, 1] as const }

function Layer({ z, children }: { z: number; children: ReactNode }) {
  return (
    <svg viewBox="0 0 160 170" className="absolute inset-0 size-full overflow-visible" style={{ transform: `translateZ(${z}px)` }}>
      {children}
    </svg>
  )
}

export function NoseScheme({ kind }: { kind: 'tip' | 'dorsum' }) {
  const calm = useReducedMotion()
  const ACC = 'var(--color-accent-2)'
  const label = 'fill-current font-mono text-[7.5px] uppercase tracking-[0.12em]'
  return (
    <div
      className="relative aspect-[16/17] h-full max-h-full max-w-full text-ink"
      style={{ perspective: 900 }}
      role="img"
      aria-label={kind === 'tip' ? 'Esquema: soporte en espina nasal / columela para elevar la punta' : 'Esquema: nivelación del dorso nasal'}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        initial={{ rotateY: calm ? 0 : -16, rotateX: 6 }}
        animate={calm ? { rotateY: 0, rotateX: 6 } : { rotateY: [-16, 16], rotateX: 6 }}
        transition={calm ? { duration: 0 } : { duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      >
        {/* Fondo: plano con retícula y sombra, lo más profundo */}
        <Layer z={-60}>
          <defs>
            <radialGradient id={`glow-${kind}`} cx="0.55" cy="0.6" r="0.55">
              <stop offset="0" stopColor="currentColor" stopOpacity=".16" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="160" height="170" fill={`url(#glow-${kind})`} />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`h${i}`} x1="8" x2="152" y1={18 + i * 18} y2={18 + i * 18} stroke="currentColor" strokeOpacity=".07" />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={`v${i}`} y1="10" y2="160" x1={8 + i * 18} x2={8 + i * 18} stroke="currentColor" strokeOpacity=".07" />
          ))}
          <ellipse cx="82" cy="164" rx="46" ry="4" fill="currentColor" fillOpacity=".12" />
        </Layer>

        {/* Extrusión: copias del perfil a distintas profundidades = volumen */}
        {[-36, -24, -12].map((z, i) => (
          <Layer key={z} z={z}>
            <path d={NOSE} fill="none" stroke="currentColor" strokeOpacity={0.08 + i * 0.06} strokeWidth="1" />
          </Layer>
        ))}

        {/* Perfil principal */}
        <Layer z={0}>
          {kind === 'tip' ? (
            <>
              <path d="M40 14 Q46 30 50 40" fill="none" stroke="currentColor" strokeOpacity=".75" strokeWidth="1.2" />
              <motion.path
                fill="none"
                stroke="currentColor"
                strokeOpacity=".9"
                strokeWidth="1.3"
                initial={{ d: TIP_DOWN }}
                animate={calm ? { d: TIP_UP } : { d: [TIP_DOWN, TIP_UP] }}
                transition={calm ? { duration: 0 } : LOOP}
              />
              <path d="M74 126 L70 136 Q66 150 70 160" fill="none" stroke="currentColor" strokeOpacity=".75" strokeWidth="1.2" />
              <path d={TIP_DOWN} fill="none" stroke="currentColor" strokeOpacity=".22" strokeDasharray="2 3" />
            </>
          ) : (
            <>
              <path d="M40 14 Q42 20 44 26" fill="none" stroke="currentColor" strokeOpacity=".75" strokeWidth="1.2" />
              <motion.path
                fill="none"
                stroke="currentColor"
                strokeOpacity=".9"
                strokeWidth="1.3"
                initial={{ d: DORSUM_HUMP }}
                animate={calm ? { d: DORSUM_FLAT } : { d: [DORSUM_HUMP, DORSUM_FLAT] }}
                transition={calm ? { duration: 0 } : LOOP}
              />
              <path d="M92 100 Q104 114 96 122 Q86 128 74 126 L70 136 Q66 150 70 160" fill="none" stroke="currentColor" strokeOpacity=".75" strokeWidth="1.2" />
            </>
          )}
          <path d={ALA} fill="none" stroke="currentColor" strokeOpacity=".45" />
        </Layer>

        {/* Producto (más cerca del observador) */}
        <Layer z={28}>
          {kind === 'tip' ? (
            <>
              <motion.circle
                cx="78"
                cy="124"
                fill={ACC}
                initial={{ r: 3, opacity: 0.6 }}
                animate={calm ? { r: 6, opacity: 1 } : { r: [3, 7], opacity: [0.6, 1] }}
                transition={calm ? { duration: 0 } : LOOP}
              />
              {!calm && (
                <motion.circle
                  cx="78"
                  cy="124"
                  fill="none"
                  stroke={ACC}
                  initial={{ r: 6, opacity: 0.8 }}
                  animate={{ r: [6, 16], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <motion.path
                d="M100 104 Q114 98 112 84"
                fill="none"
                stroke={ACC}
                strokeWidth="1.4"
                markerEnd="url(#arr3d)"
                initial={{ pathLength: 0 }}
                animate={calm ? { pathLength: 1 } : { pathLength: [0, 1] }}
                transition={calm ? { duration: 0 } : LOOP}
              />
            </>
          ) : (
            <>
              <line x1="44" y1="26" x2="92" y2="100" stroke="currentColor" strokeDasharray="3 3" strokeOpacity=".55" />
              <motion.path
                d="M50 37 Q55 44 58 50"
                fill="none"
                stroke={ACC}
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={calm ? { pathLength: 1, opacity: 0.95 } : { pathLength: [0, 1], opacity: [0.4, 0.95] }}
                transition={calm ? { duration: 0 } : LOOP}
              />
              <motion.path
                d="M62 58 Q66 66 70 72"
                fill="none"
                stroke={ACC}
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                animate={calm ? { pathLength: 1, opacity: 0.95 } : { pathLength: [0, 1], opacity: [0.4, 0.95] }}
                transition={calm ? { duration: 0 } : { ...LOOP, delay: 0.3 }}
              />
            </>
          )}
          <defs>
            <marker id="arr3d" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L6 3 L0 6 Z" fill={ACC} />
            </marker>
          </defs>
        </Layer>

        {/* Rótulos (la capa más cercana) */}
        <Layer z={48}>
          {kind === 'tip' ? (
            <>
              <path d="M104 112 L134 98" stroke="currentColor" strokeOpacity=".6" />
              <text x="120" y="94" className={label}>Punta</text>
              <path d="M80 128 L118 146" stroke="currentColor" strokeOpacity=".6" />
              <text x="84" y="158" className={label}>Espina / columela</text>
            </>
          ) : (
            <>
              <path d="M58 48 L98 30" stroke="currentColor" strokeOpacity=".6" />
              <text x="100" y="28" className={label}>Nivelación</text>
              <path d="M70 82 L104 92" stroke="currentColor" strokeOpacity=".45" />
              <text x="106" y="95" className={label}>Línea de</text>
              <text x="106" y="104" className={label}>referencia</text>
            </>
          )}
        </Layer>
      </motion.div>
    </div>
  )
}


/* Iconografía de historia clínica — trazo fino, sin relleno */
export const ICONS: Record<string, ReactNode> = {
  antecedentes: <path d="M4 20V5a1 1 0 0 1 1-1h10l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1ZM15 4v5h5M8 13h8M8 16.5h5" />,
  cirugias: <path d="M4 19 15.5 7.5a2.1 2.1 0 0 1 3 3L7 22H4v-3ZM13.5 9.5l3 3" />,
  medicacion: <path d="M9.2 4.8a4.2 4.2 0 0 1 6 6l-4.4 4.4a4.2 4.2 0 0 1-6-6ZM7 7l6 6" />,
  alergias: <path d="M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M5.6 18.4l2.5-2.5M15.9 8.1l2.5-2.5" />,
  previos: <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />,
}
