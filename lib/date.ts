import { cookies } from 'next/headers'

export async function getUserTz(): Promise<string> {
  const cookieStore = await cookies()
  return decodeURIComponent(cookieStore.get('tz')?.value ?? 'UTC')
}

export function getTodayBounds(tz: string): {
  start: string
  end: string
  displayDate: Date
  localDateStr: string
  y: number
  m: number
  d: number
  offsetMs: number
} {
  const now = new Date()
  const tzProxy = new Date(now.toLocaleString('en-US', { timeZone: tz }))
  const utcProxy = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
  const offsetMs = tzProxy.getTime() - utcProxy.getTime()
  const localNow = new Date(now.getTime() + offsetMs)
  const y = localNow.getUTCFullYear()
  const m = localNow.getUTCMonth()
  const d = localNow.getUTCDate()
  const localDateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return {
    start: new Date(Date.UTC(y, m, d) - offsetMs).toISOString(),
    end: new Date(Date.UTC(y, m, d + 1) - offsetMs).toISOString(),
    displayDate: new Date(y, m, d),
    localDateStr,
    y,
    m,
    d,
    offsetMs,
  }
}

export function toLocalDateStr(date: Date, tz: string): string {
  return date.toLocaleDateString('en-CA', { timeZone: tz })
}
