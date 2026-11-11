import type { Figure } from '../content/types'

/* Siluetas esquemáticas (NO son registros de la paciente).
   Sólo se muestran en el placeholder para que la capa de anotaciones
   pueda leerse antes de cargar las fotografías reales. */

const S = { fill: 'none', stroke: 'rgba(246,242,234,0.16)', strokeWidth: 1, vectorEffect: 'non-scaling-stroke' as const }

export function Guide({ kind }: { kind: NonNullable<Figure['guide']> }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      {kind === 'frontal' && (
        <g {...S}>
          <ellipse cx="50" cy="46" rx="24" ry="31" />
          <path d="M40 75 L37 100 M60 75 L63 100" />
          <path d="M36 37 Q41 35 46 37 M54 37 Q59 35 64 37" />
          <path d="M37 41.5 Q41 40 45 41.5 M55 41.5 Q59 40 63 41.5" />
          <path d="M50 40 L48 52 Q50 54.5 52 52" />
          <path d="M43 64 Q50 66.5 57 64" />
          <path d="M26 38 Q50 6 74 38" strokeDasharray="2 3" />
        </g>
      )}
      {kind === 'three-quarter' && (
        <g {...S}>
          <path d="M34 22 Q50 10 66 20 Q74 32 71 46 L74 53 L70 55 L71 62 Q68 70 62 76 Q52 81 44 78 Q32 70 30 52 Q28 34 34 22 Z" />
          <path d="M40 78 L38 100 M62 76 L66 100" />
          <ellipse cx="34" cy="50" rx="3" ry="6" />
        </g>
      )}
      {kind === 'profile' && (
        <g {...S}>
          <path d="M58 12 Q64 22 63 31 L62 36 L72 52 L68 55 L69 62 L67 66 L68 70 L65 73 L67 77 Q66 80 62 81 L53 84 L48 92 L47 100" />
          <path d="M58 12 Q36 8 28 26 Q24 44 32 58 Q36 66 40 72 L42 100" />
          <ellipse cx="42" cy="48" rx="3.5" ry="6.5" />
        </g>
      )}
      {kind === 'nose-frontal' && (
        <g {...S}>
          <path d="M45 12 Q44 40 41 60 M55 12 Q56 40 59 60" />
          <path d="M41 60 Q30 66 34 76 Q40 80 45 76 Q50 80 55 76 Q60 80 66 76 Q70 66 59 60" />
          <ellipse cx="50" cy="66" rx="6" ry="5" />
        </g>
      )}
      {kind === 'nose-profile' && (
        <g {...S}>
          <path d="M34 10 Q38 18 40 24 Q48 40 58 56 Q66 66 62 72 Q56 76 50 76 L48 82" />
          <path d="M50 76 Q44 70 46 64 Q50 60 56 64" />
          <path d="M48 82 Q44 90 46 100" />
        </g>
      )}
    </svg>
  )
}
