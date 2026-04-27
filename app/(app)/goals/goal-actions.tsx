'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Goal } from '@/lib/types'

export function GoalActions({ goal }: { goal: Goal }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function updateStatus(status: 'completed' | 'abandoned') {
    const supabase = createClient()
    await supabase.from('goals').update({ status }).eq('id', goal.id)
    setOpen(false)
    router.refresh()
  }

  async function deleteGoal() {
    if (!confirm('Delete this goal?')) return
    const supabase = createClient()
    await supabase.from('goals').update({ deleted_at: new Date().toISOString() }).eq('id', goal.id)
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
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border shadow-lg py-1" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <button onClick={() => updateStatus('completed')} className="w-full text-left px-4 py-2 text-sm" style={{ color: 'var(--text)' }}>
              Mark completed
            </button>
            <button onClick={() => updateStatus('abandoned')} className="w-full text-left px-4 py-2 text-sm" style={{ color: 'var(--text)' }}>
              Mark abandoned
            </button>
            <button onClick={deleteGoal} className="w-full text-left px-4 py-2 text-sm text-red-500">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
