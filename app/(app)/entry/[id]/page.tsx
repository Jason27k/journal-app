import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { EntryActions } from './entry-actions'
import { EntryEditorWrapper } from './entry-editor-wrapper'

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entry } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .is('deleted_at', null)
    .single()

  if (!entry) notFound()

  return (
    <div className="flex flex-col h-[100dvh] lg:h-screen max-w-2xl mx-auto">
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
        <EntryActions entry={entry} />
      </div>
      <div className="flex-1 overflow-hidden">
        <EntryEditorWrapper entry={entry} />
      </div>
    </div>
  )
}
