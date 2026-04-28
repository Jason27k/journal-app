'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserTz, getTodayBounds, toLocalDateStr } from '@/lib/date'
import type { EntryWithTags } from '@/lib/types'

export type DayGroup = { dateStr: string; entries: EntryWithTags[] }

export async function loadMoreEntries(offsetDays: number): Promise<{ groups: DayGroup[]; hasMore: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tz = await getUserTz()
  const { y, m, d, offsetMs } = getTodayBounds(tz)

  const rangeEnd = new Date(Date.UTC(y, m, d - offsetDays) - offsetMs).toISOString()
  const rangeStart = new Date(Date.UTC(y, m, d - offsetDays - 6) - offsetMs).toISOString()

  const [entriesResult, olderResult] = await Promise.all([
    supabase
      .from('entries')
      .select('*, entry_tags(tags(id, name))')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .gte('created_at', rangeStart)
      .lt('created_at', rangeEnd)
      .order('created_at', { ascending: false }),
    supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .lt('created_at', rangeStart),
  ])

  const entries = (entriesResult.data ?? []) as EntryWithTags[]

  const groupMap = new Map<string, EntryWithTags[]>()
  for (const entry of entries) {
    const key = toLocalDateStr(new Date(entry.created_at), tz)
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(entry)
  }

  const groups: DayGroup[] = [...groupMap.entries()]
    .map(([dateStr, entries]) => ({ dateStr, entries }))
    .sort((a, b) => b.dateStr.localeCompare(a.dateStr))

  return { groups, hasMore: (olderResult.count ?? 0) > 0 }
}
