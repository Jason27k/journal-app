'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import type { Entry, TagRow } from '@/lib/types'

export function EntryActions({ entry, tags }: { entry: Entry; tags: TagRow[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function togglePin() {
    const supabase = createClient()
    await supabase.from('entries').update({ pinned: !entry.pinned }).eq('id', entry.id)
    router.refresh()
    setOpen(false)
  }

  async function deleteEntry() {
    if (!confirm('Delete this entry? It can be recovered from Supabase if needed.')) return
    const supabase = createClient()
    await supabase.from('entries').update({ deleted_at: new Date().toISOString() }).eq('id', entry.id)
    router.push('/')
  }

  function exportEntry() {
    const date = format(new Date(entry.created_at), 'MMMM d, yyyy · h:mm a')
    const lines: string[] = [`# Journal Entry`, ``, `*${date}*`, ``]
    if (tags.length > 0) lines.push(`**Tags:** ${tags.map(t => t.name).join(', ')}`, '')
    lines.push(entry.content ?? '')
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `entry-${format(new Date(entry.created_at), 'yyyy-MM-dd-HHmm')}.md`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-sm px-2 py-1 rounded"
        style={{ color: 'var(--text-muted)' }}
      >
        •••
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 z-20 mt-1 w-40 rounded-xl border shadow-lg py-1"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <button
              onClick={togglePin}
              className="w-full text-left px-4 py-2 text-sm"
              style={{ color: 'var(--text)' }}
            >
              {entry.pinned ? 'Unpin' : 'Pin entry'}
            </button>
            <button
              onClick={exportEntry}
              className="w-full text-left px-4 py-2 text-sm"
              style={{ color: 'var(--text)' }}
            >
              Export
            </button>
            <button
              onClick={deleteEntry}
              className="w-full text-left px-4 py-2 text-sm text-red-500"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
