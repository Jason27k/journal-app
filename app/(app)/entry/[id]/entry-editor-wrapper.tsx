'use client'

import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { createClient } from '@/lib/supabase/client'
import type { Entry } from '@/lib/types'

export function EntryEditorWrapper({ entry }: { entry: Entry }) {
  async function handleSave(content: string) {
    const supabase = createClient()
    await supabase.from('entries').update({ content }).eq('id', entry.id)
  }

  return <MarkdownEditor initialContent={entry.content} onSave={handleSave} />
}
