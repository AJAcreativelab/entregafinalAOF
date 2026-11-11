/* ==========================================================================
   MANIFIESTO DE ASSETS
   --------------------------------------------------------------------------
   Cada "slot" tiene una ruta FIJA dentro de /public/assets.
   Para cargar una fotografía o video basta con copiar el archivo en esa
   carpeta con ese nombre exacto: la presentación lo detecta automáticamente
   y reemplaza el placeholder "Pendiente de carga". No hace falta tocar código.

   Si el archivo tiene otra extensión (.png, .webp, .mov…), cambiar sólo `src`.
   `ratio` es el formato del marco mientras la imagen no está cargada;
   una vez cargada, se respeta su proporción original (no se recorta).
   ========================================================================== */

export type AssetKind = 'image' | 'video'
export type AssetView = 'frontal' | 'smile' | 'three-quarter' | 'profile-right' | 'profile-left' | 'profile' | 'detail' | 'product' | 'video' | 'portrait'

export interface AssetSlot {
  id: string
  src: string
  kind: AssetKind
  label: string
  view: AssetView
  ratio: string // CSS aspect-ratio, p.ej. '4 / 5'
  poster?: string
}

const img = (id: string, src: string, label: string, view: AssetView, ratio = '4 / 5'): AssetSlot => ({
  id,
  src: `assets/${src}`,
  kind: 'image',
  label,
  view,
  ratio,
})
const vid = (id: string, src: string, label: string, ratio = '16 / 9'): AssetSlot => ({
  id,
  src: `assets/videos/${src}`,
  kind: 'video',
  label,
  view: 'video',
  ratio,
})

export const assets = {
  /* 00 · Portada y ficha */
  cover: img('cover', 'patient/initial/portada.jpg', 'Fotografía de portada (autorizada)', 'portrait', '4 / 5'),
  portrait: img('portrait', 'patient/initial/retrato-ficha.jpg', 'Retrato de ficha clínica', 'portrait', '4 / 5'),

  /* 03.1 · Protocolo fotográfico */
  frontalSerio: img('frontalSerio', 'patient/protocol/frontal-serio.jpg', 'Frontal en reposo (serio)', 'frontal'),
  frontalSonrisa: img('frontalSonrisa', 'patient/protocol/frontal-sonrisa.jpg', 'Frontal con sonrisa', 'smile'),
  tresCuartos: img('tresCuartos', 'patient/protocol/tres-cuartos.jpg', 'Tres cuartos', 'three-quarter'),
  perfilDerecho: img('perfilDerecho', 'patient/protocol/perfil-derecho.jpg', 'Perfil derecho', 'profile-right'),
  perfilIzquierdo: img('perfilIzquierdo', 'patient/protocol/perfil-izquierdo.webp', 'Perfil izquierdo', 'profile-left'),

  /* 03.2 · Piel */
  pielFrontal: img('pielFrontal', 'patient/skin-analysis/piel-frontal.jpg', 'Fotografía frontal — piel', 'frontal'),
  pielTextura: img('pielTextura', 'patient/skin-analysis/textura-luminosidad.jpg', 'Acercamiento — textura y luminosidad', 'detail', '1 / 1'),
  pielHidratacion: img('pielHidratacion', 'patient/skin-analysis/hidratacion.jpg', 'Acercamiento — hidratación', 'detail', '1 / 1'),
  pielArrugas: img('pielArrugas', 'patient/skin-analysis/arrugas-lineas.jpg', 'Acercamiento — arrugas y líneas', 'detail', '1 / 1'),
  pielPoros: img('pielPoros', 'patient/skin-analysis/poros-manchas.jpg', 'Acercamiento — poros y manchas', 'detail', '1 / 1'),
  pielFoto: img('pielFoto', 'patient/skin-analysis/fotoenvejecimiento.jpg', 'Acercamiento — fotoenvejecimiento', 'detail', '1 / 1'),
  pielOjeras: img('pielOjeras', 'patient/skin-analysis/ojeras.jpg', 'Acercamiento — ojeras', 'detail', '1 / 1'),

  /* 03.6 · Nariz (acercamientos) */
  narizFrontal: img('narizFrontal', 'patient/profile/nariz-frontal.jpg', 'Nariz — vista frontal', 'frontal'),
  narizPerfil: img('narizPerfil', 'patient/profile/nariz-perfil.jpg', 'Nariz — vista de perfil', 'profile'),

  /* 06.1 · Lipólisis enzimática */
  pbserum: img('pbserum', 'products/pbserum-enzimas.jpg', 'Enzimas lipolíticas PBSerum', 'product', '1 / 1'),
  lipoMapeo: img('lipoMapeo', 'procedures/lipolysis/mapeo-papada-zoom.jpg', 'Lipólisis — marcación de zonas', 'detail', '4 / 5'),
  lipoS1a: img('lipoS1a', 'procedures/lipolysis/sesion-1-a.jpg', 'Sesión 1 — registro A', 'detail'),
  lipoS1b: img('lipoS1b', 'procedures/lipolysis/sesion-1-b.jpg', 'Sesión 1 — registro B', 'detail'),
  lipoS1c: img('lipoS1c', 'procedures/lipolysis/sesion-1-c.jpg', 'Sesión 1 — registro C', 'detail'),
  lipoS1map: vid('lipoS1map', 'lipolisis-sesion-1-mapeo.mp4', 'Video — Sesión 1 · Mapeo', '9 / 16'),
  lipoS1v: vid('lipoS1v', 'lipolisis-sesion-1-procedimiento.mp4', 'Video — Sesión 1 · Procedimiento', '9 / 16'),
  lipoS2a: img('lipoS2a', 'procedures/lipolysis/sesion-2-a.jpg', 'Sesión 2 — registro A', 'detail'),
  lipoS2b: img('lipoS2b', 'procedures/lipolysis/sesion-2-b.jpg', 'Sesión 2 — registro B', 'detail'),
  lipoS2c: img('lipoS2c', 'procedures/lipolysis/sesion-2-c.jpg', 'Sesión 2 — registro C', 'detail'),
  lipoS2v: vid('lipoS2v', 'lipolisis-sesion-2.mp4', 'Video — Sesión 2'),
  lipoS2va: vid('lipoS2va', 'lipolisis-sesion-2-a.mp4', 'Video — Sesión 2 · Momento 1', '16 / 9'),
  lipoS2vb: vid('lipoS2vb', 'lipolisis-sesion-2-b.mp4', 'Video — Sesión 2 · Momento 2', '16 / 9'),
  lipoEvo1: img('lipoEvo1', 'procedures/lipolysis/evolucion-1.jpg', 'Evolución — registro 1', 'profile'),
  lipoEvo2: img('lipoEvo2', 'procedures/lipolysis/evolucion-2.jpg', 'Evolución — registro 2', 'frontal'),

  /* 06.2 · PRP */
  prpA: img('prpA', 'procedures/prp/procedimiento-a.jpg', 'PRP — procedimiento A', 'detail'),
  prpB: img('prpB', 'procedures/prp/procedimiento-b.jpg', 'PRP — procedimiento B', 'detail'),
  prpEvo: img('prpEvo', 'procedures/prp/evolucion.jpg', 'PRP — evolución', 'frontal'),
  prpV: vid('prpV', 'prp-procedimiento.mp4', 'Video — Procedimiento PRP', '9 / 16'),

  /* 06.3 · Rinomodelación */
  neauvia: img('neauvia', 'products/neauvia-intense-lv.jpg', 'NEAUVIA Intense LV', 'product', '1 / 1'),
  rinoFrontal: img('rinoFrontal', 'procedures/rhinomodelation/nariz-frontal.jpg', 'Nariz — frontal', 'frontal'),
  rinoPerfil: img('rinoPerfil', 'procedures/rhinomodelation/nariz-perfil.jpg', 'Nariz — perfil', 'profile'),
  rinoReferencia: img('rinoReferencia', 'procedures/rhinomodelation/referencia.jpg', 'Imagen de referencia', 'detail'),
  rinoTecnica: img('rinoTecnica', 'procedures/rhinomodelation/tecnica.jpg', 'Técnica aplicada', 'detail'),
  rinoV: vid('rinoV', 'rinomodelacion-tecnica.mp4', 'Video — Técnica de rinomodelación', '9 / 16'),

  /* 06.4 · Documentación adicional (plan) */
  bioestimulador: img('bioestimulador', 'procedures/bioestimulador.jpg', 'Bioestimulador Intense — documentación', 'detail'),
  endolaser: img('endolaser', 'procedures/endolaser.jpg', 'Endolaser — documentación', 'detail'),

  /* 07 · Video final */
  finalV: vid('finalV', 'resultado-final.mp4', 'Video final'),
} satisfies Record<string, AssetSlot>

export type AssetId = keyof typeof assets

/* Comparativas antes/después: mismas vistas para cada tratamiento.
   Ambas imágenes deben tener el MISMO encuadre y proporción. */
export type CompareView = 'frontal' | 'perfil' | 'tres-cuartos' | 'detalle'
export const compareViews: { id: CompareView; label: string }[] = [
  { id: 'frontal', label: 'Frontal' },
  { id: 'perfil', label: 'Perfil' },
]

export const comparePair = (treatment: string, view: CompareView) => ({
  before: img(`${treatment}-${view}-antes`, `results/before/${treatment}-${view}.jpg`, `Antes · ${view}`, 'frontal'),
  after: img(`${treatment}-${view}-despues`, `results/after/${treatment}-${view}.jpg`, `Después · ${view}`, 'frontal'),
})

export const finalPair = {
  before: img('inicio', 'results/before/inicio-frontal.jpg', 'Al inicio del tratamiento', 'frontal'),
  after: img('final', 'results/after/final-frontal.jpg', 'Al finalizar el tratamiento', 'frontal'),
  beforeProfile: img('inicio-perfil', 'results/before/inicio-perfil.jpg', 'Al inicio — perfil', 'profile'),
  afterProfile: img('final-perfil', 'results/after/final-perfil.jpg', 'Al finalizar — perfil', 'profile'),
}
