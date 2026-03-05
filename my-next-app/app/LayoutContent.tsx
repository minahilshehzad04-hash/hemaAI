'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/General/Navbar'
import Footer from '@/components/General/Footer'

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()?.toLowerCase()

  const publicRoutes = ['/', '/about', '/contact', '/doctors', '/patients', '/donors']
  const authRoutes = ['/login', '/signup', '/forget-password', '/reset', '/callback', '/role-select']

  const isPublic = publicRoutes.includes(pathname)
  const isAuth = authRoutes.includes(pathname)

  return (
    <div className="min-h-screen flex flex-col font-[var(--font-body)] bg-[var(--color-background)] text-[var(--color-foreground)]">
      {/* ✅ Show Navbar on public and auth pages */}
      {(isPublic || isAuth) && <Navbar />}

      <main className="flex-1">{children}</main>

      {/* ✅ Show Footer only on public pages */}
      {isPublic && <Footer />}
    </div>
  )
}
