import { createClient } from '@/lib/supabase/server'
import { EntryCard } from '@/components/entry/entry-card'
import { format, subYears } from 'date-fns'

export default async function OnThisDayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .lt('created_at', subYears(today, 0).toISOString().slice(0, 10)) // exclude today
    .order('created_at', { ascending: false })

  // Filter client-side to same month/day (Postgres doesn't do this well without a function)
  const onThisDay = (entries ?? []).filter(entry => {
    const d = new Date(entry.created_at)
    return d.getMonth() + 1 === month && d.getDate() === day
  })

  const byYear = onThisDay.reduce<Record<number, typeof onThisDay>>((acc, entry) => {
    const year = new Date(entry.created_at).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(entry)
    return acc
  }, {})

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>On This Day</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        {format(today, 'MMMM d')} in previous years
      </p>

      {years.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Nothing from previous years on this date yet. Check back as your journal grows.
        </p>
      ) : (
        years.map(year => (
          <section key={year} className="mb-8">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
              {year} · {today.getFullYear() - year} year{today.getFullYear() - year !== 1 ? 's' : ''} ago
            </h3>
            <div className="flex flex-col gap-3">
              {byYear[year].map(entry => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
