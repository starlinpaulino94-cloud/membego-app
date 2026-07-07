import { prisma } from '@/lib/prisma'
import type { CompanyPublic, PromotionPublic } from '@/modules/marketplace/types'

// ─── FASE 3: capa social — seguir empresas y guardar promociones ────────────

export interface EmpresaSeguida {
  followId: string
  esFavorita: boolean
  seguidaDesde: Date
  company: {
    id: string
    name: string
    slug: string
    type: string
    description: string | null
    logoUrl: string | null
    bannerUrl: string | null
    ciudad: string | null
    activePromotionsCount: number
  }
}

/** Empresas que sigue el usuario, favoritas primero. */
export async function getMisEmpresas(dbUserId: string): Promise<EmpresaSeguida[]> {
  const follows = await prisma.companyFollow.findMany({
    where: { userId: dbUserId, company: { isActive: true, isPublished: true } },
    orderBy: [{ esFavorita: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      esFavorita: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          description: true,
          logoUrl: true,
          bannerUrl: true,
          ciudad: true,
          activePromotionsCount: true,
        },
      },
    },
  })

  return follows.map((f) => ({
    followId: f.id,
    esFavorita: f.esFavorita,
    seguidaDesde: f.createdAt,
    company: f.company,
  }))
}

/** IDs de empresas seguidas (para marcar tarjetas). */
export async function getSeguidasIds(dbUserId: string): Promise<Set<string>> {
  const rows = await prisma.companyFollow.findMany({
    where: { userId: dbUserId },
    select: { companyId: true },
  })
  return new Set(rows.map((r) => r.companyId))
}

/** Promociones guardadas por el usuario (vigentes o no, más recientes primero). */
export async function getPromocionesGuardadas(
  dbUserId: string
): Promise<PromotionPublic[]> {
  const guardadas = await prisma.promocionGuardada.findMany({
    where: { userId: dbUserId },
    orderBy: { createdAt: 'desc' },
    select: {
      promocion: {
        select: {
          id: true,
          titulo: true,
          slug: true,
          descripcion: true,
          imagenUrl: true,
          tipo: true,
          descuento: true,
          codigo: true,
          vigenciaDesde: true,
          vigenciaHasta: true,
          viewCount: true,
          shareCount: true,
          tags: true,
          isFeatured: true,
          createdAt: true,
          company: {
            select: { id: true, name: true, slug: true, logoUrl: true },
          },
        },
      },
    },
  })

  return guardadas.map((g) => g.promocion) as PromotionPublic[]
}

/** IDs de promociones guardadas (para marcar tarjetas). */
export async function getGuardadasIds(dbUserId: string): Promise<Set<string>> {
  const rows = await prisma.promocionGuardada.findMany({
    where: { userId: dbUserId },
    select: { promocionId: true },
  })
  return new Set(rows.map((r) => r.promocionId))
}

// ─── F3.2: Promociones inteligentes ──────────────────────────────────────────

const PROMO_SELECT = {
  id: true,
  titulo: true,
  slug: true,
  descripcion: true,
  imagenUrl: true,
  tipo: true,
  descuento: true,
  codigo: true,
  vigenciaDesde: true,
  vigenciaHasta: true,
  viewCount: true,
  shareCount: true,
  tags: true,
  isFeatured: true,
  createdAt: true,
  company: {
    select: { id: true, name: true, slug: true, logoUrl: true },
  },
} as const

/** Condición de promoción vigente y visible públicamente. */
function promoVigente(now: Date) {
  return {
    activo: true,
    vigenciaDesde: { lte: now },
    OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: now } }],
    company: { isPublished: true, isActive: true },
  }
}

export interface PromoFeed {
  /** Promos de empresas que el usuario sigue (favoritas primero). */
  seguidas: PromotionPublic[]
  /** Destacadas del marketplace (sin repetir las de arriba). */
  destacadas: PromotionPublic[]
  /** Publicadas en los últimos 14 días (sin repetir). */
  nuevas: PromotionPublic[]
  /** Vencen en los próximos 7 días (sin repetir). */
  expiranPronto: PromotionPublic[]
  /** Promos de empresas recomendadas que aún no sigue (sin repetir). */
  recomendadas: PromotionPublic[]
  /** Empresas sugeridas para seguir. */
  empresasRecomendadas: CompanyPublic[]
}

/**
 * Feed inteligente de promociones del cliente. Prioriza empresas seguidas
 * (las favoritas primero) y evita duplicados entre secciones: cada promoción
 * aparece solo en la sección de mayor prioridad.
 */
export async function getPromoFeed(dbUserId: string): Promise<PromoFeed> {
  const now = new Date()
  const en7dias = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const hace14dias = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const follows = await prisma.companyFollow.findMany({
    where: { userId: dbUserId },
    select: { companyId: true, esFavorita: true },
  })
  const seguidasIds = follows.map((f) => f.companyId)
  const favoritasIds = new Set(
    follows.filter((f) => f.esFavorita).map((f) => f.companyId)
  )

  const [seguidasRaw, destacadasRaw, nuevasRaw, expiranRaw, empresasRecomendadas] =
    await Promise.all([
      seguidasIds.length > 0
        ? prisma.promocion.findMany({
            where: { ...promoVigente(now), companyId: { in: seguidasIds } },
            select: PROMO_SELECT,
            orderBy: [{ isFeatured: 'desc' }, { publicadaEn: 'desc' }],
            take: 30,
          })
        : Promise.resolve([]),
      prisma.promocion.findMany({
        where: { ...promoVigente(now), isFeatured: true },
        select: PROMO_SELECT,
        orderBy: [{ featuredOrder: 'asc' }, { publicadaEn: 'desc' }],
        take: 12,
      }),
      prisma.promocion.findMany({
        where: { ...promoVigente(now), publicadaEn: { gte: hace14dias } },
        select: PROMO_SELECT,
        orderBy: { publicadaEn: 'desc' },
        take: 12,
      }),
      prisma.promocion.findMany({
        where: {
          ...promoVigente(now),
          vigenciaHasta: { gte: now, lte: en7dias },
        },
        select: PROMO_SELECT,
        orderBy: { vigenciaHasta: 'asc' },
        take: 12,
      }),
      getEmpresasRecomendadas(dbUserId, seguidasIds, 4),
    ])

  // Favoritas primero dentro de "seguidas".
  const seguidas = [...seguidasRaw].sort((a, b) => {
    const favA = favoritasIds.has(a.company.id) ? 1 : 0
    const favB = favoritasIds.has(b.company.id) ? 1 : 0
    return favB - favA
  }) as PromotionPublic[]

  // Deduplicación por prioridad de sección.
  const vistos = new Set(seguidas.map((p) => p.id))
  const dedupe = (rows: typeof destacadasRaw, limit: number) => {
    const out: PromotionPublic[] = []
    for (const p of rows) {
      if (vistos.has(p.id)) continue
      vistos.add(p.id)
      out.push(p as PromotionPublic)
      if (out.length >= limit) break
    }
    return out
  }

  const destacadas = dedupe(destacadasRaw, 6)
  const nuevas = dedupe(nuevasRaw, 6)
  const expiranPronto = dedupe(expiranRaw, 6)

  // Recomendadas: promos vigentes de las empresas sugeridas.
  const recomendadasIds = empresasRecomendadas.map((c) => c.id)
  const recomendadasRaw =
    recomendadasIds.length > 0
      ? await prisma.promocion.findMany({
          where: { ...promoVigente(now), companyId: { in: recomendadasIds } },
          select: PROMO_SELECT,
          orderBy: [{ isFeatured: 'desc' }, { publicadaEn: 'desc' }],
          take: 12,
        })
      : []
  const recomendadas = dedupe(recomendadasRaw, 6)

  return { seguidas, destacadas, nuevas, expiranPronto, recomendadas, empresasRecomendadas }
}

/**
 * Empresas sugeridas para seguir: comparten categoría con las que ya sigue
 * (y no las sigue aún). Si no hay coincidencias, cae a las más populares.
 */
async function getEmpresasRecomendadas(
  dbUserId: string,
  seguidasIds: string[],
  limit: number
): Promise<CompanyPublic[]> {
  try {
    const companySelect = {
      id: true,
      name: true,
      slug: true,
      type: true,
      description: true,
      logoUrl: true,
      bannerUrl: true,
      galleryImages: true,
      ciudad: true,
      provincia: true,
      pais: true,
      telefono: true,
      whatsapp: true,
      email: true,
      website: true,
      instagram: true,
      facebook: true,
      tiktok: true,
      googleMapsUrl: true,
      totalMembersCount: true,
      activePromotionsCount: true,
      averageRating: true,
      isFeatured: true,
      createdAt: true,
      categories: { select: { category: { select: { slug: true } } } },
    } as const

    const baseWhere = {
      isPublished: true,
      isActive: true,
      ...(seguidasIds.length > 0 && { id: { notIn: seguidasIds } }),
    }

    // Categorías de las empresas seguidas.
    let candidatas: Awaited<
      ReturnType<typeof prisma.company.findMany<{ select: typeof companySelect }>>
    > = []

    if (seguidasIds.length > 0) {
      const cats = await prisma.companyToCategory.findMany({
        where: { companyId: { in: seguidasIds } },
        select: { categoryId: true },
      })
      const categoryIds = [...new Set(cats.map((c) => c.categoryId))]
      if (categoryIds.length > 0) {
        candidatas = await prisma.company.findMany({
          where: {
            ...baseWhere,
            categories: { some: { categoryId: { in: categoryIds } } },
          },
          select: companySelect,
          orderBy: [{ isFeatured: 'desc' }, { activePromotionsCount: 'desc' }],
          take: limit,
        })
      }
    }

    // Respaldo: populares del marketplace.
    if (candidatas.length < limit) {
      const extra = await prisma.company.findMany({
        where: {
          ...baseWhere,
          id: { notIn: [...seguidasIds, ...candidatas.map((c) => c.id)] },
        },
        select: companySelect,
        orderBy: [{ isFeatured: 'desc' }, { totalMembersCount: 'desc' }],
        take: limit - candidatas.length,
      })
      candidatas = [...candidatas, ...extra]
    }

    return candidatas.map((c) => ({
      ...c,
      categories: c.categories.map((cc) => cc.category.slug),
    })) as CompanyPublic[]
  } catch (e) {
    console.error('[social] getEmpresasRecomendadas', e)
    return []
  }
}
