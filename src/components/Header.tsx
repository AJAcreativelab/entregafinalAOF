import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { sections } from '../config/navigation'
import { meta } from '../content/case'
import { BookPlan } from './Chrome'
import { scrollToId } from '../lib/hooks'
import { usePresentation } from '../lib/presentation'

const EASE = [0.22, 1, 0.36, 1] as const

function FolderGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 16" className={className} aria-hidden>
      <path d="M1 3.5 Q1 1.5 3 1.5 H8 L10 3.5 H19 Q21 3.5 21 5.5 V13 Q21 15 19 15 H3 Q1 15 1 13 Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1 6 H21" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

/** Header persistente: índice de expediente con pestañas de carpeta. */
export function Header() {
  const { active, activeSub, presenting, togglePresenting, toggleHelp } = usePresentation()
  const [hover, setHover] = useState<string | null>(null)
  const [peek, setPeek] = useState(false)
  const [sheet, setSheet] = useState(false)
  const idx = sections.findIndex((s) => s.id === active)
  const current = sections[idx]

  /* En modo presentación el header se oculta y reaparece al acercar el cursor arriba */
  useEffect(() => {
    if (!presenting) return setPeek(false)
    const on = (e: MouseEvent) => setPeek(e.clientY < 72)
    window.addEventListener('mousemove', on)
    return () => window.removeEventListener('mousemove', on)
  }, [presenting])

  const hidden = presenting && !peek

  return (
    <>
      <motion.header
        className="tone-stage fixed inset-x-0 top-0 z-50"
        initial={{ y: -80 }}
        animate={{ y: hidden ? -80 : 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: hidden ? 0 : 0.1 }}
        onMouseLeave={() => setHover(null)}
      >
        <div className="relative border-b border-line bg-paper/88 backdrop-blur-md lg:border-transparent lg:bg-transparent lg:backdrop-blur-none">
          <div className="wrap relative flex h-16 items-end justify-between gap-6">
            {/* Mapa del libro + contador (como la referencia: centro del header) */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-4 text-ink min-[1500px]:flex">
              <BookPlan />
              <span className="t-data text-[0.88rem] text-stone">
                <span className="text-ink">{current ? current.n : '00'}</span> / 08
              </span>
            </div>
            {/* Marca */}
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex min-w-0 items-center gap-3 self-center text-left lg:shrink-0">
              <FolderGlyph className="h-4 w-[1.35rem] text-ink" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-display text-[1.08rem] leading-none">{meta.kicker}</span>
                <span className="t-label hidden truncate pt-1 text-[0.7rem] text-stone min-[420px]:block">N. León · Dra. J. Berné</span>
              </span>
            </button>

            {/* Pestañas — desktop */}
            <nav aria-label="Índice del expediente" className="ml-auto hidden h-full items-end lg:flex">
              {sections.map((s) => {
                const on = s.id === active
                return (
                  <div key={s.id} className="relative h-full" onMouseEnter={() => setHover(s.id)} onFocus={() => setHover(s.id)}>
                    <button
                      onClick={() => scrollToId(s.id)}
                      aria-current={on ? 'true' : undefined}
                      className={`relative flex h-full items-end px-2 pb-[0.9rem] xl:px-2.5 ${on ? 'text-ink' : 'text-stone hover:text-ink'}`}
                    >
                      {on && (
                        <motion.span
                          layoutId="folder-tab"
                          className="absolute inset-x-0 bottom-[-1px] top-[0.7rem] rounded-t-[10px] border border-b-0 border-line bg-paper"
                          transition={{ duration: 0.55, ease: EASE }}
                        />
                      )}
                      <span className="t-label relative flex items-baseline gap-1.5 whitespace-nowrap text-[0.73rem]">
                        <span className={on ? 'text-accent' : ''}>{s.n}</span>
                        <span className={on ? 'inline' : 'hidden'}>{s.tab}</span>
                      </span>
                    </button>

                    <AnimatePresence>
                      {hover === s.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.28, ease: EASE }}
                          className="absolute left-1/2 top-full z-10 w-[19rem] -translate-x-1/2 pt-2"
                        >
                          <div className="rounded-[4px] border border-line bg-paper p-4 shadow-[0_18px_40px_-24px_rgba(28,27,25,.35)]">
                            <div className="flex items-baseline justify-between border-b border-line pb-3">
                              <span className="font-display text-[1.3rem] leading-none">{s.title}</span>
                              <span className="t-label text-[0.7rem] text-stone">{s.en}</span>
                            </div>
                            <ul className="pt-2">
                              {s.subs.map((sub) => (
                                <li key={sub.id}>
                                  <button
                                    onClick={() => {
                                      scrollToId(sub.id)
                                      setHover(null)
                                    }}
                                    className={`group flex w-full items-baseline gap-3 py-1.5 text-left text-[0.95rem] ${activeSub === sub.id ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
                                  >
                                    <span className="t-data w-9 shrink-0 text-[0.85rem] text-stone">{sub.n}</span>
                                    <span className="flex-1">{sub.label}</span>
                                    {activeSub === sub.id && <span className="size-1.5 rounded-full bg-accent" />}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </nav>

            {/* Estado + modo presentación */}
            <div className="flex shrink-0 items-center gap-4 self-center">
              <span className="t-data hidden text-[0.88rem] text-stone sm:inline">
                <span className="text-ink">{current ? current.n : '00'}</span> / 08
              </span>
              <button onClick={toggleHelp} className="t-data hidden size-7 place-items-center rounded-full border border-line text-[0.88rem] text-stone hover:border-ink hover:text-ink md:grid" aria-label="Atajos de teclado">
                ?
              </button>
              <button
                onClick={togglePresenting}
                className={`t-label hidden items-center gap-2 rounded-full border px-3 py-1.5 text-[0.73rem] transition-colors md:flex ${presenting ? 'border-ink bg-ink text-paper' : 'border-ink/70 text-ink hover:bg-ink hover:text-paper'}`}
              >
                <span className={`size-1.5 rounded-full ${presenting ? 'bg-accent-2' : 'bg-accent'}`} />
                {presenting ? 'Salir · P' : 'Presentar · P'}
              </button>
              <button onClick={() => setSheet(true)} className="t-label flex items-center gap-2 text-[0.75rem] lg:hidden" aria-label="Abrir índice">
                <span className="hidden sm:inline">{current?.tab ?? 'Índice'}</span>
                <span className="sm:hidden">Índice</span>
                <span className="grid gap-[3px]">
                  <span className="block h-px w-4 bg-ink" />
                  <span className="block h-px w-4 bg-ink" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Índice completo — tablets y móviles */}
      <AnimatePresence>
        {sheet && (
          <motion.div className="fixed inset-0 z-[60] bg-paper lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="wrap flex h-16 items-center justify-between border-b border-line">
              <span className="t-label text-[0.75rem] text-stone">Índice del expediente</span>
              <button className="t-label text-[0.75rem]" onClick={() => setSheet(false)}>
                Cerrar
              </button>
            </div>
            <div className="wrap h-[calc(100svh-4rem)] overflow-y-auto py-6">
              {sections.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border-b border-line py-4">
                  <button
                    className="flex w-full items-baseline gap-4 text-left"
                    onClick={() => {
                      setSheet(false)
                      setTimeout(() => scrollToId(s.id), 50)
                    }}
                  >
                    <span className="t-data text-[0.94rem] text-accent">{s.n}</span>
                    <span className="font-display text-[1.9rem] leading-none">{s.title}</span>
                  </button>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-9">
                    {s.subs.map((sub) => (
                      <button
                        key={sub.id}
                        className="text-[0.92rem] text-stone"
                        onClick={() => {
                          setSheet(false)
                          setTimeout(() => scrollToId(sub.id), 50)
                        }}
                      >
                        {sub.n} {sub.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
