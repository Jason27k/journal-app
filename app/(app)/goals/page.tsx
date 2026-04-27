import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { GoalActions } from './goal-actions'
import { NewGoalForm } from './new-goal-form'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const active = goals?.filter(g => g.status === 'active') ?? []
  const done = goals?.filter(g => g.status !== 'active') ?? []

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Goals</h2>

      <NewGoalForm />

      {active.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Active
          </h3>
          <div className="flex flex-col gap-3">
            {active.map(goal => (
              <div
                key={goal.id}
                className="rounded-xl border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {goal.title}
                  </span>
                  <GoalActions goal={goal} />
                </div>
                {goal.description && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {goal.description}
                  </p>
                )}
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Started {format(new Date(goal.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Completed / Abandoned
          </h3>
          <div className="flex flex-col gap-2">
            {done.map(goal => (
              <div
                key={goal.id}
                className="rounded-xl border p-4 opacity-60"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                    {goal.title}
                  </span>
                  <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                    {goal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(!goals || goals.length === 0) && (
        <p className="text-sm mt-8" style={{ color: 'var(--text-muted)' }}>
          No goals yet. Add one above.
        </p>
      )}
    </div>
  )
}
