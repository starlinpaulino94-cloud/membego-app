/**
 * Biblioteca de Automation Playbooks de FRECUENCIA (Fase E1.4). Aumentan la
 * frecuencia de compra/visita/consumo, crean hábitos y elevan el LTV. No son
 * automatizaciones simples por tiempo: reaccionan al COMPORTAMIENTO, las
 * preferencias y los patrones del cliente. Estrategias probadas de fidelización
 * y suscripción (Starbucks Rewards/Sephora/Amazon/retail/CRM) convertidas en
 * playbooks UNIVERSALES instalables sobre el Automation Engine (E1). Reutilizan
 * Rule Engine (condiciones), Action Engine (acciones) y referencian Benefit/
 * Promotion/Membership/Reward/Gamification/Campaign/Analytics por código. Car
 * Wash es solo la primera industria que las usa.
 *
 * Cada Playbook es una automatización real (`config`) + su documentación
 * completa (24 apartados). Nada hardcodeado por industria: beneficios/promos por
 * código y textos con variables `{{...}}`. Las automatizaciones basadas en IA se
 * integran vía `INVOKE_MODULE` sin alterar la lógica existente.
 */

import { ACTION_TYPES } from '@/lib/rule-engine'
import { AUTOMATION_EVENTS as EV } from '../domain/events'
import { INDUSTRIES as I } from './types'
import type { AutomationPlaybook } from './types'

const U = I.UNIVERSAL

// Configuración editable mínima (Documento Maestro): común a todos.
const EDITABLE = [
  'nombre', 'descripcion', 'triggers', 'reglas', 'frecuenciaEsperada', 'intervalos',
  'horarios', 'segmentos', 'beneficios', 'promociones', 'limites', 'variables',
  'prioridad', 'idioma', 'sucursales', 'canales', 'sensibilidadDeteccion',
] as const

// KPIs típicos de frecuencia / hábito / LTV.
const FREQ_KPIS = [
  'frecuencia_visitas', 'tiempo_entre_compras', 'ltv', 'tasa_retencion',
  'uso_membresia', 'uso_beneficios', 'rachas_activas', 'riesgo_abandono',
  'reactivacion', 'tasa_apertura', 'tasa_clic',
] as const

/** Helper: completa los apartados comunes de un playbook de frecuencia. */
function pb(
  p: Omit<AutomationPlaybook, 'category' | 'editable' | 'kpis' | 'engines'> &
    Partial<Pick<AutomationPlaybook, 'engines' | 'kpis' | 'editable'>>,
): AutomationPlaybook {
  return {
    category: 'frecuencia',
    editable: p.editable ?? EDITABLE,
    kpis: p.kpis ?? FREQ_KPIS,
    engines: p.engines ?? ['rule', 'action', 'analytics'],
    ...p,
  }
}

export const FREQUENCY_PLAYBOOKS: readonly AutomationPlaybook[] = [
  pb({
    id: 'FREQ-001',
    name: 'Frecuencia en descenso (preventivo)',
    objective: 'Reaccionar cuando el tiempo entre visitas empieza a aumentar.',
    problem: 'La caída de frecuencia anticipa el abandono si no se actúa.',
    whenToUse: 'Cuando el intervalo entre visitas supera la frecuencia habitual.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: baja de frecuencia'],
    conditions: ['Intervalo actual > frecuencia esperada * sensibilidad'],
    variables: ['cliente.nombre', 'cliente.diasSinVisita', 'cliente.frecuenciaHabitual'],
    engines: ['rule', 'action', 'benefit', 'promotion', 'analytics'],
    flow: ['Se detecta descenso de frecuencia', 'Se analiza el comportamiento', 'Se aplica estrategia preventiva (incentivo)', 'Al volver, se registra'],
    actions: [ACTION_TYPES.SEND_PUSH, ACTION_TYPES.APPLY_BENEFIT],
    esperas: ['Reintento a los N días si no regresa (editable)'],
    events: [EV.CLIENT_FREQUENCY_DROP, EV.CLIENT_REWARD_OBTAINED],
    exceptions: ['Cliente nuevo sin patrón', 'Frecuencia esperada no definida'],
    compatibleBenefits: ['CAR-004', 'CAR-011'],
    compatiblePromotions: ['REACTIVATION', 'FREQUENCY'],
    compatibleCampaigns: ['retencion', 'frecuencia'],
    dependencies: ['Analytics con frecuencia habitual por cliente'],
    compatibleTemplates: [],
    examples: ['Car Wash: normalmente cada 7 días y lleva 14 → incentivo', 'Gimnasio: baja de asistencia semanal → reto'],
    notes: 'La sensibilidad de detección es editable; complementa la recuperación de E1.5.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_FREQUENCY_DROP },
      variables: ['cliente.nombre', 'cliente.diasSinVisita'],
      channels: ['push', 'whatsapp'],
      limits: { maxPerSubject: 2, perPeriod: 'MONTH' },
      steps: [
        {
          label: 'Estrategia preventiva',
          condition: 'cliente.diasSinVisita > cliente.frecuenciaHabitual',
          actions: [
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Te extrañamos, {{cliente.nombre}}', body: 'Vuelve con un beneficio pensado para ti.' } },
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-004' } },
          ],
          chain: { event: EV.CLIENT_REWARD_OBTAINED },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-002',
    name: 'Cliente constante (reconocimiento)',
    objective: 'Reconocer y reforzar a quien mantiene una frecuencia estable.',
    problem: 'Los clientes constantes se dan por sentados y pueden desengancharse.',
    whenToUse: 'Cuando el cliente mantiene su frecuencia esperada por N periodos.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Segmento: frecuencia estable'],
    conditions: ['Frecuencia dentro del rango esperado de forma sostenida'],
    variables: ['cliente.nombre', 'cliente.frecuenciaHabitual'],
    engines: ['rule', 'action', 'benefit', 'reward', 'analytics'],
    flow: ['Se reconoce el comportamiento estable', 'Se entrega un beneficio configurable', 'Se registra el reconocimiento'],
    actions: [ACTION_TYPES.APPLY_BENEFIT, ACTION_TYPES.SEND_PUSH],
    esperas: ['Cadencia de reconocimiento editable (ej. mensual)'],
    events: [EV.CLIENT_REWARD_OBTAINED],
    exceptions: ['Frecuencia inestable', 'Beneficio sin stock'],
    compatibleBenefits: ['CAR-001', 'CAR-004'],
    compatiblePromotions: ['LOYALTY', 'FREQUENCY'],
    compatibleCampaigns: ['fidelizacion', 'frecuencia'],
    dependencies: ['Analytics con evaluación de estabilidad'],
    compatibleTemplates: [],
    examples: ['“Gracias por tu constancia: un regalo para ti”'],
    notes: 'El beneficio y la cadencia son editables; refuerza el hábito ya adquirido.',
    config: {
      trigger: { type: 'SEGMENT_ENTER', params: { segment: 'frecuencia_estable' } },
      variables: ['cliente.nombre'],
      channels: ['push', 'email'],
      steps: [
        {
          label: 'Reconocer constancia',
          actions: [
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-004' } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Gracias por tu constancia, {{cliente.nombre}}', body: 'Tienes un regalo por ser cliente frecuente.' } },
          ],
          chain: { event: EV.CLIENT_REWARD_OBTAINED },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-003',
    name: 'Frecuencia por encima de lo habitual',
    objective: 'Premiar un incremento positivo de frecuencia y elevar el segmento.',
    problem: 'No aprovechar el momento de mayor engagement pierde LTV.',
    whenToUse: 'Cuando el cliente supera su frecuencia habitual.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: subió frecuencia'],
    conditions: ['Frecuencia reciente > frecuencia habitual'],
    variables: ['cliente.nombre', 'cliente.frecuenciaReciente', 'cliente.frecuenciaHabitual'],
    engines: ['rule', 'action', 'reward', 'gamification', 'analytics'],
    flow: ['Se detecta incremento', 'Se otorga recompensa', 'Se actualiza la segmentación', 'Se registra'],
    actions: [ACTION_TYPES.ADD_POINTS, ACTION_TYPES.SEND_PUSH, ACTION_TYPES.RECORD_EVENT],
    esperas: [],
    events: [EV.CLIENT_FREQUENCY_UP, EV.CLIENT_REWARD_OBTAINED],
    exceptions: ['Sin frecuencia habitual de referencia'],
    compatibleBenefits: ['CAR-001'],
    compatiblePromotions: ['FREQUENCY'],
    compatibleCampaigns: ['gamificacion', 'frecuencia'],
    dependencies: ['Analytics con comparación de frecuencia', 'Reward/Gamification Engine'],
    compatibleTemplates: [],
    examples: ['“Estás viniendo más seguido: ganaste puntos extra”'],
    notes: 'Actualiza el segmento a “muy activo”; recompensa editable.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_FREQUENCY_UP },
      variables: ['cliente.nombre'],
      channels: ['push'],
      steps: [
        {
          label: 'Premiar incremento',
          condition: 'cliente.frecuenciaReciente > cliente.frecuenciaHabitual',
          actions: [
            { type: ACTION_TYPES.ADD_POINTS, params: { points: 30 } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: '¡Vas genial, {{cliente.nombre}}!', body: 'Estás más activo que nunca. Ganaste puntos extra.' } },
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'segmento.muy_activo' } },
          ],
          chain: { event: EV.CLIENT_REWARD_OBTAINED },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-004',
    name: 'Racha rota (recuperación temprana)',
    objective: 'Recuperar al cliente que deja de cumplir su patrón de racha.',
    problem: 'Romper una racha suele preceder el abandono.',
    whenToUse: 'Cuando el cliente pierde una racha activa.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: perdió racha'],
    conditions: ['El cliente tenía una racha activa y la rompió'],
    variables: ['cliente.nombre', 'cliente.rachaPrevia'],
    engines: ['rule', 'action', 'gamification', 'benefit', 'analytics'],
    flow: ['Se detecta racha rota', 'Se ofrece recuperar/retomar con incentivo', 'Al volver, se reinicia la racha'],
    actions: [ACTION_TYPES.SEND_PUSH, ACTION_TYPES.APPLY_BENEFIT],
    esperas: ['Aviso inmediato y recordatorio a 48h (editable)'],
    events: [EV.CLIENT_STREAK_LOST, EV.CLIENT_REWARD_OBTAINED],
    exceptions: ['Sin racha previa', 'Gamificación desactivada'],
    compatibleBenefits: ['CAR-011', 'CAR-004'],
    compatiblePromotions: ['REACTIVATION'],
    compatibleCampaigns: ['gamificacion', 'retencion'],
    dependencies: ['Gamification Engine con rachas'],
    compatibleTemplates: [],
    examples: ['“Tu racha se pausó: recupérala hoy y no pierdas tu progreso”'],
    notes: 'Recuperación temprana específica de racha; complementa FREQ-001.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_STREAK_LOST },
      variables: ['cliente.nombre'],
      channels: ['push', 'whatsapp'],
      steps: [
        {
          label: 'Recuperar racha',
          actions: [
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Tu racha se pausó, {{cliente.nombre}}', body: 'Recupérala hoy y conserva tu progreso.' } },
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-011' } },
          ],
          chain: { event: EV.CLIENT_REWARD_OBTAINED },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-005',
    name: 'Nueva racha (motivar continuidad)',
    objective: 'Registrar un nuevo hábito, mostrar progreso y motivar la continuidad.',
    problem: 'Los hábitos nacientes se abandonan sin refuerzo de progreso.',
    whenToUse: 'Cuando el cliente inicia/alcanza una racha.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Evento: alcanzó racha'],
    conditions: ['Racha activa recién formada'],
    variables: ['cliente.nombre', 'cliente.rachaActual'],
    engines: ['rule', 'action', 'gamification', 'analytics'],
    flow: ['Se registra la racha', 'Se muestra el progreso', 'Se motiva a continuar'],
    actions: [ACTION_TYPES.SEND_PUSH, ACTION_TYPES.ADD_POINTS],
    esperas: [],
    events: [EV.CLIENT_STREAK_REACHED, EV.CLIENT_REWARD_OBTAINED],
    exceptions: ['Gamificación desactivada'],
    compatibleBenefits: ['CAR-001'],
    compatiblePromotions: [],
    compatibleCampaigns: ['gamificacion', 'frecuencia'],
    dependencies: ['Gamification Engine con rachas'],
    compatibleTemplates: [],
    examples: ['“Racha de 3 visitas: sigue así para desbloquear un premio”'],
    notes: 'Muestra el progreso hacia el siguiente hito; refuerzo positivo editable.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_STREAK_REACHED },
      variables: ['cliente.nombre', 'cliente.rachaActual'],
      channels: ['push'],
      steps: [
        {
          label: 'Motivar continuidad',
          actions: [
            { type: ACTION_TYPES.ADD_POINTS, params: { points: 10 } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: '¡Racha activa, {{cliente.nombre}}!', body: 'Llevas {{cliente.rachaActual}}. Sigue para desbloquear tu premio.' } },
          ],
          chain: { event: EV.CLIENT_REWARD_OBTAINED },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-006',
    name: 'Alta actividad en período corto (ofrecer membresía)',
    objective: 'Convertir picos de actividad en membresía o upgrade.',
    problem: 'Clientes muy activos pagan por visita cuando les convendría un plan.',
    whenToUse: 'Cuando el cliente concentra varias visitas en poco tiempo.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: alta actividad'],
    conditions: ['Nº de visitas en ventana corta >= umbral'],
    variables: ['cliente.nombre', 'cliente.visitasRecientes'],
    engines: ['rule', 'action', 'membership', 'promotion', 'analytics'],
    flow: ['Se detecta alta actividad', 'Se ofrece membresía/upgrade con ahorro', 'Al contratar, se emite evento'],
    actions: [ACTION_TYPES.SEND_EMAIL, ACTION_TYPES.SEND_PUSH, ACTION_TYPES.INVOKE_MODULE],
    esperas: [],
    events: [EV.CLIENT_HIGH_ACTIVITY, EV.AUTOMATION_FINISHED],
    exceptions: ['Cliente ya tiene membresía', 'Sin planes publicados'],
    compatibleBenefits: ['CAR-001'],
    compatiblePromotions: ['MEMBERSHIP', 'UPGRADE'],
    compatibleCampaigns: ['membresias', 'frecuencia'],
    dependencies: ['Membership Engine con planes', 'Analytics con conteo por ventana'],
    compatibleTemplates: [],
    examples: ['Car Wash: 4 lavados en 2 semanas → “con el plan ilimitado ahorrarías X”'],
    notes: 'El umbral y la ventana son editables; el ahorro se calcula por el Membership Engine.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_HIGH_ACTIVITY },
      variables: ['cliente.nombre', 'cliente.visitasRecientes'],
      channels: ['email', 'push'],
      steps: [
        {
          label: 'Ofrecer membresía',
          condition: 'cliente.tieneMembresia == false',
          actions: [
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'membership', action: 'recommend_upgrade' } },
            { type: ACTION_TYPES.SEND_EMAIL, params: { subject: 'Con una membresía ahorrarías, {{cliente.nombre}}', body: 'Vienes seguido: un plan te conviene más.' } },
          ],
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-007',
    name: 'Objetivos de frecuencia (5/10/20 visitas)',
    objective: 'Entregar beneficios y subir de nivel al alcanzar hitos de frecuencia.',
    problem: 'Sin metas visibles, la frecuencia no se refuerza.',
    whenToUse: 'Cuando el cliente alcanza un hito de visitas/compras configurable.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Evento: alcanzó meta de frecuencia'],
    conditions: ['Nº de visitas/compras == hito configurado'],
    variables: ['cliente.nombre', 'cliente.totalVisitas'],
    engines: ['rule', 'action', 'reward', 'membership', 'gamification', 'analytics'],
    flow: ['Se alcanza un hito', 'Se entrega el beneficio del hito', 'Se actualiza el nivel', 'Se registra'],
    actions: [ACTION_TYPES.APPLY_BENEFIT, ACTION_TYPES.UPDATE_MEMBERSHIP_LEVEL, ACTION_TYPES.SEND_PUSH],
    esperas: [],
    events: [EV.CLIENT_FREQUENCY_GOAL, EV.CLIENT_LEVEL_UP],
    exceptions: ['Hito no configurado', 'Beneficio sin stock'],
    compatibleBenefits: ['CAR-001', 'CAR-004'],
    compatiblePromotions: ['MILESTONE'],
    compatibleCampaigns: ['gamificacion', 'fidelizacion'],
    dependencies: ['Hitos configurables', 'Reward/Membership Engine'],
    compatibleTemplates: [],
    examples: ['5 visitas → beneficio bronce; 10 → plata; 20 → oro'],
    notes: 'Los hitos y sus beneficios/niveles son totalmente editables por la empresa.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_FREQUENCY_GOAL },
      variables: ['cliente.nombre', 'cliente.totalVisitas'],
      channels: ['push', 'email'],
      steps: [
        {
          label: 'Hito 10 visitas',
          condition: 'cliente.totalVisitas >= 10',
          actions: [
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-001' } },
            { type: ACTION_TYPES.UPDATE_MEMBERSHIP_LEVEL, params: { level: 'plata' } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: '¡{{cliente.totalVisitas}} visitas, {{cliente.nombre}}!', body: 'Alcanzaste un nuevo nivel.' } },
          ],
          chain: { event: EV.CLIENT_LEVEL_UP },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-008',
    name: 'Cambio de horario habitual',
    objective: 'Actualizar recomendaciones cuando cambia el horario de consumo.',
    problem: 'Recomendaciones desalineadas con el nuevo horario pierden eficacia.',
    whenToUse: 'Cuando se detecta un cambio sostenido del horario del cliente.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: cambio de comportamiento (horario)'],
    conditions: ['Franja horaria reciente != franja habitual'],
    variables: ['cliente.nombre', 'cliente.franjaReciente'],
    engines: ['rule', 'action', 'analytics', 'campaign'],
    flow: ['Se detecta el cambio de horario', 'Se actualiza la preferencia', 'Se ajustan las próximas recomendaciones'],
    actions: [ACTION_TYPES.RECORD_EVENT, ACTION_TYPES.INVOKE_MODULE],
    esperas: [],
    events: [EV.CLIENT_BEHAVIOR_CHANGED],
    exceptions: ['Cambio puntual no sostenido'],
    compatibleBenefits: [],
    compatiblePromotions: ['TIME_BASED'],
    compatibleCampaigns: ['personalizacion'],
    dependencies: ['Analytics con patrón horario'],
    compatibleTemplates: [],
    examples: ['Pasa de venir en la tarde a la mañana → ofertas matutinas'],
    notes: 'Actualiza preferencias; no molesta al cliente, solo reorienta las campañas.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_BEHAVIOR_CHANGED },
      variables: ['cliente.nombre', 'cliente.franjaReciente'],
      channels: ['inapp'],
      steps: [
        {
          label: 'Actualizar preferencia horaria',
          condition: 'evento.tipo == "horario"',
          actions: [
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'preferencia.horario_actualizada' } },
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'analytics', action: 'update_time_preference' } },
          ],
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-009',
    name: 'Cambio de sucursal preferida',
    objective: 'Actualizar la sucursal preferida y personalizar campañas futuras.',
    problem: 'Campañas dirigidas a una sucursal equivocada reducen la relevancia.',
    whenToUse: 'Cuando el cliente cambia su sucursal habitual.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Evento: cambio de comportamiento (sucursal)'],
    conditions: ['Sucursal reciente != sucursal habitual'],
    variables: ['cliente.nombre', 'cliente.sucursalReciente'],
    engines: ['rule', 'action', 'analytics', 'campaign'],
    flow: ['Se detecta cambio de sucursal', 'Se actualiza la preferencia', 'Se personalizan campañas/geosegmentación'],
    actions: [ACTION_TYPES.RECORD_EVENT, ACTION_TYPES.INVOKE_MODULE],
    esperas: [],
    events: [EV.CLIENT_BEHAVIOR_CHANGED],
    exceptions: ['Visita puntual fuera de patrón'],
    compatibleBenefits: [],
    compatiblePromotions: ['LOCAL'],
    compatibleCampaigns: ['personalizacion', 'sucursal'],
    dependencies: ['Analytics con preferencia de sucursal'],
    compatibleTemplates: [],
    examples: ['Se muda y cambia de sucursal → ofertas de la nueva sede'],
    notes: 'Personaliza por sucursal; útil para geosegmentación de promociones.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_BEHAVIOR_CHANGED },
      variables: ['cliente.nombre', 'cliente.sucursalReciente'],
      channels: ['inapp'],
      steps: [
        {
          label: 'Actualizar sucursal preferida',
          condition: 'evento.tipo == "sucursal"',
          actions: [
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'preferencia.sucursal_actualizada' } },
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'analytics', action: 'update_branch_preference' } },
          ],
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-010',
    name: 'Uso frecuente de beneficios (optimizar ofertas)',
    objective: 'Aprender de los beneficios más usados para optimizar futuras ofertas.',
    problem: 'Ofrecer beneficios poco relevantes desperdicia presupuesto.',
    whenToUse: 'Cuando el cliente usa beneficios con alta frecuencia.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Evento: usó cupón'],
    conditions: ['Uso de beneficios por encima del promedio'],
    variables: ['cliente.nombre', 'cliente.beneficiosUsados'],
    engines: ['rule', 'action', 'benefit', 'analytics'],
    flow: ['Se registra el uso frecuente', 'Se ajusta el perfil de preferencias de beneficio', 'Se optimizan próximas ofertas'],
    actions: [ACTION_TYPES.RECORD_EVENT, ACTION_TYPES.INVOKE_MODULE],
    esperas: [],
    events: [EV.CLIENT_COUPON_USED, EV.AUTOMATION_FINISHED],
    exceptions: ['Uso puntual'],
    compatibleBenefits: ['CAR-004', 'CAR-011'],
    compatiblePromotions: ['PERSONALIZED'],
    compatibleCampaigns: ['personalizacion'],
    dependencies: ['Analytics con historial de beneficios'],
    compatibleTemplates: [],
    examples: ['Usa mucho el beneficio de aroma → priorizar ese tipo de oferta'],
    notes: 'Alimenta el selector estratégico del Benefit Engine; no envía spam.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_COUPON_USED },
      variables: ['cliente.nombre'],
      channels: ['inapp'],
      steps: [
        {
          label: 'Optimizar perfil de beneficios',
          actions: [
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'beneficio.preferencia_actualizada' } },
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'analytics', action: 'update_benefit_affinity' } },
          ],
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-011',
    name: 'Beneficios sin aprovechar (educar/incentivar)',
    objective: 'Reactivar el uso cuando el cliente no aprovecha sus beneficios.',
    problem: 'Beneficios sin usar no generan visitas ni valor percibido.',
    whenToUse: 'Cuando el cliente tiene beneficios disponibles y no los usa.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Evento: beneficios sin usar'],
    conditions: ['Beneficios disponibles > 0', 'Sin uso en N días'],
    variables: ['cliente.nombre', 'cliente.beneficiosDisponibles'],
    engines: ['rule', 'action', 'benefit', 'campaign', 'analytics'],
    flow: ['Se detecta bajo aprovechamiento', 'Se envía campaña educativa/recordatorio', 'Al usar, se registra'],
    actions: [ACTION_TYPES.SEND_PUSH, ACTION_TYPES.SEND_EMAIL],
    esperas: ['Recordatorio único con posible seguimiento (editable)'],
    events: [EV.CLIENT_BENEFIT_UNDERUSED, EV.CLIENT_COUPON_USED],
    exceptions: ['Sin beneficios disponibles'],
    compatibleBenefits: ['CAR-004', 'CAR-011'],
    compatiblePromotions: ['EDUCATIONAL'],
    compatibleCampaigns: ['educacion', 'frecuencia'],
    dependencies: ['Benefit Engine con beneficios disponibles por cliente'],
    compatibleTemplates: [],
    examples: ['“Tienes 2 beneficios sin usar: así los aprovechas”'],
    notes: 'Enfoque educativo, no agresivo; explica el valor de lo que ya tiene.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_BENEFIT_UNDERUSED },
      variables: ['cliente.nombre', 'cliente.beneficiosDisponibles'],
      channels: ['push', 'email'],
      limits: { maxPerSubject: 2, perPeriod: 'MONTH' },
      steps: [
        {
          label: 'Recordar beneficios disponibles',
          condition: 'cliente.beneficiosDisponibles > 0',
          actions: [
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Tienes beneficios esperando, {{cliente.nombre}}', body: 'Tienes {{cliente.beneficiosDisponibles}} sin usar. Aprovéchalos.' } },
          ],
          chain: { event: EV.CLIENT_COUPON_USED },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-012',
    name: 'Cambio en el patrón de consumo (gasto)',
    objective: 'Ajustar la estrategia cuando cambia el nivel de gasto del cliente.',
    problem: 'No adaptar la oferta al nuevo gasto pierde ingresos o clientes.',
    whenToUse: 'Cuando se detecta mayor o menor gasto sostenido.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: cambio de comportamiento (gasto)'],
    conditions: ['Gasto reciente difiere del habitual por encima del umbral'],
    variables: ['cliente.nombre', 'cliente.gastoReciente', 'cliente.gastoHabitual'],
    engines: ['rule', 'action', 'promotion', 'benefit', 'analytics'],
    flow: ['Se detecta el cambio de gasto', 'Si sube: ofertas premium; si baja: incentivos de retención', 'Se actualiza la estrategia'],
    actions: [ACTION_TYPES.APPLY_BENEFIT, ACTION_TYPES.SEND_PUSH, ACTION_TYPES.RECORD_EVENT],
    esperas: [],
    events: [EV.CLIENT_BEHAVIOR_CHANGED, EV.CLIENT_CHURN_RISK],
    exceptions: ['Variación puntual dentro del rango normal'],
    compatibleBenefits: ['CAR-001', 'CAR-011'],
    compatiblePromotions: ['UPSELL', 'RETENTION'],
    compatibleCampaigns: ['personalizacion', 'retencion'],
    dependencies: ['Analytics con evolución de gasto'],
    compatibleTemplates: [],
    examples: ['Sube el gasto → ofrecer premium; baja → incentivo para sostener frecuencia'],
    notes: 'Dos ramas (subida/bajada); baja sostenida marca riesgo de abandono.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_BEHAVIOR_CHANGED },
      variables: ['cliente.nombre', 'cliente.gastoReciente', 'cliente.gastoHabitual'],
      channels: ['push', 'email'],
      steps: [
        {
          label: 'Gasto en aumento (upsell)',
          condition: 'cliente.gastoReciente > cliente.gastoHabitual',
          actions: [
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Algo premium para ti, {{cliente.nombre}}', body: 'Descubre opciones a tu medida.' } },
          ],
        },
        {
          label: 'Gasto en descenso (retención)',
          condition: 'cliente.gastoReciente < cliente.gastoHabitual',
          actions: [
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-011' } },
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'riesgo.gasto_a_la_baja' } },
          ],
          chain: { event: EV.CLIENT_CHURN_RISK },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-013',
    name: 'Frecuencia estacional (clima/temporada/festivos)',
    objective: 'Adaptar campañas a temporadas, clima, festivos y vacaciones.',
    problem: 'Ignorar la estacionalidad desperdicia picos naturales de demanda.',
    whenToUse: 'En fechas/temporadas relevantes para el negocio.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Programado por temporada/fecha'],
    conditions: ['Temporada activa', 'Segmento estacional relevante'],
    variables: ['cliente.nombre', 'temporada.nombre'],
    engines: ['rule', 'action', 'promotion', 'campaign', 'analytics'],
    flow: ['Llega la temporada', 'Se lanza la campaña estacional al segmento', 'Se mide el desempeño'],
    actions: [ACTION_TYPES.SEND_PUSH, ACTION_TYPES.APPLY_BENEFIT],
    esperas: ['Según calendario de temporada (editable)'],
    events: [EV.CLIENT_REWARD_OBTAINED, EV.AUTOMATION_FINISHED],
    exceptions: ['Fuera de temporada', 'Segmento no aplicable'],
    compatibleBenefits: ['CAR-004'],
    compatiblePromotions: ['SEASONAL'],
    compatibleCampaigns: ['estacional'],
    dependencies: ['Calendario/segmentos estacionales'],
    compatibleTemplates: [],
    examples: ['Car Wash: campaña de temporada de lluvias', 'Hotel: ofertas de temporada alta'],
    notes: 'El calendario y los segmentos son editables; usa SCHEDULE para la activación.',
    config: {
      trigger: { type: 'SCHEDULE', schedule: '0 9 1 * *', params: { season: 'editable' } },
      variables: ['cliente.nombre', 'temporada.nombre'],
      channels: ['push', 'email'],
      steps: [
        {
          label: 'Campaña estacional',
          actions: [
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Temporada de {{temporada.nombre}}', body: '{{cliente.nombre}}, tenemos algo especial para esta época.' } },
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-004' } },
          ],
          chain: { event: EV.CLIENT_REWARD_OBTAINED },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-014',
    name: 'Recomendación de mejor momento para visitar',
    objective: 'Sugerir el mejor momento y promociones relevantes según el patrón.',
    problem: 'Sin guía, el cliente no optimiza cuándo volver.',
    whenToUse: 'De forma recurrente, según el patrón de cada cliente.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Programado (recurrente)'],
    conditions: ['Existe patrón de visita analizable'],
    variables: ['cliente.nombre', 'cliente.mejorMomento'],
    engines: ['rule', 'action', 'analytics', 'campaign'],
    flow: ['Se analiza el patrón', 'Se recomienda el mejor momento + promo relevante', 'Se mide la respuesta'],
    actions: [ACTION_TYPES.INVOKE_MODULE, ACTION_TYPES.SEND_PUSH],
    esperas: ['Cadencia editable (ej. semanal)'],
    events: [EV.AUTOMATION_FINISHED],
    exceptions: ['Sin patrón suficiente', 'Notificaciones desactivadas'],
    compatibleBenefits: ['CAR-011'],
    compatiblePromotions: ['TIME_BASED', 'PERSONALIZED'],
    compatibleCampaigns: ['personalizacion', 'frecuencia'],
    dependencies: ['Analytics con predicción de mejor momento'],
    compatibleTemplates: [],
    examples: ['“Tu mejor día suele ser el sábado por la mañana: te esperamos”'],
    notes: 'La recomendación la calcula Analytics; el playbook solo la comunica.',
    config: {
      trigger: { type: 'SCHEDULE', schedule: '0 10 * * 5' },
      variables: ['cliente.nombre', 'cliente.mejorMomento'],
      channels: ['push'],
      steps: [
        {
          label: 'Sugerir mejor momento',
          actions: [
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'analytics', action: 'best_time_to_visit' } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Tu mejor momento, {{cliente.nombre}}', body: 'Te esperamos {{cliente.mejorMomento}} con una promo para ti.' } },
          ],
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-015',
    name: 'Frecuencia predictiva con IA',
    objective: 'Usar modelos predictivos para próxima visita, riesgo y mejor incentivo.',
    problem: 'Reaccionar tarde al abandono cuesta más que anticiparlo.',
    whenToUse: 'Cuando la arquitectura de IA/predicción esté disponible.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Programado (scoring recurrente)'],
    conditions: ['Modelo predictivo disponible', 'Score dentro del umbral de acción'],
    variables: ['cliente.nombre', 'cliente.probAbandono', 'cliente.proximaVisitaEstimada'],
    engines: ['rule', 'action', 'analytics', 'benefit', 'campaign'],
    flow: ['Se calcula el score predictivo', 'Si hay riesgo, se aplica el mejor incentivo estimado', 'Se registra y se mide'],
    actions: [ACTION_TYPES.INVOKE_MODULE, ACTION_TYPES.APPLY_BENEFIT, ACTION_TYPES.SEND_PUSH],
    esperas: ['Scoring recurrente (editable)'],
    events: [EV.CLIENT_CHURN_RISK, EV.CLIENT_REWARD_OBTAINED],
    exceptions: ['Modelo no disponible (se omite sin error)', 'Score bajo el umbral'],
    compatibleBenefits: ['CAR-004', 'CAR-011'],
    compatiblePromotions: ['PREDICTIVE', 'RETENTION'],
    compatibleCampaigns: ['ia', 'retencion'],
    dependencies: ['Motor de IA/predicción (integrable vía INVOKE_MODULE sin cambiar la lógica)'],
    compatibleTemplates: [],
    examples: ['“Alta probabilidad de abandono → mejor incentivo estimado por el modelo”'],
    notes: 'Diseñado para integrarse con la futura arquitectura de IA sin modificar el motor: el score y el incentivo se obtienen por INVOKE_MODULE.',
    config: {
      trigger: { type: 'SCHEDULE', schedule: '0 8 * * *' },
      variables: ['cliente.nombre', 'cliente.probAbandono'],
      channels: ['push', 'whatsapp'],
      steps: [
        {
          label: 'Scoring y acción predictiva',
          condition: 'cliente.probAbandono >= 0.6',
          actions: [
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'ai', action: 'best_incentive' } },
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-004' } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Algo especial para ti, {{cliente.nombre}}', body: 'Pensamos en ti con el beneficio ideal.' } },
          ],
          chain: { event: EV.CLIENT_CHURN_RISK },
        },
      ],
    },
  }),

  pb({
    id: 'FREQ-016',
    name: 'Recordatorio de próxima visita ideal (ritmo)',
    objective: 'Recordar volver justo cuando toca según el ritmo del cliente.',
    problem: 'El cliente olvida volver aunque su servicio ya lo necesita.',
    whenToUse: 'Cuando se acerca la fecha ideal de la próxima visita.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Segmento: próxima visita estimada cercana'],
    conditions: ['Fecha ideal de próxima visita dentro de la ventana'],
    variables: ['cliente.nombre', 'cliente.diasDesdeUltimaVisita', 'cliente.frecuenciaHabitual'],
    engines: ['rule', 'action', 'analytics', 'promotion'],
    flow: ['Se acerca el momento ideal', 'Se envía un recordatorio útil', 'Opcional: promo suave', 'Al volver, se reinicia el ciclo'],
    actions: [ACTION_TYPES.SEND_WHATSAPP, ACTION_TYPES.SEND_PUSH],
    esperas: ['Al llegar la fecha ideal (editable)'],
    events: [EV.CLIENT_VISIT, EV.AUTOMATION_FINISHED],
    exceptions: ['Cliente ya volvió', 'Sin frecuencia habitual'],
    compatibleBenefits: ['CAR-011'],
    compatiblePromotions: ['REMINDER', 'FREQUENCY'],
    compatibleCampaigns: ['frecuencia', 'recordatorio'],
    dependencies: ['Analytics con frecuencia habitual', 'Segmentación por fecha estimada'],
    compatibleTemplates: [],
    examples: ['Car Wash: “Tu auto suele lavarse cada 7 días; ¿lo agendamos?”', 'Veterinaria: recordatorio de control periódico'],
    notes: 'Basado en el ritmo real del cliente, no en un intervalo fijo global; ventana editable.',
    config: {
      trigger: { type: 'SEGMENT_ENTER', params: { segment: 'proxima_visita_cercana' } },
      variables: ['cliente.nombre', 'cliente.frecuenciaHabitual'],
      channels: ['whatsapp', 'push'],
      limits: { maxPerSubject: 1, perPeriod: 'WEEK' },
      steps: [
        {
          label: 'Recordatorio de ritmo',
          condition: 'cliente.diasDesdeUltimaVisita >= cliente.frecuenciaHabitual',
          actions: [
            { type: ACTION_TYPES.SEND_WHATSAPP, params: { body: '{{cliente.nombre}}, según tu ritmo ya toca. ¿Te esperamos?' } },
          ],
          chain: { event: EV.CLIENT_VISIT },
        },
      ],
    },
  }),
]

/** Lista mutable de los playbooks de frecuencia (para composición). */
export function frequencyPlaybooks(): AutomationPlaybook[] {
  return [...FREQUENCY_PLAYBOOKS]
}

/** Busca un playbook de frecuencia por su ID (ej. "FREQ-001"). */
export function getFrequencyPlaybook(id: string): AutomationPlaybook | undefined {
  return FREQUENCY_PLAYBOOKS.find((p) => p.id === id)
}
