import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { AnnotatedPhoto } from '../components/AnnotatedPhoto'
import { CompareSlider } from '../components/CompareSlider'
import { Photo, SyncedVideos, Video } from '../components/Media'
import { PendingTag, PendingText } from '../components/Pending'
import { comparePair, compareViews, finalPair, type CompareView } from '../content/assets'
import { assessment as A, conclusions, diagnosis, history, lipolysis as L, meta, patient, plan, prp as PRP, results, rhino as R, type LipoSession } from '../content/case'
import { ICONS, NoseScheme, SessionCard, Syringe, TechniqueGlyph } from '../components/Graphics'
import { ChapterSpine, DocConclusion, Obs, Row, Shell } from './Shell'
import type { PanelDef } from './Strip'

const EASE = [0.22, 1, 0.36, 1] as const
const spine = (id: string): PanelDef => ({ key: `ch-${id}`, u: 1, tone: 'night', fixed: true, anchor: { id, section: id }, render: () => <ChapterSpine id={id} /> })

/* ─── Portada: la misma al abrir el expediente y en la contratapa al cerrarlo ─ */
function CoverPage({ intro = false }: { intro?: boolean }) {
  return (
    <Shell n={meta.fileCode} aside={meta.specialty} foot={['Expediente digital', meta.patient]}>
      <div className="mb-[3.4cqh] flex items-center gap-[1.6cqh] text-ink">
        <span className="ucam-mark h-[6cqh]" role="img" aria-label="UCAM — Universidad Católica San Antonio de Murcia" />
        <span className="h-[4.4cqh] w-px bg-line" />
        <span className="t-label text-[0.81rem] leading-relaxed text-stone">
          <span className="text-ink">AOF</span>
          <br />
          Armonización Orofacial
        </span>
      </div>
      <h1 className="p-hero">
        {['Caso clínico', 'integral'].map((l, i) => (
          <span key={l} className="block overflow-hidden pb-[0.06em]">
            <motion.span className={`block ${i ? 'italic text-ink-2' : ''}`} initial={intro ? { y: '108%' } : false} animate={{ y: 0 }} transition={{ duration: 1.3, ease: EASE, delay: 0.2 + i * 0.12 }}>
              {l}
            </motion.span>
          </span>
        ))}
      </h1>
      <p className="p-sub mt-[3cqh] max-w-[22ch] text-ink-2">{meta.title}</p>
      <dl className="mt-auto">
        <Row k="Paciente">{meta.patient}</Row>
        <Row k="Presentado por">{meta.presenter}</Row>
        <Row k="Especialidad">Armonización Orofacial</Row>
      </dl>
    </Shell>
  )
}

/* ─── 03.1 relato de tercios: la misma fotografía, capas distintas ─────── */
const thirdsPhoto = (active: string[], tag: string) => <AnnotatedPhoto id="frontalSerio" figure="thirds" tag={tag} active={active} fill />

/* ─── 05 plan ─────────────────────────────────────────────────────────── */
function PlanSheet() {
  return (
    <Shell n="05.1" label="Mapa de intervención" aside="Treatment plan" foot={['Plan de tratamiento · 5 procedimientos', 'Detalle en 06 · Procedimientos']}>
      <h3 className="p-title">
        Plan de <span className="italic">tratamiento</span>
      </h3>
      <ol className="mt-[3cqh] flex min-h-0 flex-1 flex-col border-t border-line">
        {plan.map((p) => (
          <li key={p.id} className="grid flex-1 grid-cols-[minmax(0,0.16fr)_minmax(0,1.9fr)] items-center gap-x-[3cqh] border-b border-line">
            <span className="t-data text-[clamp(1.8rem,5.4cqh,4rem)] leading-none text-accent">{p.n}</span>
            <span className="text-[clamp(1.9rem,6.2cqh,4.6rem)] font-medium leading-[1] tracking-[-0.035em] text-ink">{p.name}</span>
          </li>
        ))}
      </ol>
    </Shell>
  )
}

/* ─── 06.1 · S02 · tomas sincronizadas ──────────────────────────────────
   Mismo recorrido de la cabeza en las dos tomas (frente → mira abajo → perfil → vuelve por el
   frente → lado opuesto → mira abajo), pero el Momento 1 sostiene más cada pose. Se cortan esas
   esperas para que cada giro caiga en el mismo instante. Los puntos de corte salen de comparar
   la postura cuadro a cuadro (0,2 s) entre ambas tomas. Momento 2 solo pierde el inicio
   (manos en el mentón, antes de empezar). */
const SYNC_S2: [number, number][][] = [
  [[2.6, 6.8], [8.4, 12.0], [14.6, 15.8], [16.8, 18.0], [18.2, 21.2], [23.2, 25.8]],
  [[2.4, 18.2]],
]

/* ─── 07 comparativas ─────────────────────────────────────────────────── */
function ComparePanel({ t, i }: { t: (typeof results.treatments)[number]; i: number }) {
  const [view, setView] = useState<CompareView>('frontal')
  const pair = comparePair(t.id, view)
  return (
    <Shell n={`07.1 · ${String.fromCharCode(65 + i)}`} label="Antes / después" aside={t.short} foot={['Arrastrar la línea · ← → con la manija enfocada', 'Mismo encuadre y proporción']}>
      <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-[3cqh]">
        <div className="flex flex-col">
          <h3 className="p-title">{t.label}</h3>
          {t.sub && <h3 className="p-title mt-[1.2cqh]">{t.sub}</h3>}
          <div className="mt-auto">
            <div className="t-label mb-2 text-[0.78rem] text-stone">Vista</div>
            <div className="flex flex-col items-start gap-1.5" role="tablist">
              {compareViews.map((v) => (
                <button
                  key={v.id}
                  role="tab"
                  aria-selected={view === v.id}
                  onClick={() => setView(v.id)}
                  className={`t-label rounded-full border px-3 py-1.5 text-[0.81rem] transition-colors ${view === v.id ? 'border-ink bg-ink text-paper' : 'border-line text-stone hover:border-stone'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={view} className="flex min-h-0 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CompareSlider before={pair.before} after={pair.after} fill />
          </motion.div>
        </AnimatePresence>
      </div>
    </Shell>
  )
}

/* ========================================================================== */

export const panels: PanelDef[] = [
  /* 00 · Portada ---------------------------------------------------------- */
  {
    key: 'cover',
    u: 1,
    fixed: true,
    render: () => (
      <CoverPage intro />
    ),
  },
  {
    key: 'cover-photo',
    u: 1,
    tone: 'night',
    render: () => (
      <Shell n="00" label="Registro" aside="Fotografía autorizada" foot={[meta.patient, '40 años']}>
        <Photo id="cover" fit="contain" fill priority />
      </Shell>
    ),
  },

  /* 01 · Paciente ---------------------------------------------------------- */
  spine('paciente'),
  {
    key: 'ficha',
    u: 2,
    anchor: { id: 'paciente-ficha', sub: 'paciente-ficha' },
    render: () => (
      <Shell n="01.1" label="Ficha de la paciente" aside="Patient file" foot={['FIG. 01 — Retrato', 'Datos de consulta']}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-[3.3cqh]">
          <Photo id="portrait" tag="FIG. 01" fill />
          <div className="flex flex-col">
            <div className="t-label text-[0.81rem] text-stone">Paciente</div>
            <p className="p-hero mt-[1cqh] !text-[clamp(2.6rem,10cqh,8rem)]">
              Natasha <span className="block italic text-ink-2">León</span>
            </p>
            <dl className="mt-auto">
              <Row k="Edad">{patient.age}</Row>
              <Row k="Profesión">{patient.profession}</Row>
              <Row k="Expectativas">{patient.expectations}</Row>
              <Row k="Antecedentes estéticos">{patient.aestheticHistory}</Row>
            </dl>
          </div>
        </div>
      </Shell>
    ),
  },
  {
    key: 'motivo',
    u: 1.5,
    anchor: { id: 'paciente-motivo', sub: 'paciente-motivo' },
    render: () => (
      <Shell n="01.2" label="Motivo de consulta" aside="Chief complaint" foot={['Expectativas', patient.expectations]}>
        <h3 className="p-sub max-w-[24ch]">¿Qué le gustaría mejorar de su rostro?</h3>
        <ol className="mt-[3cqh]">
          {patient.concerns.map((c, i) => (
            <li key={c} className="flex items-baseline gap-5 border-b border-line py-[1.6cqh]">
              <span className="t-data text-[1.01rem] text-accent">0{i + 1}</span>
              <span className="p-title">{c}</span>
            </li>
          ))}
        </ol>
        <figure className="mt-auto">
          <blockquote className="font-serif text-[clamp(1.6rem,4.4cqh,3.4rem)] italic leading-[1.02] tracking-[-0.02em]">
            <span className="text-accent">“</span>
            {patient.quote}
            <span className="text-accent">”</span>
          </blockquote>
          <figcaption className="t-label mt-[1.4cqh] text-[0.81rem] text-stone">— Natasha León, en consulta</figcaption>
        </figure>
      </Shell>
    ),
  },

  /* 02 · Historia ---------------------------------------------------------- */
  spine('historia'),
  {
    key: 'historia',
    u: 2,
    anchor: { id: 'historia-items', sub: 'historia-items' },
    render: () => (
      <Shell n="02.1" label="Antecedentes" aside="Medical history" foot={['Registro de historia clínica', 'Consulta inicial']}>
        <h3 className="p-title">
          Antecedentes <span className="italic">clínicos</span>
        </h3>
        <div className="mt-auto">
          {history.map((h, i) => (
            <div key={h.key} className="grid grid-cols-[2.2rem_minmax(8rem,30%)_1fr] items-baseline gap-5 border-t border-line py-[1.9cqh]">
              <svg viewBox="0 0 24 24" className="size-6 self-center text-ink" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {ICONS[h.key]}
              </svg>
              <div className="t-label text-[0.81rem] text-stone">
                <span className="t-data mr-2 text-accent">0{i + 1}</span>
                {h.label}
              </div>
              <div className="p-sub">
                {h.key === 'alergias' ? (
                  <span className="flex flex-wrap gap-x-5">
                    {h.value.split(', ').map((a) => (
                      <span key={a} className="inline-flex items-baseline gap-2">
                        <span className="size-2 -translate-y-[0.3em] rounded-full bg-accent-2" />
                        {a}
                      </span>
                    ))}
                  </span>
                ) : (
                  h.value
                )}
              </div>
            </div>
          ))}
        </div>
      </Shell>
    ),
  },

  /* 03 · Evaluación -------------------------------------------------------- */
  spine('evaluacion'),
  {
    key: 'protocolo',
    u: 2,
    anchor: { id: 'eval-general', sub: 'eval-general' },
    render: () => {
      const P = [
        ['frontalSerio', 'Frontal serio', 'frontal'],
        ['frontalSonrisa', 'Frontal con sonrisa', 'frontal'],
        ['tresCuartos', 'Tres cuartos', 'three-quarter'],
        ['perfilDerecho', 'Perfil derecho', 'profile'],
        ['perfilIzquierdo', 'Perfil izquierdo', 'profile'],
      ] as const
      return (
        <Shell n="03.1" label="Protocolo fotográfico y análisis facial general" aside="Photographic protocol" foot={[A.intro, '5 registros']}>
          <h3 className="p-title">Protocolo fotográfico</h3>
          <div className="mt-[2.4cqh] grid min-h-0 flex-1 grid-rows-1 grid-cols-5 gap-[1.5cqh]">
            {P.map(([id, label, guide], i) => (
              <Photo key={id} id={id} fit="natural" ratio="9 / 16" guide={guide} tag={`P.0${i + 1}`} caption={label} gallery={P.map((x) => x[0])} fill align="start" />
            ))}
          </div>
        </Shell>
      )
    },
  },
  {
    key: 'simetria',
    u: 2,
    render: () => (
      <Shell n="03.1 · A" label={A.symmetry.title} aside="Facial symmetry" foot={['FIG. 03.1-A', 'Región malar · surcos nasolabiales · comisuras']}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-[3.3cqh]">
          <AnnotatedPhoto id="frontalSerio" figure="symmetry" tag="FIG. 03.1-A" fill />
          <div className="flex flex-col">
            <h3 className="p-title">
              Simetría <span className="italic">facial</span>
            </h3>
            <p className="p-sub mt-auto">{A.symmetry.text[0]}</p>
            <p className="p-text mt-[1.6cqh]">{A.symmetry.text[1]}</p>
          </div>
        </div>
      </Shell>
    ),
  },
  {
    key: 'tercios',
    u: 2,
    render: () => (
      <Shell n="03.1 · B" label={A.thirds.title} aside="Facial thirds" foot={['FIG. 03.1-B', 'Capa: tercios faciales']}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-[3.3cqh]">
          {thirdsPhoto(['tercios'], 'FIG. 03.1-B')}
          <div className="flex flex-col">
            <h3 className="p-title">
              Tercios <span className="italic">faciales</span>
            </h3>
            <div className="mt-auto">
              {A.thirds.items.map((t, i) => (
                <Obs key={t.label} n={['I', 'II', 'III'][i]} title={t.label}>
                  {t.text}
                </Obs>
              ))}
              <p className="mt-[1.4cqh] border-l-2 border-accent-2 pl-4 text-[clamp(1.15rem,2.3cqh,1.47rem)] leading-snug text-ink">{A.thirds.note}</p>
            </div>
          </div>
        </div>
      </Shell>
    ),
  },
  {
    key: 'contorno',
    u: 2,
    render: () => (
      <Shell n="03.1 · C" label={A.contour.title} aside="Facial contour" foot={['FIG. 03.1-C', 'Capas: forma y contorno · tercio inferior']}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-[3.3cqh]">
          {thirdsPhoto(['contorno', 'inferior'], 'FIG. 03.1-C')}
          <div className="flex flex-col">
            <h3 className="p-title">
              Forma y <span className="italic">contorno</span>
            </h3>
            <div className="mt-auto">
              {A.contour.items.map((c, i) => (
                <Obs key={c.key} n={`C.${i + 1}`} title={['Forma', 'Región inferior', 'Contorno mandibular', 'Mentón'][i]}>
                  {c.text}
                </Obs>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    ),
  },
  {
    key: 'piel',
    u: 1.5,
    anchor: { id: 'eval-piel', sub: 'eval-piel' },
    render: () => (
      <Shell n="03.2" label={A.skin.title} aside="Skin assessment" foot={['FIG. 03.2', A.skin.lead]}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] gap-[3cqh]">
          <AnnotatedPhoto id="pielFrontal" figure="skin" tag="FIG. 03.2" fill />
          <div className="flex flex-col">
            <h3 className="p-title">
              Evaluación de la <span className="italic">piel</span>
            </h3>
            <p className="p-text mt-auto">Seis aspectos evaluados, cada uno con su acercamiento fotográfico en la página siguiente.</p>
          </div>
        </div>
      </Shell>
    ),
  },
  {
    key: 'piel-detalle',
    u: 2,
    render: () => (
      <Shell n="03.2" label="Acercamientos" aside="Detail" foot={['Fotografía frontal y acercamiento de la piel', '6 registros']}>
        <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-2 gap-x-[2.4cqh] gap-y-[2.4cqh]">
          {A.skin.items.map((it, i) => (
            <article key={it.key} className="grid min-h-0 grid-rows-1 grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] gap-[1.6cqh]">
              <Photo id={it.asset} fit="contain" ratio="1 / 1" tag={`03.2-${String.fromCharCode(97 + i)}`} gallery={A.skin.items.map((x) => x.asset)} fill align="start" />
              <div className="flex flex-col border-t border-ink pt-[1cqh]">
                <span className="t-data text-[0.95rem] text-accent">0{i + 1}</span>
                <h4 className="mt-[0.6cqh] text-[clamp(1.21rem,2.43cqh,1.59rem)] font-medium leading-snug">{it.title}</h4>
                <p className="p-text mt-auto">{it.text}</p>
              </div>
            </article>
          ))}
        </div>
      </Shell>
    ),
  },
  {
    key: 'adiposo',
    u: 2,
    anchor: { id: 'eval-adiposo', sub: 'eval-adiposo' },
    render: () => (
      <Shell n="03.3" label={A.adipose.title} aside="Adipose tissue" foot={['Evaluación facial: perfil, tres cuartos y frontal', 'Numeración = observaciones 1–4']}>
        <h3 className="p-title">
          Tejido <span className="italic">adiposo</span>
        </h3>
        <div className="mt-[2.4cqh] grid min-h-0 flex-1 grid-rows-1 grid-cols-3 gap-[1.8cqh]">
          {(
            [
              ['perfilDerecho', 'adiposeProfile', 'Perfil'],
              ['tresCuartos', 'adiposeThreeQuarter', 'Tres cuartos'],
              ['frontalSerio', 'adiposeFrontal', 'Frontal'],
            ] as const
          ).map(([id, fig, label], i) => (
            <AnnotatedPhoto key={fig} id={id} figure={fig} tag={`FIG. 03.3-${i + 1} · ${label}`} showChips={false} fill />
          ))}
        </div>
      </Shell>
    ),
  },
  {
    key: 'adiposo-obs',
    u: 2,
    render: () => (
      <Shell n="03.3" label="Valoración morfológica" aside="Findings" foot={['Tejidos blandos', '4 observaciones']}>
        <p className="p-text max-w-[52ch]">{A.intro}</p>
        <div className="mt-auto">
          {A.adipose.items.map((o) => (
            <Obs key={o.n} n={o.n} title={o.title}>
              {o.text}
            </Obs>
          ))}
        </div>
      </Shell>
    ),
  },
  {
    key: 'baumann',
    u: 2,
    anchor: { id: 'eval-clasificaciones', sub: 'eval-clasificaciones' },
    render: () => {
      const B = A.classifications.baumann
      return (
        <Shell n="03.4" label={B.title} aside="Clasificación orientativa" foot={[B.note, 'O · R · P · T']}>
          <div className="flex items-center justify-between">
            <h3 className="p-title">Baumann</h3>
            <span className="t-label rounded-full bg-accent-2 px-3 py-1.5 text-[0.78rem] text-night">Clasificación de la paciente</span>
          </div>
          <div className="keep-grid mt-[2.4cqh] grid grid-cols-4 border-y border-ink">
            {B.rows.map((r, i) => (
              <motion.div
                key={r.letter}
                className="border-r border-line py-[2cqh] text-center last:border-r-0"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.9, ease: EASE }}
              >
                <div className="font-display text-[clamp(3.4rem,13cqh,9rem)] leading-[0.82] tracking-[-0.05em]">{r.letter}</div>
                <div className="t-label mt-[1cqh] text-[0.81rem] text-accent">{r.name}</div>
              </motion.div>
            ))}
          </div>
          <dl className="mt-auto">
            {B.rows.map((r) => (
              <div key={r.letter} className="grid grid-cols-[1.6rem_8.5rem_9.5rem_1fr] items-baseline gap-3 border-b border-line py-[1.1cqh] last:border-b-0">
                <dt className="font-display text-[1.25rem] leading-none">{r.letter}</dt>
                <dd className="t-label text-[0.78rem] text-stone">{r.parameter}</dd>
                <dd className="text-[clamp(1.09rem,2.17cqh,1.34rem)] font-medium">{r.value}</dd>
                <dd className="p-text">{r.detail}</dd>
              </div>
            ))}
          </dl>
        </Shell>
      )
    },
  },
  {
    key: 'fitz-glogau',
    u: 2,
    render: () => {
      const { fitzpatrick: F, glogau: G } = A.classifications
      return (
        <Shell n="03.4" label="Fitzpatrick · Glogau" aside="Estimaciones" foot={['Fototipo IV – V', 'Glogau tipo II']}>
          <div className="flex items-baseline justify-between">
            <h4 className="p-sub">{F.title}</h4>
            <span className="t-label text-[0.75rem] text-stone">Estimación visual</span>
          </div>
          <div className="keep-grid mt-[1.6cqh] grid grid-cols-6 gap-1.5">
            {['I', 'II', 'III', 'IV', 'V', 'VI'].map((r) => {
              const on = r === 'IV' || r === 'V'
              return (
                <div key={r} className={`grid h-[6.5cqh] place-items-center rounded-[2px] border font-display text-[clamp(1.23rem,2.91cqh,2.02rem)] ${on ? 'border-accent-2 bg-accent-2 text-night' : 'border-line text-stone-2'}`}>
                  {r}
                </div>
              )
            })}
          </div>
          <p className="p-text mt-[1.4cqh]">{F.text}</p>
          {F.types.map((t) => (
            <p key={t.id} className="p-text mt-[0.6cqh]">
              <span className="t-data mr-2 text-accent">{t.id}</span>
              {t.text}
            </p>
          ))}

          <div className="mt-auto flex items-baseline justify-between border-t border-ink pt-[1.6cqh]">
            <h4 className="p-sub">{G.title}</h4>
            <span className="t-label text-[0.75rem] text-stone">Estimación orientativa</span>
          </div>
          <div className="mt-[1.4cqh] space-y-1">
            {G.types.map((t, i) => {
              const on = t.id === G.patientType
              return (
                <div key={t.id} className={`flex items-center gap-4 rounded-[2px] border px-4 py-[0.9cqh] ${on ? 'border-accent-2 bg-accent-2 text-night' : 'border-line'}`}>
                  <span className="flex items-end gap-[3px]" aria-hidden>
                    {[0, 1, 2, 3].map((k) => (
                      <span key={k} className={`w-1 rounded-full ${k <= i ? 'bg-current' : 'bg-current/25'}`} style={{ height: 5 + k * 4 }} />
                    ))}
                  </span>
                  <span className="w-16 font-display text-[clamp(1.21rem,2.43cqh,1.59rem)] leading-none">Tipo {t.id}</span>
                  <span className={`flex-1 text-[clamp(1rem,1.98cqh,1.25rem)] ${on ? 'text-night/80' : 'text-stone'}`}>{t.text}</span>
                  {on && <span className="t-label text-[0.72rem]">Paciente</span>}
                </div>
              )
            })}
          </div>
        </Shell>
      )
    },
  },
  {
    key: 'mandibula',
    u: 2,
    anchor: { id: 'eval-mandibula', sub: 'eval-mandibula' },
    render: () => (
      <Shell n="03.5" label={A.mandible.title} aside="Mandibular region" foot={['FIG. 03.5-1 · Frontal  ·  FIG. 03.5-2 · Perfil', A.mandible.lead]}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="p-title">
            Mandíbula y <span className="italic">papada</span>
          </h3>
          <div className="flex items-center gap-4 rounded-[3px] bg-accent-2 px-4 py-[1cqh] text-night">
            <span className="font-display text-[clamp(2rem,5cqh,3.4rem)] leading-none">III</span>
            <span className="t-label text-[0.75rem] leading-relaxed">
              Clasificación de Dedo
              <br />
              Volumen submentoniano
            </span>
          </div>
        </div>
        <div className="mt-[2.4cqh] grid min-h-0 flex-1 grid-rows-1 grid-cols-2 gap-[1.8cqh]">
          <AnnotatedPhoto id="frontalSerio" figure="mandibleFrontal" tag="FIG. 03.5-1" fill />
          <AnnotatedPhoto id="perfilDerecho" figure="mandibleProfile" tag="FIG. 03.5-2" fill />
        </div>
        <div className="mt-[2.2cqh] shrink-0">
          <DocConclusion>{A.mandible.conclusion}</DocConclusion>
        </div>
      </Shell>
    ),
  },
  {
    key: 'nariz',
    u: 2,
    anchor: { id: 'eval-nasal', sub: 'eval-nasal' },
    render: () => (
      <Shell n="03.6" label={A.nose.title} aside="Nasal assessment" foot={['FIG. 03.6-1 · Frontal  ·  FIG. 03.6-2 · Perfil', A.nose.lead]}>
        <h3 className="p-title">
          Evaluación <span className="italic">nasal</span>
        </h3>
        <div className="mt-[2.4cqh] grid min-h-0 flex-1 grid-rows-1 grid-cols-2 gap-[1.8cqh]">
          <AnnotatedPhoto id="narizFrontal" figure="noseFrontal" tag="FIG. 03.6-1" fill />
          <AnnotatedPhoto id="narizPerfil" figure="noseProfile" tag="FIG. 03.6-2" fill />
        </div>
      </Shell>
    ),
  },
  {
    key: 'nariz-obs',
    u: 2,
    render: () => (
      <Shell n="03.6" label="Hallazgos" aside="Findings" foot={['Evaluación nasal', '5 observaciones']}>
        <div>
          {A.nose.items.map((it, i) => (
            <Obs key={it.key} n={`0${i + 1}`} title={it.title}>
              {it.text}
            </Obs>
          ))}
        </div>
        <DocConclusion>{A.nose.conclusion}</DocConclusion>
      </Shell>
    ),
  },

  /* 04 · Diagnóstico ------------------------------------------------------- */
  spine('diagnostico'),
  {
    key: 'diag-escalas',
    u: 1.5,
    anchor: { id: 'diag-sintesis', sub: 'diag-sintesis' },
    render: () => (
      <Shell n="04.1" label="Síntesis de hallazgos" aside="Findings synthesis" foot={['Reúne, sin reinterpretar, lo documentado en la evaluación', 'Escalas']}>
        <h3 className="p-title">
          Síntesis <span className="italic">diagnóstica</span>
        </h3>
        <div className="keep-grid mt-auto grid grid-cols-2 gap-px border border-line bg-line">
          {diagnosis.scales.map((s) => (
            <div key={s.name} className="bg-paper-2 p-[2cqh]">
              <div className="t-label text-[0.78rem] text-stone">{s.name}</div>
              <div className="mt-[1.4cqh] font-display text-[clamp(2.4rem,8cqh,6rem)] leading-none tracking-[-0.05em]">{s.value}</div>
              <div className="t-label mt-[1.2cqh] text-[0.75rem] text-accent">{s.note}</div>
            </div>
          ))}
        </div>
      </Shell>
    ),
  },

  /* 05 · Plan -------------------------------------------------------------- */
  spine('plan'),
  {
    key: 'plan-mapa',
    u: 2,
    anchor: { id: 'plan-mapa', sub: 'plan-mapa' },
    render: () => <PlanSheet />,
  },

  /* 06 · Procedimientos ---------------------------------------------------- */
  spine('procedimientos'),
  {
    key: 'lipo',
    u: 2,
    anchor: { id: 'proc-lipolisis', sub: 'proc-lipolisis' },
    render: () => (
      <Shell n="06.1" label="Lipólisis enzimática" aside="Papada y jowl" foot={[L.product, `${L.sessionsCount} sesiones`]}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] gap-[3cqh]">
          <div className="flex min-h-0 flex-col">
            <h3 className="p-title">
              Lipólisis <span className="italic">enzimática</span>
            </h3>
            <div className="mt-[2.4cqh] min-h-0 flex-1">
              <Photo id="lipoMapeo" fill />
            </div>
          </div>
          <div className="flex flex-col">
            <dl>
              <Row k="Producto utilizado">{L.product}</Row>
              <Row k="Principio activo">{L.activePrinciple ?? <PendingTag>A documentar</PendingTag>}</Row>
              <Row k="Número de sesiones">{L.sessionsCount}</Row>
            </dl>
            <div className="mt-auto">
              <div className="t-label mb-1 text-[0.78rem] text-stone">Técnica de aplicación</div>
              {L.technique.map((t) => (
                <div key={t.zone} className="flex items-center gap-5 border-t border-line py-[1.6cqh]">
                  <TechniqueGlyph kind={t.zone === 'Papada' ? 'mallado' : 'abanico'} />
                  <div>
                    <div className="p-sub">{t.zone}</div>
                    <div className="p-text mt-1">{t.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    ),
  },
  ...L.sessions.flatMap((s): PanelDef[] => [
    {
      key: `lipo-s${s.n}`,
      u: 1.5,
      render: () => (
        <Shell n={`06.1 · S0${s.n}`} label={s.label} aside="Cantidad utilizada" foot={['Escala común 0–3 ml', `Total aplicado ${s.totalDocumented.label}`]}>
          <div className="min-h-0 flex-1 [&>div]:h-full">
            <SessionCard s={s} />
          </div>
        </Shell>
      ),
    },
    {
      key: `lipo-s${s.n}-fotos`,
      u: 2,
      render: () => (
        <Shell n={`06.1 · S0${s.n}`} label={`${s.label} — registros`} aside="Fotografías" foot={['Clic para ampliar', '3 registros']}>
          <div className={`grid min-h-0 grid-rows-1 grid-cols-3 gap-[1.5cqh] shrink-0`}>
            {s.assets.map((a, i) => (
              <Photo key={a} id={a} fit="contain" tag={`S0${s.n} · ${String.fromCharCode(65 + i)}`} gallery={s.assets} />
            ))}
          </div>
          {(
            <div className="mt-[2.4cqh] flex min-h-0 flex-1 items-center justify-between gap-6 border-t border-line pt-[1cqh]">
              <h3 className="text-[clamp(3rem,12cqh,9rem)] font-medium leading-[0.9] tracking-[-0.04em] text-ink">
                Post <span className="t-serif">inmediato</span>
              </h3>
              <span className="t-label pb-[0.6cqh] text-right text-[0.84rem] text-stone">{s.n === 1 ? 'Frontal · 3/4 · Perfil' : 'Frontal · Submental · Perfil'}</span>
            </div>
          )}
        </Shell>
      ),
    },
    {
      key: `lipo-s${s.n}-video`,
      u: 2,
      tone: 'night',
      render: () => (
        <Shell n={`06.1 · S0${s.n}`} label={`${s.label} — video`} aside="Registro audiovisual" foot={[`Sesión 0${s.n} / 02`, 'Video']}>
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            {(s as LipoSession).synced ? (
              <SyncedVideos ids={(s as LipoSession).synced!} tags={(s as LipoSession).synced!.map((_, i) => `S0${s.n} · Momento ${i + 1}`)} rotate={-90} clips={SYNC_S2} />
            ) : (s as LipoSession).videos ? (
              <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-2 gap-[2cqh]">
                {(s as LipoSession).videos!.map((v, i) => (
                  <Video key={v} id={v} tag={`S0${s.n} · ${i === 0 ? 'Mapeo' : 'Procedimiento'}`} fill muted />
                ))}
              </div>
            ) : (
              <Video id={s.video} tag={`S0${s.n} · Video`} fill />
            )}
          </div>
        </Shell>
      ),
    },
  ]),
  {
    key: 'lipo-progresion',
    u: 1,
    tone: 'night',
    render: () => {
      const [s1, s2] = L.sessions
      return (
        <Shell n="06.1" label="Progresión de dosis" aside="1.ª → 2.ª" foot={[`S1 ${s1.totalDocumented.label}`, `S2 ${s2.totalDocumented.label}`]}>
          <h3 className="p-title">
            Dosis <span className="italic">por sesión</span>
          </h3>
          {/* Texto tal cual lo indicó la autora, organizado por sesión */}
          <div className="mt-[2.4cqh] flex min-h-0 flex-1 flex-col justify-evenly gap-[2cqh]">
            {[
              { title: '1era sesión', doses: [['Lipasa', '1,5 ml'], ['Colagenasa', '0,75ml'], ['Hialuronidasa', '0,75 ml']], total: 'Total aplicado: 2,75 ml.', dist: '1,5ml en la papada y 0,75ml en cada jowl.' },
              { title: '2da sesión', doses: [['Lipasa', '3 ml'], ['Colagenasa', '1,5 ml'], ['Hialuronidasa', '1,5  ml']], total: 'Total aplicado: 6 ml.', dist: '3 ml en la papada y 1,5ml en cada jowl.' },
            ].map((s, k) => (
              <section key={s.title} className="border-t border-line pt-[1.6cqh]">
                <div className={`p-sub mb-[1cqh] ${k ? 'text-accent-2' : 'text-ink'}`}>{s.title}</div>
                <ul>
                  {s.doses.map(([n, v]) => (
                    <li key={n} className="flex items-baseline justify-between gap-3 py-[0.5cqh]">
                      <span className="text-[clamp(1.15rem,2.7cqh,1.7rem)] text-ink">{n}:</span>
                      <span className="t-data text-[clamp(1.15rem,2.7cqh,1.7rem)] text-ink">{v}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-[1.2cqh] text-[clamp(1.15rem,2.7cqh,1.7rem)] font-medium text-ink">{s.total}</p>
                <p className="p-text mt-[0.4cqh]">{s.dist}</p>
              </section>
            ))}
          </div>
        </Shell>
      )
    },
  },
  {
    key: 'prp',
    u: 2,
    anchor: { id: 'proc-prp', sub: 'proc-prp' },
    render: () => (
      <Shell n="06.2" label="Plasma rico en plaquetas" aside="PRP" foot={[`Material: ${PRP.material}`, PRP.techniqueText]}>
        <h3 className="p-title">
          Plasma rico en <span className="italic">plaquetas</span>
        </h3>
        <div className="keep-grid mt-auto grid grid-cols-3 gap-px border border-line bg-line">
          {PRP.technique.map((t, i) => (
            <div key={t} className="bg-paper-2 p-[2.2cqh]">
              <div className="t-data text-[0.95rem] text-accent">0{i + 1}</div>
              <div className="mt-[6cqh] font-display text-[clamp(1.9rem,6cqh,4.4rem)] leading-none tracking-[-0.05em]">{t}</div>
              <div className="t-label mt-[1.4cqh] text-[0.75rem] text-stone">Técnica de aplicación</div>
            </div>
          ))}
        </div>
        <dl className="mt-[2cqh]">
          <Row k="Material utilizado">{PRP.material}</Row>
          <Row k="Evolución">{PRP.evolution.text ?? <PendingTag>Colocar fotos y videos</PendingTag>}</Row>
        </dl>
      </Shell>
    ),
  },
  {
    key: 'prp-media',
    u: 2,
    render: () => (
      <Shell n="06.2" label="Registro del procedimiento" aside="PRP" foot={['Procedimiento y evolución', 'Clic para ampliar']}>
        <div className="grid min-h-0 shrink-0 grid-rows-1 grid-cols-3 gap-[1.5cqh]">
          {(['prpA', 'prpB', 'prpEvo'] as const).map((id, i) => (
            <Photo key={id} id={id} fit="contain" tag={['PRP · A', 'PRP · B', 'PRP · Evolución'][i]} gallery={['prpA', 'prpB', 'prpEvo']} />
          ))}
        </div>
        <div className="mt-[2.4cqh] flex min-h-0 flex-1 items-center border-t border-line pt-[1cqh]">
          <h3 className="text-[clamp(3rem,12cqh,9rem)] font-medium leading-[0.9] tracking-[-0.04em] text-ink">
            Antes y <span className="t-serif">post inmediato</span>
          </h3>
        </div>
      </Shell>
    ),
  },
  {
    key: 'prp-video',
    u: 2,
    tone: 'night',
    render: () => (
      <Shell n="06.2" label="Video del procedimiento" aside="PRP" foot={['Nappage · Dermapen · DMAE', 'Video']}>
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <Video id="prpV" tag="PRP · Video" fill muted />
        </div>
      </Shell>
    ),
  },
  {
    key: 'rino',
    u: 2,
    tone: 'night',
    anchor: { id: 'proc-rino', sub: 'proc-rino' },
    render: () => (
      <Shell n="06.3" label="Rinomodelación" aside="Ficha del producto" foot={['Producto utilizado', R.amount]}>
        <h3 className="p-title">
          Rino<span className="italic">modelación</span>
        </h3>
        <div className="mt-auto">
          <div className="t-label text-[0.78rem] text-stone">Producto utilizado</div>
          <div className="mt-[1cqh] font-display text-[clamp(2rem,6cqh,4.4rem)] leading-[0.92] tracking-[-0.05em]">{R.product}</div>
          <dl className="t-data mt-[2.4cqh] text-[clamp(0.92rem,1.92cqh,1.12rem)]">
            {R.composition.lines.map((c) => (
              <div key={c.k} className="flex justify-between border-t border-line py-[1cqh]">
                <dt className="text-stone">{c.k}</dt>
                <dd>{c.v}</dd>
              </div>
            ))}
          </dl>
          <p className="p-text mt-[1.6cqh]">{R.composition.text}</p>
        </div>
      </Shell>
    ),
  },
  {
    key: 'rino-objetivo',
    u: 1.5,
    tone: 'night',
    render: () => (
      <Shell n="06.3" label="Objetivo y cantidad" aside="Rinomodelación" foot={['Propósito en la nariz', 'Sin cirugía']}>
        <div className="flex items-baseline justify-between">
          <span className="t-label text-[0.78rem] text-stone">Cantidad utilizada</span>
          <span className="p-sub">{R.amount}</span>
        </div>
        <div className="mt-[1.6cqh] text-ink-2">
          <Syringe />
        </div>
        <div className="mt-auto">
          {R.objectives.map((o, i) => (
            <div key={o} className="flex items-baseline gap-4 border-t border-line py-[1.6cqh]">
              <span className="t-data text-[0.95rem] text-accent">0{i + 1}</span>
              <span className="p-sub">{o}</span>
            </div>
          ))}
          <p className="p-text border-t border-line pt-[1.6cqh]">{R.purpose}</p>
        </div>
      </Shell>
    ),
  },
  {
    key: 'rino-tecnicas',
    u: 2,
    tone: 'night',
    render: () => (
      <Shell n="06.3" label="Aplicación" aside="Rinomodelación" foot={['Punta nasal · dorso nasal', '2 zonas']}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-2 gap-[3cqh]">
          {R.techniques.map((t, i) => (
            <div key={t.title} className="flex flex-col border-t border-ink pt-[1.6cqh]">
              <div className="t-label text-[0.78rem] text-accent">Aplicación · 0{i + 1}</div>
              <h4 className="p-sub mt-[1cqh]">{t.title}</h4>
              <div className="mt-[1.4cqh] flex min-h-0 flex-1 items-center justify-center py-[1cqh]">
                <NoseScheme kind={i === 0 ? 'tip' : 'dorsum'} />
              </div>
              <div className="mt-[1.4cqh] space-y-[1.4cqh]">
                <div>
                  <div className="t-label text-[0.72rem] text-stone">Objetivo</div>
                  <p className="p-text mt-1">{t.objective}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Shell>
    ),
  },
  {
    key: 'rino-video',
    u: 2,
    tone: 'night',
    render: () => (
      <Shell n="06.3" label="Video final" aside="Rinomodelación" foot={['Rinomodelación', 'Video']}>
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <Video id="rinoV" tag="Video final" fill muted />
        </div>
      </Shell>
    ),
  },

  /* 07 · Evolución --------------------------------------------------------- */
  spine('evolucion'),
  ...results.treatments.map(
    (t, i): PanelDef => ({
      key: `res-${t.id}`,
      u: 2,
      anchor: i === 0 ? { id: 'res-comparativas', sub: 'res-comparativas' } : undefined,
      render: () => <ComparePanel t={t} i={i} />,
    }),
  ),
  {
    key: 'res-final',
    u: 2,
    tone: 'night',
    anchor: { id: 'res-final', sub: 'res-final' },
    render: () => (
      <Shell n="07.2" label="Final" aside="Cómo llegó y cómo se fue" foot={['Al inicio del tratamiento', 'Al finalizar el tratamiento']}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-[minmax(0,0.5fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,0.5fr)] gap-[2.1cqh]">
          <h3 className="p-hero self-end !text-[clamp(1.6rem,5.4cqh,4.2rem)]">
            De dónde <span className="block italic">partimos</span>
          </h3>
          <Photo slot={finalPair.before} fit="contain" tag="Inicio" fill />
          <Photo slot={finalPair.after} fit="contain" tag="Final" fill />
          <h3 className="p-hero self-start text-right !text-[clamp(1.6rem,5.4cqh,4.2rem)]">
            Hacia dónde <span className="block italic">llegamos</span>
          </h3>
        </div>
      </Shell>
    ),
  },
  {
    key: 'res-final-compare',
    u: 2,
    tone: 'night',
    render: () => (
      <Shell n="07.2" label="Comparación inicial y final" aside="Deslizar" foot={['Frontal', 'Perfil']}>
        <div className="grid min-h-0 flex-1 grid-rows-1 grid-cols-2 gap-[2.1cqh]">
          <CompareSlider before={finalPair.before} after={finalPair.after} labels={['Inicio', 'Final']} fill />
          <CompareSlider before={finalPair.beforeProfile} after={finalPair.afterProfile} labels={['Inicio', 'Final']} fill />
        </div>
      </Shell>
    ),
  },

  /* 08 · Conclusiones ------------------------------------------------------ */
  spine('conclusiones'),
  {
    key: 'conclusiones',
    u: 2,
    anchor: { id: 'conclusiones-final', sub: 'conclusiones-final' },
    render: () => (
      <Shell n="08.1" label="Consideraciones finales" aside="Dra. Jeanily Berné" foot={['Espacio reservado para las conclusiones reales', '4 apartados']}>
        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-x-[3.6cqh] gap-y-[3cqh]">
          {conclusions.map((c, i) => (
            <div key={c.key} className="flex flex-col border-t border-ink pt-[1.6cqh]">
              <div className="flex items-baseline gap-3">
                <span className="t-data text-[0.95rem] text-accent">0{i + 1}</span>
                <h4 className="p-sub">{c.title}</h4>
              </div>
              <div className="mt-auto">{c.value ? <p className="p-text">{c.value}</p> : <PendingText label="Conclusión pendiente" lines={3} />}</div>
            </div>
          ))}
        </div>
      </Shell>
    ),
  },
]

/** Contratapa del libro cerrado (fin del expediente) */
export const backCover = () => <CoverPage />
