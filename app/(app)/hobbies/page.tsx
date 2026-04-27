import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { NewHobbyForm } from './new-hobby-form'
import { HobbyActions } from './hobby-actions'

export default async function HobbiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: hobbies } = await supabase
    .from('hobbies')
    .select('*')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .order('started_at', { ascending: false })

  const active = hobbies?.filter(h => !h.ended_at) ?? []
  const past = hobbies?.filter(h => h.ended_at) ?? []

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>Hobbies</h2>

      <NewHobbyForm />

      {active.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Current
          </h3>
          <div className="flex flex-col gap-3">
            {active.map(hobby => (
              <div
                key={hobby.id}
                className="rounded-xl border p-4"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {hobby.name}
                  </span>
                  <HobbyActions hobby={hobby} />
                </div>
                {hobby.description && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {hobby.description}
                  </p>
                )}
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Since {format(new Date(hobby.started_at), 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Past interests
          </h3>
          <div className="flex flex-col gap-2">
            {past.map(hobby => (
              <div
                key={hobby.id}
                className="rounded-xl border p-4 opacity-60"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text)' }}>{hobby.name}</span>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {format(new Date(hobby.started_at), 'MMM yyyy')} – {format(new Date(hobby.ended_at!), 'MMM yyyy')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(!hobbies || hobbies.length === 0) && (
        <p className="text-sm mt-8" style={{ color: 'var(--text-muted)' }}>
          No hobbies tracked yet. Add one above.
        </p>
      )}
    </div>
  )
}
