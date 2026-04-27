'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function NewHabitForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('habits').insert({ user_id: user!.id, title: title.trim(), frequency })
    setTitle('')
    setFrequency('daily')
    setOpen(false)
    setSaving(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed px-4 py-3 text-sm text-left"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        + Add a habit
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Habit name"
        className="w-full text-sm bg-transparent outline-none"
        style={{ color: 'var(--text)' }}
      />
      <div className="flex gap-2">
        {(['daily', 'weekly'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFrequency(f)}
            className="text-xs px-3 py-1.5 rounded-lg capitalize"
            style={{
              background: frequency === f ? 'var(--text)' : 'var(--border)',
              color: frequency === f ? 'var(--bg)' : 'var(--text-muted)',
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          Cancel
        </button>
        <button type="submit" disabled={saving || !title.trim()} className="text-sm px-3 py-1.5 rounded-lg" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
