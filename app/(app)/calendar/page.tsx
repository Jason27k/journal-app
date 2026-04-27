import { createClient } from '@/lib/supabase/server'
import { CalendarGrid } from './calendar-grid'
import { YearNav } from './year-nav'
import { startOfYear, endOfYear } from 'date-fns'

interface CalendarPageProps {
  searchParams: Promise<{ year?: string }>
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const currentYear = new Date().getFullYear()
  const { year: yearParam } = await searchParams
  const year = Math.min(currentYear, parseInt(yearParam ?? String(currentYear), 10) || currentYear)

  const yearStart = startOfYear(new Date(year, 0))
  const yearEnd = endOfYear(new Date(year, 0))

  const { data: entries } = await supabase
    .from('entries')
    .select('created_at')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .gte('created_at', yearStart.toISOString())
    .lte('created_at', yearEnd.toISOString())

  const counts: Record<string, number> = {}
  for (const entry of entries ?? []) {
    const date = entry.created_at.slice(0, 10)
    counts[date] = (counts[date] ?? 0) + 1
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{year}</h2>
        <YearNav year={year} maxYear={currentYear} />
      </div>
      <CalendarGrid counts={counts} year={year} />
    </div>
  )
}
