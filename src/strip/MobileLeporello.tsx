import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { StripModeCtx } from '../lib/strip'
import { DH, DW, Sheet } from './Leporello'
import type { PanelDef } from './Strip'

/* ==========================================================================
   ACORDEÓN MÓVIL — una página por vez, plegada en 3D al desplazarse.
   · El scroll vertical avanza el libro: la página actual se pliega hacia la
     izquierda (bisagra en su canto izquierdo) mientras la siguiente se
     despliega desde la derecha (bisagra en su canto derecho) → zigzag.
   · Misma luz/sombra de papel que el escritorio (lp-page / lp-shade).
   · Tocar la página la abre como diapositiva (misma vista ampliada).
   ========================================================================== */

const STEP = 0.72 // pantallas de scroll por página
const TAU = 0.09 // inercia del progreso (s)
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const isInteractive = (el: EventTarget | null) => el instanceof Element && !!el.closest('button, a, input, video, [role="slider"], [role="tab"]')

function useViewport() {
  const [v, setV] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useLayoutEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return v
}

export function MobileLeporello({ panels, back }: { panels: PanelDef[]; back: () => ReactNode }) {
  const { w: vw, h: vh } = useViewport()
  const all: PanelDef[] = [...panels, { key: '__back', u: 1, tone: 'night', fixed: true, render: back }]
  const N = all.length
  const headerH = 64
  const step = vh * STEP
  const units = all.map((p) => p.u ?? 1)
  const land = vw > vh
  const chrome = land ? 44 : 96
  const geo = units.map((u) => {
    const k = Math.min((vw - 28) / (u * DW), (vh - headerH - chrome) / DH)
    return { k, w: u * DW * k, h: DH * k }
  })

  const outer = useRef<HTMLDivElement>(null)
  const pages = useRef<(HTMLDivElement | null)[]>([])
  const shades = useRef<(HTMLDivElement | null)[]>([])
  const prog = useRef({ p: 0, target: 0, last: 0 })
  const [cur, setCur] = useState(0)
  const [sheet, setSheet] = useState<{ i: number; from: DOMRect } | null>(null)

  // Bucle: progreso con inercia → transformaciones del pliegue
  useEffect(() => {
    let raf = 0
    const readTarget = () => {
      const top = outer.current ? outer.current.getBoundingClientRect().top + window.scrollY : 0
      prog.current.target = clamp((window.scrollY - top) / step, 0, N - 1)
    }
    const apply = (p: number) => {
      for (let i = 0; i < N; i++) {
        const el = pages.current[i]
        const sh = shades.current[i]
        if (!el) continue
        const d = i - p
        if (d <= -1 || d >= 1) {
          el.style.visibility = 'hidden'
          continue
        }
        el.style.visibility = 'visible'
        let t: string
        let shade: number
        if (d <= 0) {
          // sale: se pliega hacia la izquierda sobre su canto izquierdo
          const a = -d * 92
          el.style.transformOrigin = '0% 50%'
          t = `translate3d(0,0,${d * 40}px) rotateY(${a}deg)`
          shade = -d * 0.75
          el.style.zIndex = '2'
        } else {
          // entra: se despliega desde la derecha sobre su canto derecho
          const a = -d * 92
          el.style.transformOrigin = '100% 50%'
          t = `translate3d(0,0,${-d * 40}px) rotateY(${a}deg)`
          shade = d * 0.75
          el.style.zIndex = '1'
        }
        el.style.transform = t
        if (sh) sh.style.opacity = String(shade)
      }
    }
    const tick = (now: number) => {
      const s = prog.current
      const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0.016
      s.last = now
      readTarget()
      s.p += (s.target - s.p) * (1 - Math.exp(-dt / TAU))
      if (Math.abs(s.target - s.p) < 0.0005) s.p = s.target
      apply(s.p)
      const c = Math.round(s.p)
      setCur((old) => (old === c ? old : c))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [N, step])

  const goTo = (i: number) => {
    const top = outer.current ? outer.current.getBoundingClientRect().top + window.scrollY : 0
    window.scrollTo({ top: top + i * step, behavior: 'instant' })
  }
  const onClick = (i: number, e: MouseEvent) => {
    if (i !== cur || i >= panels.length || isInteractive(e.target)) return
    const el = pages.current[i]
    if (el) setSheet({ i, from: el.getBoundingClientRect() })
  }

  return (
    <StripModeCtx.Provider value="h">
      <div ref={outer} className="relative" style={{ height: (N - 1) * step + vh }}>
        {/* Marcadores invisibles: navegación por capítulos y modo presentación */}
        {all.map((p, i) => (
          <div
            key={`m-${p.key}`}
            id={p.anchor?.id}
            data-step
            data-section={i === 0 ? 'cover' : p.anchor?.section}
            data-sub={p.anchor?.sub}
            className="pointer-events-none absolute h-px w-px"
            style={{ top: i * step + headerH }}
          />
        ))}

        <div className="lp-stage sticky top-0 h-[100svh] overflow-hidden" style={{ perspective: 1100, perspectiveOrigin: '50% 50%' }}>
          <div className="pointer-events-none absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {all.map((p, i) => {
              const g = geo[i]
              const near = Math.abs(i - cur) <= 2
              return (
                <div
                  key={p.key}
                  ref={(el) => {
                    pages.current[i] = el
                  }}
                  onClick={(e) => onClick(i, e)}
                  className={`lp-page pointer-events-auto absolute ${p.tone === 'night' ? 'tone-night lp-dark' : p.tone === 'bare' ? 'lp-bare' : ''} ${i % 2 ? 'lp-even' : ''}`}
                  style={{
                    left: (vw - g.w) / 2,
                    top: headerH + (vh - headerH - (land ? 28 : 56) - g.h) / 2,
                    width: g.w,
                    height: g.h,
                    visibility: 'hidden',
                    boxShadow: '0 30px 60px -30px rgba(0,0,0,.6)',
                  }}
                >
                  {near && (
                    <div className="lp-pg" style={{ width: units[i] * DW, height: DH, transform: `scale(${g.k})` }}>
                      {p.render()}
                    </div>
                  )}
                  <div className="lp-shade" />
                  <div
                    ref={(el) => {
                      shades.current[i] = el
                    }}
                    className="pointer-events-none absolute inset-0 bg-black"
                    style={{ opacity: 0 }}
                  />
                </div>
              )
            })}
          </div>

          {/* Pie: avance y gesto */}
          <div className="t-label pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 whitespace-nowrap px-5 pb-[max(14px,env(safe-area-inset-bottom))] text-[0.72rem] text-stone-2">
            <span>
              {String(Math.min(cur + 1, N)).padStart(2, '0')} / {String(N).padStart(2, '0')}
            </span>
            <span>{cur >= panels.length ? 'Fin' : !land && units[cur] >= 1.5 ? '↻ Girá el teléfono' : 'Deslizá · tocá para ampliar'}</span>
          </div>
        </div>
      </div>

      {sheet && <Sheet panels={panels} start={sheet.i} from={sheet.from} units={units.slice(0, panels.length)} goTo={goTo} onClose={() => setSheet(null)} />}
    </StripModeCtx.Provider>
  )
}
