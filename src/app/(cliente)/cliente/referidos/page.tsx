import { redirect } from 'next/navigation'

/**
 * Unificación: el módulo "Referidos" se fusionó en "Invita y Gana".
 * Se conserva la ruta como redirect para no romper enlaces guardados,
 * notificaciones antiguas ni marcadores.
 */
export default function ReferidosRedirect() {
  redirect('/cliente/invita-y-gana')
}
