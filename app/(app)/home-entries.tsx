'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { EntryCard } from '@/components/entry/entry-card'
import { flattenTags } from '@/lib/types'
import { loadMoreEntries, type DayGroup } from './actions'

interface HomeEntriesProps {
  initialGroups: DayGroup[]
  todayStr: string
  yestStr: string
  initialHasMore: boolean
}

export function HomeEntries({ initialGroups, todayStr, yestStr, initialHasMore }: HomeEntriesProps) {
  const [groups, setGroups] = useState(initialGroups)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [offsetDays, setOffsetDays] = useState(7)
  const [isPending, startTransition] = useTransition()

  function dayLabel(dateStr: string): string {
    if (dateStr === todayStr) return 'Today'
    if (dateStr === yestStr) return 'Yesterday'
    const [dy, dm, dd] = dateStr.split('-').map(Number)
    return format(new Date(dy, dm - 1, dd), 'EEEE, MMMM d')
  }

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreEntries(offsetDays)
      setGroups(prev => [...prev, ...result.groups])
      setHasMore(result.hasMore)
      setOffsetDays(prev => prev + 7)
    })
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        {groups.map(({ dateStr, entries }) => (
          <section key={dateStr}>
            <p
              className="text-xs font-medium uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              {dayLabel(dateStr)}
            </p>
            {entries.length > 0 ? (
              <div className="flex flex-col gap-3">
                {entries.map(entry => (
                  <EntryCard key={entry.id} entry={entry} tags={flattenTags(entry)} />
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl border border-dashed px-6 py-10 text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  Nothing written today yet.
                </p>
                <Link href="/entry/new" className="text-sm font-medium underline" style={{ color: 'var(--text)' }}>
                  Start writing
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isPending}
          className="mt-8 w-full rounded-xl border px-4 py-3 text-sm transition-opacity"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-muted)',
            opacity: isPending ? 0.5 : 1,
          }}
        >
          {isPending ? 'Loading…' : 'Load more'}
        </button>
      )}
    </>
  )
}
