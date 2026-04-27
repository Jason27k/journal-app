import { createClient } from '@/lib/supabase/server'
import { EntryCard } from '@/components/entry/entry-card'
import { format } from 'date-fns'
import type { EntryWithTags } from '@/lib/types'
import { flattenTags } from '@/lib/types'
import Link from 'next/link'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tag?: string; from?: string; to?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, tag, from, to } = await searchParams
  const textQuery = q?.trim() ?? ''
  const tagFilter = tag?.trim() ?? ''
  const fromDate = from?.trim() ?? ''
  const toDate = to?.trim() ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let entries: EntryWithTags[] | null = null
  const hasFilter = textQuery || tagFilter || fromDate || toDate

  if (hasFilter) {
    if (tagFilter) {
      const { data: tagRow } = await supabase
        .from('tags')
        .select('id')
        .eq('user_id', user!.id)
        .eq('name', tagFilter)
        .single()

      if (tagRow) {
        const { data: entryTagRows } = await supabase
          .from('entry_tags')
          .select('entry_id')
          .eq('tag_id', tagRow.id)

        const entryIds = (entryTagRows ?? []).map(et => et.entry_id)

        if (entryIds.length > 0) {
          let dbQuery = supabase
            .from('entries')
            .select('*, entry_tags(tags(id, name))')
            .eq('user_id', user!.id)
            .is('deleted_at', null)
            .in('id', entryIds)
            .order('created_at', { ascending: false })
            .limit(50)

          if (textQuery) dbQuery = dbQuery.textSearch('search_vector', textQuery, { type: 'websearch' })
          if (fromDate) dbQuery = dbQuery.gte('created_at', `${fromDate}T00:00:00`)
          if (toDate) dbQuery = dbQuery.lte('created_at', `${toDate}T23:59:59`)

          const { data } = await dbQuery
          entries = (data ?? []) as EntryWithTags[]
        } else {
          entries = []
        }
      } else {
        entries = []
      }
    } else {
      let dbQuery = supabase
        .from('entries')
        .select('*, entry_tags(tags(id, name))')
        .eq('user_id', user!.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (textQuery) dbQuery = dbQuery.textSearch('search_vector', textQuery, { type: 'websearch' })
      if (fromDate) dbQuery = dbQuery.gte('created_at', `${fromDate}T00:00:00`)
      if (toDate) dbQuery = dbQuery.lte('created_at', `${toDate}T23:59:59`)

      const { data } = await dbQuery
      entries = (data ?? []) as EntryWithTags[]
    }
  }

  function buildHref(overrides: Record<string, string | undefined>) {
    const params: Record<string, string> = {}
    if (textQuery) params.q = textQuery
    if (tagFilter) params.tag = tagFilter
    if (fromDate) params.from = fromDate
    if (toDate) params.to = toDate
    Object.assign(params, overrides)
    Object.keys(params).forEach(k => params[k] === undefined && delete params[k])
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return qs ? `/search?${qs}` : '/search'
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-5" style={{ color: 'var(--text)' }}>Search</h2>

      <form method="GET" action="/search">
        {tagFilter && <input type="hidden" name="tag" value={tagFilter} />}
        <input
          name="q"
          defaultValue={textQuery}
          placeholder="Search your entries…"
          autoFocus
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none mb-3"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
        />
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>From</label>
          <input
            type="date"
            name="from"
            defaultValue={fromDate}
            className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
          />
          <label className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>To</label>
          <input
            type="date"
            name="to"
            defaultValue={toDate}
            className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm"
            style={{ background: 'var(--border)', color: 'var(--text)' }}
          >
            Go
          </button>
        </div>
      </form>

      {(tagFilter || fromDate || toDate) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {tagFilter && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
              style={{ background: 'var(--border)', color: 'var(--text)' }}
            >
              tag: {tagFilter}
              <Link
                href={buildHref({ tag: undefined })}
                className="hover:opacity-60 leading-none"
                style={{ color: 'var(--text-muted)' }}
              >×</Link>
            </span>
          )}
          {fromDate && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
              style={{ background: 'var(--border)', color: 'var(--text)' }}
            >
              from: {fromDate}
              <Link
                href={buildHref({ from: undefined })}
                className="hover:opacity-60 leading-none"
                style={{ color: 'var(--text-muted)' }}
              >×</Link>
            </span>
          )}
          {toDate && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
              style={{ background: 'var(--border)', color: 'var(--text)' }}
            >
              to: {toDate}
              <Link
                href={buildHref({ to: undefined })}
                className="hover:opacity-60 leading-none"
                style={{ color: 'var(--text-muted)' }}
              >×</Link>
            </span>
          )}
        </div>
      )}

      {entries !== null && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            {textQuery ? ` for "${textQuery}"` : ''}
          </p>
          {entries.length > 0 && (
            <a
              href={`/export?${new URLSearchParams(
                Object.fromEntries(
                  [['q', textQuery], ['tag', tagFilter], ['from', fromDate], ['to', toDate]]
                    .filter(([, v]) => v)
                ) as Record<string, string>
              ).toString()}`}
              download
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Export
            </a>
          )}
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="flex flex-col gap-3">
          {entries.map(entry => (
            <div key={entry.id}>
              <p className="text-xs mb-1 px-1" style={{ color: 'var(--text-muted)' }}>
                {format(new Date(entry.created_at), 'MMMM d, yyyy')}
              </p>
              <EntryCard entry={entry} tags={flattenTags(entry)} />
            </div>
          ))}
        </div>
      )}

      {entries !== null && entries.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No entries found.</p>
      )}
    </div>
  )
}
