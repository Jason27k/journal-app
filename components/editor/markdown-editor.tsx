'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'

interface MarkdownEditorProps {
  initialContent?: string
  onSave: (content: string) => Promise<void>
  autoFocus?: boolean
}

export function MarkdownEditor({ initialContent = '', onSave, autoFocus }: MarkdownEditorProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function triggerSave(content: string) {
    clearTimeout(saveTimer.current)
    setSaving(true)
    setSaved(false)
    saveTimer.current = setTimeout(async () => {
      await onSave(content)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 600)
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: initialContent,
    autofocus: autoFocus ? 'end' : false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose outline-none px-5 py-5 min-h-full',
        style: 'color: var(--text);',
      },
    },
    onUpdate({ editor }) {
      triggerSave((editor.storage as any).markdown.getMarkdown())
    },
  })

  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        triggerSave((editor.storage as any).markdown.getMarkdown())
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor])

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} style={{ height: '100%' }} />
      </div>
      {(saving || saved) && (
        <span
          className="absolute bottom-3 right-4 text-xs pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        >
          {saving ? 'Saving…' : 'Saved'}
        </span>
      )}
    </div>
  )
}
