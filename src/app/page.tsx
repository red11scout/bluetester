'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { LandingUpload } from '@/components/dashboard/LandingUpload'
import { ExecutiveSummary } from '@/components/dashboard/ExecutiveSummary'
import { UseCasesView } from '@/components/dashboard/UseCasesView'
import { WorkflowStudio } from '@/components/workflow/WorkflowStudio'
import { AssessmentPage } from '@/components/assessment/AssessmentPage'
import { FloatingAssistant } from '@/components/ai/FloatingAssistant'
import { useDashboardStore } from '@/lib/store'
import { PORTFOLIO_DATA } from '@/lib/data-loader'

export default function Dashboard() {
  const { activeTab, setActiveTab, setCompanies, companies } = useDashboardStore()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // If we already have companies loaded, go to dashboard
    if (companies.length > 0) {
      setIsLoaded(true)
      return
    }
    // Otherwise start on landing page
    setActiveTab('landing')
    setIsLoaded(true)
  }, [setCompanies, setActiveTab, companies.length])

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingUpload />
      case 'overview':
        return <ExecutiveSummary />
      case 'workflow':
        return <WorkflowStudio />
      case 'usecases':
        return <UseCasesView />
      case 'assessment':
        return <AssessmentPage />
      default:
        return <LandingUpload />
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-deep-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blueally-primary to-blueally-accent rounded-2xl flex items-center justify-center shadow-glow-blue animate-glow-pulse">
            <span className="text-white font-black text-lg">BA</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Loading Portfolio Intelligence...
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Preparing your AI-powered analysis
          </p>
        </motion.div>
      </div>
    )
  }

  // Landing page is full-screen, no sidebar/header
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-white dark:bg-deep-900">
        <LandingUpload />
        <FloatingAssistant />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-deep-900">
      <Sidebar />

      <main className="flex-1 md:ml-[72px] transition-all duration-300">
        <Header />

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-6"
        >
          {renderContent()}
        </motion.div>
      </main>

      <FloatingAssistant />
    </div>
  )
}
