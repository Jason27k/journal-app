'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, subDays, subWeeks, startOfWeek } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitCompletion } from '@/lib/types'

function getMondayStr(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

function dailyStreak(completedDates: string[]): number {
  const set = new Set(completedDates)
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  let d = set.has(today) ? new Date() : set.has(yesterday) ? subDays(new Date(), 1) : null
  if (!d) return 0
  let count = 0
  while (set.has(format(d, 'yyyy-MM-dd'))) {
    count++
    d = subDays(d, 1)
  }
  return count
}

function weeklyStreak(completedDates: string[]): number {
  const set = new Set(completedDates)
  const thisMonday = getMondayStr(new Date())
  const lastMonday = getMondayStr(subWeeks(new Date(), 1))
  let w = set.has(thisMonday)
    ? startOfWeek(new Date(), { weekStartsOn: 1 })
    : set.has(lastMonday) ? startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }) : null
  if (!w) return 0
  let count = 0
  while (set.has(getMondayStr(w))) {
    count++
    w = subWeeks(w, 1)
  }
  return count
}

export function HabitCard({ habit, completions }: { habit: Habit; completions: HabitCompletion[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const completedDates = completions.map(c => c.completed_date)
  const isDaily = habit.frequency === 'daily'

  const todayKey = isDaily ? format(new Date(), 'yyyy-MM-dd') : getMondayStr(new Date())

  const dots = isDaily
    ? Array.from({ length: 14 }, (_, i) => format(subDays(new Date(), 13 - i), 'yyyy-MM-dd'))
    : Array.from({ length: 8 }, (_, i) => getMondayStr(subWeeks(new Date(), 7 - i)))

  const completedSet = new Set(completedDates)
  const streak = isDaily ? dailyStreak(completedDates) : weeklyStreak(completedDates)
  const doneToday = completedSet.has(todayKey)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (doneToday) {
      await supabase.from('habit_completions').delete().eq('habit_id', habit.id).eq('completed_date', todayKey)
    } else {
      await supabase.from('habit_completions').insert({ habit_id: habit.id, user_id: user!.id, completed_date: todayKey })
    }
    setLoading(false)
    router.refresh()
  }

  async function deleteHabit() {
    if (!confirm('Delete this habit?')) return
    const supabase = createClient()
    await supabase.from('habits').update({ deleted_at: new Date().toISOString() }).eq('id', habit.id)
    setOpen(false)
    router.refresh()
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{habit.title}</span>
          <span
            className="shrink-0 text-xs px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--border)', color: 'var(--text-muted)' }}
          >
            {habit.frequency}
          </span>
        </div>
        <div className="relative shrink-0">
          <button onClick={() => setOpen(o => !o)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--text-muted)' }}>
            •••
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border shadow-lg py-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <button onClick={deleteHabit} className="w-full text-left px-4 py-2 text-sm text-red-500">
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {dots.map(dateStr => {
          const isTodayDot = dateStr === todayKey
          const done = completedSet.has(dateStr)
          const label = isDaily
            ? format(new Date(dateStr + 'T12:00:00Z'), 'MMM d')
            : `Week of ${format(new Date(dateStr + 'T12:00:00Z'), 'MMM d')}`

          return isTodayDot ? (
            <button
              key={dateStr}
              onClick={toggle}
              disabled={loading}
              title={label}
              className="rounded-full border-2 transition-colors shrink-0"
              style={{
                width: 18,
                height: 18,
                background: done ? 'var(--text)' : 'transparent',
                borderColor: 'var(--text)',
                opacity: loading ? 0.5 : 1,
              }}
            />
          ) : (
            <div
              key={dateStr}
              title={label}
              className="rounded-full shrink-0"
              style={{
                width: 14,
                height: 14,
                background: done ? 'var(--text-muted)' : 'transparent',
                border: `1.5px solid var(${done ? '--text-muted' : '--border'})`,
              }}
            />
          )
        })}
        <span className="ml-1 text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
          {streak > 0
            ? `${streak} ${isDaily ? (streak === 1 ? 'day' : 'days') : (streak === 1 ? 'week' : 'weeks')}`
            : '–'}
        </span>
      </div>
    </div>
  )
}
