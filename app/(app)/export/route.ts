import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { NextResponse, type NextRequest } from 'next/server'
import type { EntryWithTags } from '@/lib/types'
import { flattenTags } from '@/lib/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const textQuery = searchParams.get('q')?.trim() ?? ''
  const tagFilter = searchParams.get('tag')?.trim() ?? ''
  const fromDate = searchParams.get('from')?.trim() ?? ''
  const toDate = searchParams.get('to')?.trim() ?? ''

  let entries: EntryWithTags[] = []

  if (tagFilter) {
    const { data: tagRow } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', tagFilter)
      .single()

    if (tagRow) {
      const { data: entryTagRows } = await supabase
        .from('entry_tags')
        .select('entry_id')
        .eq('tag_id', tagRow.id)

      const entryIds = (entryTagRows ?? []).map(et => et.entry_id)

      if (entryIds.length > 0) {
        let dbQuery = supabase
          .from('entries')
          .select('*, entry_tags(tags(id, name))')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .in('id', entryIds)
          .order('created_at', { ascending: true })

        if (textQuery) dbQuery = dbQuery.textSearch('search_vector', textQuery, { type: 'websearch' })
        if (fromDate) dbQuery = dbQuery.gte('created_at', `${fromDate}T00:00:00`)
        if (toDate) dbQuery = dbQuery.lte('created_at', `${toDate}T23:59:59`)

        const { data } = await dbQuery
        entries = (data ?? []) as EntryWithTags[]
      }
    }
  } else {
    let dbQuery = supabase
      .from('entries')
      .select('*, entry_tags(tags(id, name))')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (textQuery) dbQuery = dbQuery.textSearch('search_vector', textQuery, { type: 'websearch' })
    if (fromDate) dbQuery = dbQuery.gte('created_at', `${fromDate}T00:00:00`)
    if (toDate) dbQuery = dbQuery.lte('created_at', `${toDate}T23:59:59`)

    const { data } = await dbQuery
    entries = (data ?? []) as EntryWithTags[]
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const lines: string[] = [`# Journal`, ``, `*Exported ${today}*`, ``]

  for (const entry of entries) {
    const date = format(new Date(entry.created_at), 'MMMM d, yyyy')
    const time = format(new Date(entry.created_at), 'h:mm a')
    const tags = flattenTags(entry).map(t => t.name)

    lines.push('---', '')
    lines.push(`## ${date} — ${time}`, '')
    if (tags.length > 0) lines.push(`**Tags:** ${tags.join(', ')}`, '')
    lines.push(entry.content ?? '', '')
  }

  const markdown = lines.join('\n')
  const filename = fromDate || toDate
    ? `journal-${fromDate || 'start'}-to-${toDate || 'now'}.md`
    : `journal-${today}.md`

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
