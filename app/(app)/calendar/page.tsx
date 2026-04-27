import { createClient } from '@/lib/supabase/server'
import { CalendarGrid } from './calendar-grid'
import { startOfYear, endOfYear } from 'date-fns'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const { data: entries } = await supabase
    .from('entries')
    .select('created_at')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .gte('created_at', startOfYear(now).toISOString())
    .lte('created_at', endOfYear(now).toISOString())

  const counts: Record<string, number> = {}
  for (const entry of entries ?? []) {
    const date = entry.created_at.slice(0, 10)
    counts[date] = (counts[date] ?? 0) + 1
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>
        {now.getFullYear()}
      </h2>
      <CalendarGrid counts={counts} year={now.getFullYear()} />
    </div>
  )
}
