export function fmtMonto(value: number, currency = 'DOP'): string {
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency }).format(value)
}

export function fmtFecha(date: string | Date): string {
  return new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium' }).format(new Date(date))
}

export function fmtFechaHora(date: string | Date): string {
  return new Intl.DateTimeFormat('es-DO', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(date)
  )
}
