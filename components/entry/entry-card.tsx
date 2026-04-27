import Link from 'next/link'
import { format } from 'date-fns'
import type { Entry } from '@/lib/types'

interface EntryCardProps {
  entry: Entry
}

export function EntryCard({ entry }: EntryCardProps) {
  const preview = entry.content.replace(/#{1,6}\s/g, '').slice(0, 160).trim()
  const firstLine = entry.content.split('\n').find(l => l.trim())?.replace(/^#{1,6}\s*/, '') ?? ''

  return (
    <Link
      href={`/entry/${entry.id}`}
      className="block rounded-xl border p-4 transition-colors hover:opacity-80"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-medium leading-snug line-clamp-1" style={{ color: 'var(--text)' }}>
          {firstLine || 'Untitled'}
        </span>
        {entry.pinned && (
          <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>📌</span>
        )}
      </div>
      <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>
        {preview || 'Empty entry'}
      </p>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {format(new Date(entry.created_at), 'h:mm a')}
      </span>
    </Link>
  )
}
