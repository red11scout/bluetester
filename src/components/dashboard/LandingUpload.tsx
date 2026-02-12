'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileSpreadsheet, Zap, ArrowRight, Sparkles,
  CheckCircle, Loader2, FileText, Play,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { PORTFOLIO_DATA } from '@/lib/data-loader'

const PROCESSING_STEPS = [
  { label: 'Analyzing assessment data', icon: FileSpreadsheet },
  { label: 'Identifying AI use cases', icon: Sparkles },
  { label: 'Calculating quantified benefits', icon: Zap },
  { label: 'Generating workflow comparisons', icon: Play },
  { label: 'Dashboard ready', icon: CheckCircle },
]

export function LandingUpload() {
  const { setCompanies, setActiveTab } = useDashboardStore()
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].name.endsWith('.xlsx')) {
      setUploadedFile(files[0])
      startProcessing()
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
      startProcessing()
    }
  }, [])

  const startProcessing = useCallback(() => {
    setProcessing(true)
    setCurrentStep(0)

    // Simulate AI processing steps
    const stepDuration = 1200
    PROCESSING_STEPS.forEach((_, index) => {
      setTimeout(() => {
        setCurrentStep(index)
        if (index === PROCESSING_STEPS.length - 1) {
          setTimeout(() => {
            setCompanies(PORTFOLIO_DATA)
            setActiveTab('overview')
          }, 800)
        }
      }, stepDuration * (index + 1))
    })
  }, [setCompanies, setActiveTab])

  const handleSkipToDemo = useCallback(() => {
    setCompanies(PORTFOLIO_DATA)
    setActiveTab('overview')
  }, [setCompanies, setActiveTab])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blueally-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blueally-accent/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-1.5s' }} />
      </div>

      <AnimatePresence mode="wait">
        {processing ? (
          /* Processing Animation */
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blueally-primary to-blueally-accent rounded-2xl flex items-center justify-center shadow-glow-blue animate-glow-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              AI is analyzing your data
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-10">
              Claude is processing your assessment and building insights
            </p>

            <div className="space-y-4">
              {PROCESSING_STEPS.map((step, index) => {
                const Icon = step.icon
                const isComplete = index < currentStep
                const isCurrent = index === currentStep
                const isPending = index > currentStep

                return (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      isCurrent ? 'glass-card' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isComplete ? 'bg-green-500/20 text-green-500' :
                      isCurrent ? 'bg-blueally-primary/20 text-blueally-primary dark:text-blueally-accent' :
                      'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>
                      {isComplete ? <CheckCircle size={16} /> :
                       isCurrent ? <Loader2 size={16} className="animate-spin" /> :
                       <Icon size={16} />}
                    </div>
                    <span className={`text-sm font-medium ${
                      isComplete ? 'text-green-600 dark:text-green-400' :
                      isCurrent ? 'text-slate-800 dark:text-white' :
                      'text-slate-400 dark:text-slate-500'
                    }`}>
                      {step.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ) : (
          /* Upload Interface */
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl w-full"
          >
            {/* Hero */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blueally-primary to-blueally-accent rounded-2xl flex items-center justify-center shadow-glow-blue"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight"
              >
                Accelerate AI Value
                <br />
                <span className="ba-gradient-text">Across Your Portfolio</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
              >
                Upload your assessment data and let Claude AI identify use cases,
                quantify benefits, and generate workflow comparisons.
              </motion.p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Upload Excel Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`glass-card p-8 text-center cursor-pointer transition-all group hover:shadow-glow-blue ${
                    isDragging ? 'border-blueally-primary dark:border-blueally-accent bg-blueally-50 dark:bg-blueally-500/10 scale-[1.02]' : ''
                  }`}
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-blueally-50 dark:bg-blueally-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blueally-100 dark:group-hover:bg-blueally-500/20 transition-colors">
                    <FileSpreadsheet className="w-7 h-7 text-blueally-primary dark:text-blueally-accent" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    Upload Assessment
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Drag & drop your Excel assessment file, or click to browse
                  </p>

                  <label className="ba-btn-primary cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                    Supports .xlsx, .xls, .csv
                  </p>
                </div>
              </motion.div>

              {/* Quick Assessment Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  onClick={() => setActiveTab('assessment')}
                  className="glass-card p-8 text-center cursor-pointer transition-all group hover:shadow-glow-accent"
                >
                  <div className="w-14 h-14 mx-auto mb-4 bg-cyan-50 dark:bg-cyan-500/10 rounded-2xl flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 transition-colors">
                    <FileText className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    Quick Assessment
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Fill out a quick form and let AI generate your use case portfolio
                  </p>

                  <button className="ba-btn-outline">
                    Start Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Skip to Demo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <button
                onClick={handleSkipToDemo}
                className="text-sm text-slate-400 dark:text-slate-500 hover:text-blueally-primary dark:hover:text-blueally-accent transition-colors"
              >
                Skip to demo with sample portfolio data
                <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
