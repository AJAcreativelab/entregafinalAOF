/* Vista cenital del libro (x, z de cada bisagra) para el glifo del header.
   Se publica fuera de React para no re-renderizar a 60 fps. */
export type PlanSeg = [number, number, number, number, boolean]
type L = (segs: PlanSeg[]) => void
const ls = new Set<L>()
let last: PlanSeg[] = []
export const plan = {
  emit(s: PlanSeg[]) {
    last = s
    ls.forEach((l) => l(s))
  },
  on(l: L) {
    ls.add(l)
    l(last)
    return () => {
      ls.delete(l)
    }
  },
}

/* Pista central de la barra inferior */
type H = (h: string) => void
const hs = new Set<H>()
let hint = ''
export const hintStore = {
  set(h: string) {
    if (h === hint) return
    hint = h
    hs.forEach((l) => l(h))
  },
  on(l: H) {
    hs.add(l)
    l(hint)
    return () => {
      hs.delete(l)
    }
  },
}
