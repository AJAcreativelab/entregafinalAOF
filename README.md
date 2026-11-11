# Clinical Case File — Caso Clínico Integral

Presentación interactiva del caso de **Natasha León**, presentada por la **Dra. Jeanily Berné**
(Especialidad en Armonización Orofacial).

Estructura tipo *leporello*: el expediente es una tira de páginas plegada en acordeón. El scroll la
despliega y luego la recorre en horizontal; en móvil las páginas se apilan en vertical.

Stack: React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion. Sitio 100 % estático: no requiere backend
y funciona sin conexión a internet (las tipografías están incluidas localmente).

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera /dist (abrir con: npm run preview)
```

`/dist` puede subirse a cualquier hosting estático (Vercel, Netlify, GitHub Pages) o servirse localmente
el día de la defensa con `npm run preview`.

## Cargar fotografías y videos (sin tocar código)

Cada espacio de foto/video tiene una ruta fija dentro de `public/assets/`. Copiar el archivo **con ese
nombre exacto** y recargar: el placeholder "Pendiente de carga" se reemplaza solo.

- Cada placeholder muestra en pantalla la ruta que espera (`/public/assets/...`).
- Tecla **I** → inventario: lista todos los archivos esperados y marca cuáles ya están cargados.
- El listado completo está en `src/content/assets.ts`. Si el archivo tiene otra extensión
  (.png, .webp, .mov), cambiar sólo el campo `src` de ese slot.
- Las fotos se muestran **sin recortar ni alterar**: se respeta la proporción original.
- Comparativas antes/después: `public/assets/results/before/<tratamiento>-<vista>.jpg` y
  `public/assets/results/after/<tratamiento>-<vista>.jpg` — tratamiento: `lipolisis`, `prp`,
  `rinomodelacion`; vista: `frontal`, `perfil`, `tres-cuartos`, `detalle`. Ambas fotos de cada par deben
  tener el mismo encuadre y tamaño.
- Videos: `public/assets/videos/` (MP4 H.264 recomendado). Exportar fotos en JPG ~2000 px de lado mayor.

## Calibrar las anotaciones anatómicas

Las líneas, puntos y etiquetas son una capa SVG independiente (nunca modifican la foto). Sus posiciones
actuales son provisorias, sobre una silueta esquemática. Una vez cargadas las fotos reales:

1. Pulsar **C** (modo calibración): aparece una cruz y las coordenadas `[x, y]` en % sobre cada foto anotada.
2. Hacer clic sobre el punto anatómico → la coordenada se copia al portapapeles.
3. Pegarla en `src/content/annotations.ts`, en la anotación correspondiente.

El modo calibración también muestra avisos de revisión de datos (ver "Observaciones del documento").

## Modo presentación

| Tecla | Acción |
| --- | --- |
| **P** | Activar / salir del modo presentación (oculta el header, tipografía más grande) |
| **F** | Pantalla completa |
| → · PgDn · ↓ · Espacio | Siguiente bloque (compatible con presentadores/clickers) |
| ← · PgUp · ↑ | Bloque anterior |
| 1 – 8 | Saltar a capítulo · 0 = portada |
| C · I · ? | Calibración · inventario · atajos |

Optimizado para proyección 1920 × 1080 (16:9). En modo presentación el header reaparece acercando el
cursor al borde superior y el cursor se oculta tras 2 s sin movimiento.

## Dónde editar el contenido

| Archivo | Contenido |
| --- | --- |
| `src/content/case.ts` | Todo el texto clínico (fuente: CASO CLÍNICO INTEGRAL.pdf). Campos `PENDING` = espacio reservado |
| `src/content/assets.ts` | Rutas de fotos y videos |
| `src/content/annotations.ts` | Anotaciones sobre fotografías |
| `src/config/navigation.ts` | Índice del expediente (header, capítulos, subsecciones) |
| `src/strip/panels.tsx` | Las páginas del leporello: orden, ancho (`w`, en % del ancho de pantalla), tono claro/oscuro y contenido de cada página |
| `src/strip/Leporello.tsx` | Motor del libro plegado (apertura, despliegue, lectura, hover, hoja ampliada, cierre y contratapa). Especificación en `MOTION.md` |

Para completar un dato pendiente (p. ej. conclusiones, diagnóstico, evolución), reemplazar `PENDING` por
el texto entre comillas.

## Observaciones del documento fuente (a revisar por la Dra. Berné)

- **Lipólisis, 1.ª sesión:** los componentes suman 3 ml (1,5 + 0,75 + 0,75) y la distribución también
  (1,5 + 0,75 × 2), pero el total documentado es **2,75 ml**. Se muestra el valor del documento.
- **Diagnóstico:** el título aparece en el plan de tratamiento sin texto desarrollado → espacio reservado (04.2).
- **Equilibrio entre estructuras faciales** (03.1-D): sin análisis en el documento; la página se quitó de la presentación por pedido de la autora.
- **Principio activo** de las enzimas, **evolución** de
  cada procedimiento, **resultados** y **conclusiones**: sin contenido en el documento → espacios reservados.
- **Bioestimulador Intense** (2 sesiones) y **Endolaser** (1 sesión) figuran en el plan pero sin ficha de
  procedimiento → espacios opcionales en 06.4, sin datos simulados.
- **Sesiones de PRP y de rinomodelación** y **objetivos** de PRP, lipólisis, bioestimulador y endolaser
  no figuran en el documento.
- El vínculo "PRP → Evaluación de la piel" en el plan está marcado como *a confirmar* (no está explícito
  en la fuente).
- Correcciones tipográficas menores: "40 ños" → "40 años"; "submetall" → "submental"; "Dmae" → "DMAE".
- Numeración del PDF (4. Protocolo fotográfico dentro de 3; 6.4 sin 6.3; 9. Conclusiones sin 8) unificada
  según el índice de 8 capítulos de la presentación.
