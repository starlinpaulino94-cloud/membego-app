import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_TOKEN_FIELD = '_csrf'

/**
 * Generate or retrieve CSRF token for current session.
 * Tokens are stored in httpOnly cookies and validated on form submission.
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_TOKEN_COOKIE)?.value

  if (!token) {
    token = randomBytes(32).toString('hex')
    cookieStore.set(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })
  }

  return token
}

/**
 * Validate CSRF token from form submission.
 * Throws error if token is missing or invalid.
 */
export async function validateCsrfToken(formData: FormData): Promise<void> {
  const token = formData.get(CSRF_TOKEN_FIELD) as string
  if (!token) {
    throw new Error('CSRF token is missing')
  }

  const cookieStore = await cookies()
  const storedToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value

  if (!storedToken || storedToken !== token) {
    throw new Error('CSRF token is invalid')
  }
}

/**
 * Get field name for CSRF token in forms.
 */
export function getCsrfFieldName(): string {
  return CSRF_TOKEN_FIELD
}
