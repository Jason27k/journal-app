'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { TagRow } from '@/lib/types'

interface TagInputProps {
  entryId: string
  initialTags: TagRow[]
  allUserTags?: TagRow[]
  onTagsChange?: (tags: TagRow[]) => void
}

export function TagInput({ entryId, initialTags, allUserTags, onTagsChange }: TagInputProps) {
  const [tags, setTags] = useState(initialTags)
  const [knownTags, setKnownTags] = useState(allUserTags ?? [])
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [showInput, setShowInput] = useState(initialTags.length === 0)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showInput) inputRef.current?.focus()
  }, [showInput])

  useEffect(() => {
    if (tags.length === 0) setShowInput(true)
  }, [tags.length])

  useEffect(() => {
    if (allUserTags) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('tags').select('id, name').eq('user_id', user.id).order('name')
        .then(({ data }) => { if (data) setKnownTags(data as TagRow[]) })
    })
  }, [])

  const tagIds = new Set(tags.map(t => t.id))
  const normalised = input.trim().toLowerCase()
  const suggestions = knownTags
    .filter(t => !tagIds.has(t.id))
    .filter(t => !normalised || t.name.includes(normalised))
    .slice(0, 6)
  const canCreate = normalised.length > 0 && !knownTags.find(t => t.name === normalised)

  function getDropdownStyle(): React.CSSProperties {
    const el = triggerRef.current
    if (!el) return {}
    const { bottom, left, width } = el.getBoundingClientRect()
    return { top: bottom + 4, left, minWidth: Math.max(width, 144) }
  }

  async function addTag(name: string) {
    const trimmed = name.trim().toLowerCase()
    if (!trimmed || tags.find(t => t.name === trimmed)) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: tag } = await supabase
      .from('tags')
      .upsert({ user_id: user!.id, name: trimmed }, { onConflict: 'user_id,name' })
      .select('id, name')
      .single()

    if (tag) {
      await supabase.from('entry_tags').upsert({ entry_id: entryId, tag_id: tag.id })
      const newTags = [...tags, tag]
      setTags(newTags)
      onTagsChange?.(newTags)
      if (!knownTags.find(t => t.id === tag.id)) {
        setKnownTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)))
      }
    }
    setInput('')
    setOpen(false)
  }

  async function removeTag(tagId: string) {
    const supabase = createClient()
    await supabase.from('entry_tags').delete().eq('entry_id', entryId).eq('tag_id', tagId)
    const newTags = tags.filter(t => t.id !== tagId)
    setTags(newTags)
    onTagsChange?.(newTags)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions.length > 0 && !canCreate) addTag(suggestions[0].name)
      else if (normalised) addTag(normalised)
    }
    if (e.key === 'Escape') setOpen(false)
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1].id)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
      {tags.map(tag => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
          style={{ background: 'var(--border)', color: 'var(--text)' }}
        >
          <Link href={`/search?tag=${encodeURIComponent(tag.name)}`} className="hover:underline">
            {tag.name}
          </Link>
          <button
            onClick={() => removeTag(tag.id)}
            className="text-base leading-none hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </span>
      ))}

      <div ref={triggerRef} className="relative">
        {tags.length > 0 && !showInput ? (
          <button
            onClick={() => setShowInput(true)}
            className="rounded-full border px-3 py-1 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            + Add tag
          </button>
        ) : (
          <input
            ref={inputRef}
            value={input}
            onChange={e => { setInput(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => {
              setOpen(false)
              if (!input) setShowInput(false)
            }, 150)}
            onKeyDown={handleKeyDown}
            placeholder="Add tags…"
            className="text-sm bg-transparent outline-none"
            style={{ width: input ? `${input.length + 2}ch` : '8ch', color: 'var(--text-muted)' }}
          />
        )}
        {open && (suggestions.length > 0 || canCreate) && (
          <div
            className="fixed z-[9999] rounded-xl border shadow-lg py-1"
            style={{ ...getDropdownStyle(), background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            {suggestions.map(tag => (
              <button
                key={tag.id}
                onMouseDown={() => addTag(tag.name)}
                className="w-full text-left px-3 py-2 text-sm hover:opacity-70"
                style={{ color: 'var(--text)' }}
              >
                {tag.name}
              </button>
            ))}
            {canCreate && (
              <button
                onMouseDown={() => addTag(normalised)}
                className="w-full text-left px-3 py-2 text-sm hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                Create &ldquo;{normalised}&rdquo;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
