import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useSyncExternalStore } from 'react'
import type { AssetSlot } from '../content/assets'
import { assetUrl } from '../lib/assets'

/* Visor ampliado global: cualquier fotografía cargada puede abrirse aquí. */

type Item = { slot: AssetSlot; caption?: string }
let state: { items: Item[]; index: number } | null = null
const subs = new Set<() => void>()
const emit = () => subs.forEach((s) => s())

export function openLightbox(items: Item[], index = 0) {
  state = { items, index }
  document.body.dataset.lightbox = 'open'
  emit()
}
function close() {
  state = null
  delete document.body.dataset.lightbox
  emit()
}
function step(d: number) {
  if (!state) return
  state = { ...state, index: (state.index + d + state.items.length) % state.items.length }
  emit()
}

export function Lightbox() {
  const s = useSyncExternalStore(
    (cb) => {
      subs.add(cb)
      return () => subs.delete(cb)
    },
    () => state,
  )

  useEffect(() => {
    if (!s) return
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (['ArrowRight', 'PageDown', 'ArrowDown', ' '].includes(e.key)) step(1)
      if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) step(-1)
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', on, true)
    return () => window.removeEventListener('keydown', on, true)
  }, [s])

  const item = s?.items[s.index]
  return (
    <AnimatePresence>
      {s && item && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col bg-[#171614]/96 text-annot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={close}
          role="dialog"
          aria-modal
          aria-label="Visor de fotografía"
        >
          <div className="flex items-center justify-between px-6 py-4 t-label text-annot/70">
            <span>
              {String(s.index + 1).padStart(2, '0')} / {String(s.items.length).padStart(2, '0')} · {item.caption ?? item.slot.label}
            </span>
            <button className="t-label text-annot/80 hover:text-annot" onClick={close}>
              Cerrar · Esc
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 pb-10">
            <AnimatePresence mode="wait">
              {item.slot.kind === 'video' ? (
                <motion.video key={item.slot.id} src={assetUrl(item.slot.src)} controls autoPlay className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()} />
              ) : (
                <motion.img
                  key={item.slot.id}
                  src={assetUrl(item.slot.src)}
                  alt={item.slot.label}
                  className="max-h-full max-w-full object-contain"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </AnimatePresence>
            {s.items.length > 1 && (
              <>
                <button aria-label="Anterior" onClick={(e) => (e.stopPropagation(), step(-1))} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 t-label text-annot/60 hover:text-annot">
                  ←
                </button>
                <button aria-label="Siguiente" onClick={(e) => (e.stopPropagation(), step(1))} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 t-label text-annot/60 hover:text-annot">
                  →
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
