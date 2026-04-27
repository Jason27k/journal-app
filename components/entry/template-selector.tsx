'use client'

import { TEMPLATES, type TemplateKey } from '@/lib/types'

interface TemplateSelectorProps {
  onSelect: (key: TemplateKey, content: string) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="flex flex-col gap-2 px-5 py-8 max-w-sm mx-auto w-full">
      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
        Choose a template
      </p>
      {(Object.entries(TEMPLATES) as [TemplateKey, typeof TEMPLATES[TemplateKey]][]).map(
        ([key, { label }]) => (
          <button
            key={key}
            onClick={() => onSelect(key, TEMPLATES[key].content)}
            className="w-full text-left rounded-xl px-4 py-3 text-sm border transition-colors"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
            }}
          >
            {label}
          </button>
        )
      )}
    </div>
  )
}
