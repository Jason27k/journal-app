'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Typography from '@tiptap/extension-typography'
import Youtube from '@tiptap/extension-youtube'
import Twitch from '@tiptap/extension-twitch'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import 'katex/dist/katex.min.css'

interface MarkdownEditorProps {
  initialContent?: string
  onSave: (content: string) => Promise<void>
  autoFocus?: boolean
}

function Sep() {
  return <div className="w-px h-4 shrink-0 mx-0.5" style={{ background: 'var(--border)' }} />
}

function Btn({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className="flex items-center justify-center w-7 h-7 rounded text-xs transition-colors"
      style={{
        color: active ? 'var(--text)' : 'var(--text-muted)',
        background: active ? 'color-mix(in srgb, var(--text) 10%, transparent)' : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const e = editor
  return (
    <div
      className="flex items-center gap-0.5 px-2 py-1 shrink-0 border-b flex-wrap"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Text formatting */}
      <Btn title="Bold (⌘B)" active={e.isActive('bold')} onClick={() => e.chain().focus().toggleBold().run()}>
        <span style={{ fontWeight: 700 }}>B</span>
      </Btn>
      <Btn title="Italic (⌘I)" active={e.isActive('italic')} onClick={() => e.chain().focus().toggleItalic().run()}>
        <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>I</span>
      </Btn>
      <Btn title="Underline (⌘U)" active={e.isActive('underline')} onClick={() => e.chain().focus().toggleUnderline().run()}>
        <span style={{ textDecoration: 'underline' }}>U</span>
      </Btn>
      <Btn title="Strikethrough" active={e.isActive('strike')} onClick={() => e.chain().focus().toggleStrike().run()}>
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </Btn>
      <Btn title="Highlight" active={e.isActive('highlight')} onClick={() => e.chain().focus().toggleHighlight().run()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="5" width="12" height="5" rx="1" fill="currentColor" opacity="0.5" />
          <rect x="3" y="1" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <line x1="1" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </Btn>

      <Sep />

      {/* Headings */}
      <Btn title="Heading 1" active={e.isActive('heading', { level: 1 })} onClick={() => e.chain().focus().toggleHeading({ level: 1 }).run()}>
        <span style={{ fontWeight: 600, fontSize: '11px', letterSpacing: '-0.03em' }}>H1</span>
      </Btn>
      <Btn title="Heading 2" active={e.isActive('heading', { level: 2 })} onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()}>
        <span style={{ fontWeight: 600, fontSize: '11px', letterSpacing: '-0.03em' }}>H2</span>
      </Btn>
      <Btn title="Heading 3" active={e.isActive('heading', { level: 3 })} onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()}>
        <span style={{ fontWeight: 600, fontSize: '11px', letterSpacing: '-0.03em' }}>H3</span>
      </Btn>

      <Sep />

      {/* Lists */}
      <Btn title="Bullet list" active={e.isActive('bulletList')} onClick={() => e.chain().focus().toggleBulletList().run()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="2" cy="3.5" r="1.2" />
          <circle cx="2" cy="7" r="1.2" />
          <circle cx="2" cy="10.5" r="1.2" />
          <rect x="5" y="2.8" width="8" height="1.4" rx="0.7" />
          <rect x="5" y="6.3" width="8" height="1.4" rx="0.7" />
          <rect x="5" y="9.8" width="8" height="1.4" rx="0.7" />
        </svg>
      </Btn>
      <Btn title="Numbered list" active={e.isActive('orderedList')} onClick={() => e.chain().focus().toggleOrderedList().run()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <text x="0.5" y="5" fontSize="4.5" fontWeight="600">1.</text>
          <text x="0.5" y="8.5" fontSize="4.5" fontWeight="600">2.</text>
          <text x="0.5" y="12" fontSize="4.5" fontWeight="600">3.</text>
          <rect x="6" y="2.8" width="7" height="1.4" rx="0.7" />
          <rect x="6" y="6.3" width="7" height="1.4" rx="0.7" />
          <rect x="6" y="9.8" width="7" height="1.4" rx="0.7" />
        </svg>
      </Btn>
      <Btn title="Task list" active={e.isActive('taskList')} onClick={() => e.chain().focus().toggleTaskList().run()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="1" y="2" width="4" height="4" rx="0.8" />
          <polyline points="1.8,4 2.8,5.2 4.8,2.8" strokeWidth="1.1" />
          <rect x="1" y="8" width="4" height="4" rx="0.8" />
          <rect x="7" y="3.3" width="6" height="1.4" rx="0.7" fill="currentColor" stroke="none" />
          <rect x="7" y="9.3" width="6" height="1.4" rx="0.7" fill="currentColor" stroke="none" />
        </svg>
      </Btn>

      <Sep />

      {/* Blocks */}
      <Btn title="Blockquote" active={e.isActive('blockquote')} onClick={() => e.chain().focus().toggleBlockquote().run()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="1" y="2" width="2" height="10" rx="1" />
          <rect x="5" y="3.5" width="8" height="1.3" rx="0.6" opacity="0.8" />
          <rect x="5" y="6.4" width="6" height="1.3" rx="0.6" opacity="0.8" />
          <rect x="5" y="9.2" width="7" height="1.3" rx="0.6" opacity="0.8" />
        </svg>
      </Btn>
      <Btn title="Code block" active={e.isActive('codeBlock')} onClick={() => e.chain().focus().toggleCodeBlock().run()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4,3 1,7 4,11" />
          <polyline points="10,3 13,7 10,11" />
        </svg>
      </Btn>

      <Sep />

      {/* Table */}
      <Btn title="Insert table" onClick={() => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="1" y="1" width="12" height="12" rx="1.5" />
          <line x1="1" y1="4.5" x2="13" y2="4.5" />
          <line x1="1" y1="8.5" x2="13" y2="8.5" />
          <line x1="5" y1="4.5" x2="5" y2="13" />
          <line x1="9" y1="4.5" x2="9" y2="13" />
        </svg>
      </Btn>
    </div>
  )
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
      StarterKit.configure({ link: false, underline: false }),
      Markdown.configure({ transformPastedText: true }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Typography,
      Youtube.configure({ nocookie: true }),
      Twitch.configure({ parent: typeof window !== 'undefined' ? window.location.hostname : 'localhost' }),
      Mathematics,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
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
      {editor && <Toolbar editor={editor} />}
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
