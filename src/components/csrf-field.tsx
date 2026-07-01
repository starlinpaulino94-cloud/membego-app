import { getCsrfToken, getCsrfFieldName } from '@/lib/csrf'

export async function CsrfField() {
  const token = await getCsrfToken()
  const fieldName = getCsrfFieldName()

  return (
    <input
      type="hidden"
      name={fieldName}
      value={token}
    />
  )
}
