import { headers } from 'next/headers'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader activePath={pathname} />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  )
}
