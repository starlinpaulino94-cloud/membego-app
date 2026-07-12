/**
 * Centralized environment variable validation. Imported by Supabase clients so
 * that a missing/wrong configuration fails loudly with a clear message instead
 * of throwing obscure errors deep inside the SDK at runtime.
 */

const REQUIRED_PUBLIC = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const
const REQUIRED_SERVER = ['SUPABASE_SERVICE_ROLE_KEY'] as const

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
  return url
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return key
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY')
  return key
}

/** Returns the list of missing required public env vars (for diagnostics). */
export function missingPublicEnv(): string[] {
  return REQUIRED_PUBLIC.filter((k) => !process.env[k])
}

/** Returns the list of missing required server env vars (for diagnostics). */
export function missingServerEnv(): string[] {
  return REQUIRED_SERVER.filter((k) => !process.env[k])
}
