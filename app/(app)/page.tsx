import { createClient } from '@/lib/supabase/server'
import { EntryCard } from '@/components/entry/entry-card'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .gte('created_at', startOfDay)
    .lt('created_at', endOfDay)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
            {format(today, 'EEEE')}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {format(today, 'MMMM d, yyyy')}
          </p>
        </div>
        <Link
          href="/entry/new"
          className="lg:hidden rounded-xl px-4 py-2 text-sm font-medium"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          + Write
        </Link>
      </div>

      {entries && entries.length > 0 ? (
        <div className="flex flex-col gap-3">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl border border-dashed px-6 py-12 text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Nothing written today yet.
          </p>
          <Link
            href="/entry/new"
            className="text-sm font-medium underline"
            style={{ color: 'var(--text)' }}
          >
            Start writing
          </Link>
        </div>
      )}
    </div>
  )
}
