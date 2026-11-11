import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

export function useMediaQuery(q: string) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

export const useCalmMotion = () => useReducedMotion() ?? false

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset()
  window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  history.replaceState(null, '', `#${id}`)
}

export function headerOffset() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0
}
