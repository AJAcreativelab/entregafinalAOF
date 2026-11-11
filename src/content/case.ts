/* ==========================================================================
   CONTENIDO ACADÉMICO — fuente: "CASO CLÍNICO INTEGRAL.pdf"
   --------------------------------------------------------------------------
   Todo el texto clínico vive aquí. Los componentes sólo lo presentan.
   Regla: no se agregan diagnósticos, cantidades, resultados ni conclusiones
   que no estén en el documento. Lo que falta se marca con `PENDING`.
   ========================================================================== */



/** Marcador de contenido pendiente: la UI lo muestra como espacio reservado */
export const PENDING = null
export type Maybe<T> = T | null

export const meta = {
  kicker: 'Caso clínico integral',
  specialty: 'Especialidad en Armonización Orofacial',
  title: 'Abordaje integral en Armonización Orofacial: presentación de un caso clínico.',
  patient: 'Natasha León',
  presenter: 'Dra. Jeanily Berné',
  fileCode: 'EXP · AOF · NL-40',
}

/* 01 ─────────────────────────────────────────────────────────────────────── */
export const patient = {
  name: 'Natasha León',
  age: '40 años',
  profession: 'Enfermera',
  concerns: ['Papada', 'Ojeras', 'Mejillas caídas'],
  quote: 'Los cachetes de bulldog es lo que más me sorprende',
  expectations: 'Muy positiva y abierta a los tratamientos estéticos',
  aestheticHistory: 'Solo se realiza PRP facial hace 4 años',
}

/* 02 ─────────────────────────────────────────────────────────────────────── */
export const history: { key: string; label: string; value: string; note?: string }[] = [
  { key: 'antecedentes', label: 'Antecedentes médicos', value: 'Cáncer de útero' },
  { key: 'cirugias', label: 'Cirugías', value: 'Se le realizó una cirugía y extracción de 21 ganglios e histerectomía parcial.' },
  { key: 'medicacion', label: 'Medicación habitual', value: 'No recibe' },
  { key: 'alergias', label: 'Alergias', value: 'Polen, Tramadol' },
  { key: 'previos', label: 'Tratamientos estéticos previos', value: 'PRP facial hace 4 años' },
]

/* 03 ─────────────────────────────────────────────────────────────────────── */
export const assessment = {
  intro:
    'A partir de las fotografías, se puede realizar la siguiente valoración morfológica y de los tejidos blandos, teniendo en cuenta las vistas de perfil, tres cuartos y frontal.',

  protocol: ['Fotografía frontal serio', 'Fotografía frontal con sonrisa', 'Fotografía en tres cuartos', 'Fotografía de perfil derecho e izquierdo'],

  symmetry: {
    title: 'Simetría facial',
    text: [
      'Se aprecia una asimetría leve entre ambos lados del rostro.',
      'Las diferencias se observan principalmente en la región malar, los surcos nasolabiales y la expresión de las comisuras.',
    ],
  },

  thirds: {
    title: 'Proporciones de los tercios faciales',
    items: [
      { label: 'Tercio superior', text: 'Desde la línea de implantación del cabello hasta la glabela.' },
      { label: 'Tercio medio', text: 'Desde la glabela hasta la base nasal.' },
      { label: 'Tercio inferior', text: 'Desde la base nasal hasta el mentón.' },
    ],
    note: 'En estas fotografías, el tercio inferior presenta un protagonismo visual importante por el volumen de los tejidos blandos de la región perioral, mentoniana y submentoniana.',
  },

  contour: {
    title: 'Forma y contorno facial',
    items: [
      { key: 'forma', text: 'Se observa un rostro de contorno predominantemente ovalado-ancho, con tendencia a una configuración redondeada.' },
      { key: 'inferior', text: 'La región inferior presenta mayor amplitud visual y volumen en comparación con el tercio superior.' },
      { key: 'mandibular', text: 'El contorno mandibular se encuentra poco definido, especialmente en la transición entre el borde mandibular y la región cervical.' },
      { key: 'menton', text: 'El mentón presenta una proyección moderada y una transición poco delimitada hacia la región submentoniana.' },
    ],
  },

  balance: {
    title: 'Equilibrio entre las estructuras faciales',
    text: PENDING as Maybe<string>,
  },

  skin: {
    title: 'Evaluación de la piel',
    lead: 'Fotografía frontal y acercamiento de la piel.',
    items: [
      { key: 'textura', asset: 'pielTextura', title: 'Textura y luminosidad', text: 'Textura relativamente uniforme, con poca luminosidad.' },
      { key: 'hidratacion', asset: 'pielHidratacion', title: 'Hidratación aparente', text: 'Aspecto de hidratación conservada.' },
      { key: 'arrugas', asset: 'pielArrugas', title: 'Arrugas y líneas de expresión', text: 'Presencia de pliegues infraorbitarios y surcos nasolabiales. Arrugas dinámicas.' },
      { key: 'poros', asset: 'pielPoros', title: 'Poros, manchas y alteraciones visibles', text: 'Poros ligeramente visibles y ojeras de tonalidad oscura bilateral.' },
      { key: 'foto', asset: 'pielFoto', title: 'Fotoenvejecimiento', text: 'Signos leves de alteración pigmentaria, sin arrugas estáticas evidentes.' },
      { key: 'ojeras', asset: 'pielOjeras', title: 'Ojeras mixtas, con predominio pigmentario', text: 'Presentan una coloración marrón oscura y una leve depresión del surco lagrimal que genera sombra en la zona infraorbitaria.' },
    ] as const,
  },

  adipose: {
    title: 'Evaluación del tejido adiposo',
    items: [
      { n: '1', title: 'Presencia y distribución de adiposidad localizada', text: 'Hay mayor volumen de tejido adiposo en el tercio inferior facial, especialmente en la región submentoniana y submandibular. También se aprecia plenitud en la zona inferior de las mejillas.' },
      { n: '2', title: 'Volumen de la región submentoniana', text: 'Hay acumulación de tejido adiposo submentoniano, con presencia de papada y disminución de la definición del ángulo cervicomentoniano.' },
      { n: '3', title: 'Evaluación de la región jowl', text: 'Hay plenitud en la región mandibular lateral, compatible con presencia de jowls o bolsas de Bichat mandibulares. Esto contribuye a una menor definición del borde mandibular.' },
      { n: '4', title: 'Definición del contorno facial', text: 'El contorno mandibular tiene definición disminuida, principalmente en el tercio inferior, asociada al volumen de los tejidos blandos submentonianos y perimandibulares. Se aprecia continuidad poco definida entre mandíbula y cuello.' },
    ],
  },

  classifications: {
    fitzpatrick: {
      title: 'Clasificación de Fitzpatrick',
      estimate: 'IV – V',
      text: 'Por la tonalidad cutánea observada, podría corresponder a un fototipo IV – V.',
      types: [
        { id: 'IV', text: 'Piel morena clara, se quema poco y se broncea con facilidad.' },
        { id: 'V', text: 'Muy rara vez se quema y se broncea intensamente de forma rápida.' },
      ],
    },
    baumann: {
      title: 'Clasificación de Baumann',
      code: 'ORPT',
      note: 'ORPT como clasificación orientativa.',
      rows: [
        { letter: 'O', name: 'Oil', parameter: 'Producción sebácea', value: 'Mixta', detail: 'Mayor producción de sebo en zona T y menor en mejillas.' },
        { letter: 'R', name: 'Resistant', parameter: 'Sensibilidad', value: 'R – Resistente', detail: 'Piel tolerante, sin reactividad evidente.' },
        { letter: 'P', name: 'Pigmented', parameter: 'Pigmentación', value: 'P – Pigmentada', detail: 'Tendencia a manchas e hiperpigmentación.' },
        { letter: 'T', name: 'Tight', parameter: 'Envejecimiento', value: 'T – Tight (firme)', detail: 'Sin arrugas profundas ni signos marcados de envejecimiento.' },
      ],
    },
    glogau: {
      title: 'Clasificación de Glogau',
      estimate: 'Glogau II',
      patientType: 'II',
      types: [
        { id: 'I', text: 'Sin arrugas evidentes.' },
        { id: 'II', text: 'Arrugas principalmente dinámicas, visibles con la expresión.' },
        { id: 'III', text: 'Arrugas estáticas visibles en reposo.' },
        { id: 'IV', text: 'Arrugas profundas y fotoenvejecimiento avanzado.' },
      ],
      text: 'En las fotografías se observan pliegues y líneas de expresión discretas, sin arrugas profundas generalizadas. La estimación sería compatible con Glogau II.',
    },
  },

  mandible: {
    title: 'Evaluación de la región mandibular y papada',
    lead: 'A partir de las fotografías frontales y de perfil, se observa:',
    items: [
      { key: 'borde', title: 'Definición del borde mandibular', text: 'Disminuida, con un contorno mandibular poco delimitado.' },
      { key: 'submento', title: 'Volumen submentoniano', text: 'Clasificación de Dedo grado III compatible con adiposidad submental y submandibular moderada.' },
      { key: 'continuidad', title: 'Continuidad del contorno mandibular', text: 'Alterada por el volumen de tejidos blandos en el tercio inferior facial y la región submentoniana.' },
      { key: 'jowl', title: 'Región jowl', text: 'Se aprecia cierta pérdida de definición en la zona mandibular lateral, con discreta acumulación de tejido blando.' },
      { key: 'angulo', title: 'Ángulo cervicomental', text: 'Aumentado, con transición poco definida entre el mentón y el cuello.' },
    ],
    dedo: 'III',
    conclusion:
      'Se evidencia un aumento de volumen submentoniano, disminución de la definición del borde mandibular y pérdida de nitidez del ángulo cervicomental, que afectan la definición del tercio inferior facial.',
  },

  nose: {
    title: 'Evaluación nasal',
    lead: 'A partir de las fotografías frontales y de perfil, se observa:',
    items: [
      { key: 'punta', title: 'Proyección de la punta nasal', text: 'Moderada, con punta ligeramente redondeada.' },
      { key: 'dorso', title: 'Perfil del dorso nasal', text: 'Dorso relativamente recto, con una leve concavidad.' },
      { key: 'simetria', title: 'Simetría frontal', text: 'Nariz centrada, sin desviaciones evidentes a simple vista.' },
      { key: 'relacion', title: 'Relación nasofacial', text: 'Proporción nasal globalmente armónica con las estructuras faciales, aunque debe valorarse en conjunto con el mentón y el perfil facial.' },
      { key: 'base', title: 'Base nasal', text: 'Se aprecia una base de amplitud moderada.' },
    ],
    conclusion:
      'Presenta una estructura nasal de aspecto relativamente armónico, con punta redondeada y dorso ligeramente cóncavo. No se observan alteraciones estructurales evidentes en las fotografías.',
  },
}

/* 04 ─────────────────────────────────────────────────────────────────────── */
/** Síntesis: sólo reúne hallazgos ya documentados en la evaluación. */
export const diagnosis = {
  /** El PDF incluye el título "Diagnóstico" sin texto desarrollado. */
  formal: PENDING as Maybe<string>,
  findings: [
    { region: 'Rostro', ref: 'eval-general', text: 'Asimetría leve: región malar, surcos nasolabiales y expresión de las comisuras. Contorno ovalado-ancho con tendencia redondeada.' },
    { region: 'Tercio inferior', ref: 'eval-general', text: 'Protagonismo visual por el volumen de los tejidos blandos de la región perioral, mentoniana y submentoniana.' },
    { region: 'Piel', ref: 'eval-piel', text: 'Poca luminosidad, arrugas dinámicas, máculas pigmentadas y ojeras mixtas con predominio pigmentario.' },
    { region: 'Tejido adiposo', ref: 'eval-adiposo', text: 'Acumulación de tejido adiposo submentoniano y plenitud en la región mandibular lateral (jowls).' },
    { region: 'Mandíbula y papada', ref: 'eval-mandibula', text: 'Se evidencia un aumento de volumen submentoniano, disminución de la definición del borde mandibular y pérdida de nitidez del ángulo cervicomental, que afectan la definición del tercio inferior facial.' },
    { region: 'Nariz', ref: 'eval-nasal', text: 'Estructura nasal de aspecto relativamente armónico, con punta redondeada y dorso ligeramente cóncavo. No se observan alteraciones estructurales evidentes.' },
  ],
  scales: [
    { name: 'Fitzpatrick', value: 'IV – V', note: 'Estimación visual' },
    { name: 'Baumann', value: 'ORPT', note: 'Clasificación orientativa' },
    { name: 'Glogau', value: 'II', note: 'Estimación orientativa' },
    { name: 'Dedo', value: 'III', note: 'Volumen submentoniano' },
  ],
}

/* 05 ─────────────────────────────────────────────────────────────────────── */
export type PlanStatus = 'documented' | 'plan-only'
export interface PlanItem {
  id: string
  n: string
  name: string
  detail: string
  sessions: Maybe<string>
  objective: Maybe<string>
  /** Vínculo con la evaluación. `confirmed: false` = a validar por la Dra. */
  links: { label: string; ref: string; confirmed: boolean }[]
  status: PlanStatus
  procedureRef?: string
  asset: string
}

export const plan: PlanItem[] = [
  {
    id: 'prp',
    n: '01',
    name: 'Mesoterapia con PRP',
    detail: 'Técnica Nappage y Dermapen',
    sessions: PENDING,
    objective: PENDING,
    links: [{ label: 'Evaluación de la piel', ref: 'eval-piel', confirmed: false }],
    status: 'documented',
    procedureRef: 'proc-prp',
    asset: 'prpA',
  },
  {
    id: 'lipolisis',
    n: '02',
    name: 'Lipólisis enzimática',
    detail: 'Papada y jowl',
    sessions: '2 sesiones',
    objective: PENDING,
    links: [
      { label: 'Motivo de consulta: papada · “cachetes de bulldog”', ref: 'paciente', confirmed: true },
      { label: 'Tejido adiposo', ref: 'eval-adiposo', confirmed: true },
      { label: 'Mandíbula y papada', ref: 'eval-mandibula', confirmed: true },
    ],
    status: 'documented',
    procedureRef: 'proc-lipolisis',
    asset: 'pbserum',
  },
  {
    id: 'bioestimulador',
    n: '03',
    name: 'Bioestimulador',
    detail: 'Bioestimulador',
    sessions: '2 sesiones',
    objective: PENDING,
    links: [],
    status: 'plan-only',
    asset: 'bioestimulador',
  },
  {
    id: 'endolaser',
    n: '04',
    name: 'Endolaser',
    detail: 'Endolaser',
    sessions: '1 sesión',
    objective: PENDING,
    links: [],
    status: 'plan-only',
    asset: 'endolaser',
  },
  {
    id: 'rino',
    n: '05',
    name: 'Rinomodelación',
    detail: 'NEAUVIA Intense LV · media jeringa',
    sessions: PENDING,
    objective: 'Que no descienda la punta al sonreír, levantar la punta de la nariz, corregir el perfil.',
    links: [{ label: 'Evaluación nasal', ref: 'eval-nasal', confirmed: true }],
    status: 'documented',
    procedureRef: 'proc-rino',
    asset: 'neauvia',
  },
]

/* 06 ─────────────────────────────────────────────────────────────────────── */
export interface Dose {
  name: string
  ml: number
  label: string
}
export interface LipoSession {
  n: 1 | 2
  label: string
  doses: Dose[]
  /** Total tal como figura en el documento */
  totalDocumented: { ml: number; label: string }
  distribution: { zone: string; ml: number; label: string }[]
  assets: string[]
  video: string
  /** Videos adicionales de la sesión, en orden (se muestran sin audio) */
  videos?: string[]
  /** Tomas del mismo gesto en dos momentos: se reproducen juntas, giradas a vertical */
  synced?: string[]
}

export const lipolysis = {
  title: 'Lipólisis enzimática',
  scope: 'Papada y jowl',
  product: 'Enzimas Lipolíticas PBSerum',
  activePrinciple: 'Complejo de enzimas recombinantes' as Maybe<string>,
  sessionsCount: '2',
  technique: [
    { zone: 'Papada', text: 'Mallado profesional más inyecciones profundas' },
    { zone: 'Jowl', text: 'Inyección en abanico (con mapeo tipo pizza)' },
  ],
  sessions: [
    {
      n: 1,
      label: '1.ª sesión',
      doses: [
        { name: 'Lipasa', ml: 1.5, label: '1,5 ml' },
        { name: 'Colagenasa', ml: 0.75, label: '0,75 ml' },
        { name: 'Hialuronidasa', ml: 0.75, label: '0,75 ml' },
      ],
      totalDocumented: { ml: 2.75, label: '2,75 ml' },
      distribution: [
        { zone: 'Papada', ml: 1.5, label: '1,5 ml' },
        { zone: 'Jowl izquierdo', ml: 0.75, label: '0,75 ml' },
        { zone: 'Jowl derecho', ml: 0.75, label: '0,75 ml' },
      ],
      assets: ['lipoS1a', 'lipoS1b', 'lipoS1c'],
      video: 'lipoS1v',
      videos: ['lipoS1map', 'lipoS1v'],
    },
    {
      n: 2,
      label: '2.ª sesión',
      doses: [
        { name: 'Lipasa', ml: 3, label: '3 ml' },
        { name: 'Colagenasa', ml: 1.5, label: '1,5 ml' },
        { name: 'Hialuronidasa', ml: 1.5, label: '1,5 ml' },
      ],
      totalDocumented: { ml: 6, label: '6 ml' },
      distribution: [
        { zone: 'Papada', ml: 3, label: '3 ml' },
        { zone: 'Jowl izquierdo', ml: 1.5, label: '1,5 ml' },
        { zone: 'Jowl derecho', ml: 1.5, label: '1,5 ml' },
      ],
      assets: ['lipoS2a', 'lipoS2b', 'lipoS2c'],
      video: 'lipoS2v',
      synced: ['lipoS2va', 'lipoS2vb'],
    },
  ] satisfies LipoSession[],
  evolution: { text: PENDING as Maybe<string>, assets: ['lipoEvo1', 'lipoEvo2'] },
}

export const prp = {
  title: 'Plasma rico en plaquetas',
  abbr: 'PRP',
  technique: ['Nappage', 'Dermapen', 'DMAE'],
  techniqueText: 'Nappage y dermapen + DMAE',
  material: 'Plasma rico en plaquetas',
  evolution: { text: PENDING as Maybe<string> },
}

export const rhino = {
  title: 'Rinomodelación',
  product: 'NEAUVIA Intense LV',
  amount: 'Media jeringa',
  objectives: ['Que no descienda la punta al sonreír', 'Levantar la punta de la nariz', 'Corregir el perfil'],
  composition: {
    lines: [
      { k: 'Ácido hialurónico', v: '26 mg/ml' },
      { k: 'Glicina', v: '+' },
      { k: 'L-prolina', v: '+' },
      { k: 'Reticulación', v: 'PEG' },
    ],
    text: 'Ácido hialurónico (26 mg/ml) con glicina y L-prolina, reticulado con PEG en lugar de los reticulantes tradicionales (como BDDE), lo que genera una alta capacidad elástica y volumizadora, menor inflamación o edema post-procedimiento y gran estabilidad en los tejidos.',
  },
  purpose: 'Aportar soporte estructural, definición y rectificación de pequeñas irregularidades sin cirugía.',
  techniques: [
    {
      title: 'Proyección y elevación de la punta nasal',
      technique: 'Se coloca un soporte de alta densidad (como el que ofrece Intense LV) en la espina nasal o en la columela/punta para levantarla levemente.',
      objective: 'Corregir la caída de la punta (especialmente al sonreír) y afinar visualmente el frente.',
    },
    {
      title: 'Corrección del dorso nasal (camuflaje de giba / caballete)',
      technique: 'Se aplica producto por encima y/o por debajo de una pequeña protuberancia ósea o cartilaginosa para nivelar el puente de la nariz.',
      objective: 'Lograr un perfil recto y uniforme de vista lateral.',
    },
  ],
}

/* 07 ─────────────────────────────────────────────────────────────────────── */
export const results = {
  treatments: [
    { id: 'lipolisis', label: 'Lipólisis enzimática', short: 'Lipólisis', sub: 'Plasma rico en plaquetas (PRP) mesoterapia' },
    { id: 'rinomodelacion', label: 'Rinomodelación', short: 'Rinomodelación', sub: undefined as string | undefined },
  ],
  fields: [
    { key: 'respuesta', label: 'Respuesta de la paciente a los tratamientos', value: PENDING as Maybe<string> },
    { key: 'cambios', label: 'Cambios observados', value: PENDING as Maybe<string> },
    { key: 'region', label: 'Resultados por región', value: PENDING as Maybe<string> },
    { key: 'comparacion', label: 'Comparación fotográfica inicial y final', value: PENDING as Maybe<string> },
    { key: 'satisfaccion', label: 'Satisfacción de la paciente', value: PENDING as Maybe<string> },
    { key: 'seguimiento', label: 'Seguimiento realizado', value: PENDING as Maybe<string> },
  ],
}

/* 08 ─────────────────────────────────────────────────────────────────────── */
export const conclusions = [
  { key: 'abordaje', title: 'Reflexión sobre el abordaje integral', value: PENDING as Maybe<string> },
  { key: 'plan', title: 'Evaluación del plan terapéutico', value: PENDING as Maybe<string> },
  { key: 'resultados', title: 'Análisis de los resultados', value: PENDING as Maybe<string> },
  { key: 'finales', title: 'Consideraciones finales', value: PENDING as Maybe<string> },
]
