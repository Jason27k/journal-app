'use client'

import { format, getDaysInMonth, getDay, startOfMonth } from 'date-fns'
import Link from 'next/link'

interface CalendarGridProps {
  counts: Record<string, number>
  year: number
}

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function intensity(count: number, max: number) {
  if (!count) return 'var(--border)'
  const ratio = count / max
  if (ratio < 0.34) return '#3b82f640'
  if (ratio < 0.67) return '#3b82f680'
  return '#3b82f6'
}

function MonthGrid({
  year,
  month,
  counts,
  max,
}: {
  year: number
  month: number
  counts: Record<string, number>
  max: number
}) {
  const first = startOfMonth(new Date(year, month))
  const totalDays = getDaysInMonth(first)
  const startDow = getDay(first)

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <p className="text-xs font-medium mb-2" style={{ color: 'var(--text)' }}>
        {format(first, 'MMMM')}
      </p>
      <div className="grid grid-cols-7 gap-px">
        {DOW.map((d, i) => (
          <div
            key={i}
            className="text-center pb-1"
            style={{ fontSize: 9, color: 'var(--text-muted)' }}
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="aspect-square" />
          const mm = String(month + 1).padStart(2, '0')
          const dd = String(day).padStart(2, '0')
          const dateStr = `${year}-${mm}-${dd}`
          const count = counts[dateStr] ?? 0
          return (
            <Link
              key={dateStr}
              href={`/search?from=${dateStr}&to=${dateStr}`}
              title={count ? `${count} entr${count !== 1 ? 'ies' : 'y'}` : undefined}
              className="aspect-square rounded-sm flex items-center justify-center transition-opacity hover:opacity-70"
              style={{
                fontSize: 9,
                background: intensity(count, max),
                color: count ? '#fff' : 'var(--text-muted)',
              }}
            >
              {day}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function CalendarGrid({ counts, year }: CalendarGridProps) {
  const max = Math.max(1, ...Object.values(counts))
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
        {Array.from({ length: 12 }, (_, month) => (
          <MonthGrid key={month} year={year} month={month} counts={counts} max={max} />
        ))}
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {total} {total === 1 ? 'entry' : 'entries'} in {year}
      </p>
    </div>
  )
}
