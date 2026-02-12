'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Share2,
  Link,
  Mail,
  Copy,
  Check,
  X,
  Loader2,
  FileJson,
  Presentation
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'
import { PORTFOLIO_DATA } from '@/lib/data-loader'
import {
  exportToExcel,
  exportScenarioToExcel,
  downloadHTMLReport,
  generateShareableLink,
  copyToClipboard
} from '@/lib/export'

interface ExportCenterProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportCenter({ isOpen, onClose }: ExportCenterProps) {
  const { companies, scenarios, filters } = useDashboardStore()
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)

  const filteredCompanies = companies.length > 0 ? companies : PORTFOLIO_DATA

  const handleExcelExport = async () => {
    setIsExporting('excel')
    try {
      await exportToExcel(filteredCompanies, `BlueAlly_AEA_Portfolio_${new Date().toISOString().split('T')[0]}`)
    } catch (error) {
      console.error('Export error:', error)
    }
    setIsExporting(null)
  }

  const handleHTMLExport = async () => {
    setIsExporting('html')
    try {
      await downloadHTMLReport(filteredCompanies, 'AEA Portfolio Analysis')
    } catch (error) {
      console.error('Export error:', error)
    }
    setIsExporting(null)
  }

  const handleScenarioExport = async () => {
    if (scenarios.length === 0) return
    setIsExporting('scenarios')
    try {
      await exportScenarioToExcel(
        scenarios,
        `BlueAlly_WhatIf_Scenarios_${new Date().toISOString().split('T')[0]}`
      )
    } catch (error) {
      console.error('Export error:', error)
    }
    setIsExporting(null)
  }

  const handleGenerateLink = () => {
    const config = {
      filters,
      scenarioIds: scenarios.map(s => s.id),
      timestamp: Date.now()
    }
    const link = generateShareableLink(config)
    setShareLink(link)
  }

  const handleCopyLink = async () => {
    if (shareLink) {
      await copyToClipboard(shareLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blueally-primary to-blueally-secondary flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">
                      Export & Share
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Download reports or share your analysis
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Download Options */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                  Download Reports
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <ExportButton
                    icon={FileSpreadsheet}
                    label="Excel Workbook"
                    description="Full portfolio data with multiple sheets"
                    onClick={handleExcelExport}
                    isLoading={isExporting === 'excel'}
                    color="green"
                  />
                  <ExportButton
                    icon={FileText}
                    label="HTML Report"
                    description="Shareable web report"
                    onClick={handleHTMLExport}
                    isLoading={isExporting === 'html'}
                    color="blue"
                  />
                  <ExportButton
                    icon={Presentation}
                    label="What-If Scenarios"
                    description={`${scenarios.length} saved scenarios`}
                    onClick={handleScenarioExport}
                    isLoading={isExporting === 'scenarios'}
                    disabled={scenarios.length === 0}
                    color="purple"
                  />
                  <ExportButton
                    icon={FileJson}
                    label="JSON Data"
                    description="Raw data export"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(filteredCompanies, null, 2)], {
                        type: 'application/json'
                      })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `BlueAlly_Portfolio_${new Date().toISOString().split('T')[0]}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    color="amber"
                  />
                </div>
              </div>

              {/* Share Options */}
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                  Share Analysis
                </h3>

                {!shareLink ? (
                  <button
                    onClick={handleGenerateLink}
                    className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-blueally-primary hover:bg-blueally-50 dark:hover:bg-blueally-900/20 transition-colors group"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Link className="w-5 h-5 text-slate-400 group-hover:text-blueally-primary" />
                      <span className="text-slate-600 dark:text-slate-300 group-hover:text-blueally-primary font-medium">
                        Generate Shareable Link
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          copiedLink
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                        )}
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`mailto:?subject=BlueAlly Portfolio Analysis&body=${encodeURIComponent(shareLink)}`, '_blank')}
                        className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">Email</span>
                      </button>
                      <button
                        onClick={() => setShareLink(null)}
                        className="px-4 py-3 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Export Info */}
              <div className="p-4 bg-blueally-50 dark:bg-blueally-900/20 rounded-xl">
                <div className="flex gap-3">
                  <Share2 className="w-5 h-5 text-blueally-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blueally-navy dark:text-white">
                      Branded Exports
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      All exports include BlueAlly branding and follow the Three Framework methodology.
                      Share reports with stakeholders or export for presentations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ExportButtonProps {
  icon: React.ElementType
  label: string
  description: string
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
  color: 'green' | 'blue' | 'purple' | 'amber'
}

function ExportButton({
  icon: Icon,
  label,
  description,
  onClick,
  isLoading,
  disabled,
  color
}: ExportButtonProps) {
  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-900/50',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left hover:border-blueally-primary hover:shadow-md transition-all group',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center transition-colors', colorClasses[color])}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="font-medium text-blueally-navy dark:text-white">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
    </button>
  )
}
