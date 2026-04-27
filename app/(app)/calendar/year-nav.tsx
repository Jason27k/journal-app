'use client'

import { useRouter } from 'next/navigation'

interface YearNavProps {
  year: number
  maxYear: number
}

export function YearNav({ year, maxYear }: YearNavProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => router.push(`/calendar?year=${year - 1}`)}
        className="rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:opacity-70"
        style={{ color: 'var(--text-muted)', background: 'var(--border)' }}
      >
        ←
      </button>
      <button
        onClick={() => router.push(`/calendar?year=${year + 1}`)}
        disabled={year >= maxYear}
        className="rounded-lg px-2.5 py-1.5 text-sm transition-colors"
        style={{
          color: year >= maxYear ? 'var(--border)' : 'var(--text-muted)',
          background: year >= maxYear ? 'transparent' : 'var(--border)',
          cursor: year >= maxYear ? 'default' : 'pointer',
        }}
      >
        →
      </button>
    </div>
  )
}
