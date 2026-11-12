import type { ReactNode } from 'react'
import { sectionById } from '../config/navigation'
import { scrollToId } from '../lib/hooks'

/** Estructura común de cada página del leporello: rótulo · contenido · pie. */
export function Shell({ n, label, aside, foot, children, className = '' }: { n?: string; label?: string; aside?: ReactNode; foot?: [ReactNode, ReactNode]; children: ReactNode; className?: string }) {
  return (
    <div className={`p-pad flex h-full flex-col ${className}`}>
      {(n || label || aside) && (
        <div className="t-label flex shrink-0 items-baseline justify-between gap-4 text-[0.86rem]">
          <span className="flex items-baseline gap-3">
            {n && <span className="t-data text-accent">{n}</span>}
            {label && <span className="text-ink">{label}</span>}
          </span>
          {aside && <span className="text-right text-stone">{aside}</span>}
        </div>
      )}
      <div className="mt-[2.2cqh] flex min-h-0 flex-1 flex-col">{children}</div>
      {foot && (
        <div className="t-label mt-[2cqh] flex shrink-0 items-baseline justify-between gap-4 border-t border-line pt-[1.2cqh] text-[0.81rem] text-stone">
          <span>{foot[0]}</span>
          <span className="text-right">{foot[1]}</span>
        </div>
      )}
    </div>
  )
}

/** Página-lomo oscura que abre cada capítulo. */
export function ChapterSpine({ id }: { id: string }) {
  const s = sectionById[id]
  return (
    <div className="p-pad relative isolate flex h-full flex-col overflow-hidden">
      <div className="t-label flex items-baseline justify-between text-[0.84rem] text-stone">
        <span>
          <span className="text-accent">Capítulo {s.n}</span> / 08
        </span>
        <span>{s.en}</span>
      </div>
      {/* Firma institucional: logo de la universidad, chico y arriba a la izquierda */}
      <span className="ucam-mark mt-[3.2cqh] w-[34%] text-[#eef1f3] opacity-45" role="img" aria-label="UCAM — Universidad Católica San Antonio de Murcia" />
      <div className="mt-auto font-display text-[clamp(7rem,30cqh,22rem)] leading-[0.78] tracking-[-0.07em] text-ink">{s.n}</div>
      <h2 className="p-title mt-[3cqh]">{s.title}</h2>
      <ul className="mt-[3cqh] border-t border-line">
        {s.subs.map((sub) => (
          <li key={sub.id}>
            <button onClick={() => scrollToId(sub.id)} className="group flex w-full items-baseline gap-4 border-b border-line py-[0.9cqh] text-left">
              <span className="t-data w-9 text-[0.95rem] text-stone">{sub.n}</span>
              <span className="flex-1 text-[clamp(1.02rem,1.98cqh,1.28rem)] text-ink-2 transition-colors group-hover:text-ink">{sub.label}</span>
              <span className="text-stone transition-transform duration-500 group-hover:translate-x-1">→</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Fila clave → valor compacta para paneles. */
export function Row({ k, n, children }: { k: string; n?: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(7rem,34%)_1fr] gap-4 border-b border-line py-[1.3cqh]">
      <dt className="t-label flex gap-2 pt-[0.2em] text-[0.84rem] text-stone">
        {n && <span className="t-data text-accent">{n}</span>}
        {k}
      </dt>
      <dd className="text-[clamp(1.15rem,2.3cqh,1.53rem)] leading-snug text-ink">{children}</dd>
    </div>
  )
}

/** Observación numerada compacta. */
export function Obs({ n, title, children }: { n?: string; title: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 border-t border-line py-[1.4cqh]">
      {n && <span className="t-data w-6 shrink-0 text-[0.95rem] text-accent">{n}</span>}
      <div>
        <div className="text-[clamp(1.18rem,2.36cqh,1.53rem)] font-medium leading-snug text-ink">{title}</div>
        <div className="p-text mt-[0.4cqh]">{children}</div>
      </div>
    </div>
  )
}

export function DocConclusion({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto border-l-2 border-accent-2 pl-5">
      <div className="t-label text-[0.81rem] text-accent">Conclusión documentada</div>
      <p className="p-sub mt-[1cqh]">{children}</p>
    </div>
  )
}
