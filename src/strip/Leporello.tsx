import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { usePresentation } from '../lib/presentation'
import { StripModeCtx } from '../lib/strip'
import { hintStore, plan, type PlanSeg } from './plan'
import type { PanelDef } from './Strip'

/* ==========================================================================
   LEPORELLO — motor de libro plegado (implementación propia)
   Especificación y valores medidos en la referencia: ver MOTION.md
   ========================================================================== */

const D2R = Math.PI / 180
const TH_COVER = 46 * D2R // portada en reposo
const TH_R = 56 * D2R // páginas que esperan (pila derecha)
const TH_L = 80 * D2R // páginas ya leídas (pila izquierda)
export const DW = 560 // ancho de diseño de una página (px)
export const DH = 760 // alto de diseño de una página (px)
const WU = 2 // ventana de lectura: 2 unidades de página planas
const STEP = 0.8 // pantallas de scroll por unidad de página
const TAIL = 0.7 // tramo final para cerrar el libro
const PERSP = 2400
const TAU = 0.1 // inercia del progreso (s)
const SHEET_EASE = 'cubic-bezier(.2,.72,.1,1)'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const sstep = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))
const io = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const out = (t: number) => 1 - Math.pow(1 - t, 3)

type Mode = 'read' | 'anim' | 'back'
interface Tween {
  key: 'open' | 'shut' | 'book'
  from: number
  to: number
  dur: number
  t0: number
  ease: (t: number) => number
  done?: () => void
}

function useViewport() {
  const [v, setV] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useLayoutEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return v
}

const isInteractive = (el: EventTarget | null) => el instanceof Element && !!el.closest('button, a, input, video, [role="slider"], [role="tab"]')

export function Leporello({ panels, back }: { panels: PanelDef[]; back: () => ReactNode }) {
  const { w: vw, h: vh } = useViewport()
  const { presenting } = usePresentation()
  const headerH = presenting ? 0 : 64
  const N = panels.length

  /* ─── Geometría ──────────────────────────────────────────────────────── */
  const g = useMemo(() => {
    const margin = vw < 1100 ? 40 : 64
    // Página ≈ 70 % del alto (la referencia deja el libro "apoyado" con aire alrededor)
    const k = clamp(Math.min((vh * (presenting ? 0.76 : 0.65)) / DH, (vh - 172) / DH, (vw - 2 * margin - 40) / (WU * DW)), 0.5, 1.25)
    const pw = DW * k
    const ph = DH * k
    const s = panels.map((p) => p.u ?? 1)
    const U = [0]
    s.forEach((v, i) => U.push(U[i] + v))
    const umax = Math.max(0, U[N] - WU)
    const A = 1 + umax
    const j = A * STEP * vh
    const M = TAIL * vh
    const w = s.map((v) => v * pw)
    const sumW = w.reduce((a, b) => a + b, 0)
    // Reposo calibrado como la referencia (≈7 páginas en el 80 % del ancho)
    const firstRest = w.slice(1, 7).reduce((a, b) => a + b, 0)
    const cos0 = clamp((vw * 0.8 - w[0] * Math.cos(TH_COVER)) / Math.max(1, firstRest), 0.3, 0.8)
    const th0 = Math.acos(cos0)
    // Libro cerrado: el expediente entero cabe en un bloque compacto
    const thShut = Math.acos(clamp(Math.min(Math.cos(87 * D2R), (vw * 0.11) / sumW), 0.0005, 1))
    const thClose = Math.acos(clamp(Math.min(Math.cos(89.5 * D2R), 84 / sumW), 0.0002, 1))
    const bt = Math.max(16, sumW * Math.cos(thClose))
    const faceS = clamp((vh - 190) / ph, 1, 1.22)
    const top = (vh - ph) / 2 + (presenting ? 0 : 10)
    return { margin, k, pw, ph, s, U, umax, A, j, M, w, th0, thShut, thClose, bt, faceS, top }
  }, [vw, vh, presenting, panels, N])

  /* ─── Estado de animación (fuera de React) ───────────────────────────── */
  const S = useRef({ q: 0, qT: 0, open: 0, shut: 0, book: 0, mode: 'read' as Mode, hov: new Float32Array(N), hovV: new Float32Array(N), hovIdx: -1, intro: false, last: 0, raf: 0 })
  const tweens = useRef<Tween[]>([])
  const outer = useRef<HTMLDivElement>(null)
  const pages = useRef<(HTMLDivElement | null)[]>([])
  const bookEl = useRef<HTMLDivElement>(null)
  const trackEl = useRef<HTMLDivElement>(null)
  const [sheet, setSheet] = useState<{ i: number; from: DOMRect } | null>(null)
  const lastPlan = useRef('')
  if (import.meta.env.DEV) (window as unknown as { __lp: unknown }).__lp = { S, tweens }

  const readAngle = useCallback(
    (i: number, u: number) => {
      const left = u - g.U[i]
      if (left > 0) return TH_L * sstep(left / g.s[i])
      const right = g.U[i] + g.s[i] - (u + WU)
      if (right > 0) return TH_R * sstep(right / g.s[i])
      return 0
    },
    [g],
  )

  const apply = useCallback(() => {
    const st = S.current
    const sm = sstep(Math.min(1, st.q))
    const u = clamp(st.q - 1, 0, g.umax)
    const ang = new Array<number>(N)
    for (let i = 0; i < N; i++) {
      let a = (i === 0 ? TH_COVER : g.th0) * (1 - sm) + readAngle(i, u) * sm
      a = a * st.open + g.thShut * (1 - st.open)
      ang[i] = a + (g.thClose - a) * st.shut
    }
    const d = st.open * (1 - st.shut)
    const phi = ang.map((a, i) => (i % 2 ? -1 : 1) * a * (1 - 0.38 * st.hov[i] * d))

    // Bisagra de anclaje
    let p: number
    let m: number
    let h = 0
    if (st.q <= 1) {
      const E = ang.slice(0, 7).reduce((acc, a, i) => acc + g.w[i] * Math.cos(a), 0)
      p = 0
      m = Math.max(g.margin, (vw - E) / 2) * (1 - sm) + g.margin * sm
    } else {
      p = 1
      while (p < N && g.U[p] <= u + 1e-6) p++
      m = g.margin + (g.U[p] - u) * g.pw
    }
    if (st.shut > 0) {
      const cw = g.w.map((w) => w * Math.cos(g.thClose))
      const tot = cw.reduce((a, b) => a + b, 0)
      const hx = vw / 2 - tot / 2 + cw.slice(0, p).reduce((a, b) => a + b, 0)
      m = lerp(m, hx, st.shut)
      h = lerp(0, p % 2 ? -g.w[Math.min(p, N - 1)] * Math.sin(g.thClose) : 0, st.shut)
    }
    const hx = new Array<number>(N + 1)
    const hz = new Array<number>(N + 1)
    hx[p] = m
    hz[p] = h
    for (let e = p; e < N; e++) {
      hx[e + 1] = hx[e] + g.w[e] * Math.cos(phi[e])
      hz[e + 1] = hz[e] - g.w[e] * Math.sin(phi[e])
    }
    for (let e = p - 1; e >= 0; e--) {
      hx[e] = hx[e + 1] - g.w[e] * Math.cos(phi[e])
      hz[e] = hz[e + 1] + g.w[e] * Math.sin(phi[e])
    }

    const oc = vw / 2
    const proj = (x: number, z: number) => oc + ((x - oc) * PERSP) / (PERSP - z)
    for (let e = 0; e < N; e++) {
      const el = pages.current[e]
      if (!el) continue
      const a = proj(hx[e], hz[e])
      const b = proj(hx[e + 1], hz[e + 1])
      const off = Math.max(a, b) < -200 || Math.min(a, b) > vw + 200
      el.style.visibility = off ? 'hidden' : 'visible'
      if (off) continue
      el.style.transform = `translate3d(${hx[e].toFixed(2)}px,0,${hz[e].toFixed(2)}px) rotateY(${phi[e].toFixed(4)}rad)`
    }

    // Mapa cenital para el header
    const x0 = hx[0]
    const span = Math.max(1, Math.min(hx[N], vw * 1.6) - x0)
    const sc = Math.min(0.075, 180 / span)
    const ox = (190 - span * sc) / 2
    const segs: PlanSeg[] = []
    for (let e = 0; e < N; e++) {
      const xa = ox + (hx[e] - x0) * sc
      if (xa > 196) break
      segs.push([+xa.toFixed(1), +(12 + hz[e] * 0.03).toFixed(1), +(ox + (hx[e + 1] - x0) * sc).toFixed(1), +(12 + hz[e + 1] * 0.03).toFixed(1), Math.abs(phi[e]) < 8 * D2R])
    }
    const key = JSON.stringify(segs)
    if (key !== lastPlan.current) {
      lastPlan.current = key
      plan.emit(segs)
    }

    // Libro (contratapa)
    const be = bookEl.current
    if (be) {
      const t = st.book
      const e = 90 * (1 - t)
      const z = lerp((-g.pw * Math.sin(g.thClose)) / 2, 0, out(t))
      const l = lerp(1 / g.faceS, 1, io(t))
      be.style.transform = `translate3d(${(vw / 2 - (g.pw * g.faceS) / 2).toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${e.toFixed(3)}deg) scale(${l.toFixed(4)})`
    }

    // Pistas
    hintStore.set(
      st.mode === 'back' ? 'Desplazá hacia arriba o presioná Esc para reabrir el expediente' : st.open >= 1 && st.q < 0.04 ? 'Desplazar para desplegar' : st.q > g.A - 0.3 ? 'Seguí desplazando para cerrar el expediente' : '',
    )
  }, [g, N, vw, readAngle])

  /* ─── Bucle: inercia, resortes de hover y tweens ─────────────────────── */
  const tick = useCallback(
    (now: number) => {
      const st = S.current
      st.raf = 0
      const dt = Math.min(0.05, st.last ? (now - st.last) / 1000 : 1 / 60)
      st.last = now
      let active = false
      const r = st.qT - st.q
      if (Math.abs(r) > 5e-4) {
        st.q += r * (1 - Math.exp(-dt / TAU))
        active = true
      } else st.q = st.qT
      for (let i = 0; i < N; i++) {
        const target = i === st.hovIdx ? 1 : 0
        const acc = 100 * (target - st.hov[i]) - 20 * st.hovV[i]
        st.hovV[i] += acc * dt
        st.hov[i] += st.hovV[i] * dt
        if (Math.abs(target - st.hov[i]) > 0.001 || Math.abs(st.hovV[i]) > 0.001) active = true
        else {
          st.hov[i] = target
          st.hovV[i] = 0
        }
      }
      const finished: (() => void)[] = []
      tweens.current = tweens.current.filter((tw) => {
        const k = clamp((now - tw.t0) / tw.dur)
        st[tw.key] = lerp(tw.from, tw.to, tw.ease(k))
        if (k >= 1) {
          if (tw.done) finished.push(tw.done)
          return false
        }
        active = true
        return true
      })
      // Los encadenamientos (cerrar → girar libro) se agregan después de depurar la lista
      finished.forEach((f) => f())
      if (tweens.current.length) active = true
      apply()
      if (active) st.raf = requestAnimationFrame(tick)
      else st.last = 0
    },
    [apply, N],
  )
  const wake = useCallback(() => {
    if (!S.current.raf) S.current.raf = requestAnimationFrame(tick)
  }, [tick])
  const tween = useCallback(
    (key: Tween['key'], to: number, dur: number, ease: Tween['ease'], done?: () => void) => {
      tweens.current = tweens.current.filter((t) => t.key !== key)
      tweens.current.push({ key, from: S.current[key], to, dur, t0: performance.now(), ease, done })
      wake()
    },
    [wake],
  )

  /* ─── Cerrar / reabrir el libro ──────────────────────────────────────── */
  const showBook = (on: boolean) => {
    // opacity (no visibility): las páginas fijan su propia visibility y la heredada no las ocultaría
    if (trackEl.current) {
      trackEl.current.style.opacity = on ? '0' : '1'
      trackEl.current.style.pointerEvents = on ? 'none' : ''
    }
    if (bookEl.current) bookEl.current.style.visibility = on ? 'visible' : 'hidden'
  }
  const close = useCallback(() => {
    const st = S.current
    if (st.mode !== 'read') return
    st.mode = 'anim'
    st.hovIdx = -1
    tween('shut', 1, 560, io, () => {
      showBook(true)
      st.book = 0
      tween('book', 1, 820, out, () => {
        st.mode = 'back'
        apply()
      })
    })
  }, [tween, apply])
  const reopen = useCallback(() => {
    const st = S.current
    if (st.mode !== 'back') return
    st.mode = 'anim'
    tween('book', 0, 620, io, () => {
      showBook(false)
      const top = outer.current ? outer.current.getBoundingClientRect().top + window.scrollY : 0
      if (window.scrollY > top + g.j) window.scrollTo({ top: top + g.j - 2, behavior: 'instant' })
      tween('shut', 0, 680, out, () => {
        st.mode = 'read'
        apply()
      })
    })
  }, [tween, apply, g.j])

  /* ─── Scroll → progreso objetivo ─────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const el = outer.current
      if (!el) return
      const st = S.current
      const y = -el.getBoundingClientRect().top
      st.qT = clamp(y / g.j) * g.A
      if (st.qT > 0.001 && st.open < 1 && !st.intro) st.open = 1
      const tail = (y - g.j) / Math.max(1, g.M)
      if (st.mode === 'read' && tail > 0.28) close()
      else if (st.mode === 'back' && tail < 0.12) reopen()
      wake()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [g, close, reopen, wake])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && S.current.mode === 'back') reopen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reopen])

  /* ─── Apertura inicial: libro cerrado → zigzag de reposo ─────────────── */
  useEffect(() => {
    const st = S.current
    if (window.scrollY > 4) {
      st.open = 1
      wake()
      return
    }
    st.intro = true
    let id = 0
    const go = () => {
      id = window.setTimeout(() => tween('open', 1, 1800, out, () => (st.intro = false)), 250)
    }
    const fonts = document.fonts
    if (fonts?.ready) fonts.ready.then(go, go)
    else go()
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    apply()
  }, [apply])

  /* ─── Hover y clic ───────────────────────────────────────────────────── */
  const onEnter = (i: number) => {
    if (S.current.mode !== 'read') return
    S.current.hovIdx = i
    wake()
  }
  const onLeave = (i: number) => {
    if (S.current.hovIdx === i) S.current.hovIdx = -1
    wake()
  }
  const onClick = (i: number, e: MouseEvent) => {
    // Todas las páginas se pueden ampliar (modo diapositivas); los controles internos no disparan
    if (S.current.mode !== 'read' || isInteractive(e.target)) return
    const el = pages.current[i]
    if (el) setSheet({ i, from: el.getBoundingClientRect() })
  }

  /* ─── Paradas de navegación (marcadores invisibles en el flujo vertical) ─ */
  const stopFor = (i: number) => (i === 0 ? 0 : clamp((1 + Math.min(g.U[i], g.umax)) / g.A) * g.j)
  const height = g.j + g.M + vh
  /* Lleva el libro a la página i (al cerrar la vista ampliada en otra diapositiva) */
  const goTo = (i: number) => {
    const top = outer.current ? outer.current.getBoundingClientRect().top + window.scrollY : 0
    window.scrollTo({ top: top + stopFor(i), behavior: 'instant' })
  }

  return (
    <StripModeCtx.Provider value="h">
      <div ref={outer} className="relative" style={{ height }}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
          <div data-step data-section="cover" className="absolute h-px w-px" style={{ top: headerH }} />
          <div data-step className="absolute h-px w-px" style={{ top: g.j / g.A + headerH }} />
          {panels.map((p, i) =>
            i < 2 ? null : (
              <div key={p.key} id={p.anchor?.id} data-step data-section={p.anchor?.section} data-sub={p.anchor?.sub} className="absolute h-px w-px" style={{ top: stopFor(i) + headerH }} />
            ),
          )}
          {/* El ancla del capítulo 01 y su primera página caen en paradas ya listadas */}
        </div>

        <div className="lp-stage sticky top-0 h-[100svh] overflow-hidden" style={{ perspective: PERSP, perspectiveOrigin: '50% 48%' }}>
          <div ref={trackEl} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {panels.map((p, i) => (
              <div
                key={p.key}
                ref={(el) => {
                  pages.current[i] = el
                }}
                onPointerEnter={() => onEnter(i)}
                onPointerLeave={() => onLeave(i)}
                onClick={(e) => onClick(i, e)}
                className={`lp-page absolute left-0 ${p.tone === 'night' ? 'tone-night lp-dark' : p.tone === 'bare' ? 'lp-bare' : ''} ${i % 2 ? 'lp-even' : ''} cursor-pointer`}
                style={{ top: g.top, width: g.w[i] + 0.6, height: g.ph }}
              >
                <div className="lp-pg" style={{ width: g.s[i] * DW, height: DH, transform: `scale(${g.k})` }}>
                  {p.render()}
                </div>
                <div className="lp-shade" />
                <div className="lp-foot" />
              </div>
            ))}
          </div>

          {/* Libro cerrado: contratapa con canto */}
          <div ref={bookEl} className="lp-book absolute left-0" style={{ top: g.top - (g.ph * (g.faceS - 1)) / 2, width: g.pw * g.faceS, height: g.ph * g.faceS, visibility: 'hidden', ['--bt' as string]: `${Math.min(g.bt, 120)}px` }}>
            <div className="lp-face lp-face-back">
              <div className="lp-pg" style={{ width: DW, height: DH, transform: `scale(${(g.k * g.faceS).toFixed(4)})` }}>
                {back()}
              </div>
            </div>
            <div className="lp-face lp-face-front" />
            <i className="lp-edge lp-edge-l" />
            <i className="lp-edge lp-edge-r" />
            <i className="lp-edge lp-edge-t" />
            <i className="lp-edge lp-edge-b" />
            <div className="lp-foot" />
          </div>
        </div>
      </div>

      {sheet && <Sheet panels={panels} start={sheet.i} from={sheet.from} units={g.s} goTo={goTo} onClose={() => setSheet(null)} />}
    </StripModeCtx.Provider>
  )
}

/* ─── Vista ampliada = modo diapositivas ───────────────────────────────────
   · Se abre con FLIP desde la página tocada (620 ms, curva "sheet").
   · ← → / PgUp PgDn / Espacio / clicker pasan a la página anterior o siguiente
     con un fundido direccional, sin salir de la vista.
   · Al cerrar: si se volvió a la misma página, FLIP de regreso; si se navegó,
     el libro queda posicionado en la última página vista. */
export function Sheet({ panels, start, from, units, goTo, onClose }: { panels: PanelDef[]; start: number; from: DOMRect; units: number[]; goTo: (i: number) => void; onClose: () => void }) {
  const el = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const dir = useRef(0)
  const [cur, setCur] = useState(start)
  const N = panels.length
  const panel = panels[cur]
  const u = units[cur]
  const vw = window.innerWidth
  const vh = window.innerHeight
  const ks = Math.min((vh * 0.86) / DH, (vw * 0.9) / (u * DW))
  const W = u * DW * ks
  const H = DH * ks
  const left = (vw - W) / 2
  const top = (vh - H) / 2 - 12
  const fromT = `translate(${from.left - left}px,${from.top - top}px) scale(${from.width / W},${from.height / H})`

  useLayoutEffect(() => {
    document.body.dataset.lightbox = 'open'
    el.current?.animate([{ transform: fromT }, { transform: 'none' }], { duration: 620, easing: SHEET_EASE })
    scrim.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 620, easing: SHEET_EASE, fill: 'forwards' })
    return () => {
      delete document.body.dataset.lightbox
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cambio de diapositiva: fundido con leve desplazamiento en la dirección del avance
  useLayoutEffect(() => {
    if (!dir.current) return
    el.current?.animate([{ opacity: 0, transform: `translateX(${dir.current * 36}px)` }, { opacity: 1, transform: 'none' }], { duration: 420, easing: SHEET_EASE })
  }, [cur])

  const go = (d: number) => {
    const n = Math.min(N - 1, Math.max(0, cur + d))
    if (n === cur) return
    dir.current = d
    setCur(n)
  }

  const close = () => {
    if (closing.current) return
    closing.current = true
    scrim.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 560, easing: SHEET_EASE, fill: 'forwards' })
    const back = cur === start
    if (!back) goTo(cur)
    const frames = back
      ? [{ transform: 'none', opacity: 1, offset: 0 }, { opacity: 1, offset: 0.82 }, { transform: fromT, opacity: 0 }]
      : [{ transform: 'none', opacity: 1 }, { transform: 'scale(.96)', opacity: 0 }]
    const a = el.current?.animate(frames, { duration: 560, easing: SHEET_EASE, fill: 'forwards' })
    if (a) a.finished.then(onClose, onClose)
    else onClose()
  }

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      // El visor de fotos (si está abierto encima) maneja sus propias teclas
      if (document.querySelector('[aria-label="Visor de fotografía"]')) return
      const k = e.key
      if (k === 'Escape') close()
      else if (['ArrowRight', 'PageDown', 'ArrowDown'].includes(k) || (k === ' ' && !e.shiftKey)) go(1)
      else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(k) || (k === ' ' && e.shiftKey)) go(-1)
      else if (k === 'Home') go(-cur)
      else if (k === 'End') go(N - 1 - cur)
      else return
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', on, true)
    return () => window.removeEventListener('keydown', on, true)
  })

  const ctl = 'grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 text-[1.1rem] text-white backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-30'
  return createPortal(
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal aria-label="Página ampliada">
      <div ref={scrim} className="absolute inset-0 bg-[#17191a]/88 backdrop-blur-[3px]" onClick={close} style={{ opacity: 0 }} />
      <div
        ref={el}
        key={panel.key}
        className={`lp-page lp-sheet absolute overflow-hidden shadow-[0_40px_90px_-40px_rgba(0,0,0,.7)] ${panel.tone === 'night' ? 'tone-night lp-dark' : panel.tone === 'bare' ? 'lp-bare' : ''}`}
        style={{ left, top, width: W, height: H, transformOrigin: '0 0' }}
      >
        <div className="lp-pg" style={{ width: u * DW, height: DH, transform: `scale(${ks})` }}>
          <StripModeCtx.Provider value="h">{panel.render()}</StripModeCtx.Provider>
        </div>
      </div>

      {/* Controles de diapositiva */}
      <div className="t-label absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-5 text-[0.9rem] text-white/85">
        <button className={ctl} onClick={() => go(-1)} disabled={cur === 0} aria-label="Página anterior">
          ←
        </button>
        <span className="t-data min-w-[6.5rem] text-center text-[0.95rem]">
          <span className="text-white">{String(cur + 1).padStart(2, '0')}</span> / {N}
        </span>
        <button className={ctl} onClick={() => go(1)} disabled={cur === N - 1} aria-label="Página siguiente">
          →
        </button>
      </div>
      <button onClick={close} className="t-label absolute right-6 top-5 z-10 rounded-full border border-ink/40 bg-paper-2 px-4 py-2 text-[0.85rem] text-ink hover:border-ink">
        Cerrar · Esc
      </button>
    </div>,
    document.body,
  )
}
