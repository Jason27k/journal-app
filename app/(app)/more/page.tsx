'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/on-this-day', label: 'On This Day', description: 'What you wrote on this date in past years' },
  { href: '/calendar', label: 'Calendar', description: 'Entry heatmap for the year' },
  { href: '/hobbies', label: 'Hobbies', description: 'Track your interests over time' },
]

export default function MorePage() {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>More</h2>

      <div className="flex flex-col gap-2 mb-6">
        {navItems.map(({ href, label, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border px-4 py-4 flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2 mb-10">
        <a
          href="/export"
          download
          className="rounded-xl border px-4 py-4 flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Export</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Download all entries as a Markdown file</p>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>↓</span>
        </a>
      </div>

      <button
        onClick={signOut}
        className="text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        Sign out
      </button>
    </div>
  )
}
