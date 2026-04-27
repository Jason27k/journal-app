'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Entry } from '@/lib/types'

export function EntryActions({ entry }: { entry: Entry }) {
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
