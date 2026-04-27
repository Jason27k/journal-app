'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import type { Hobby } from '@/lib/types'

export function HobbyActions({ hobby }: { hobby: Hobby }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function markEnded() {
    const supabase = createClient()
    await supabase
      .from('hobbies')
      .update({ ended_at: format(new Date(), 'yyyy-MM-dd') })
      .eq('id', hobby.id)
    setOpen(false)
    router.refresh()
  }

  async function deleteHobby() {
    if (!confirm('Delete this hobby?')) return
    const supabase = createClient()
    await supabase.from('hobbies').update({ deleted_at: new Date().toISOString() }).eq('id', hobby.id)
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen(o => !o)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--text-muted)' }}>
        •••
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border shadow-lg py-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <button onClick={markEnded} className="w-full text-left px-4 py-2 text-sm" style={{ color: 'var(--text)' }}>
              Mark as ended
            </button>
            <button onClick={deleteHobby} className="w-full text-left px-4 py-2 text-sm text-red-500">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
