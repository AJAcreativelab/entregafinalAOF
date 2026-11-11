/* ==========================================================================
   ESCENARIO — "Graphite cinematic environment"
   Capas independientes (de atrás hacia adelante). Cada una se ajusta por
   separado en index.css (bloque "ESCENARIO GRAFITO"). Ninguna recibe eventos
   ni participa del motor Leporello: sólo es ambiente.
   ========================================================================== */
export function Backdrop() {
  return (
    <div className="bd" aria-hidden>
      <div className="bd-base" />
      <div className="bd-halo" />
      <div className="bd-arcs">
        <div className="bd-arc bd-arc-top" />
        <div className="bd-arc bd-arc-top-glow" />
        <div className="bd-arc bd-arc-bottom" />
      </div>
      <div className="bd-behind" />
      <div className="bd-floor" />
      <div className="bd-logo" />
      <div className="bd-vignette" />
      <div className="bd-grain" />
    </div>
  )
}
