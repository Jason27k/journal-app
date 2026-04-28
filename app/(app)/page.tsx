import { createClient } from '@/lib/supabase/server'
import { getUserTz, getTodayBounds, toLocalDateStr } from '@/lib/date'
import { HomeEntries } from './home-entries'
import type { DayGroup } from './actions'
import Link from 'next/link'
import { format } from 'date-fns'
import type { EntryWithTags } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tz = await getUserTz()
  const { end, displayDate, localDateStr: todayStr, y, m, d, offsetMs } = getTodayBounds(tz)

  const yestDate = new Date(Date.UTC(y, m, d - 1))
  const yestStr = `${yestDate.getUTCFullYear()}-${String(yestDate.getUTCMonth() + 1).padStart(2, '0')}-${String(yestDate.getUTCDate()).padStart(2, '0')}`

  const weekStart = new Date(Date.UTC(y, m, d - 6) - offsetMs).toISOString()

  const [entriesResult, olderResult] = await Promise.all([
    supabase
      .from('entries')
      .select('*, entry_tags(tags(id, name))')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .gte('created_at', weekStart)
      .lt('created_at', end)
      .order('created_at', { ascending: false }),
    supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .lt('created_at', weekStart),
  ])

  const entries = (entriesResult.data ?? []) as EntryWithTags[]

  const groupMap = new Map<string, EntryWithTags[]>()
  for (const entry of entries) {
    const key = toLocalDateStr(new Date(entry.created_at), tz)
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(entry)
  }

  // All 7 days newest first; always include today, skip empty past days
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(Date.UTC(y, m, d - i))
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
  })
  const initialGroups: DayGroup[] = days
    .filter((dateStr, i) => i === 0 || (groupMap.get(dateStr)?.length ?? 0) > 0)
    .map(dateStr => ({ dateStr, entries: groupMap.get(dateStr) ?? [] }))

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
            {format(displayDate, 'EEEE')}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {format(displayDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <Link
          href="/entry/new"
          className="lg:hidden rounded-xl px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          + Write
        </Link>
      </div>

      <HomeEntries
        initialGroups={initialGroups}
        todayStr={todayStr}
        yestStr={yestStr}
        initialHasMore={(olderResult.count ?? 0) > 0}
      />

      <footer className="mt-12 text-center">
        <Link href="/privacy" className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Privacy Policy
        </Link>
      </footer>
    </div>
  )
}
