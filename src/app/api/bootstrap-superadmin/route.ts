import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * POST /api/bootstrap-superadmin
 *
 * Endpoint de arranque protegido para crear (o promover) una cuenta SUPERADMIN
 * en producción, cuando todavía no existe ninguna forma de iniciar sesión.
 *
 * Seguridad:
 *  - Requiere el header `x-bootstrap-secret` que debe coincidir con la variable
 *    de entorno BOOTSTRAP_SECRET (configúrala en Vercel).
 *  - Idempotente: si el usuario ya existe en Supabase, solo actualiza contraseña,
 *    rol y app_metadata.
 *  - Pensado para ejecutarse una sola vez. Elimina la variable BOOTSTRAP_SECRET
 *    (o este endpoint) después de usarlo.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.BOOTSTRAP_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'BOOTSTRAP_SECRET no está configurado en el servidor.' },
      { status: 500 }
    )
  }

  const provided = req.headers.get('x-bootstrap-secret')
  if (!provided || provided !== secret) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  let body: { email?: string; password?: string; nombre?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido.' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const password = String(body.password ?? '')
  const nombre = String(body.nombre ?? '').trim() || 'Super Admin'

  if (!email || !password) {
    return NextResponse.json(
      { error: 'email y password son obligatorios.' },
      { status: 400 }
    )
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 6 caracteres.' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()

    // 1. Buscar si el usuario ya existe en Supabase Auth
    const { data: list, error: listError } =
      await supabase.auth.admin.listUsers()
    if (listError) {
      throw new Error(`listUsers: ${listError.message}`)
    }
    const existing = list?.users?.find(
      (u) => u.email?.toLowerCase() === email
    )

    let supabaseId: string
    if (existing) {
      // Actualizar contraseña y confirmar email
      const { data, error } = await supabase.auth.admin.updateUserById(
        existing.id,
        {
          password,
          email_confirm: true,
          user_metadata: { name: nombre },
        }
      )
      if (error) throw new Error(`updateUserById: ${error.message}`)
      supabaseId = data.user!.id
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: nombre },
      })
      if (error) throw new Error(`createUser: ${error.message}`)
      supabaseId = data.user!.id
    }

    // 2. Crear/actualizar el registro en la BD con rol SUPERADMIN
    const dbUser = await prisma.user.upsert({
      where: { supabaseId },
      update: { email, name: nombre, role: 'SUPERADMIN', companyId: null },
      create: {
        supabaseId,
        email,
        name: nombre,
        role: 'SUPERADMIN',
        companyId: null,
      },
    })

    // 3. Sincronizar app_metadata (usado por el proxy y los guards)
    const { error: metaError } = await supabase.auth.admin.updateUserById(
      supabaseId,
      {
        app_metadata: {
          role: 'SUPERADMIN',
          dbUserId: dbUser.id,
          clienteId: null,
          companyId: null,
        },
      }
    )
    if (metaError) throw new Error(`updateUserById metadata: ${metaError.message}`)

    return NextResponse.json({
      ok: true,
      message: 'Cuenta SUPERADMIN lista. Ya puedes iniciar sesión.',
      email,
      role: 'SUPERADMIN',
      created: !existing,
    })
  } catch (e) {
    console.error('[bootstrap-superadmin] error:', e)
    return NextResponse.json(
      { error: 'No se pudo crear la cuenta. Revisa los logs del servidor.' },
      { status: 500 }
    )
  }
}
