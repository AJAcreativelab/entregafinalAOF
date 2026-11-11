import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { AssetSlot } from '../content/assets'
import type { Figure } from '../content/types'
import { assetUrl, getSlot, useAsset } from '../lib/assets'
import { useElementSize } from '../lib/hooks'
import { useStripMode } from '../lib/strip'
import { Guide } from './Guides'
import { openLightbox } from './Lightbox'

const EASE = [0.22, 1, 0.36, 1] as const

export interface PhotoProps {
  id?: string
  /** Alternativa a `id`: slot definido fuera del manifiesto */
  slot?: AssetSlot
  tag?: string
  caption?: string
  guide?: Figure['guide']
  /** natural: respeta la proporción original · contain: marco fijo sin recortar */
  fit?: 'natural' | 'contain'
  ratio?: string
  className?: string
  priority?: boolean
  /** Ids del grupo para navegar en el visor ampliado */
  gallery?: string[]
  overlay?: ReactNode
  /** En la tira horizontal: ocupa el alto disponible del panel manteniendo la proporción exacta */
  fill?: boolean
  align?: 'start' | 'center'
}

const ratioOf = (r: string) => {
  const [a, b] = r.split('/').map((v) => parseFloat(v))
  return a / (b || 1)
}

/** Caja que contiene un rectángulo de proporción `ratio` dentro del espacio disponible (como object-fit: contain). */
export function FitBox({ ratio, active, align = 'center', className = '', children }: { ratio: string; active: boolean; align?: 'start' | 'center'; className?: string; children: (style: CSSProperties) => ReactNode }) {
  const [ref, { w, h }] = useElementSize<HTMLDivElement>()
  if (!active) return <>{children({ aspectRatio: ratio, width: '100%' })}</>
  const r = ratioOf(ratio)
  let fw = w
  let fh = w / r
  if (fh > h) {
    fh = h
    fw = h * r
  }
  return (
    <div ref={ref} className={`relative min-h-0 flex-1 ${className}`}>
      {children({ width: fw, height: fh, marginInline: align === 'center' ? 'auto' : undefined })}
    </div>
  )
}

function Corners() {
  const c = 'absolute size-3 border-annot/30'
  return (
    <>
      <span className={`${c} left-3 top-3 border-l border-t`} />
      <span className={`${c} right-3 top-3 border-r border-t`} />
      <span className={`${c} bottom-3 left-3 border-b border-l`} />
      <span className={`${c} bottom-3 right-3 border-b border-r`} />
    </>
  )
}

export function Placeholder({ slot, guide, compact }: { slot: AssetSlot; guide?: Figure['guide']; compact?: boolean }) {
  return (
    <div className="film-grid absolute inset-0 text-annot ring-1 ring-inset ring-annot/10">
      {guide && <Guide kind={guide} />}
      <Corners />
      <div className={`absolute inset-x-0 bottom-0 flex flex-col gap-1 ${compact ? 'p-3' : 'p-5'} bg-gradient-to-t from-film via-film/80 to-transparent pt-10`}>
        <span className="t-label flex items-center gap-2 text-[0.86rem] text-accent-2">
          <span className="size-1.5 animate-pulse rounded-full bg-accent-2" />
          {slot.kind === 'video' ? 'Video pendiente de carga' : 'Pendiente de carga'}
        </span>
        {!compact && <span className="text-[1.18rem] leading-snug text-annot/90">{slot.label}</span>}
        <span className="t-data truncate text-[0.86rem] text-annot/40" title={slot.src}>
          /public/{slot.src}
        </span>
      </div>
    </div>
  )
}

export function Photo({ id, slot: slotProp, tag, caption, guide, fit = 'natural', ratio, className = '', gallery, overlay, fill, align }: PhotoProps) {
  const slot = slotProp ?? getSlot(id!)!
  const st = useAsset(slot)
  const calm = useReducedMotion()
  const mode = useStripMode()
  const fillH = !!fill && mode === 'h'
  const ready = st.status === 'ready'
  const aspect = ready && fit === 'natural' && st.w && st.h ? `${st.w} / ${st.h}` : (ratio ?? slot.ratio)

  const open = () => {
    if (!ready) return
    if (!gallery || !id) return openLightbox([{ slot }])
    openLightbox(
      gallery.map((g) => ({ slot: getSlot(g)! })),
      Math.max(0, gallery.indexOf(id)),
    )
  }

  return (
    <figure className={`group relative ${fillH ? 'flex h-full min-h-0 flex-col' : ''} ${className}`}>
      <FitBox ratio={aspect} active={fillH} align={align}>
        {(style) => (
          /* Sin revelado por visibilidad: dentro de las páginas plegadas en 3D algunos navegadores
             nunca disparan IntersectionObserver (ni loading="lazy") y la foto quedaba en negro.
             La foto aparece con un fundido corto apenas carga — "el papel se mueve, la tinta no". */
          <div className="relative overflow-hidden bg-film" style={style}>
            {ready ? (
              <motion.button
                type="button"
                onClick={open}
                className="absolute inset-0 block cursor-zoom-in"
                aria-label={`Ampliar: ${slot.label}`}
                initial={calm ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <img
                  src={assetUrl(slot.src)}
                  alt={slot.label}
                  width={st.w}
                  height={st.h}
                  loading="eager"
                  decoding="async"
                  className={`size-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-[1.6s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.015]`}
                />
              </motion.button>
            ) : (
              <Placeholder slot={slot} guide={guide} />
            )}
            {overlay}
            {tag && <span className="t-label pointer-events-none absolute left-4 top-4 z-10 text-[0.86rem] text-annot/80 annot-shadow">{tag}</span>}
          </div>
        )}
      </FitBox>
      {caption && (
        <figcaption className="mt-3 flex shrink-0 items-baseline justify-between gap-4 text-[1.03rem] text-stone">
          <span>{caption}</span>
        </figcaption>
      )}
    </figure>
  )
}

export function Video({ id, tag, caption, className = '', fill, muted }: { id: string; tag?: string; caption?: string; className?: string; fill?: boolean; muted?: boolean }) {
  const slot = getSlot(id)!
  const st = useAsset(slot)
  const mode = useStripMode()
  const fillH = !!fill && mode === 'h'
  return (
    <figure className={`${fillH ? 'flex h-full min-h-0 flex-col' : ''} ${className}`}>
      <FitBox ratio={slot.ratio} active={fillH}>
        {(style) => (
          <div className="relative overflow-hidden bg-film" style={style}>
            {st.status === 'ready' ? (
              <video
                src={assetUrl(slot.src)}
                controls
                preload="metadata"
                playsInline
                muted={muted}
                // Sin audio: si alguien sube el volumen desde los controles, vuelve a silenciarse
                onVolumeChange={muted ? (e) => { if (!e.currentTarget.muted) e.currentTarget.muted = true } : undefined}
                controlsList={muted ? 'nodownload noplaybackrate' : undefined}
                className="size-full object-contain"
              />
            ) : (
              <>
                <Placeholder slot={slot} />
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="grid size-14 place-items-center rounded-full border border-annot/25">
                    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
                      <path d="M1 1 L13 8 L1 15 Z" fill="none" stroke="rgba(247,234,212,.5)" strokeWidth="1.2" />
                    </svg>
                  </span>
                </div>
              </>
            )}
            {tag && <span className="t-label pointer-events-none absolute left-4 top-4 text-[0.86rem] text-annot/80 annot-shadow">{tag}</span>}
          </div>
        )}
      </FitBox>
      {caption && <figcaption className="mt-3 shrink-0 text-[1.03rem] text-stone">{caption}</figcaption>}
    </figure>
  )
}

/**
 * Dos (o más) tomas del mismo gesto, reproducidas en paralelo y sincronizadas:
 * un solo play/pausa y una sola barra de tiempo mueven todas las tomas a la vez.
 * `clips` (opcional, por toma): tramos [inicio, fin] en segundos que se encadenan; sirve para
 * cortar las esperas de una toma y que cada movimiento caiga en el mismo instante en todas.
 * Siempre sin audio. `rotate` endereza tomas grabadas de costado (−90 = gira a la izquierda).
 */
export function SyncedVideos({ ids, tags, rotate = 0, ratio = '9 / 16', clips }: { ids: string[]; tags?: string[]; rotate?: number; ratio?: string; clips?: [number, number][][] }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([])
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [durs, setDurs] = useState<number[]>([])
  const mode = useStripMode()
  const sideways = Math.abs(rotate) % 180 === 90
  const listOf = (i: number): [number, number][] => clips?.[i] ?? [[0, durs[i] || 0]]
  const lenOf = (i: number) => listOf(i).reduce((s, [a, b]) => s + (b - a), 0)
  const total = ids.length ? Math.min(...ids.map((_, i) => lenOf(i))) : 0
  // Tiempo de la línea común → segundo exacto de cada toma
  const srcAt = (i: number, T: number) => {
    let acc = 0
    const list = listOf(i)
    for (const [a, b] of list) {
      if (T <= acc + (b - a)) return a + (T - acc)
      acc += b - a
    }
    const last = list[list.length - 1]
    return last ? last[1] : 0
  }
  // El reloj lo marca la toma con menos cortes (corre de corrido); las demás la siguen.
  // Solo se re-posiciona una toma al cruzar un corte o si se desfasa más de 0,3 s, y nunca
  // mientras todavía está buscando el cuadro (en 4K buscar en cada cuadro la trabaría).
  const masterIdx = ids.length ? ids.map((_, i) => listOf(i).length).reduce((best, n, i, arr) => (n < arr[best] ? i : best), 0) : 0
  const timeOf = (i: number, src: number) => {
    let acc = 0
    for (const [a, b] of listOf(i)) {
      if (src >= a - 0.02 && src <= b + 0.02) return acc + Math.min(b, Math.max(a, src)) - a
      acc += b - a
    }
    return 0
  }
  const place = (T: number, force = false) => {
    refs.current.forEach((v, i) => {
      if (!v) return
      const s = srcAt(i, T)
      if (force) {
        v.currentTime = s
        return
      }
      if (i === masterIdx || v.seeking) return
      if (Math.abs(v.currentTime - s) > 0.3) v.currentTime = s
    })
  }

  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      const m = refs.current[masterIdx]
      const T = m ? Math.min(total, timeOf(masterIdx, m.currentTime)) : 0
      setT(T)
      place(T)
      if (T >= total - 0.04 || (m && m.ended)) {
        refs.current.forEach((v) => v?.pause())
        setPlaying(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, total])

  const toggle = () => {
    if (playing) {
      refs.current.forEach((v) => v?.pause())
      setPlaying(false)
      return
    }
    const from = t >= total - 0.05 ? 0 : t
    place(from, true)
    refs.current.forEach((v) => {
      if (!v) return
      v.muted = true
      void v.play().catch(() => {})
    })
    setT(from)
    setPlaying(true)
  }
  const seek = (x: number) => {
    place(x, true)
    setT(x)
  }
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 grid-rows-1 gap-[2cqh]" style={{ gridTemplateColumns: `repeat(${ids.length}, minmax(0, 1fr))` }}>
        {ids.map((id, i) => (
          <SyncedFrame
            key={id}
            id={id}
            tag={tags?.[i]}
            ratio={ratio}
            fill={mode === 'h'}
            rotate={rotate}
            sideways={sideways}
            onRef={(el) => (refs.current[i] = el)}
            onMeta={(el) => {
              setDurs((d) => {
                const n = [...d]
                n[i] = el.duration || 0
                return n
              })
              el.currentTime = srcAt(i, 0)
            }}
            onClick={toggle}
          />
        ))}
      </div>
      <div className="mt-[1.6cqh] flex shrink-0 items-center gap-4">
        <button type="button" onClick={toggle} aria-label={playing ? 'Pausar ambas tomas' : 'Reproducir ambas tomas'} className="grid size-10 shrink-0 place-items-center rounded-full border border-annot/40 text-annot transition-colors hover:border-annot">
          {playing ? (
            <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden><path d="M2 1v12M10 1v12" stroke="currentColor" strokeWidth="2" /></svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden><path d="M1 1 L11 7 L1 13 Z" fill="currentColor" /></svg>
          )}
        </button>
        <input type="range" min={0} max={total || 0} step={0.01} value={Math.min(t, total || 0)} onChange={(e) => seek(parseFloat(e.target.value))} aria-label="Tiempo de ambas tomas" className="h-1 min-w-0 flex-1 cursor-pointer accent-[var(--color-accent,#c8794a)]" />
        <span className="t-label shrink-0 text-[0.8rem] text-annot/70">
          {fmt(t)} / {fmt(total)} · Sincronizado · Sin audio
        </span>
      </div>
    </div>
  )
}

function SyncedFrame({ id, tag, ratio, fill, rotate, sideways, onRef, onMeta, onClick }: { id: string; tag?: string; ratio: string; fill: boolean; rotate: number; sideways: boolean; onRef: (el: HTMLVideoElement | null) => void; onMeta: (el: HTMLVideoElement) => void; onClick: () => void }) {
  const slot = getSlot(id)!
  const st = useAsset(slot)
  return (
    <figure className={fill ? 'flex h-full min-h-0 flex-col' : ''}>
      <FitBox ratio={ratio} active={fill}>
        {(style) => (
          <div className="relative overflow-hidden bg-film [container-type:size]" style={style}>
            {st.status === 'ready' ? (
              <video
                ref={onRef}
                src={assetUrl(slot.src)}
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={(e) => onMeta(e.currentTarget)}
                onVolumeChange={(e) => {
                  if (!e.currentTarget.muted) e.currentTarget.muted = true
                }}
                onClick={onClick}
                className="absolute left-1/2 top-1/2 max-w-none cursor-pointer object-cover"
                style={{
                  width: sideways ? '100cqh' : '100cqw',
                  height: sideways ? '100cqw' : '100cqh',
                  transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                }}
              />
            ) : (
              <Placeholder slot={slot} />
            )}
            {tag && <span className="t-label pointer-events-none absolute left-4 top-4 text-[0.86rem] text-annot/80 annot-shadow">{tag}</span>}
          </div>
        )}
      </FitBox>
    </figure>
  )
}
