import { useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMediaQuery } from '../lib/hooks'
import { StripModeCtx } from '../lib/strip'
import { Leporello } from './Leporello'
import { MobileLeporello } from './MobileLeporello'

/* El expediente como libro plegado: en desktop, motor Leporello (ver MOTION.md);
   en móvil o con movimiento reducido, las páginas se apilan en vertical. */

export interface PanelDef {
  key: string
  /** Ancho de la página en unidades (1 = página simple · 1.5 · 2 = pliego) */
  u?: number
  tone?: 'light' | 'night' | 'bare'
  /** Página no ampliable al hacer clic (portada, lomos de capítulo) */
  fixed?: boolean
  /** Ancla de navegación: capítulo y/o subsección */
  anchor?: { id: string; section?: string; sub?: string }
  render: () => ReactNode
}

export function Strip({ panels, back }: { panels: PanelDef[]; back: () => ReactNode }) {
  const desktop = useMediaQuery('(min-width: 1024px)')
  const calm = useReducedMotion()
  if (calm) return <VerticalStrip panels={panels} back={back} />
  return desktop ? <Leporello panels={panels} back={back} /> : <MobileLeporello panels={panels} back={back} />
}

const toneClass = (t: PanelDef['tone']) => (t === 'night' ? 'tone-night' : t === 'bare' ? 'bg-paper' : 'bg-paper-2')

function VerticalStrip({ panels, back }: { panels: PanelDef[]; back: () => ReactNode }) {
  return (
    <StripModeCtx.Provider value="v">
      <div className="strip-v pt-16">
        {panels.map((p, i) => (
          <section key={p.key} id={p.anchor?.id} data-step data-section={i === 0 ? 'cover' : p.anchor?.section} data-sub={p.anchor?.sub} className={`border-b border-line ${toneClass(p.tone)}`}>
            <div className="min-h-[60svh]">{p.render()}</div>
          </section>
        ))}
        <section data-step className="tone-night">
          <div className="min-h-[60svh]">{back()}</div>
        </section>
      </div>
    </StripModeCtx.Provider>
  )
}
