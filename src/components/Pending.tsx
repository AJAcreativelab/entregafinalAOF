import type { ReactNode } from 'react'

/** Etiqueta discreta para marcar información aún no documentada. */
export function PendingTag({ children = 'Pendiente' }: { children?: ReactNode }) {
  return (
    <span className="t-label inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-stone-2 px-2.5 py-1 text-[0.9rem] text-stone">
      <span className="size-1.5 rounded-full border border-stone" />
      {children}
    </span>
  )
}

/** Bloque de texto reservado: espacio visible para completar luego. */
export function PendingText({ label = 'Contenido pendiente de documentar', lines = 3, note }: { label?: string; lines?: number; note?: string }) {
  return (
    <div className="rounded-[2px] border border-dashed border-stone-2/80 bg-paper-2/40 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <PendingTag>{label}</PendingTag>
      </div>
      <div className="space-y-2.5" aria-hidden>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-[7px] rounded-full bg-paper-3/80" style={{ width: `${92 - ((i * 17) % 38)}%` }} />
        ))}
      </div>
      {note && <p className="mt-4 text-[1.03rem] leading-relaxed text-stone">{note}</p>}
    </div>
  )
}

/** Muestra el valor si existe; si no, un marcador pendiente en línea. */
export function Value({ v, fallback = 'Pendiente de documentar' }: { v: string | null | undefined; fallback?: string }) {
  return v ? <>{v}</> : <PendingTag>{fallback}</PendingTag>
}
