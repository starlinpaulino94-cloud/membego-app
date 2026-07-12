export interface SeedPlan {
  nombre: string
  precio: number
  lavadosIncluidos: number
  esIlimitado: boolean
  descripcion: string
  beneficios: string[]
}

export interface SeedCompany {
  name: string
  slug: string
  type: 'carwash' | 'restaurante'
  description: string
  plans: SeedPlan[]
}

export const SEED_COMPANIES: SeedCompany[] = [
  {
    name: 'CARTOWN Wash & Detailing',
    slug: 'cartown',
    type: 'carwash',
    description:
      'Lavado y detallado profesional de vehículos. Tu auto siempre impecable.',
    plans: [
      {
        nombre: 'Silver',
        precio: 999,
        lavadosIncluidos: 4,
        esIlimitado: false,
        descripcion: 'Plan ideal para mantenimiento básico mensual.',
        beneficios: [
          '4 lavados básicos',
          '1 aromatizante premium',
          'Acceso a promociones exclusivas',
        ],
      },
      {
        nombre: 'Gold',
        precio: 1499,
        lavadosIncluidos: 4,
        esIlimitado: false,
        descripcion: 'Para quienes buscan un cuidado superior.',
        beneficios: [
          '4 lavados premium',
          'Aspirado completo',
          'Descuento en detallados',
        ],
      },
      {
        nombre: 'Platinum',
        precio: 2499,
        lavadosIncluidos: 0,
        esIlimitado: true,
        descripcion: 'La experiencia definitiva, sin límites.',
        beneficios: [
          'Lavados ilimitados',
          'Prioridad de atención',
          'Descuentos especiales',
        ],
      },
    ],
  },
  {
    name: "Toni's Restaurante",
    slug: 'tonis',
    type: 'restaurante',
    description:
      'Gastronomía de alto nivel con beneficios exclusivos para miembros.',
    plans: [
      {
        nombre: 'Silver',
        precio: 999,
        lavadosIncluidos: 4,
        esIlimitado: false,
        descripcion: 'Disfruta de nuestro menú ejecutivo cada mes.',
        beneficios: [
          '4 comidas menú ejecutivo',
          '1 bebida premium/mes',
          'Postre de cumpleaños',
        ],
      },
      {
        nombre: 'Gold',
        precio: 1499,
        lavadosIncluidos: 4,
        esIlimitado: false,
        descripcion: 'Una experiencia gastronómica premium.',
        beneficios: [
          '4 comidas premium',
          'Bebida por visita',
          'Acceso anticipado a nuevos platos',
          'Prioridad en reservas',
        ],
      },
      {
        nombre: 'Platinum',
        precio: 2499,
        lavadosIncluidos: 0,
        esIlimitado: true,
        descripcion: 'Membresía exclusiva sin límites de consumo.',
        beneficios: [
          'Consumos mensuales ilimitados',
          'Prioridad en reservas',
          'Mesa preferencial',
          'Invitaciones a degustaciones',
        ],
      },
    ],
  },
]
