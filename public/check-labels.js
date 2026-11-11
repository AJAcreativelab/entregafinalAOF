// Control automático de etiquetas (uso de desarrollo): encimadas, fuera de la foto o sobre la cara.
window.__checkLabels = async () => {
  await document.fonts.ready
  const L = await import('/src/components/labelLayout.ts?t=' + Date.now())
  const { figures } = await import('/src/content/annotations.ts')
  const sp = document.createElement('span')
  sp.className = L.LABEL_CLASS
  Object.assign(sp.style, { visibility: 'hidden', left: '-9999px', top: 0 })
  document.body.appendChild(sp)
  const H = (t, maxW) => {
    sp.style.whiteSpace = maxW ? 'normal' : 'nowrap'
    sp.style.width = maxW ? maxW + 'px' : 'auto'
    sp.textContent = t
    return sp.getBoundingClientRect().height
  }
  const map = {
    'FIG. 03.1-A': ['symmetry', null],
    'FIG. 03.1-B': ['thirds', ['tercios']],
    'FIG. 03.1-C': ['thirds', ['contorno', 'inferior']],
    'FIG. 03.3-1': ['adiposeProfile', null],
    'FIG. 03.3-2': ['adiposeThreeQuarter', null],
    'FIG. 03.3-3': ['adiposeFrontal', null],
    'FIG. 03.5-1': ['mandibleFrontal', null],
    'FIG. 03.5-2': ['mandibleProfile', null],
  }
  const report = []
  let ok = 0
  let bad = 0
  for (const ov of document.querySelectorAll('.lp-stage div.annot-shadow')) {
    const fig = ov.closest('figure')
    if (!fig) continue
    const tag = [...fig.querySelectorAll('span')].map((s) => s.textContent).find((t) => t && t.startsWith('FIG.')) || ''
    const key = Object.keys(map).find((k) => tag.startsWith(k))
    if (!key) continue
    const [id, act] = map[key]
    const f = figures[id]
    for (const s of [0.8, 1, 1.25])
      for (const vis of [new Set(act || f.layers.map((l) => l.id)), new Set(f.layers.map((l) => l.id))]) {
        const w = ov.offsetWidth * s
        const h = ov.offsetHeight * s
        const pl = L.layoutLabels(f, vis, w, h).places; sp.style.setProperty('--ls', String(L.layoutLabels(f, vis, w, h).scale))
        const rects = []
        for (const [aid, p] of pl) {
          const a = f.annotations.find((z) => z.id === aid)
          if (!a || !a.label) continue
          const hh = H(a.label, p.maxW)
          const ww = p.W || p.maxW || 0
          rects.push({ aid, x0: p.align === 'right' ? p.x - ww : p.x, x1: p.align === 'right' ? p.x : p.x + ww, y0: p.y - hh, y1: p.y, hline: a.type === 'hline' })
        }
        const fb = f.face
        const FX0 = (fb.x0 / 100) * w, FX1 = (fb.x1 / 100) * w, FY0 = (fb.y0 / 100) * h, FY1 = (fb.y1 / 100) * h
        const issues = []
        for (const r of rects) {
          if (r.x0 < -1 || r.x1 > w + 1 || r.y0 < -1 || r.y1 > h + 1) issues.push('fuera:' + r.aid)
          if (!r.hline && r.x0 < FX1 - 1 && r.x1 > FX0 + 1 && r.y0 < FY1 - 1 && r.y1 > FY0 + 1) issues.push('cara:' + r.aid)
        }
        for (let i = 0; i < rects.length; i++)
          for (let j = i + 1; j < rects.length; j++) {
            const a = rects[i], b = rects[j]
            if (a.x0 < b.x1 - 1 && a.x1 > b.x0 + 1 && a.y0 < b.y1 - 1 && a.y1 > b.y0 + 1) issues.push('pisa:' + a.aid + '/' + b.aid)
          }
        if (issues.length) {
          bad++
          report.push([key, 'escala ' + s, vis.size, issues.join(' ')])
        } else ok++
      }
  }
  sp.remove()
  return { vw: innerWidth, ok, bad, report }
}
