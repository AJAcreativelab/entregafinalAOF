/** Punto en coordenadas relativas a la fotografía: [x% del ancho, y% del alto] */
export type Pt = [number, number]

interface Base {
  id: string
  /** Capa a la que pertenece: permite encender/apagar grupos de anotaciones */
  layer: string
  /** Resalta en color de acento (hallazgo principal) */
  emphasis?: boolean
}

export type Annotation =
  | (Base & { type: 'hline'; y: number; label: string; sub?: string })
  | (Base & { type: 'vline'; x: number; label?: string })
  | (Base & { type: 'bracket'; y1: number; y2: number; x: number; label: string; side?: 'left' | 'right' })
  | (Base & { type: 'line'; from: Pt; to: Pt; dashed?: boolean })
  | (Base & { type: 'ellipse'; c: Pt; rx: number; ry: number; dashed?: boolean; label?: string; labelAt?: Pt })
  | (Base & { type: 'path'; d: Pt[]; closed?: boolean; dashed?: boolean; label?: string; labelAt?: Pt })
  | (Base & { type: 'callout'; at: Pt; label: string; side: 'left' | 'right'; dy?: number; /** posición fija en la leyenda numerada */ order?: number })
  | (Base & { type: 'angle'; a: Pt; vertex: Pt; b: Pt; label: string })

export interface AnnotationLayer {
  id: string
  label: string
}

export interface Figure {
  layers: AnnotationLayer[]
  annotations: Annotation[]
  /** Silueta esquemática que se dibuja SOLO en el placeholder, como guía de lectura */
  guide?: 'frontal' | 'profile' | 'three-quarter' | 'nose-frontal' | 'nose-profile'
  /** Zona del rostro (en %) donde ninguna etiqueta puede apoyarse: si no entran al costado,
   *  se apilan arriba o abajo de esta zona con una línea guía hasta su punto. */
  face?: { x0: number; x1: number; y0: number; y1: number }
  /** Puntos numerados + leyenda debajo del rostro (sin líneas guía), para figuras con muchos puntos juntos */
  legend?: boolean
  /** Leyenda sobre placa oscura (para fotos en primer plano donde la piel ocupa todo el cuadro) */
  plate?: boolean
}

export interface Finding {
  title: string
  text: string
}
