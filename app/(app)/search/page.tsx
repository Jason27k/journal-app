import { createClient } from '@/lib/supabase/server'
import { EntryCard } from '@/components/entry/entry-card'
import { format } from 'date-fns'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let entries = null
  if (query) {
    const { data } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .textSearch('search_vector', query, { type: 'websearch' })
      .order('created_at', { ascending: false })
      .limit(50)
    entries = data
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-5" style={{ color: 'var(--text)' }}>Search</h2>

      <form method="GET" action="/search">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search your entries…"
          autoFocus
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none mb-6"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text)',
          }}
        />
      </form>

      {query && entries && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {entries.length} result{entries.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </p>
      )}

      {entries && entries.length > 0 && (
        <div className="flex flex-col gap-3">
          {entries.map(entry => (
            <div key={entry.id}>
              <p className="text-xs mb-1 px-1" style={{ color: 'var(--text-muted)' }}>
                {format(new Date(entry.created_at), 'MMMM d, yyyy')}
              </p>
              <EntryCard entry={entry} />
            </div>
          ))}
        </div>
      )}

      {query && entries?.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No entries found.
        </p>
      )}
    </div>
  )
}
