'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, BarChart3, MessageCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function HomeClient() {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero Section */}
      <section className="pt-12 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--gn-gold)]/10 border border-[var(--gn-gold)]/20 px-4 py-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-[var(--gn-gold)]" />
                <span>
                  <span className="text-[var(--gn-gold)] font-semibold">AI-powered</span>
                  <span className="text-slate-300"> retention for G Nail Pines</span>
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50 leading-tight">
                Turn every visit into a{' '}
                <span
                  className="bg-gradient-to-r from-[var(--gn-gold)] via-amber-500 to-[var(--gn-rose)] bg-clip-text text-transparent"
                >
                  regular
                </span>
                .
              </h1>
              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                Track check-ins, capture feedback, catch issues early, and guide happy
                customers to leave 5★ reviews. Your all-in-one retention system—built
                specifically for G Nail Pines.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" asChild className="group">
                <Link href="/check-in">
                  Start a test check-in
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">View analytics demo</Link>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-sm text-slate-500"
            >
              Internal pilot tool for owner & front desk staff
            </motion.p>
          </div>

          {/* Right Column - Dashboard Snapshot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="gn-glass-gold">
              <CardHeader>
                <CardTitle className="text-[var(--gn-gold)]">
                  Today at G Nail Pines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* KPI Tiles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--gn-gold)]/20 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-[var(--gn-gold)]" />
                      </div>
                      <span className="text-sm text-slate-300">Check-ins today</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--gn-gold)]">17</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-sm text-slate-300">Avg rating (30d)</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-400">8.6/10</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--gn-rose)]/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-[var(--gn-rose)]" />
                      </div>
                      <span className="text-sm text-slate-300">Issues to review</span>
                    </div>
                    <span className="text-2xl font-bold text-[var(--gn-rose)]">3</span>
                  </div>
                </div>

                {/* Bottom Link */}
                <div className="pt-2 border-t border-white/10">
                  <Link
                    href="/today"
                    className="text-sm text-[var(--gn-gold)] hover:text-[var(--gn-gold)]/80 transition-colors inline-flex items-center gap-1"
                  >
                    Open live view
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Fits Your Salon Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            How it fits your salon
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100">
            Built for real salon workflows
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gn-gold)]/20 to-amber-500/20 flex items-center justify-center text-2xl border border-[var(--gn-gold)]/30">
                  💅
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Check in once, track everything
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Front desk logs customers in two taps. System automatically sends
                    feedback requests via SMS after checkout and tracks every response.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gn-rose)]/20 to-red-500/20 flex items-center justify-center text-2xl border border-[var(--gn-rose)]/30">
                  ⚠️
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Catch problems before Yelp
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    AI flags low ratings and categorizes issues. Owner sees them in the
                    Issues Inbox with pre-drafted recovery messages to win customers back.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center text-2xl border border-amber-500/30">
                  ⭐️
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Turn fans into 5★ reviews
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    When customers rate 9+ out of 10, they&apos;re guided to leave a Google or
                    Yelp review with one tap. Build your reputation automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
