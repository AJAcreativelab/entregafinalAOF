import { MotionConfig } from 'motion/react'
import { Backdrop } from './components/Backdrop'
import { HelpOverlay, InventoryPanel, ProgressRail } from './components/Chrome'
import { Header } from './components/Header'
import { Lightbox } from './components/Lightbox'
import { PresentationProvider } from './lib/presentation'
import { backCover, panels } from './strip/panels'
import { Strip } from './strip/Strip'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <PresentationProvider>
        {/* Escenario grafito: base, halos, arcos de luz, piso, logo UCAM, viñeta, grano */}
        <Backdrop />
        <Header />
        <main>
          <Strip panels={panels} back={backCover} />
        </main>
        <ProgressRail />
        <HelpOverlay />
        <InventoryPanel />
        <Lightbox />
      </PresentationProvider>
    </MotionConfig>
  )
}
