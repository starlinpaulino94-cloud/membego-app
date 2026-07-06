import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Devuelve una ruta interna segura para redirigir tras el login. Evita open
 * redirects: solo acepta rutas que empiezan con una única '/' (no '//' ni '/\',
 * que serían protocol-relative hacia un host externo). Cualquier otra cosa
 * (URLs absolutas, valores vacíos) cae al fallback.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback: string
): string {
  if (!candidate) return fallback
  if (!candidate.startsWith('/')) return fallback
  // Rechaza '//host' y '/\host' (protocol-relative / backslash tricks).
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback
  return candidate
}
