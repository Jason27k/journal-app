import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

function wordCount(content: string): number {
  return content.trim() ? content.trim().split(/\s+/).length : 0
}

function computeStreaks(dates: string[]): { current: number; longest: number } {
  const unique = [...new Set(dates)].sort()
  if (unique.length === 0) return { current: 0, longest: 0 }

  let longest = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    const diff = Math.round(
      (new Date(unique[i] + 'T12:00:00Z').getTime() - new Date(unique[i - 1] + 'T12:00:00Z').getTime()) / 86400000
    )
    if (diff === 1) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const yestStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const set = new Set(unique)

  let current = 0
  const start = set.has(todayStr) ? todayStr : set.has(yestStr) ? yestStr : null
  if (start) {
    let d = new Date(start + 'T12:00:00Z')
    while (set.has(d.toISOString().slice(0, 10))) {
      current++
      d = new Date(d.getTime() - 86400000)
    }
  }

  return { current, longest }
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('entries')
    .select('created_at, content')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const entries = data ?? []

  const totalEntries = entries.length
  const totalWords = entries.reduce((sum, e) => sum + wordCount(e.content), 0)
  const avgWords = totalEntries ? Math.round(totalWords / totalEntries) : 0

  const dates = entries.map(e => e.created_at.slice(0, 10))
  const uniqueDates = [...new Set(dates)]
  const daysActive = uniqueDates.length
  const { current: currentStreak, longest: longestStreak } = computeStreaks(dates)

  const firstEntry = entries[0] ? new Date(entries[0].created_at) : null

  const dayCounts = new Array(7).fill(0)
  for (const d of dates) {
    dayCounts[new Date(d + 'T12:00:00Z').getUTCDay()]++
  }
  const mostActiveDay = totalEntries ? DAY_NAMES[dayCounts.indexOf(Math.max(...dayCounts))] : null

  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()
  const entriesThisYear = entries.filter(e => new Date(e.created_at).getFullYear() === thisYear).length
  const entriesThisMonth = entries.filter(e => {
    const d = new Date(e.created_at)
    return d.getFullYear() === thisYear && d.getMonth() === thisMonth
  }).length

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text)' }}>Stats</h2>
      {firstEntry && (
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Journaling since {format(firstEntry, 'MMMM d, yyyy')}
        </p>
      )}

      {totalEntries === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No entries yet. Start writing to see your stats.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard label="Total Entries" value={totalEntries.toLocaleString()} />
            <StatCard label="Total Words" value={totalWords.toLocaleString()} />
            <StatCard label="Avg Words / Entry" value={avgWords.toLocaleString()} />
            <StatCard label="Days Active" value={daysActive.toLocaleString()} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard label="Current Streak" value={`${currentStreak} day${currentStreak !== 1 ? 's' : ''}`} accent />
            <StatCard label="Longest Streak" value={`${longestStreak} day${longestStreak !== 1 ? 's' : ''}`} accent />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard label={format(now, 'MMMM')} value={`${entriesThisMonth} ${entriesThisMonth === 1 ? 'entry' : 'entries'}`} />
            <StatCard label={String(thisYear)} value={`${entriesThisYear} ${entriesThisYear === 1 ? 'entry' : 'entries'}`} />
          </div>

          {mostActiveDay && (
            <div
              className="rounded-xl border px-4 py-4"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Most Active Day</p>
              <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{mostActiveDay}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-xl border px-4 py-4"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
    >
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p
        className={accent ? 'text-2xl font-bold' : 'text-xl font-semibold'}
        style={{ color: 'var(--text)' }}
      >
        {value}
      </p>
    </div>
  )
}
