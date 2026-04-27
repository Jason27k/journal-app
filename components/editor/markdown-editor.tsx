'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  initialContent?: string
  onSave: (content: string) => Promise<void>
  autoFocus?: boolean
}

export function MarkdownEditor({ initialContent = '', onSave, autoFocus }: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [previewing, setPreviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        triggerSave(content)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [content])

  function triggerSave(value: string) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaving(true)
    setSaved(false)
    saveTimerRef.current = setTimeout(async () => {
      await onSave(value)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 600)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    triggerSave(e.target.value)
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-2 border-b text-xs shrink-0"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewing(false)}
            className="px-2 py-1 rounded transition-colors"
            style={{
              background: !previewing ? 'var(--border)' : 'transparent',
              color: !previewing ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => setPreviewing(true)}
            className="px-2 py-1 rounded transition-colors"
            style={{
              background: previewing ? 'var(--border)' : 'transparent',
              color: previewing ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            Preview
          </button>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>
          {saving ? 'Saving…' : saved ? 'Saved' : ''}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {previewing ? (
          <div
            className="prose px-5 py-5 max-w-none min-h-full"
            style={{ color: 'var(--text)' }}
          >
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="Start writing…"
            className="w-full h-full min-h-64 resize-none px-5 py-5 text-sm leading-relaxed outline-none bg-transparent"
            style={{ color: 'var(--text)' }}
            spellCheck
          />
        )}
      </div>
    </div>
  )
}
