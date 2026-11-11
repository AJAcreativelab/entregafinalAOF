import { createContext, useContext } from 'react'

/** 'h' = tira horizontal tipo leporello (desktop) · 'v' = apilado vertical (móvil / movimiento reducido) */
export type StripMode = 'h' | 'v'
export const StripModeCtx = createContext<StripMode>('v')
export const useStripMode = () => useContext(StripModeCtx)
