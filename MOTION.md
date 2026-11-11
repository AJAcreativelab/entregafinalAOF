# Sistema de motion — auditoría de Leporello y su traslado al expediente

Referencia: https://leporello.framer.website/ (auditada en 1920 × 1080 recorriendo la web, midiendo las
transformaciones del DOM cuadro a cuadro y leyendo los parámetros del componente). La implementación del
expediente es propia (`src/strip/Leporello.tsx`); no reutiliza código, textos ni imágenes de la referencia.

## 1. Qué es la referencia

Un **libro plegado en acordeón** (leporello) puesto sobre una mesa. Toda la experiencia es UN objeto físico:
no hay secciones con animaciones propias. El papel se mueve; la tinta no.

| Capa | Comportamiento observado |
| --- | --- |
| Escenario | `position: sticky`, 100svh, `perspective: 2400px`, origen 50% 48%, fondo con luz cenital (gradiente radial desde arriba) |
| Páginas | Todas del mismo alto; cada una gira `rotateY` sobre su **borde izquierdo** (`transform-origin: 0 50%`), con signo alternado (zigzag) |
| Cadena | Las posiciones se encadenan: `x[i+1] = x[i] + w·cos φ`, `z[i+1] = z[i] − w·sin φ`. Una página nunca se separa de la siguiente |
| Contenido | Diseñado a un tamaño fijo de página y escalado con `scale(k)`; no se reacomoda al girar |
| Luz | Un softbox cenital: cada página es un tono plano (el pliegue queda como arista nítida); las páginas pares, un paso más oscuras; un leve degradé de suelo en la base |
| Sombra | Sombra de contacto sobre el piso bajo cada página |

## 2. Fases del recorrido

| Fase | Mecánica | Tiempo / curva |
| --- | --- | --- |
| Carga | El libro aparece **cerrado** (todas las páginas a 87°), centrado. Tras 250 ms (y fuentes listas) se abre hasta el zigzag de reposo | 1800 ms · ease-out cúbica `1−(1−t)³` |
| Reposo | Portada a 46°; el resto a un ángulo θ₀ calculado para que el acordeón ocupe el 80 % del ancho | — |
| Desplegar | El scroll lleva cada ángulo del reposo a su ángulo de lectura y desplaza el libro del centro al margen izquierdo | smoothstep `t²(3−2t)` sobre la primera pantalla de scroll |
| Lectura | Ventana de lectura de **2 páginas planas** apoyadas en el margen. La que sale se pliega a 80° girando sobre su arista derecha; las que esperan se apilan a la derecha a 56°. Transiciones con smoothstep | 0,8 pantallas de scroll por página |
| Inercia | El progreso sigue al scroll con amortiguación exponencial (no es 1:1) | τ = 0,1 s |
| Cierre | Al seguir desplazando después de la última página (> 28 % de un tramo de 0,7 pantallas) el acordeón se cierra y el libro gira para mostrar la contratapa | cierre 560 ms ease-in-out cúbica · giro 820 ms ease-out |
| Reapertura | Scroll hacia arriba o Esc: la contratapa gira de vuelta y el acordeón se reabre | 620 ms in-out · 680 ms out |

## 3. Microinteracciones

| Interacción | Comportamiento |
| --- | --- |
| Hover sobre una página | La página se **abre un 38 %** respecto de su pliegue (se asoma hacia el lector) con un resorte (rigidez 100, amortiguación 20). Sólo se percibe en las páginas plegadas |
| Clic en una página | La página se expande a una "hoja" de lectura con FLIP desde su posición | 620 ms `cubic-bezier(.2,.72,.1,1)` · cierre 560 ms |
| Enlaces | Subrayado que crece desde la izquierda | 350 ms `cubic-bezier(.2,.7,.2,1)` |
| Elementos fijos | Header (nombre · mapa del libro + contador · navegación), rótulo inferior izquierdo y una pista central ("Desplazar para desplegar" / "Seguí desplazando para cerrar") |
| Mapa del libro | Glifo del header = **vista cenital en vivo** del acordeón (x, z de cada bisagra): es un zigzag que se aplana al desplegar |

## 4. Qué se replica fielmente y qué se adapta

**Fiel:** escenario, cadena de bisagras, ángulos (46°/θ₀/56°/80°/87°/89,5°), ventana de 2 páginas,
smoothstep, inercia τ 0,1 s, apertura 1,8 s, cierre y contratapa, hover con resorte, hoja FLIP con su curva,
luz plana con páginas pares más oscuras, sombra de contacto, mapa cenital y pistas.

**Adaptado:**
- Ancho de página variable en unidades (1 · 1,5 · 2): el expediente tiene páginas-pliego para series
  fotográficas. La ventana de lectura se mide en unidades (2), lo que con páginas simples equivale exactamente
  a la referencia.
- Escala de página sin tope en 1 para mejorar la legibilidad a distancia en la proyección.
- Contenido clínico, paleta, tipografía e identidad del expediente.
- Las anotaciones anatómicas se dibujan cuando su página entra en la ventana de lectura (la única "tinta" que
  se mueve, por pedido explícito del brief).
- Móvil (< 1024 px) y movimiento reducido: las páginas se apilan en vertical.
