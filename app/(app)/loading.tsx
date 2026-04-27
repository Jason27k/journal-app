export default function Loading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto animate-pulse">
      <div className="h-7 w-36 rounded-lg mb-6" style={{ background: 'var(--border)' }} />
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-20 rounded-xl" style={{ background: 'var(--border)' }} />
        ))}
      </div>
    </div>
  )
}
