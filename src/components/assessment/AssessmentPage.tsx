'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileSpreadsheet, FileText, Upload, ArrowRight,
  Building2, DollarSign, Users, Briefcase, AlertCircle,
  Sparkles, Loader2, CheckCircle,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { PORTFOLIO_DATA } from '@/lib/data-loader'

type TabId = 'upload' | 'form'

const BUSINESS_FUNCTIONS = [
  'Sales & Marketing', 'Finance & Accounting', 'Operations',
  'HR & Talent', 'Customer Service', 'Supply Chain',
  'IT & Technology', 'Legal & Compliance', 'R&D / Product',
]

const AI_READINESS = [
  'We have structured data in databases/CRM',
  'We have documented processes and SOPs',
  'Our team is open to AI adoption',
  'We have technical staff to support integration',
  'Leadership is sponsoring AI initiatives',
  'We have budget allocated for AI projects',
]

export function AssessmentPage() {
  const { setCompanies, setActiveTab } = useDashboardStore()
  const [activeAssessmentTab, setActiveAssessmentTab] = useState<TabId>('form')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [revenue, setRevenue] = useState('')
  const [ebitda, setEbitda] = useState('')
  const [employees, setEmployees] = useState('')
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([])
  const [painPoints, setPainPoints] = useState('')
  const [selectedReadiness, setSelectedReadiness] = useState<string[]>([])

  const toggleFunction = (fn: string) => {
    setSelectedFunctions(prev =>
      prev.includes(fn) ? prev.filter(f => f !== fn) : [...prev, fn]
    )
  }

  const toggleReadiness = (item: string) => {
    setSelectedReadiness(prev =>
      prev.includes(item) ? prev.filter(r => r !== item) : [...prev, item]
    )
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    const steps = ['Analyzing company profile...', 'Identifying AI opportunities...', 'Quantifying benefits...', 'Building dashboard...']
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    // TODO: Replace with actual Claude API call
    // For now, load demo data
    setCompanies(PORTFOLIO_DATA)
    setActiveTab('overview')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsProcessing(true)
    const steps = ['Parsing Excel file...', 'Extracting assessment data...', 'Running AI analysis...', 'Generating use cases...']
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i)
      await new Promise(resolve => setTimeout(resolve, 1200))
    }
    setCompanies(PORTFOLIO_DATA)
    setActiveTab('overview')
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blueally-primary to-blueally-accent rounded-2xl flex items-center justify-center shadow-glow-blue animate-glow-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Processing with Claude AI</h2>
          <div className="space-y-3">
            {['Analyzing data', 'Identifying use cases', 'Calculating benefits', 'Building dashboard'].map((step, i) => (
              <div key={step} className={`flex items-center gap-3 p-3 rounded-xl ${i === processingStep ? 'glass-card' : ''}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  i < processingStep ? 'bg-green-500/20 text-green-500' :
                  i === processingStep ? 'bg-blueally-primary/20 text-blueally-primary' :
                  'bg-slate-100 dark:bg-white/5 text-slate-400'
                }`}>
                  {i < processingStep ? <CheckCircle size={14} /> : i === processingStep ? <Loader2 size={14} className="animate-spin" /> : <span className="text-xs">{i + 1}</span>}
                </div>
                <span className={`text-sm ${i <= processingStep ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">New Assessment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Upload data or fill out the form to identify AI opportunities</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setActiveAssessmentTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeAssessmentTab === 'upload' ? 'bg-white dark:bg-glass-heavy shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileSpreadsheet size={16} /> Upload Excel
        </button>
        <button
          onClick={() => setActiveAssessmentTab('form')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeAssessmentTab === 'form' ? 'bg-white dark:bg-glass-heavy shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText size={16} /> Quick Assessment
        </button>
      </div>

      {activeAssessmentTab === 'upload' ? (
        /* Excel Upload */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          <div className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl p-12 text-center hover:border-blueally-primary dark:hover:border-blueally-accent transition-colors">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Drop your assessment file here</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Supports .xlsx, .xls, and .csv formats</p>
            <label className="ba-btn-primary cursor-pointer">
              <Upload className="w-4 h-4 mr-2" /> Choose File
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </motion.div>
      ) : (
        /* Quick Assessment Form */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Company Info */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blueally-primary" /> Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Company Name</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp" className="ba-input py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Industry</label>
                <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Manufacturing, Services..." className="ba-input py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Annual Revenue ($M)</label>
                <input value={revenue} onChange={e => setRevenue(e.target.value)} type="number" placeholder="50" className="ba-input py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">EBITDA ($M)</label>
                <input value={ebitda} onChange={e => setEbitda(e.target.value)} type="number" placeholder="8" className="ba-input py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Employees</label>
                <input value={employees} onChange={e => setEmployees(e.target.value)} type="number" placeholder="200" className="ba-input py-2.5 text-sm" />
              </div>
            </div>
          </div>

          {/* Business Functions */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blueally-primary" /> Key Business Functions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Select functions where AI could have the most impact</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BUSINESS_FUNCTIONS.map(fn => (
                <button
                  key={fn}
                  onClick={() => toggleFunction(fn)}
                  className={`p-3 rounded-xl text-sm text-left transition-all ${
                    selectedFunctions.includes(fn)
                      ? 'bg-blueally-primary/10 dark:bg-blueally-500/20 text-blueally-700 dark:text-blueally-300 border border-blueally-primary/30'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-white/10'
                  }`}
                >
                  {fn}
                </button>
              ))}
            </div>
          </div>

          {/* Pain Points */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blueally-primary" /> Operational Challenges
            </h3>
            <textarea
              value={painPoints}
              onChange={e => setPainPoints(e.target.value)}
              placeholder="Describe your biggest operational challenges, bottlenecks, and areas where manual processes slow you down..."
              rows={4}
              className="ba-input text-sm"
            />
          </div>

          {/* AI Readiness */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blueally-primary" /> AI Readiness
            </h3>
            <div className="space-y-2">
              {AI_READINESS.map(item => (
                <button
                  key={item}
                  onClick={() => toggleReadiness(item)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm text-left transition-all ${
                    selectedReadiness.includes(item)
                      ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/20'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    selectedReadiness.includes(item) ? 'border-green-500 bg-green-500' : 'border-slate-300 dark:border-white/20'
                  }`}>
                    {selectedReadiness.includes(item) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button onClick={handleSubmit} className="ba-btn-primary text-base px-8 py-3">
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze with Claude AI
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
