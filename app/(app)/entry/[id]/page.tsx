import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { EntryActions } from './entry-actions'
import { EntryEditorWrapper } from './entry-editor-wrapper'
import { TagSheet } from '@/components/entry/tag-sheet'
import type { TagRow } from '@/lib/types'

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [entryResult, entryTagsResult, allTagsResult] = await Promise.all([
    supabase
      .from('entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', user!.id)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('entry_tags')
      .select('tags(id, name)')
      .eq('entry_id', id),
    supabase
      .from('tags')
      .select('id, name')
      .eq('user_id', user!.id)
      .order('name'),
  ])

  if (!entryResult.data) notFound()
  const entry = entryResult.data

  const entryTags = ((entryTagsResult.data ?? []) as { tags: TagRow | null }[])
    .flatMap(et => (et.tags ? [et.tags] : []))

  const allTags = (allTagsResult.data ?? []) as TagRow[]

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-screen max-w-2xl mx-auto">
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <a href="/" className="text-sm" style={{ color: 'var(--text-muted)' }}>
          ← Back
        </a>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {format(new Date(entry.created_at), 'MMM d, yyyy · h:mm a')}
        </span>
        <div className="flex items-center gap-2">
          <TagSheet entryId={id} initialTags={entryTags} allUserTags={allTags} />
          <EntryActions entry={entry} tags={entryTags} />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <EntryEditorWrapper entry={entry} />
      </div>
    </div>
  )
}
