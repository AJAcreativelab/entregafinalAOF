/* Índice del expediente: alimenta el header, la barra de progreso,
   los atajos de teclado (1–8) y los separadores de capítulo. */

export interface NavSub {
  id: string
  n: string
  label: string
}
export interface NavSection {
  id: string
  n: string
  tab: string
  title: string
  en: string
  subs: NavSub[]
}

export const sections: NavSection[] = [
  {
    id: 'paciente',
    n: '01',
    tab: 'Paciente',
    title: 'Presentación de la paciente',
    en: 'Patient file',
    subs: [
      { id: 'paciente-ficha', n: '01.1', label: 'Ficha de la paciente' },
      { id: 'paciente-motivo', n: '01.2', label: 'Motivo de consulta' },
    ],
  },
  {
    id: 'historia',
    n: '02',
    tab: 'Historia clínica',
    title: 'Historia clínica',
    en: 'Medical history',
    subs: [{ id: 'historia-items', n: '02.1', label: 'Antecedentes' }],
  },
  {
    id: 'evaluacion',
    n: '03',
    tab: 'Evaluación',
    title: 'Evaluación y diagnóstico inicial',
    en: 'Facial assessment',
    subs: [
      { id: 'eval-general', n: '03.1', label: 'Protocolo fotográfico y análisis facial' },
      { id: 'eval-piel', n: '03.2', label: 'Evaluación de la piel' },
      { id: 'eval-adiposo', n: '03.3', label: 'Evaluación del tejido adiposo' },
      { id: 'eval-clasificaciones', n: '03.4', label: 'Clasificaciones dermatológicas' },
      { id: 'eval-mandibula', n: '03.5', label: 'Región mandibular y papada' },
      { id: 'eval-nasal', n: '03.6', label: 'Evaluación nasal' },
    ],
  },
  {
    id: 'diagnostico',
    n: '04',
    tab: 'Diagnóstico',
    title: 'Diagnóstico',
    en: 'Diagnosis',
    subs: [
      { id: 'diag-sintesis', n: '04.1', label: 'Síntesis de hallazgos' },
    ],
  },
  {
    id: 'plan',
    n: '05',
    tab: 'Plan',
    title: 'Plan de tratamiento',
    en: 'Treatment plan',
    subs: [{ id: 'plan-mapa', n: '05.1', label: 'Mapa de intervención' }],
  },
  {
    id: 'procedimientos',
    n: '06',
    tab: 'Procedimientos',
    title: 'Procedimientos realizados',
    en: 'Procedures',
    subs: [
      { id: 'proc-lipolisis', n: '06.1', label: 'Lipólisis enzimática' },
      { id: 'proc-prp', n: '06.2', label: 'Plasma rico en plaquetas' },
      { id: 'proc-rino', n: '06.3', label: 'Rinomodelación' },
    ],
  },
  {
    id: 'evolucion',
    n: '07',
    tab: 'Evolución',
    title: 'Evolución y resultados',
    en: 'Results',
    subs: [
      { id: 'res-comparativas', n: '07.1', label: 'Antes / después por tratamiento' },
      { id: 'res-final', n: '07.2', label: 'De dónde partimos / hacia dónde llegamos' },
    ],
  },
  {
    id: 'conclusiones',
    n: '08',
    tab: 'Conclusiones',
    title: 'Conclusiones',
    en: 'Conclusions',
    subs: [{ id: 'conclusiones-final', n: '08.1', label: 'Consideraciones finales' }],
  },
]

export const sectionById = Object.fromEntries(sections.map((s) => [s.id, s])) as Record<string, NavSection>
