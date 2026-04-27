'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TemplateSelector } from '@/components/entry/template-selector'
import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { TEMPLATES, type TemplateKey } from '@/lib/types'

export default function NewEntryPage() {
  const router = useRouter()
  const [templateKey, setTemplateKey] = useState<TemplateKey | null>(null)
  const [initialContent, setInitialContent] = useState<string | null>(null)
  const entryIdRef = useRef<string | null>(null)
  const [entryId, setEntryId] = useState<string | null>(null)

  function handleTemplateSelect(key: TemplateKey) {
    setTemplateKey(key)
    setInitialContent(TEMPLATES[key].content)
  }

  async function handleSave(content: string) {
    const supabase = createClient()
    if (!entryIdRef.current) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('entries')
        .insert({ user_id: user!.id, content, template: templateKey! })
        .select('id')
        .single()
      if (data) {
        entryIdRef.current = data.id
        setEntryId(data.id)
      }
    } else {
      await supabase.from('entries').update({ content }).eq('id', entryIdRef.current)
    }
  }

  function handleDone() {
    router.push(entryId ? `/entry/${entryId}` : '/')
  }

  if (initialContent === null) {
    return (
      <div className="max-w-lg mx-auto">
        <div
          className="flex items-center gap-3 px-4 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <button onClick={() => router.push('/')} className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ← Cancel
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>New Entry</span>
        </div>
        <TemplateSelector onSelect={handleTemplateSelect} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh lg:h-screen max-w-2xl mx-auto">
      <div
        className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <button onClick={handleDone} className="text-sm" style={{ color: 'var(--text-muted)' }}>
          ← Done
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <MarkdownEditor initialContent={initialContent} onSave={handleSave} autoFocus />
      </div>
    </div>
  )
}
