import { useEffect, useState } from 'react'
import { assets, comparePair, compareViews, finalPair, type AssetSlot } from '../content/assets'

const TREATMENTS = ['lipolisis', 'prp', 'rinomodelacion']
/** Todos los slots (manifiesto + comparativas) para el inventario */
export const allSlots: AssetSlot[] = [
  ...Object.values(assets),
  ...TREATMENTS.flatMap((t) => compareViews.flatMap((v) => { const p = comparePair(t, v.id); return [p.before, p.after] })),
  ...Object.values(finalPair),
]

export type AssetState = { status: 'loading' | 'ready' | 'missing'; w?: number; h?: number }

const cache = new Map<string, Promise<AssetState>>()
const settled = new Map<string, AssetState>()
const listeners = new Set<() => void>()

// ?v=…: evita que el navegador muestre una versión vieja (o el aviso de pendiente) al agregar fotos nuevas
const SESSION = Date.now().toString(36)
const resolveUrl = (src: string) => `${import.meta.env.BASE_URL}${src}`.replace(/\/{2,}/g, '/') + `?v=${SESSION}`
export const assetUrl = resolveUrl

function probe(slot: AssetSlot): Promise<AssetState> {
  const url = resolveUrl(slot.src)
  if (cache.has(url)) return cache.get(url)!
  const p: Promise<AssetState> =
    slot.kind === 'image'
      ? new Promise((res) => {
          const im = new Image()
          im.decoding = 'async'
          im.onload = () => res({ status: 'ready', w: im.naturalWidth, h: im.naturalHeight })
          im.onerror = () => res({ status: 'missing' })
          im.src = url
        })
      : // El servidor de desarrollo responde index.html ante rutas inexistentes:
        // validamos el content-type para detectar si el video existe realmente.
        fetch(url, { method: 'HEAD' })
          .then((r) => (r.ok && (r.headers.get('content-type') ?? '').startsWith('video') ? ({ status: 'ready' } as AssetState) : ({ status: 'missing' } as AssetState)))
          .catch(() => ({ status: 'missing' }) as AssetState)
  p.then((s) => {
    settled.set(url, s)
    listeners.forEach((l) => l())
  })
  cache.set(url, p)
  return p
}

export function useAsset(slot: AssetSlot | undefined): AssetState {
  const url = slot ? resolveUrl(slot.src) : ''
  const [state, setState] = useState<AssetState>(() => settled.get(url) ?? { status: 'loading' })
  useEffect(() => {
    if (!slot) return
    let alive = true
    probe(slot).then((s) => alive && setState(s))
    return () => {
      alive = false
    }
  }, [url, slot])
  return slot ? state : { status: 'missing' }
}

/** Estado global del inventario (para el panel de assets) */
export function useInventory() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    allSlots.forEach((s) => probe(s))
    return () => {
      listeners.delete(l)
    }
  }, [])
  return allSlots.map((s) => ({ slot: s, state: settled.get(resolveUrl(s.src)) ?? { status: 'loading' as const } }))
}

export const getSlot = (id: string): AssetSlot | undefined => (assets as Record<string, AssetSlot>)[id]
