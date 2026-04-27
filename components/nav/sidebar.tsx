'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/habits', label: 'Habits' },
  { href: '/goals', label: 'Goals' },
  { href: '/on-this-day', label: 'On This Day' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/hobbies', label: 'Hobbies' },
  { href: '/stats', label: 'Stats' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="hidden lg:flex lg:w-56 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex flex-col flex-1 px-4 py-6 gap-1">
        <h1 className="text-lg font-semibold px-3 mb-4" style={{ color: 'var(--text)' }}>
          Journal
        </h1>

        <Link
          href="/entry/new"
          className="flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium mb-4 transition-colors"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          + New Entry
        </Link>

        {navItems.map(({ href, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm transition-colors"
              style={{
                background: active ? 'var(--border)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text-muted)',
              }}
            >
              {label}
            </Link>
          )
        })}

        <div className="mt-auto flex flex-col gap-1">
          <a
            href="/export"
            download
            className="rounded-lg px-3 py-2 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Export
          </a>
          <button
            onClick={signOut}
            className="w-full text-left rounded-lg px-3 py-2 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
