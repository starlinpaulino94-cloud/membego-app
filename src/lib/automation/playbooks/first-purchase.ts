/**
 * Biblioteca de Automation Playbooks de PRIMERA COMPRA (Fase E1.3). Aumentan la
 * conversión de usuarios registrados en clientes activos: acompañan al cliente
 * hasta su primera compra/visita/consumo y arrancan el journey de fidelización.
 * Estrategias probadas de conversión (Klaviyo/HubSpot/Braze/Square/Shopify)
 * convertidas en playbooks UNIVERSALES instalables sobre el Automation Engine
 * (E1). Reutilizan Rule Engine (condiciones), Action Engine (acciones) y
 * referencian Benefit/Promotion/Membership/Reward/Referral/Campaign/Analytics
 * por código. Car Wash es solo la primera industria que las usa.
 *
 * Cada Playbook es una automatización real (`config`) + su documentación
 * completa (24 apartados). Nada hardcodeado por industria: beneficios/promos por
 * código y textos con variables `{{...}}`.
 */

import { ACTION_TYPES } from '@/lib/rule-engine'
import { AUTOMATION_EVENTS as EV } from '../domain/events'
import { INDUSTRIES as I } from './types'
import type { AutomationPlaybook } from './types'

const U = I.UNIVERSAL

// Configuración editable mínima (Documento Maestro): común a todos.
const EDITABLE = [
  'nombre', 'descripcion', 'trigger', 'condiciones', 'reglas', 'tiempoMaxConversion',
  'beneficios', 'promociones', 'segmentos', 'limites', 'horarios', 'canales',
  'variables', 'idioma', 'prioridad', 'sucursales',
] as const

// KPIs típicos de conversión a primera compra.
const FP_KPIS = [
  'tasa_conversion', 'primera_compra', 'time_to_first_purchase',
  'uso_beneficio_inicial', 'abandono_post_registro', 'ticket_promedio_inicial',
  'ingreso_por_conversion', 'roi', 'tasa_apertura', 'tasa_clic',
] as const

/** Helper: completa los apartados comunes de un playbook de primera compra. */
function pb(
  p: Omit<AutomationPlaybook, 'category' | 'editable' | 'kpis' | 'engines'> &
    Partial<Pick<AutomationPlaybook, 'engines' | 'kpis' | 'editable'>>,
): AutomationPlaybook {
  return {
    category: 'primera_compra',
    editable: p.editable ?? EDITABLE,
    kpis: p.kpis ?? FP_KPIS,
    engines: p.engines ?? ['rule', 'action', 'analytics'],
    ...p,
  }
}

export const FIRST_PURCHASE_PLAYBOOKS: readonly AutomationPlaybook[] = [
  pb({
    id: 'FP-001',
    name: 'Registro sin primera compra',
    objective: 'Convertir un registro que no ha comprado dentro del plazo definido.',
    problem: 'Muchos registros nunca llegan a su primera compra.',
    whenToUse: 'Cuando pasa el tiempo máximo de conversión sin compra.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Segmento: registrado sin primera compra'],
    conditions: ['Cliente sin compras', 'Superado el tiempo máximo de conversión'],
    variables: ['cliente.nombre', 'cliente.compras'],
    engines: ['rule', 'action', 'benefit', 'promotion', 'analytics'],
    flow: ['Se detecta ausencia de compra', 'Se espera el plazo', 'Se envía incentivo de conversión', 'Al comprar, se emite evento'],
    actions: [ACTION_TYPES.SEND_WHATSAPP, ACTION_TYPES.APPLY_BENEFIT],
    esperas: ['Tiempo máximo de conversión configurable (ej. 3 días)'],
    events: [EV.CLIENT_FIRST_PURCHASE, EV.CLIENT_REWARD_OBTAINED],
    exceptions: ['Cliente ya compró', 'Sin canal de contacto'],
    compatibleBenefits: ['CAR-004', 'CAR-003'],
    compatiblePromotions: ['FIRST_PURCHASE'],
    compatibleCampaigns: ['conversion'],
    dependencies: ['Segmentación de registros sin compra'],
    compatibleTemplates: ['universal.bienvenida'],
    examples: ['Car Wash: “Tu primer lavado con 40% off esta semana”', 'Restaurante: “Tu primera orden con envío gratis”'],
    notes: 'El plazo (tiempoMaxConversion) y el beneficio son editables.',
    config: {
      trigger: { type: 'SEGMENT_ENTER', params: { segment: 'registrado_sin_compra' } },
      variables: ['cliente.nombre'],
      channels: ['whatsapp', 'push', 'email'],
      limits: { maxPerSubject: 2, perPeriod: 'MONTH' },
      steps: [
        {
          label: 'Incentivo de conversión',
          condition: 'cliente.compras == 0',
          actions: [
            { type: ACTION_TYPES.SEND_WHATSAPP, params: { body: '{{cliente.nombre}}, tu primera compra tiene un beneficio especial. Aprovéchalo.' } },
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-004' } },
          ],
          chain: { event: EV.CLIENT_FIRST_PURCHASE },
        },
      ],
    },
  }),

  pb({
    id: 'FP-002',
    name: 'Beneficio de bienvenida sin utilizar',
    objective: 'Recuperar un beneficio inicial antes de que expire.',
    problem: 'Los beneficios de bienvenida caducan sin usarse y no convierten.',
    whenToUse: 'Cuando el beneficio inicial está por expirar sin uso.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Segmento: beneficio inicial por vencer'],
    conditions: ['Beneficio no utilizado', 'Próximo a expirar'],
    variables: ['cliente.nombre', 'beneficio.diasRestantes'],
    engines: ['rule', 'action', 'benefit', 'analytics'],
    flow: ['Se detecta beneficio sin usar', 'Se recuerda con urgencia', 'Opcional: extender vigencia según reglas', 'Al usarse, se registra'],
    actions: [ACTION_TYPES.SEND_PUSH, ACTION_TYPES.UPDATE_BENEFIT],
    esperas: ['Recordatorio 48h y 24h antes de expirar (editable)'],
    events: [EV.CLIENT_COUPON_USED, EV.CLIENT_FIRST_PURCHASE],
    exceptions: ['Beneficio ya usado', 'Beneficio expirado sin extensión permitida'],
    compatibleBenefits: ['CAR-004', 'CAR-011'],
    compatiblePromotions: ['FIRST_PURCHASE'],
    compatibleCampaigns: ['conversion'],
    dependencies: ['Benefit Engine con expiración y extensión configurable'],
    compatibleTemplates: [],
    examples: ['“Tu regalo expira en 2 días: úsalo hoy”', 'Extensión automática de 3 días si no lo usó'],
    notes: 'La extensión de vigencia es una regla editable (UPDATE_BENEFIT); no siempre se permite.',
    config: {
      trigger: { type: 'SEGMENT_ENTER', params: { segment: 'beneficio_por_vencer' } },
      variables: ['cliente.nombre', 'beneficio.diasRestantes'],
      channels: ['push', 'whatsapp'],
      steps: [
        {
          label: 'Recordatorio de urgencia',
          condition: 'cliente.usoBeneficioBienvenida == false',
          actions: [
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Tu regalo expira pronto', body: '{{cliente.nombre}}, te quedan {{beneficio.diasRestantes}} días.' } },
          ],
          wait: { ms: 86_400_000 },
        },
        {
          label: 'Extensión opcional de vigencia',
          condition: 'cliente.usoBeneficioBienvenida == false',
          actions: [
            { type: ACTION_TYPES.UPDATE_BENEFIT, params: { extendDays: 3 } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Te damos más tiempo', body: 'Extendimos tu regalo. No lo pierdas.' } },
          ],
        },
      ],
    },
  }),

  pb({
    id: 'FP-003',
    name: 'Primera visita programada (recordatorios y seguimiento)',
    objective: 'Asegurar la asistencia a una primera visita agendada.',
    problem: 'Las citas de primera visita se pierden por olvido o fricción.',
    whenToUse: 'Cuando el cliente agenda su primera visita.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: cliente agendó primera visita'],
    conditions: ['Visita futura confirmada o pendiente'],
    variables: ['cliente.nombre', 'cita.fecha', 'cita.sucursal'],
    engines: ['rule', 'action', 'analytics'],
    flow: ['Cliente agenda visita', 'Recordatorios previos', 'Confirmación', 'Seguimiento posterior a la visita'],
    actions: [ACTION_TYPES.SEND_WHATSAPP, ACTION_TYPES.SEND_PUSH, ACTION_TYPES.RECORD_EVENT],
    esperas: ['Recordatorio 24h y 2h antes; seguimiento 2h después (editable)'],
    events: [EV.CLIENT_FIRST_VISIT, EV.AUTOMATION_FINISHED],
    exceptions: ['Cita cancelada', 'Sin canal de contacto'],
    compatibleBenefits: ['CAR-003'],
    compatiblePromotions: ['FIRST_VISIT'],
    compatibleCampaigns: ['conversion', 'agenda'],
    dependencies: ['Módulo de citas/agenda'],
    compatibleTemplates: [],
    examples: ['Salón: recordatorio de cita + confirmación', 'Clínica: recordatorio de primera consulta'],
    notes: 'Las esperas se calculan respecto a la fecha de la cita; usa DATE si la plataforma lo soporta.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_REGISTERED },
      variables: ['cliente.nombre', 'cita.fecha'],
      channels: ['whatsapp', 'push'],
      steps: [
        {
          label: 'Recordatorio previo',
          actions: [{ type: ACTION_TYPES.SEND_WHATSAPP, params: { body: '{{cliente.nombre}}, te esperamos el {{cita.fecha}}.' } }],
          wait: { ms: 79_200_000 },
        },
        {
          label: 'Seguimiento posterior',
          actions: [
            { type: ACTION_TYPES.SEND_PUSH, params: { title: '¿Cómo te fue?', body: 'Cuéntanos sobre tu primera visita.' } },
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'primera_visita.seguimiento' } },
          ],
        },
      ],
    },
  }),

  pb({
    id: 'FP-004',
    name: 'Abandono durante el proceso de compra',
    objective: 'Recuperar clientes que inician una compra/membresía y no la completan.',
    problem: 'El abandono a mitad del checkout reduce la conversión.',
    whenToUse: 'Cuando se detecta un proceso iniciado y no completado.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: proceso abandonado'],
    conditions: ['Proceso iniciado', 'No completado tras N minutos'],
    variables: ['cliente.nombre', 'proceso.tipo'],
    engines: ['rule', 'action', 'promotion', 'campaign', 'analytics'],
    flow: ['Cliente abandona el proceso', 'Se espera', 'Se envía recuperación con ayuda/incentivo', 'Al completar, se emite evento'],
    actions: [ACTION_TYPES.SEND_PUSH, ACTION_TYPES.SEND_EMAIL, ACTION_TYPES.APPLY_DISCOUNT_PERCENT],
    esperas: ['Primer aviso a los 30 min; segundo a 24h (editable)'],
    events: [EV.CLIENT_FIRST_PURCHASE, EV.AUTOMATION_FINISHED],
    exceptions: ['Proceso ya completado', 'Cliente sin contacto'],
    compatibleBenefits: ['CAR-011'],
    compatiblePromotions: ['FIRST_PURCHASE', 'CART_RECOVERY'],
    compatibleCampaigns: ['recuperacion', 'conversion'],
    dependencies: ['Registro de procesos iniciados (Analytics/Context)'],
    compatibleTemplates: [],
    examples: ['Retail: carrito abandonado', 'Gimnasio: inscripción de membresía sin terminar'],
    notes: 'El tipo de proceso es una variable; el incentivo de recuperación es editable.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_PROCESS_ABANDONED },
      variables: ['cliente.nombre', 'proceso.tipo'],
      channels: ['push', 'email'],
      limits: { maxPerSubject: 2, perPeriod: 'WEEK' },
      steps: [
        {
          label: 'Recuperación temprana',
          actions: [{ type: ACTION_TYPES.SEND_PUSH, params: { title: '¿Necesitas ayuda, {{cliente.nombre}}?', body: 'Termina tu {{proceso.tipo}} en un clic.' } }],
          wait: { ms: 1_800_000 },
        },
        {
          label: 'Recuperación con incentivo',
          actions: [
            { type: ACTION_TYPES.APPLY_DISCOUNT_PERCENT, params: { percent: 10 } },
            { type: ACTION_TYPES.SEND_EMAIL, params: { subject: 'Un descuento para completar tu compra', body: 'Te dejamos un beneficio para terminar.' } },
          ],
          chain: { event: EV.CLIENT_FIRST_PURCHASE },
        },
      ],
    },
  }),

  pb({
    id: 'FP-005',
    name: 'Recomendación del mejor servicio (next best offer)',
    objective: 'Recomendar el servicio con mayor probabilidad de primera conversión.',
    problem: 'El cliente no sabe por dónde empezar y no convierte.',
    whenToUse: 'Tras el registro, con datos de perfil/preferencias disponibles.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: preferencias configuradas', 'Segmento: sin compra con perfil'],
    conditions: ['Perfil con datos suficientes', 'Sin primera compra'],
    variables: ['cliente.nombre', 'cliente.segmento', 'cliente.preferencias'],
    engines: ['rule', 'action', 'analytics', 'template'],
    flow: ['Se analiza el perfil', 'Se recomienda el mejor servicio', 'Se acompaña con un incentivo', 'Al comprar, se emite evento'],
    actions: [ACTION_TYPES.INVOKE_MODULE, ACTION_TYPES.SEND_PUSH],
    esperas: ['Tras configurar preferencias (editable)'],
    events: [EV.CLIENT_FIRST_PURCHASE, EV.AUTOMATION_FINISHED],
    exceptions: ['Sin datos de perfil', 'Cliente ya compró'],
    compatibleBenefits: ['CAR-004'],
    compatiblePromotions: ['FIRST_PURCHASE'],
    compatibleCampaigns: ['conversion', 'personalizacion'],
    dependencies: ['Analytics/Recommendation para elegir el servicio', 'Template Engine para catálogos por industria'],
    compatibleTemplates: [],
    examples: ['Car Wash: recomendar el paquete según tipo de vehículo', 'Salón: recomendar el servicio según preferencias'],
    notes: 'La recomendación se delega a un módulo analítico; nada del catálogo está hardcodeado.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_PREFERENCES_SET },
      variables: ['cliente.nombre', 'cliente.segmento'],
      channels: ['push', 'email'],
      steps: [
        {
          label: 'Recomendar mejor servicio',
          condition: 'cliente.compras == 0',
          actions: [
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'analytics', action: 'recommend_service' } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Ideal para ti, {{cliente.nombre}}', body: 'Te recomendamos empezar por aquí.' } },
          ],
          chain: { event: EV.CLIENT_FIRST_PURCHASE },
        },
      ],
    },
  }),

  pb({
    id: 'FP-006',
    name: 'Oferta personalizada de primera compra',
    objective: 'Generar un beneficio a medida según segmento, canal y preferencias.',
    problem: 'Las ofertas genéricas convierten menos que las personalizadas.',
    whenToUse: 'Para incentivar la primera compra con una oferta relevante.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Segmento: registrado sin compra'],
    conditions: ['Sin primera compra', 'Con datos de segmento/canal/preferencias'],
    variables: ['cliente.nombre', 'cliente.segmento', 'cliente.canalAdquisicion'],
    engines: ['rule', 'action', 'benefit', 'promotion', 'analytics'],
    flow: ['Se evalúa el perfil', 'Se selecciona el beneficio óptimo', 'Se entrega la oferta personalizada', 'Al comprar, se emite evento'],
    actions: [ACTION_TYPES.APPLY_BENEFIT, ACTION_TYPES.SEND_WHATSAPP],
    esperas: ['Configurable según la ventana de conversión'],
    events: [EV.CLIENT_REWARD_OBTAINED, EV.CLIENT_FIRST_PURCHASE],
    exceptions: ['Cliente ya compró', 'Sin beneficio elegible'],
    compatibleBenefits: ['CAR-004', 'CAR-003', 'CAR-011'],
    compatiblePromotions: ['FIRST_PURCHASE'],
    compatibleCampaigns: ['conversion', 'personalizacion'],
    dependencies: ['Benefit Engine con selector estratégico', 'Datos de segmento/canal'],
    compatibleTemplates: [],
    examples: ['Segmento premium → beneficio de mayor valor', 'Canal referido → oferta ligada al referral'],
    notes: 'El código de beneficio se resuelve por reglas de segmento/canal; totalmente editable.',
    config: {
      trigger: { type: 'SEGMENT_ENTER', params: { segment: 'registrado_sin_compra' } },
      variables: ['cliente.nombre', 'cliente.segmento'],
      channels: ['whatsapp', 'email'],
      steps: [
        {
          label: 'Oferta premium por segmento',
          condition: 'cliente.segmento == "premium"',
          actions: [
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-003' } },
            { type: ACTION_TYPES.SEND_WHATSAPP, params: { body: '{{cliente.nombre}}, una oferta especial para tu primera compra.' } },
          ],
        },
        {
          label: 'Oferta estándar',
          condition: 'cliente.segmento != "premium"',
          actions: [
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-011' } },
            { type: ACTION_TYPES.SEND_WHATSAPP, params: { body: '{{cliente.nombre}}, estrena tu cuenta con este beneficio.' } },
          ],
        },
      ],
    },
  }),

  pb({
    id: 'FP-007',
    name: 'Primera compra completada (recompensa + journey activo)',
    objective: 'Celebrar la primera compra e iniciar el journey de clientes activos.',
    problem: 'Sin refuerzo tras la primera compra, el cliente no repite.',
    whenToUse: 'Justo al completarse la primera compra.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Evento: primera compra'],
    conditions: ['Es la primera compra del cliente'],
    variables: ['cliente.nombre'],
    engines: ['rule', 'action', 'reward', 'campaign', 'analytics'],
    flow: ['Se registra el evento', 'Se entrega recompensa de bienvenida', 'Se actualiza el segmento a activo', 'Se inicia el journey de retención'],
    actions: [ACTION_TYPES.ADD_POINTS, ACTION_TYPES.SEND_PUSH, ACTION_TYPES.RECORD_EVENT],
    esperas: [],
    events: [EV.CLIENT_REWARD_OBTAINED, EV.CLIENT_LOYALTY_ENROLLED],
    exceptions: ['No es la primera compra'],
    compatibleBenefits: ['CAR-001'],
    compatiblePromotions: [],
    compatibleCampaigns: ['fidelizacion'],
    dependencies: ['Reward Engine para recompensa', 'Segmentación de clientes activos'],
    compatibleTemplates: [],
    examples: ['“¡Gracias por tu primera compra! Ganaste puntos”', 'Actualización a segmento “activo”'],
    notes: 'Punto de transición del embudo: cierra la conversión y arranca la retención (E1.4+).',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_FIRST_PURCHASE },
      variables: ['cliente.nombre'],
      channels: ['push', 'email'],
      steps: [
        {
          label: 'Recompensa y activación',
          actions: [
            { type: ACTION_TYPES.ADD_POINTS, params: { points: 100 } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: '¡Gracias, {{cliente.nombre}}!', body: 'Tu primera compra te da una recompensa.' } },
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'segmento.activo' } },
          ],
          chain: { event: EV.CLIENT_LOYALTY_ENROLLED },
        },
      ],
    },
  }),

  pb({
    id: 'FP-008',
    name: 'Primera compra de alto valor (VIP)',
    objective: 'Reconocer una primera compra superior al promedio y evaluar VIP.',
    problem: 'Los clientes de alto valor inicial no reciben trato diferenciado.',
    whenToUse: 'Cuando la primera compra supera el umbral de alto valor.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: compra de alto valor'],
    conditions: ['Es primera compra', 'Monto superior al promedio/umbral'],
    variables: ['cliente.nombre', 'compra.monto'],
    engines: ['rule', 'action', 'benefit', 'membership', 'analytics'],
    flow: ['Se detecta compra de alto valor', 'Se entrega beneficio especial', 'Se evalúa ingreso a programa VIP', 'Se registra'],
    actions: [ACTION_TYPES.APPLY_BENEFIT, ACTION_TYPES.UPDATE_MEMBERSHIP_LEVEL, ACTION_TYPES.SEND_PUSH],
    esperas: [],
    events: [EV.CLIENT_REWARD_OBTAINED, EV.CLIENT_LEVEL_UP],
    exceptions: ['No supera el umbral', 'Programa VIP desactivado'],
    compatibleBenefits: ['CAR-001', 'CAR-003'],
    compatiblePromotions: ['VIP'],
    compatibleCampaigns: ['vip', 'fidelizacion'],
    dependencies: ['Umbral de alto valor configurable', 'Membership Engine para niveles VIP'],
    compatibleTemplates: [],
    examples: ['Dealer: primera compra grande → beneficios VIP', 'Hotel: primera reserva premium → nivel superior'],
    notes: 'El umbral de alto valor es editable; el ingreso a VIP usa el Membership Engine.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_HIGH_VALUE_PURCHASE },
      variables: ['cliente.nombre', 'compra.monto'],
      channels: ['push', 'email'],
      steps: [
        {
          label: 'Reconocimiento VIP',
          condition: 'compra.monto >= 100',
          actions: [
            { type: ACTION_TYPES.APPLY_BENEFIT, params: { benefitCode: 'CAR-001' } },
            { type: ACTION_TYPES.UPDATE_MEMBERSHIP_LEVEL, params: { level: 'vip' } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Bienvenido al trato VIP, {{cliente.nombre}}', body: 'Tu primera compra desbloqueó beneficios especiales.' } },
          ],
          chain: { event: EV.CLIENT_LEVEL_UP },
        },
      ],
    },
  }),

  pb({
    id: 'FP-009',
    name: 'Primera compra de cliente referido',
    objective: 'Liberar las recompensas del programa de referidos al convertir el referido.',
    problem: 'Las recompensas de referidos no se liberan si no se detecta la conversión.',
    whenToUse: 'Cuando un cliente referido completa su primera compra.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: primera compra'],
    conditions: ['El cliente fue referido', 'Es su primera compra'],
    variables: ['cliente.nombre', 'cliente.referidoPor'],
    engines: ['rule', 'action', 'referral', 'reward', 'analytics'],
    flow: ['El referido compra por primera vez', 'Se valida la referencia', 'Se liberan las recompensas de ambas partes', 'Se registra'],
    actions: [ACTION_TYPES.INVOKE_MODULE, ACTION_TYPES.SEND_PUSH],
    esperas: [],
    events: [EV.CLIENT_REWARD_OBTAINED, EV.AUTOMATION_FINISHED],
    exceptions: ['Cliente no referido', 'Programa de referidos desactivado'],
    compatibleBenefits: ['CAR-004'],
    compatiblePromotions: [],
    compatibleCampaigns: ['referidos'],
    dependencies: ['Referral Engine con condición de primera compra'],
    compatibleTemplates: [],
    examples: ['“Tu amigo compró: ambos ganan su recompensa”'],
    notes: 'La liberación se delega al Referral Engine (que ya puente al Benefit Engine).',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_FIRST_PURCHASE },
      variables: ['cliente.nombre', 'cliente.referidoPor'],
      channels: ['push', 'whatsapp'],
      steps: [
        {
          label: 'Liberar recompensas de referido',
          condition: 'cliente.referidoPor != null',
          actions: [
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'referral', action: 'release_rewards' } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: '¡Recompensa liberada!', body: 'Tú y quien te invitó ganaron, {{cliente.nombre}}.' } },
          ],
          chain: { event: EV.CLIENT_REWARD_OBTAINED },
        },
      ],
    },
  }),

  pb({
    id: 'FP-010',
    name: 'Membresía como primera transacción',
    objective: 'Activar el journey de membresías cuando la primera compra es un plan.',
    problem: 'Un cliente que empieza con membresía necesita otro acompañamiento.',
    whenToUse: 'Cuando la primera transacción es la compra de una membresía.',
    complexity: 'advanced',
    industries: [U],
    triggers: ['Evento: primera compra (tipo membresía)'],
    conditions: ['La primera compra es una membresía'],
    variables: ['cliente.nombre', 'membresia.plan'],
    engines: ['rule', 'action', 'membership', 'campaign', 'analytics'],
    flow: ['Se detecta compra de membresía', 'Se actualiza el estado del cliente', 'Se inicia el journey de membresías', 'Se registra'],
    actions: [ACTION_TYPES.ACTIVATE_MEMBERSHIP, ACTION_TYPES.SEND_EMAIL, ACTION_TYPES.RECORD_EVENT],
    esperas: [],
    events: [EV.CLIENT_LOYALTY_ENROLLED, EV.AUTOMATION_FINISHED],
    exceptions: ['La primera compra no es membresía'],
    compatibleBenefits: ['CAR-001'],
    compatiblePromotions: ['MEMBERSHIP'],
    compatibleCampaigns: ['membresias'],
    dependencies: ['Membership Engine con planes'],
    compatibleTemplates: [],
    examples: ['Gimnasio: primer plan mensual → onboarding de miembro', 'Car Wash: plan ilimitado como primera compra'],
    notes: 'Deriva al journey de membresías; el plan es una variable, nada fijo.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_FIRST_PURCHASE },
      variables: ['cliente.nombre', 'membresia.plan'],
      channels: ['email', 'push'],
      steps: [
        {
          label: 'Activar journey de membresía',
          condition: 'compra.tipo == "membresia"',
          actions: [
            { type: ACTION_TYPES.ACTIVATE_MEMBERSHIP, params: { plan: '{{membresia.plan}}' } },
            { type: ACTION_TYPES.SEND_EMAIL, params: { subject: 'Bienvenido a tu membresía, {{cliente.nombre}}', body: 'Así aprovechas tu plan al máximo.' } },
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'membresia.journey_iniciado' } },
          ],
          chain: { event: EV.CLIENT_LOYALTY_ENROLLED },
        },
      ],
    },
  }),

  pb({
    id: 'FP-011',
    name: 'Encuesta posterior a la primera compra',
    objective: 'Medir la satisfacción inicial y enriquecer el perfil.',
    problem: 'No se captura la experiencia de la primera compra para mejorar y segmentar.',
    whenToUse: 'Poco después de completarse la primera compra.',
    complexity: 'basic',
    industries: [U],
    triggers: ['Evento: primera compra'],
    conditions: ['Primera compra completada'],
    variables: ['cliente.nombre'],
    engines: ['rule', 'action', 'analytics', 'campaign'],
    flow: ['Se espera un tiempo tras la compra', 'Se envía la encuesta', 'Se registra la satisfacción', 'Se actualiza el perfil'],
    actions: [ACTION_TYPES.SEND_PUSH, ACTION_TYPES.RECORD_EVENT],
    esperas: ['2h después de la primera compra (editable)'],
    events: [EV.CLIENT_FEEDBACK_GIVEN],
    exceptions: ['Cliente desactivó notificaciones'],
    compatibleBenefits: ['CAR-011'],
    compatiblePromotions: [],
    compatibleCampaigns: ['satisfaccion'],
    dependencies: ['Módulo de encuestas'],
    compatibleTemplates: [],
    examples: ['“¿Cómo estuvo tu primer servicio?” con 1 pregunta'],
    notes: 'La satisfacción alimenta segmentos de retención y recuperación.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_FIRST_PURCHASE },
      variables: ['cliente.nombre'],
      channels: ['push', 'email'],
      steps: [
        {
          label: 'Enviar encuesta post-compra',
          actions: [
            { type: ACTION_TYPES.SEND_PUSH, params: { title: '¿Cómo te fue, {{cliente.nombre}}?', body: 'Califica tu primera experiencia.' } },
            { type: ACTION_TYPES.RECORD_EVENT, params: { event: 'encuesta.enviada' } },
          ],
          wait: { ms: 7_200_000 },
          chain: { event: EV.CLIENT_FEEDBACK_GIVEN },
        },
      ],
    },
  }),

  pb({
    id: 'FP-012',
    name: 'Inicio automático de fidelización',
    objective: 'Inscribir al cliente en los programas de fidelización tras su primera compra.',
    problem: 'La fidelización no arranca automáticamente y se pierde el impulso.',
    whenToUse: 'Inmediatamente después de la primera compra.',
    complexity: 'intermediate',
    industries: [U],
    triggers: ['Evento: primera compra'],
    conditions: ['Primera compra completada', 'Programas de fidelización activos'],
    variables: ['cliente.nombre'],
    engines: ['rule', 'action', 'reward', 'referral', 'gamification', 'analytics'],
    flow: ['Se completa la primera compra', 'Se inscribe en puntos/referidos/retos configurados', 'Se confirma la inscripción', 'Se registra'],
    actions: [ACTION_TYPES.INVOKE_MODULE, ACTION_TYPES.ADD_POINTS, ACTION_TYPES.SEND_PUSH],
    esperas: [],
    events: [EV.CLIENT_LOYALTY_ENROLLED],
    exceptions: ['Programas de fidelización desactivados', 'Ya inscrito'],
    compatibleBenefits: ['CAR-001'],
    compatiblePromotions: [],
    compatibleCampaigns: ['fidelizacion'],
    dependencies: ['Reward/Referral/Gamification Engine con programas configurados'],
    compatibleTemplates: [],
    examples: ['Auto-inscripción en puntos + referidos tras la primera compra'],
    notes: 'La empresa configura en qué programas inscribir; nada forzado ni hardcodeado.',
    config: {
      trigger: { type: 'EVENT', event: EV.CLIENT_FIRST_PURCHASE },
      variables: ['cliente.nombre'],
      channels: ['push'],
      steps: [
        {
          label: 'Inscribir en fidelización',
          actions: [
            { type: ACTION_TYPES.INVOKE_MODULE, params: { module: 'loyalty', action: 'enroll' } },
            { type: ACTION_TYPES.ADD_POINTS, params: { points: 50 } },
            { type: ACTION_TYPES.SEND_PUSH, params: { title: 'Ya acumulas recompensas, {{cliente.nombre}}', body: 'Empezaste a ganar con cada compra.' } },
          ],
          chain: { event: EV.CLIENT_LOYALTY_ENROLLED },
        },
      ],
    },
  }),
]

/** Lista mutable de los playbooks de primera compra (para composición). */
export function firstPurchasePlaybooks(): AutomationPlaybook[] {
  return [...FIRST_PURCHASE_PLAYBOOKS]
}

/** Busca un playbook de primera compra por su ID (ej. "FP-001"). */
export function getFirstPurchasePlaybook(id: string): AutomationPlaybook | undefined {
  return FIRST_PURCHASE_PLAYBOOKS.find((p) => p.id === id)
}
