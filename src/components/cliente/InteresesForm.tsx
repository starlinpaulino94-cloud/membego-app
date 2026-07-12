'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  guardarIntereses,
  type InteresesState,
} from '@/modules/social/interesesActions'
import {
  CategoryMultiSelect,
  type CategoryOption,
} from '@/components/superadmin/CategoryMultiSelect'
import { Button } from '@/components/ui/button'

const init: InteresesState = {}

export function InteresesForm({
  categories,
  selected,
}: {
  categories: CategoryOption[]
  selected: string[]
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(guardarIntereses, init)

  useEffect(() => {
    if (state.success) {
      toast.success('Intereses guardados. Tus recomendaciones mejorarán.')
      router.push('/mis-membresias')
      router.refresh()
    }
    if (state.error) toast.error(state.error)
  }, [state.success, state.error, router])

  return (
    <form action={action} className="space-y-6">
      <CategoryMultiSelect categories={categories} defaultSelected={selected} />
      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Guardar intereses
      </Button>
    </form>
  )
}
