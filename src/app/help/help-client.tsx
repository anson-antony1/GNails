'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  BookOpen,
  MessageSquare,
  AlertCircle,
  Star,
  UserPlus,
  Settings,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react'

export function HelpClient() {
  return (
    <div className="space-y-6">
      {/* Quick Start Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--gn-gold)]" />
              Quick Start: How G Nail Growth Works
            </CardTitle>
            <CardDescription>
              The complete customer feedback and retention loop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--gn-gold)]/10 flex items-center justify-center text-[var(--gn-gold)] font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Customer Check-in</h3>
                  <p className="text-sm text-slate-400">
                    Front desk staff logs customer visit (phone, service, price). Takes 20 seconds.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--gn-gold)]/10 flex items-center justify-center text-[var(--gn-gold)] font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Automatic Feedback Request</h3>
                  <p className="text-sm text-slate-400">
                    30 minutes after checkout, system sends SMS asking customer to rate 1-10.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--gn-gold)]/10 flex items-center justify-center text-[var(--gn-gold)] font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Smart Response</h3>
                  <p className="text-sm text-slate-400">
                    <span className="text-red-400">Low ratings (1-6)</span> create Issues for you to handle.{' '}
                    <span className="text-amber-400">High ratings (9-10)</span> get asked for public reviews.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--gn-gold)]/10 flex items-center justify-center text-[var(--gn-gold)] font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">You Take Action</h3>
                  <p className="text-sm text-slate-400">
                    Call unhappy customers to resolve issues. Celebrate happy customers leaving 5★ reviews.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Automatic Winbacks</h3>
                  <p className="text-sm text-slate-400">
                    Customers inactive 60+ days get friendly reminder messages. 15-25% come back.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Concepts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Issues System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                Issues Inbox
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>
                <span className="text-slate-400">What it does:</span> Catches problems before they become public reviews
              </p>
              <p>
                <span className="text-slate-400">When it triggers:</span> Any rating 6/10 or below
              </p>
              <p>
                <span className="text-slate-400">What you do:</span> Call customer within 2-4 hours, apologize, offer remedy
              </p>
              <p>
                <span className="text-slate-400">Result:</span> Turn upset customers into loyal fans
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Review Driver */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-amber-400" />
                Review Driver
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>
                <span className="text-slate-400">What it does:</span> Guides happy customers to leave 5★ reviews
              </p>
              <p>
                <span className="text-slate-400">When it triggers:</span> Any rating 9/10 or 10/10
              </p>
              <p>
                <span className="text-slate-400">What you do:</span> Nothing - system sends review links automatically
              </p>
              <p>
                <span className="text-slate-400">Result:</span> 5-10 new Google/Yelp reviews per month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Winback System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Winback Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>
                <span className="text-slate-400">What it does:</span> Reactivates customers who haven&apos;t returned
              </p>
              <p>
                <span className="text-slate-400">When it triggers:</span> Customer inactive 60+ days
              </p>
              <p>
                <span className="text-slate-400">What you do:</span> Nothing - runs automatically in background
              </p>
              <p>
                <span className="text-slate-400">Result:</span> 15-25% of inactive customers book again
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5 text-[var(--gn-gold)]" />
                Customizable Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>
                <span className="text-slate-400">Feedback timing:</span> How long after checkout to send SMS
              </p>
              <p>
                <span className="text-slate-400">Issue threshold:</span> What rating counts as a problem
              </p>
              <p>
                <span className="text-slate-400">Promoter threshold:</span> Who gets asked for reviews
              </p>
              <p>
                <span className="text-slate-400">Winback rules:</span> When to reach out and how often
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily Workflow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--gn-gold)]" />
              Your Daily Workflow
            </CardTitle>
            <CardDescription>
              How to use this system effectively (30-60 minutes per week)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <span className="text-[var(--gn-gold)]">☀️</span> Morning (2 min)
                </h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Check Today page</li>
                  <li>• Review any new issues</li>
                  <li>• Prioritize urgent problems</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <span className="text-[var(--gn-gold)]">📞</span> Throughout Day
                </h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Staff checks in customers</li>
                  <li>• Handle issues as they arrive</li>
                  <li>• 5-10 min per issue call</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <span className="text-[var(--gn-gold)]">📊</span> Weekly (10 min)
                </h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Review dashboard trends</li>
                  <li>• Check feedback patterns</li>
                  <li>• Adjust settings if needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ROI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-[var(--gn-gold)]/20 bg-gradient-to-br from-[var(--gn-gold)]/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--gn-gold)]" />
              Why This Matters: ROI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-200 mb-2">What You Prevent</h4>
                <ul className="space-y-1 text-slate-400">
                  <li>• Bad online reviews (worth $500-1500 each)</li>
                  <li>• Customer churn from unresolved issues</li>
                  <li>• Reputation damage on Google/Yelp</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-2">What You Gain</h4>
                <ul className="space-y-1 text-slate-400">
                  <li>• 5-10 new 5★ reviews per month</li>
                  <li>• 15-25% of inactive customers return</li>
                  <li>• 10-15 hours saved per week</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <p className="text-slate-400">
                <span className="font-semibold text-[var(--gn-gold)]">Bottom line:</span> One prevented bad review
                or 2-3 reactivated customers pays for this system. Everything else is profit.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documentation Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--gn-gold)]" />
              Detailed Documentation
            </CardTitle>
            <CardDescription>
              In-depth guides for learning the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/OWNER_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:border-[var(--gn-gold)]/30 hover:bg-slate-900/50 transition-colors group"
            >
              <div>
                <h4 className="font-semibold text-slate-200 group-hover:text-[var(--gn-gold)] transition-colors">
                  Owner&apos;s Guide
                </h4>
                <p className="text-sm text-slate-400">
                  Complete guide to understanding and using the system
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[var(--gn-gold)] transition-colors" />
            </a>

            <a
              href="/DEMO_SCRIPT.md"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:border-[var(--gn-gold)]/30 hover:bg-slate-900/50 transition-colors group"
            >
              <div>
                <h4 className="font-semibold text-slate-200 group-hover:text-[var(--gn-gold)] transition-colors">
                  Demo Script
                </h4>
                <p className="text-sm text-slate-400">
                  Step-by-step walkthrough for live demonstrations
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[var(--gn-gold)] transition-colors" />
            </a>

            <div className="pt-2 text-xs text-slate-500">
              💡 Tip: These guides are also in your project repository for offline access
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="border-slate-800/50 bg-slate-900/30">
          <CardHeader>
            <CardTitle className="text-lg">💡 Quick Tips for Success</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <p>
              <span className="text-[var(--gn-gold)]">✓</span> Train all staff on check-ins (15 minute training)
            </p>
            <p>
              <span className="text-[var(--gn-gold)]">✓</span> Respond to issues within 2-4 hours (same day)
            </p>
            <p>
              <span className="text-[var(--gn-gold)]">✓</span> Check Today page every morning (2 minutes)
            </p>
            <p>
              <span className="text-[var(--gn-gold)]">✓</span> Review dashboard weekly to spot trends
            </p>
            <p>
              <span className="text-[var(--gn-gold)]">✓</span> Give it 30 days of consistent use before judging results
            </p>
            <p>
              <span className="text-[var(--gn-gold)]">✓</span> Celebrate wins with team (share positive feedback!)
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
