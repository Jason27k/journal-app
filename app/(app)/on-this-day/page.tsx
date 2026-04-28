import { createClient } from '@/lib/supabase/server'
import { getUserTz, getTodayBounds, toLocalDateStr } from '@/lib/date'
import { EntryCard } from '@/components/entry/entry-card'
import { format } from 'date-fns'
import type { EntryWithTags } from '@/lib/types'
import { flattenTags } from '@/lib/types'

export default async function OnThisDayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tz = await getUserTz()
  const { start, displayDate, y, m, d } = getTodayBounds(tz)

  const { data } = await supabase
    .from('entries')
    .select('*, entry_tags(tags(id, name))')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .lt('created_at', start)
    .order('created_at', { ascending: false })

  const onThisDay = ((data ?? []) as EntryWithTags[]).filter(entry => {
    const [ey, em, ed] = toLocalDateStr(new Date(entry.created_at), tz).split('-').map(Number)
    return em === m + 1 && ed === d && ey !== y
  })

  const byYear = onThisDay.reduce<Record<number, EntryWithTags[]>>((acc, entry) => {
    const year = Number(toLocalDateStr(new Date(entry.created_at), tz).split('-')[0])
    if (!acc[year]) acc[year] = []
    acc[year].push(entry)
    return acc
  }, {})

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>On This Day</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {format(displayDate, 'MMMM d')} in previous years
      </p>

      {years.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Nothing from previous years on this date yet. Check back as your journal grows.
        </p>
      ) : (
        years.map(year => (
          <section key={year} className="mb-8">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
              {year} · {y - year} year{y - year !== 1 ? 's' : ''} ago
            </h3>
            <div className="flex flex-col gap-3">
              {byYear[year].map(entry => (
                <EntryCard key={entry.id} entry={entry} tags={flattenTags(entry)} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
