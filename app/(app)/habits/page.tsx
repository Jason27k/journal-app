import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'
import { NewHabitForm } from './new-habit-form'
import { HabitCard } from './habit-card'
import type { HabitCompletion } from '@/lib/types'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const habitIds = (habits ?? []).map(h => h.id)
  let completions: HabitCompletion[] = []

  if (habitIds.length > 0) {
    const since = format(subDays(new Date(), 60), 'yyyy-MM-dd')
    const { data } = await supabase
      .from('habit_completions')
      .select('*')
      .in('habit_id', habitIds)
      .gte('completed_date', since)
    completions = (data ?? []) as HabitCompletion[]
  }

  const dailyHabits = (habits ?? []).filter(h => h.frequency === 'daily')
  const weeklyHabits = (habits ?? []).filter(h => h.frequency === 'weekly')

  function completionsFor(habitId: string): HabitCompletion[] {
    return completions.filter(c => c.habit_id === habitId)
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Habits</h2>

      <NewHabitForm />

      {habits && habits.length === 0 && (
        <p className="text-sm mt-8" style={{ color: 'var(--text-muted)' }}>
          No habits yet. Add one above to start tracking your progress.
        </p>
      )}

      {dailyHabits.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Daily
          </h3>
          <div className="flex flex-col gap-3">
            {dailyHabits.map(habit => (
              <HabitCard key={habit.id} habit={habit} completions={completionsFor(habit.id)} />
            ))}
          </div>
        </section>
      )}

      {weeklyHabits.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Weekly
          </h3>
          <div className="flex flex-col gap-3">
            {weeklyHabits.map(habit => (
              <HabitCard key={habit.id} habit={habit} completions={completionsFor(habit.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
