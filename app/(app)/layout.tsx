import { Sidebar } from '@/components/nav/sidebar'
import { BottomNav } from '@/components/nav/bottom-nav'
import { TimezoneSync } from '@/components/timezone-sync'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <TimezoneSync />
      <Sidebar />
      <main className="lg:pl-56 pb-16 lg:pb-0 min-h-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
