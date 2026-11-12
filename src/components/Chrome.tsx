import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sections } from '../config/navigation'
import { useInventory } from '../lib/assets'
import { usePresentation } from '../lib/presentation'
import { hintStore, plan } from '../strip/plan'

/** Mapa cenital en vivo del libro: cada segmento es una página vista desde arriba. */
export function BookPlan({ className = '' }: { className?: string }) {
  const flat = useRef<SVGPathElement>(null)
  const fold = useRef<SVGPathElement>(null)
  useEffect(
    () =>
      plan.on((segs) => {
        const d = (f: boolean) =>
          segs
            .filter((x) => x[4] === f)
            .map((x) => `M${x[0]} ${x[1]}L${x[2]} ${x[3]}`)
            .join('')
        flat.current?.setAttribute('d', d(true))
        fold.current?.setAttribute('d', d(false))
      }),
    [],
  )
  return (
    <svg width="190" height="24" viewBox="0 0 190 24" className={`overflow-visible ${className}`} aria-hidden>
      <path ref={fold} fill="none" stroke="currentColor" strokeOpacity=".45" strokeWidth="1" strokeLinecap="round" />
      <path ref={flat} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Barra inferior fija: rótulo del capítulo · pista central · avance. */
export function ProgressRail() {
  const { scrollYProgress } = useScroll()
  const [p, setP] = useState(0)
  const [hint, setHint] = useState('')
  useMotionValueEvent(scrollYProgress, 'change', setP)
  useEffect(() => hintStore.on(setHint), [])
  const { active, presenting, next, prev } = usePresentation()
  const cur = sections.find((s) => s.id === active)

  return (
    <div className="tone-stage pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden lg:block">
      <div className="wrap flex h-14 items-center justify-between">
        <div className="t-label w-80 text-[0.7rem] text-stone">
          <AnimatePresence mode="wait">
            <motion.span key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45, ease: [0.2, 0.72, 0.1, 1] }} className="block">
              {cur ? (
                <>
                  <span className="text-ink">{cur.n}</span> — {cur.title}
                </>
              ) : (
                'Expediente clínico'
              )}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="t-label text-[0.73rem] text-ink transition-opacity duration-500" style={{ opacity: hint ? 1 : 0 }}>
          {hint || '·'}
        </span>
        <div className="pointer-events-auto t-label flex min-w-80 items-center justify-end gap-4 whitespace-nowrap text-[0.7rem] text-stone">
          <span className="mr-3 text-[0.56rem] tracking-[0.1em] text-stone-2 opacity-60">Web desarrollada por @ajacreativelab — Lab Creativo</span>
          {presenting && <span className="text-accent">● Presentando</span>}
          <button onClick={prev} aria-label="Anterior" className="px-1 text-[0.94rem] hover:text-ink">←</button>
          <span className="t-data text-[0.78rem]">{String(Math.round(p * 100)).padStart(3, '0')}%</span>
          <button onClick={next} aria-label="Siguiente" className="px-1 text-[0.94rem] hover:text-ink">→</button>
        </div>
      </div>
    </div>
  )
}

const SHORTCUTS: [string, string][] = [
  ['→  ·  PgDn', 'Siguiente bloque'],
  ['←  ·  PgUp', 'Bloque anterior'],
  ['↓ ↑ · Espacio', 'Avanzar / retroceder (modo presentación)'],
  ['1 – 8', 'Saltar a capítulo'],
  ['0 · Inicio', 'Volver a la portada'],
  ['P', 'Modo presentación'],
  ['F', 'Pantalla completa'],
  ['C', 'Calibrar anotaciones sobre fotos'],
  ['I', 'Inventario de fotografías y videos'],
  ['Esc', 'Cerrar / salir'],
]

export function HelpOverlay() {
  const { help, toggleHelp } = usePresentation()
  return (
    <AnimatePresence>
      {help && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-ink/30 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleHelp}>
          <motion.div initial={{ y: 16 }} animate={{ y: 0 }} className="w-full max-w-md rounded-[4px] border border-line bg-paper p-7" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-baseline justify-between border-b border-line pb-4">
              <span className="font-display text-[1.8rem] leading-none">Atajos</span>
              <span className="t-label text-[0.7rem] text-stone">Exposición guiada</span>
            </div>
            <dl className="grid grid-cols-[8.5rem_1fr] gap-y-2.5 text-[0.99rem]">
              {SHORTCUTS.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="t-data text-[0.94rem] text-ink">{k}</dt>
                  <dd className="text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Inventario: qué fotografías/videos están cargados y cuáles faltan. */
export function InventoryPanel() {
  const { inventory, toggleInventory } = usePresentation()
  return <AnimatePresence>{inventory && <InventoryInner onClose={toggleInventory} />}</AnimatePresence>
}

function InventoryInner({ onClose }: { onClose: () => void }) {
  const list = useInventory()
  const ready = list.filter((i) => i.state.status === 'ready').length
  return (
    <motion.aside
      className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-lg flex-col border-l border-line bg-paper"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-baseline justify-between border-b border-line px-6 py-5">
        <div>
          <div className="font-display text-[1.7rem] leading-none">Inventario de assets</div>
          <div className="t-label pt-2 text-[0.7rem] text-stone">
            {ready} cargados · {list.length - ready} pendientes · carpeta /public/assets
          </div>
        </div>
        <button className="t-label text-[0.75rem]" onClick={onClose}>
          Cerrar · I
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto px-6 py-3">
        {list.map(({ slot, state }) => (
          <li key={slot.id} className="flex items-start gap-3 border-b border-line/70 py-2.5">
            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${state.status === 'ready' ? 'bg-ink' : state.status === 'loading' ? 'bg-stone-2' : 'border border-accent'}`} />
            <span className="min-w-0 flex-1">
              <span className="block text-[0.95rem] text-ink">{slot.label}</span>
              <span className="t-data block truncate text-[0.83rem] text-stone">{slot.src}</span>
            </span>
            <span className="t-label shrink-0 pt-1 text-[0.68rem] text-stone">{state.status === 'ready' ? 'OK' : slot.kind === 'video' ? 'Video' : 'Pendiente'}</span>
          </li>
        ))}
      </ul>
    </motion.aside>
  )
}
