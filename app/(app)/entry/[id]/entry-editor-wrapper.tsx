'use client'

import { useRef, useState } from 'react'
import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { createClient } from '@/lib/supabase/client'
import type { Entry } from '@/lib/types'

type Conflict = {
  serverContent: string
  serverUpdatedAt: string
  myContent: string
}

export function EntryEditorWrapper({ entry }: { entry: Entry }) {
  const knownUpdatedAt = useRef(entry.updated_at)
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const [editorKey, setEditorKey] = useState(0)
  const [editorInitialContent, setEditorInitialContent] = useState(entry.content)

  async function handleSave(content: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('entries')
      .update({ content })
      .eq('id', entry.id)
      .eq('updated_at', knownUpdatedAt.current)
      .select('updated_at')

    if (!data || data.length === 0) {
      const { data: server } = await supabase
        .from('entries')
        .select('content, updated_at')
        .eq('id', entry.id)
        .single()
      if (server) {
        setConflict({ serverContent: server.content, serverUpdatedAt: server.updated_at, myContent: content })
      }
    } else {
      knownUpdatedAt.current = data[0].updated_at
    }
  }

  async function keepMine() {
    if (!conflict) return
    const supabase = createClient()
    const { data } = await supabase
      .from('entries')
      .update({ content: conflict.myContent })
      .eq('id', entry.id)
      .eq('updated_at', conflict.serverUpdatedAt)
      .select('updated_at')

    if (data && data.length > 0) {
      knownUpdatedAt.current = data[0].updated_at
      setConflict(null)
    }
  }

  function useTheirs() {
    if (!conflict) return
    knownUpdatedAt.current = conflict.serverUpdatedAt
    setEditorInitialContent(conflict.serverContent)
    setEditorKey(k => k + 1)
    setConflict(null)
  }

  return (
    <div className="flex flex-col h-full">
      {conflict && (
        <div
          className="flex items-center justify-between px-4 py-2 text-xs shrink-0 border-b"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <span>The saved version differs from what you're editing.</span>
          <div className="flex gap-2">
            <button
              onClick={keepMine}
              className="px-2 py-1 rounded font-medium"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              Keep mine
            </button>
            <button
              onClick={useTheirs}
              className="px-2 py-1 rounded font-medium"
              style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              Load saved
            </button>
          </div>
        </div>
      )}
      <MarkdownEditor
        key={editorKey}
        initialContent={editorInitialContent}
        onSave={handleSave}
      />
    </div>
  )
}
