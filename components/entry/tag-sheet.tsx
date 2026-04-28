'use client'

import { useState } from 'react'
import { TagInput } from './tag-input'
import type { TagRow } from '@/lib/types'

interface TagSheetProps {
  entryId: string | null
  initialTags: TagRow[]
  allUserTags?: TagRow[]
}

export function TagSheet({ entryId, initialTags, allUserTags }: TagSheetProps) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(initialTags.length)

  return (
    <>
      <button
        onClick={() => entryId && setOpen(true)}
        title={!entryId ? 'Start writing to add tags' : undefined}
        aria-disabled={!entryId}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors"
        style={{
          opacity: entryId ? 1 : 0.35,
          background: count > 0 ? 'var(--border)' : 'transparent',
          color: count > 0 ? 'var(--text)' : 'var(--text-muted)',
        }}
      >
        <TagIcon />
        {count > 0 && <span>{count}</span>}
      </button>

      {open && entryId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl"
            style={{ background: 'var(--bg-card)' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Tags</span>
              <button
                onClick={() => setOpen(false)}
                className="text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-56">
              <TagInput
                entryId={entryId}
                initialTags={initialTags}
                allUserTags={allUserTags}
                onTagsChange={tags => setCount(tags.length)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}
