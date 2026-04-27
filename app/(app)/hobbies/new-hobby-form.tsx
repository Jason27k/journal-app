'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export function NewHobbyForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startedAt, setStartedAt] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('hobbies').insert({
      user_id: user!.id,
      name: name.trim(),
      description: description.trim() || null,
      started_at: startedAt,
    })
    setName('')
    setDescription('')
    setOpen(false)
    setSaving(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed px-4 py-3 text-sm text-left transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        + Add a hobby
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-xl border p-4 flex flex-col gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Hobby name"
        className="w-full text-sm bg-transparent outline-none"
        style={{ color: 'var(--text)' }}
      />
      <input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full text-sm bg-transparent outline-none"
        style={{ color: 'var(--text-muted)' }}
      />
      <div className="flex items-center gap-2">
        <label className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>Started</label>
        <input
          type="date"
          value={startedAt}
          onChange={e => setStartedAt(e.target.value)}
          className="text-sm bg-transparent outline-none"
          style={{ color: 'var(--text)' }}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-3 py-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          Cancel
        </button>
        <button type="submit" disabled={saving || !name.trim()} className="text-sm px-3 py-1.5 rounded-lg" style={{ background: 'var(--text)', color: 'var(--bg)' }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
