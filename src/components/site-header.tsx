'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LogOut, Shield, User } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/today', label: 'Today' },
  { href: '/dashboard', label: 'Analytics' },
  { href: '/check-in', label: 'Check-in' },
  { href: '/issues', label: 'Issues' },
  { href: '/review-insights', label: 'Review Insights' },
  { href: '/settings', label: 'Settings', ownerOnly: true },
]

type SessionData = {
  authenticated: boolean
  role: 'owner' | 'staff' | null
}

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [session, setSession] = useState<SessionData>({ authenticated: false, role: null })
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    // Fetch session on mount
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setSession(data))
      .catch(() => setSession({ authenticated: false, role: null }))
  }, [pathname])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gn-gold)] to-amber-500 shadow-lg shadow-[var(--gn-gold)]/30 transition-all group-hover:shadow-xl group-hover:shadow-[var(--gn-gold)]/40 group-hover:scale-105">
            <span className="text-sm font-bold text-[var(--gn-ink)] tracking-tight">GP</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gn-gold)]">
              G Nail Pines
            </span>
            <span className="text-[10px] text-slate-400 -mt-0.5">Growth Console</span>
          </div>
        </Link>

        {/* Center: Navigation (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            // Hide owner-only links from staff
            if ('ownerOnly' in link && link.ownerOnly && session.role !== 'owner') {
              return null
            }
            
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium transition-colors"
              >
                <span
                  className={
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }
                >
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--gn-gold)]"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {session.authenticated && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                {session.role === 'owner' ? (
                  <Shield className="w-3.5 h-3.5 text-gn-gold" />
                ) : (
                  <User className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span className="text-xs text-slate-300 capitalize">
                  {session.role}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-slate-400 hover:text-slate-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Logout</span>
              </Button>
            </div>
          )}
          {!session.authenticated && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/login/owner">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
