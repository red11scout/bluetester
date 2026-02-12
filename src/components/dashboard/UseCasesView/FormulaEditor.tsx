'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calculator,
  SlidersHorizontal,
  RefreshCw,
  Download,
  Info,
  Check,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Assumptions {
  efficiencyFactor: number
  adoptionFactor: number
  confidenceFactor: number
  executiveRate: number
  managerRate: number
  specialistRate: number
  analystRate: number
}

interface FormulaEditorProps {
  isOpen: boolean
  onClose: () => void
  assumptions: Assumptions
  onAssumptionsChange: (assumptions: Assumptions) => void
}

const defaultAssumptions: Assumptions = {
  efficiencyFactor: 0.90,
  adoptionFactor: 0.75,
  confidenceFactor: 0.80,
  executiveRate: 395,
  managerRate: 150,
  specialistRate: 100,
  analystRate: 85
}

export function FormulaEditor({
  isOpen,
  onClose,
  assumptions,
  onAssumptionsChange
}: FormulaEditorProps) {
  const [localAssumptions, setLocalAssumptions] = useState(assumptions)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalAssumptions(assumptions)
    setHasChanges(false)
  }, [assumptions, isOpen])

  const handleChange = (key: keyof Assumptions, value: number) => {
    const newAssumptions = { ...localAssumptions, [key]: value }
    setLocalAssumptions(newAssumptions)
    setHasChanges(true)
  }

  const handleApply = () => {
    onAssumptionsChange(localAssumptions)
    setHasChanges(false)
    onClose()
  }

  const handleReset = () => {
    setLocalAssumptions(defaultAssumptions)
    setHasChanges(true)
  }

  // Calculate impact preview
  const impactMultiplier = (
    localAssumptions.efficiencyFactor *
    localAssumptions.adoptionFactor *
    localAssumptions.confidenceFactor
  )

  const originalMultiplier = (
    defaultAssumptions.efficiencyFactor *
    defaultAssumptions.adoptionFactor *
    defaultAssumptions.confidenceFactor
  )

  const impactChange = ((impactMultiplier - originalMultiplier) / originalMultiplier) * 100

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
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blueally-primary to-blueally-secondary flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">
                      Formula Assumptions
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Adjust parameters that affect all value calculations
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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Impact Preview */}
              <div className={cn(
                'p-4 rounded-xl border',
                impactChange > 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : impactChange < 0
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className={cn(
                      'w-5 h-5',
                      impactChange > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : impactChange < 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-600 dark:text-slate-400'
                    )} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Value Impact Preview
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {Math.round(impactMultiplier * 100)}%
                    </div>
                    <div className={cn(
                      'text-sm font-medium',
                      impactChange > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : impactChange < 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500'
                    )}>
                      {impactChange > 0 ? '+' : ''}{impactChange.toFixed(1)}% from default
                    </div>
                  </div>
                </div>
              </div>

              {/* Multiplier Factors */}
              <section>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Multiplier Factors
                </h3>
                <div className="space-y-4">
                  <SliderInput
                    label="Efficiency Factor"
                    description="Implementation achievability adjustment (0.70 = Conservative, 0.90 = Standard, 1.00 = Aggressive)"
                    value={localAssumptions.efficiencyFactor}
                    onChange={(v) => handleChange('efficiencyFactor', v)}
                    min={0.50}
                    max={1.00}
                    step={0.05}
                    format={(v) => `${Math.round(v * 100)}%`}
                  />
                  <SliderInput
                    label="Adoption Factor"
                    description="Level 2 data maturity adjustment for adoption likelihood"
                    value={localAssumptions.adoptionFactor}
                    onChange={(v) => handleChange('adoptionFactor', v)}
                    min={0.50}
                    max={1.00}
                    step={0.05}
                    format={(v) => `${Math.round(v * 100)}%`}
                  />
                  <SliderInput
                    label="Confidence Factor"
                    description="Risk confidence level applied to benefit estimates"
                    value={localAssumptions.confidenceFactor}
                    onChange={(v) => handleChange('confidenceFactor', v)}
                    min={0.50}
                    max={1.00}
                    step={0.05}
                    format={(v) => `${Math.round(v * 100)}%`}
                  />
                </div>
              </section>

              {/* Labor Rates */}
              <section>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Labor Rates ($/hour)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Executive Rate"
                    description="Physician/executive labor"
                    value={localAssumptions.executiveRate}
                    onChange={(v) => handleChange('executiveRate', v)}
                    prefix="$"
                    suffix="/hr"
                  />
                  <NumberInput
                    label="Manager Rate"
                    description="Senior specialist labor"
                    value={localAssumptions.managerRate}
                    onChange={(v) => handleChange('managerRate', v)}
                    prefix="$"
                    suffix="/hr"
                  />
                  <NumberInput
                    label="Specialist Rate"
                    description="Operations staff labor"
                    value={localAssumptions.specialistRate}
                    onChange={(v) => handleChange('specialistRate', v)}
                    prefix="$"
                    suffix="/hr"
                  />
                  <NumberInput
                    label="Analyst Rate"
                    description="Back-office labor"
                    value={localAssumptions.analystRate}
                    onChange={(v) => handleChange('analystRate', v)}
                    prefix="$"
                    suffix="/hr"
                  />
                </div>
              </section>

              {/* Formula Reference */}
              <section>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Formula Reference
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  <FormulaBlock
                    name="Cost Benefit"
                    formula="Hours Saved × Rate × Efficiency × Adoption"
                  />
                  <FormulaBlock
                    name="Revenue Benefit"
                    formula="Revenue Base × Lift % × 0.95 × Confidence"
                  />
                  <FormulaBlock
                    name="Risk Benefit"
                    formula="Risk Events × Impact × Reduction % × Confidence"
                  />
                  <FormulaBlock
                    name="Cash Flow Benefit"
                    formula="Days Improvement × Daily Rate × Efficiency"
                  />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset to Defaults
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!hasChanges}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all',
                      hasChanges
                        ? 'bg-blueally-primary text-white hover:bg-blueally-600'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                    )}
                  >
                    <Check className="w-4 h-4" />
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Slider Input Component
interface SliderInputProps {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  format: (value: number) => string
}

function SliderInput({ label, description, value, onChange, min, max, step, format }: SliderInputProps) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{label}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{description}</div>
        </div>
        <div className="text-xl font-bold text-blueally-primary">
          {format(value)}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-blueally-primary
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

// Number Input Component
interface NumberInputProps {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
}

function NumberInput({ label, description, value, onChange, prefix, suffix }: NumberInputProps) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
      <div className="font-medium text-slate-900 dark:text-white mb-1">{label}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">{description}</div>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-slate-500 dark:text-slate-400">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blueally-500"
        />
        {suffix && <span className="text-slate-500 dark:text-slate-400">{suffix}</span>}
      </div>
    </div>
  )
}

// Formula Block Component
function FormulaBlock({ name, formula }: { name: string; formula: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{name}</span>
      <code className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
        {formula}
      </code>
    </div>
  )
}
