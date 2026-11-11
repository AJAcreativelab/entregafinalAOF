import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { sections } from '../config/navigation'
import { headerOffset, scrollToId } from './hooks'

interface Ctx {
  presenting: boolean
  togglePresenting: () => void
  calibrate: boolean
  toggleCalibrate: () => void
  inventory: boolean
  toggleInventory: () => void
  help: boolean
  toggleHelp: () => void
  active: string
  activeSub: string
  next: () => void
  prev: () => void
}

const PresentationCtx = createContext<Ctx | null>(null)
export const usePresentation = () => useContext(PresentationCtx)!

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.getAttribute('role') === 'slider')

function stepTops() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-step]'))
    .map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY - headerOffset()))
    .sort((a, b) => a - b)
}
/* Último destino: si se presiona varias veces seguidas (control remoto),
   cada pulsación avanza desde el destino anterior y no desde la mitad del recorrido. */
let lastTarget = { top: 0, at: 0 }
const go = (top: number) => {
  lastTarget = { top, at: performance.now() }
  window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
const basis = () => (performance.now() - lastTarget.at < 900 ? lastTarget.top : window.scrollY)

export function PresentationProvider({ children }: { children: ReactNode }) {
  const [presenting, setPresenting] = useState(false)
  const [calibrate, setCalibrate] = useState(false)
  const [inventory, setInventory] = useState(false)
  const [help, setHelp] = useState(false)
  const [active, setActive] = useState('cover')
  const [activeSub, setActiveSub] = useState('')

  const next = useCallback(() => {
    const y = basis() + 6
    const t = stepTops().find((v) => v > y)
    if (t !== undefined) go(t)
  }, [])
  const prev = useCallback(() => {
    const y = basis() - 6
    const t = [...stepTops()].reverse().find((v) => v < y)
    go(t ?? 0)
  }, [])

  const togglePresenting = useCallback(() => setPresenting((v) => !v), [])
  const toggleCalibrate = useCallback(() => setCalibrate((v) => !v), [])
  const toggleInventory = useCallback(() => setInventory((v) => !v), [])
  const toggleHelp = useCallback(() => setHelp((v) => !v), [])

  /* Clase global para el modo presentación */
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('presenting', presenting)
    if (!presenting) {
      root.classList.remove('idle')
      return
    }
    let t = 0
    const wake = () => {
      root.classList.remove('idle')
      clearTimeout(t)
      t = window.setTimeout(() => root.classList.add('idle'), 2200)
    }
    wake()
    window.addEventListener('mousemove', wake)
    return () => {
      clearTimeout(t)
      window.removeEventListener('mousemove', wake)
      root.classList.remove('idle')
    }
  }, [presenting])

  /* Sección activa según la línea de lectura (40% del viewport) */
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const line = window.innerHeight * 0.4
      let cur = 'cover'
      document.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => {
        if (el.getBoundingClientRect().top <= line) cur = el.dataset.section!
      })
      let sub = ''
      document.querySelectorAll<HTMLElement>('[data-sub]').forEach((el) => {
        if (el.getBoundingClientRect().top <= line) sub = el.dataset.sub!
      })
      setActive(cur)
      setActiveSub(sub)
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    const iv = window.setInterval(measure, 700)
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.clearInterval(iv)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  /* Teclado — pensado para exposición oral y controles remotos (PageUp/PageDown) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      if (document.body.dataset.lightbox === 'open') return
      const k = e.key
      const forward = ['PageDown', 'ArrowRight'].includes(k) || (presenting && (k === 'ArrowDown' || (k === ' ' && !e.shiftKey)))
      const back = ['PageUp', 'ArrowLeft'].includes(k) || (presenting && (k === 'ArrowUp' || (k === ' ' && e.shiftKey)))
      if (forward) {
        e.preventDefault()
        next()
      } else if (back) {
        e.preventDefault()
        prev()
      } else if (k === 'Home') {
        e.preventDefault()
        go(0)
      } else if (k === 'End') {
        e.preventDefault()
        go(document.documentElement.scrollHeight)
      } else if (/^[1-8]$/.test(k)) {
        scrollToId(sections[Number(k) - 1].id)
      } else if (k === '0') {
        go(0)
      } else if (k.toLowerCase() === 'p') {
        togglePresenting()
      } else if (k.toLowerCase() === 'f') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.().catch(() => {})
      } else if (k.toLowerCase() === 'c') {
        toggleCalibrate()
      } else if (k.toLowerCase() === 'i') {
        toggleInventory()
      } else if (k === '?' || k.toLowerCase() === 'h') {
        toggleHelp()
      } else if (k === 'Escape') {
        setHelp(false)
        setInventory(false)
        setCalibrate(false)
        if (presenting) setPresenting(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [presenting, next, prev, togglePresenting, toggleCalibrate, toggleInventory, toggleHelp])

  const value = useMemo(
    () => ({ presenting, togglePresenting, calibrate, toggleCalibrate, inventory, toggleInventory, help, toggleHelp, active, activeSub, next, prev }),
    [presenting, togglePresenting, calibrate, toggleCalibrate, inventory, toggleInventory, help, toggleHelp, active, activeSub, next, prev],
  )
  return <PresentationCtx.Provider value={value}>{children}</PresentationCtx.Provider>
}
