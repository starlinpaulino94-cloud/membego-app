import { createRouteClient } from '@/lib/supabase/route-client'
import { redirect } from 'next/navigation'

/**
 * Email verification callback (O-1).
 * User clicks the link from the verification email, which contains:
 * ?token_hash=<hash>&type=magiclink
 *
 * This route verifies the magic link and marks the email as confirmed.
 * On success, redirects to /auth/login (ready to login).
 * On error, redirects to /auth/login with error message.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (!tokenHash || type !== 'magiclink') {
    return redirect('/auth/login?error=enlace-invalido')
  }

  const { supabase } = await createRouteClient(request)

  // Verify the magic link. This marks the email as confirmed and creates a session.
  const { error } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: tokenHash,
    options: {
      redirectTo: '/auth/login?verified=true',
    },
  })

  if (error) {
    console.error('[confirmar] verifyOtp error:', error)
    return redirect('/auth/login?error=verify')
  }

  // Success: redirect to login (user can now sign in with verified email)
  return redirect('/auth/login?verificado=1')
}
