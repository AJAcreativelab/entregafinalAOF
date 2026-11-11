import { motion, useInView, useReducedMotion, animate, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import type { AssetSlot } from '../content/assets'
import { assetUrl, useAsset } from '../lib/assets'
import { useStripMode } from '../lib/strip'
import { openLightbox } from './Lightbox'
import { FitBox, Placeholder } from './Media'

/* Comparativa antes/después.
   Ambas fotos comparten EXACTAMENTE el mismo marco (proporción de la foto "antes"),
   de modo que el encuadre y el tamaño son idénticos durante la comparación. */

export function CompareSlider({ before, after, labels = ['Antes', 'Después'], ratio = '4 / 5', className = '', fill }: { before: AssetSlot; after: AssetSlot; labels?: [string, string]; ratio?: string; className?: string; fill?: boolean }) {
  const mode = useStripMode()
  const b = useAsset(before)
  const a = useAsset(after)
  const calm = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box, { once: true, amount: 0.5 })
  const pos = useMotionValue(50)
  const [val, setVal] = useState(50)
  useMotionValueEvent(pos, 'change', (v) => setVal(Math.round(v)))
  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`)
  const left = useTransform(pos, (v) => `${v}%`)
  const dragging = useRef(false)
  // Toque corto (sin arrastrar) = ampliar, igual que las demás fotos; arrastrar = comparar
  const down = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const ready = b.status === 'ready' && a.status === 'ready'

  const aspect = b.status === 'ready' && b.w && b.h ? `${b.w} / ${b.h}` : ratio

  /* Gesto inicial: insinúa la interacción al entrar en pantalla */
  useEffect(() => {
    if (!inView || calm) return
    const c = animate(pos, [50, 62, 38, 50], { duration: 2.2, ease: 'easeInOut', delay: 0.4 })
    return () => c.stop()
  }, [inView, calm, pos])

  const setFrom = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    pos.set(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)))
  }

  const fillH = !!fill && mode === 'h'
  return (
    <div className={`${fillH ? 'flex h-full min-h-0 flex-col' : ''} ${className}`}>
      <FitBox ratio={aspect} active={fillH}>
      {(style) => (
      <div
        ref={box}
        className={`group relative touch-none select-none overflow-hidden bg-film ${ready ? 'cursor-zoom-in' : ''}`}
        style={style}
        onPointerDown={(e) => {
          dragging.current = true
          down.current = { x: e.clientX, y: e.clientY, moved: false }
          ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return
          const d = down.current
          if (d && !d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) d.moved = true
          if (d?.moved) setFrom(e)
        }}
        onPointerUp={(e) => {
          dragging.current = false
          const d = down.current
          down.current = null
          if (!d || d.moved || !ready) return
          if ((e.target as HTMLElement).closest('[role="slider"]')) return
          // En el libro, el toque abre la página al frente (como todas); ya al frente, amplía la foto
          if (!box.current!.closest('.lp-sheet')) return
          const r = box.current!.getBoundingClientRect()
          const side = ((e.clientX - r.left) / r.width) * 100 < pos.get() ? 0 : 1
          openLightbox([{ slot: before }, { slot: after }], side)
        }}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* DESPUÉS (base) */}
        <div className="absolute inset-0">
          {a.status === 'ready' ? <img src={assetUrl(after.src)} alt={after.label} className="size-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.015]" draggable={false} loading="eager" /> : <Placeholder slot={after} compact />}
        </div>
        {/* ANTES (recortado) */}
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          {b.status === 'ready' ? (
            <img src={assetUrl(before.src)} alt={before.label} className="size-full object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.015]" draggable={false} loading="eager" />
          ) : (
            <div className="absolute inset-0 bg-film-2">
              <Placeholder slot={before} compact />
            </div>
          )}
        </motion.div>

        <span className="t-label pointer-events-none absolute left-4 top-4 text-[0.86rem] text-annot annot-shadow">{labels[0]}</span>
        <span className="t-label pointer-events-none absolute right-4 top-4 text-[0.86rem] text-annot annot-shadow">{labels[1]}</span>

        {/* Manija */}
        <motion.div className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-annot/90" style={{ left }}>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Comparar antes y después"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={val}
            onKeyDown={(e) => {
              const d = e.shiftKey ? 10 : 2
              if (e.key === 'ArrowLeft') pos.set(Math.max(0, pos.get() - d))
              if (e.key === 'ArrowRight') pos.set(Math.min(100, pos.get() + d))
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border border-annot/80 bg-ink/35 backdrop-blur-sm"
          >
            <svg width="18" height="10" viewBox="0 0 18 10" aria-hidden>
              <path d="M5 1 L1 5 L5 9 M13 1 L17 5 L13 9" fill="none" stroke="#F7EAD4" strokeWidth="1.2" />
            </svg>
          </div>
        </motion.div>
      </div>
      )}
      </FitBox>
      <div className="mt-3 flex shrink-0 items-center justify-between t-label text-[0.84rem] text-stone">
        <span>{before.src.split('/').pop()}</span>
        <span className="t-data">{String(val).padStart(2, '0')} / 100</span>
        <span>{after.src.split('/').pop()}</span>
      </div>
    </div>
  )
}
