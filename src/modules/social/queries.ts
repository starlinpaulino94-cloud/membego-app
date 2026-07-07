import { prisma } from '@/lib/prisma'
import type { PromotionPublic } from '@/modules/marketplace/types'

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
