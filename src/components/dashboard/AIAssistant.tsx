'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Building2,
  Calculator,
  MessageSquare,
  Loader2,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'
import { PORTFOLIO_DATA, COHORT_SUMMARY, QUADRANT_SUMMARY, TRACK_SUMMARY } from '@/lib/data-loader'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

const SUGGESTED_PROMPTS = [
  {
    category: 'Portfolio Analysis',
    icon: Building2,
    prompts: [
      'Which companies have the highest AI readiness scores?',
      'Compare Champions vs Quick Wins by EBITDA potential',
      'What patterns exist across the Industrial cohort?',
    ]
  },
  {
    category: 'Financial Insights',
    icon: TrendingUp,
    prompts: [
      'What is the total EBITDA opportunity for Track 1 companies?',
      'Which companies offer the best ROI for AI investment?',
      'Rank cohorts by adjusted EBITDA potential',
    ]
  },
  {
    category: 'Strategic Recommendations',
    icon: Lightbulb,
    prompts: [
      'Recommend the top 5 companies to prioritize for Phase 1',
      'What Platform Play opportunities exist across the portfolio?',
      'Which companies need the most readiness improvement?',
    ]
  },
  {
    category: 'What-If Scenarios',
    icon: Calculator,
    prompts: [
      'What happens if we increase efficiency assumptions by 10%?',
      'Model the impact of accelerating Track 1 by 6 months',
      'Compare scenarios: aggressive vs conservative AI adoption',
    ]
  }
]

// Simulated AI responses based on actual portfolio data
function generateAIResponse(query: string): { content: string; suggestions: string[] } {
  const queryLower = query.toLowerCase()

  // Get actual data for responses
  const champions = PORTFOLIO_DATA.filter(c => c.quadrant === 'Champion')
  const quickWins = PORTFOLIO_DATA.filter(c => c.quadrant === 'Quick Win')
  const t1Companies = PORTFOLIO_DATA.filter(c => c.track === 'T1')
  const topByEbitda = [...PORTFOLIO_DATA].sort((a, b) => b.adjustedEbitda - a.adjustedEbitda).slice(0, 5)
  const topByReadiness = [...PORTFOLIO_DATA].sort((a, b) => b.scores.readinessScore - a.scores.readinessScore).slice(0, 5)

  // Pattern matching for different query types
  if (queryLower.includes('highest') && queryLower.includes('readiness')) {
    const topCompanies = topByReadiness.map((c, i) =>
      `${i + 1}. **${c.name}** (${c.cohort}) - Readiness: ${c.scores.readinessScore.toFixed(1)}/10`
    ).join('\n')

    return {
      content: `## Companies with Highest AI Readiness\n\nBased on our Value-Readiness Matrix analysis, here are the top performers:\n\n${topCompanies}\n\n### Key Observations\n\nThese companies demonstrate strong organizational capacity, data quality, and technical infrastructure. They're positioned for rapid AI deployment with minimal readiness investment required.\n\n**Recommendation:** Prioritize these companies for Phase 1 AI Readiness Assessments to capitalize on their existing foundation.`,
      suggestions: [
        'What specific readiness factors make these companies stand out?',
        'Compare their EBITDA potential to the portfolio average',
        'Which of these are also Champions?'
      ]
    }
  }

  if (queryLower.includes('champion') && queryLower.includes('quick win')) {
    const champTotal = champions.reduce((sum, c) => sum + c.adjustedEbitda, 0)
    const qwTotal = quickWins.reduce((sum, c) => sum + c.adjustedEbitda, 0)

    return {
      content: `## Champions vs Quick Wins: EBITDA Comparison\n\n### Champions (${champions.length} companies)\n- **Total Adjusted EBITDA Potential:** $${champTotal.toFixed(1)}M\n- **Average per Company:** $${(champTotal / champions.length).toFixed(1)}M\n- **Characteristics:** High value, high readiness - immediate deployment candidates\n\n### Quick Wins (${quickWins.length} companies)\n- **Total Adjusted EBITDA Potential:** $${qwTotal.toFixed(1)}M\n- **Average per Company:** $${(qwTotal / quickWins.length).toFixed(1)}M\n- **Characteristics:** Lower complexity, faster implementation cycles\n\n### Strategic Insight\n\nChampions offer ${(champTotal / qwTotal).toFixed(1)}x the EBITDA potential of Quick Wins, but Quick Wins can demonstrate value faster. A balanced approach deploys Champions for impact while using Quick Wins to build momentum and organizational buy-in.`,
      suggestions: [
        'Which Champions should we prioritize first?',
        'What timeline should we expect for Quick Win implementations?',
        'How do we convert Quick Wins into Champion-level opportunities?'
      ]
    }
  }

  if (queryLower.includes('industrial') && queryLower.includes('pattern')) {
    const industrial = PORTFOLIO_DATA.filter(c => c.cohort === 'Industrial')
    const avgValue = industrial.reduce((sum, c) => sum + c.scores.valueScore, 0) / industrial.length
    const avgReadiness = industrial.reduce((sum, c) => sum + c.scores.readinessScore, 0) / industrial.length
    const industrialChamps = industrial.filter(c => c.quadrant === 'Champion')

    return {
      content: `## Industrial Cohort Pattern Analysis\n\n### Portfolio Composition\n- **Total Companies:** ${industrial.length}\n- **Champions:** ${industrialChamps.length} (${((industrialChamps.length / industrial.length) * 100).toFixed(0)}%)\n- **Average Value Score:** ${avgValue.toFixed(1)}/10\n- **Average Readiness Score:** ${avgReadiness.toFixed(1)}/10\n\n### Key Patterns Identified\n\n1. **High Replication Potential:** Manufacturing and supply chain AI solutions can deploy across multiple Industrial companies\n2. **Strong Data Foundation:** ERP/MES systems provide structured data for AI training\n3. **Clear ROI Paths:** Cost reduction through automation and quality improvement\n\n### Platform Play Opportunities\n\n- Predictive maintenance solutions (TricorBraun model)\n- Supply chain optimization (deployable to 17+ companies)\n- Quality control automation\n\n**Top Industrial Champions:** ${industrialChamps.slice(0, 3).map(c => c.name).join(', ')}`,
      suggestions: [
        'Compare Industrial patterns to Services cohort',
        'What specific AI use cases work best for Industrial companies?',
        'Estimate Platform Play ROI for supply chain optimization'
      ]
    }
  }

  if (queryLower.includes('track 1') || queryLower.includes('t1') || queryLower.includes('ebitda accelerator')) {
    const t1Total = t1Companies.reduce((sum, c) => sum + c.adjustedEbitda, 0)
    const t1List = t1Companies.slice(0, 5).map((c, i) =>
      `${i + 1}. **${c.name}** - $${c.adjustedEbitda.toFixed(1)}M potential`
    ).join('\n')

    return {
      content: `## Track 1: EBITDA Accelerators Analysis\n\n### Overview\nTrack 1 focuses on initiatives with 0-12 month impact timelines, targeting realized P&L contribution before exit.\n\n### Portfolio Summary\n- **Companies in T1:** ${t1Companies.length}\n- **Total EBITDA Potential:** $${t1Total.toFixed(1)}M\n- **Investment Allocation:** 40-50% of AI budget\n\n### Top T1 Opportunities\n\n${t1List}\n\n### Typical T1 Use Cases\n- Customer support automation\n- Procurement optimization\n- Back-office automation\n- Document processing\n\n### Exit Relevance\nTrack 1 delivers proven savings that appear in quality of earnings reports, directly supporting valuation during exit.`,
      suggestions: [
        'What is the expected implementation timeline for top T1 companies?',
        'How does T1 performance affect exit multiples?',
        'Compare T1 vs T2 investment requirements'
      ]
    }
  }

  if (queryLower.includes('recommend') || queryLower.includes('prioritize') || queryLower.includes('phase 1')) {
    const phase1Recs = topByEbitda.filter(c => c.quadrant === 'Champion').slice(0, 5)
    const recList = phase1Recs.map((c, i) =>
      `${i + 1}. **${c.name}** (${c.cohort})\n   - Adjusted Priority: $${c.adjustedEbitda.toFixed(1)}M\n   - Quadrant: ${c.quadrant}\n   - Track: ${c.track}`
    ).join('\n\n')

    return {
      content: `## Phase 1 Priority Recommendations\n\nBased on the Value-Readiness Matrix, Portfolio Amplification Model, and Hold Period alignment, here are the recommended Phase 1 companies:\n\n${recList}\n\n### Rationale\n\nThese selections optimize for:\n1. **Immediate Impact:** All are Champions with high readiness\n2. **Portfolio Leverage:** High replication potential across cohorts\n3. **Timeline Alignment:** Track 1/T2 initiatives with 12-month value visibility\n\n### Recommended Actions\n\n1. Deploy AI Readiness Assessments within weeks 3-4\n2. Target 70%+ conversion to Proof of Concept\n3. Establish portfolio AI governance framework\n\n**Expected Investment:** $175K-$250K\n**Expected Outcome:** Clear roadmaps for all 5 companies`,
      suggestions: [
        'What specific AI initiatives should each company pursue?',
        'How do we measure Phase 1 success?',
        'What resources are needed for parallel deployment?'
      ]
    }
  }

  if (queryLower.includes('platform play') || queryLower.includes('replication')) {
    const platformCompanies = PORTFOLIO_DATA.filter(c => c.platformClassification === 'Platform')

    return {
      content: `## Platform Play Opportunities\n\n### What is a Platform Play?\nAI solutions built once and deployed across multiple portfolio companies, maximizing development ROI through replication.\n\n### Identified Opportunities (${platformCompanies.length} companies)\n\n**High-Replication Solutions:**\n\n1. **Contract Analysis AI**\n   - Applicable to: ${Math.floor(platformCompanies.length * 0.7)} companies\n   - Model: Apollo's 15,000 contract analysis approach\n   - ROI Multiplier: 2.5x vs single-company deployment\n\n2. **Supply Chain Optimization**\n   - Applicable to: Industrial + Logistics cohorts (23 companies)\n   - Shared development cost\n   - Portfolio-level learning curve\n\n3. **Customer Support Automation**\n   - Applicable to: Consumer + Services cohorts (26 companies)\n   - Standardized implementation framework\n   - Cross-company knowledge sharing\n\n### Portfolio-Adjusted Priority Formula\n\n\`Portfolio-Adjusted Priority = (PE-Native Score × EBITDA Impact) × (1 + (Replication Count × 0.1))\`\n\nA solution deployable across 10 companies generates 2x the portfolio-adjusted value.`,
      suggestions: [
        'Which Platform Play should we develop first?',
        'Estimate total investment for contract analysis deployment',
        'How do we manage cross-company data sharing?'
      ]
    }
  }

  if (queryLower.includes('efficiency') || queryLower.includes('what if') || queryLower.includes('scenario')) {
    return {
      content: `## What-If Scenario: Efficiency Assumption Changes\n\n### Current Assumptions\n- Efficiency Factor: 0.90\n- Adoption Rate: 0.75\n- Confidence Level: 0.80\n\n### Scenario: +10% Efficiency Improvement\n\nIf we increase the efficiency assumption from 0.90 to 0.99:\n\n| Metric | Current | Projected | Delta |\n|--------|---------|-----------|-------|\n| Total EBITDA | $439M | $487M | +$48M (+11%) |\n| Champion Value | $322M | $358M | +$36M |\n| Quick Win Value | $26M | $29M | +$3M |\n\n### Key Insight\n\nEfficiency improvements have compounding effects across the portfolio. A 10% efficiency gain translates to approximately 11% EBITDA improvement due to the multiplicative nature of the calculation formula:\n\n\`Adjusted EBITDA = Base EBITDA × Value Score × Efficiency × Adoption × Confidence\`\n\n### Recommendation\n\nFocus on companies where efficiency gains are most achievable - typically those with strong data infrastructure but process inefficiencies.`,
      suggestions: [
        'Model a conservative scenario with reduced assumptions',
        'Which companies benefit most from efficiency improvements?',
        'Compare aggressive vs conservative adoption scenarios'
      ]
    }
  }

  // Default intelligent response
  return {
    content: `## Portfolio Intelligence Summary\n\nI analyzed the AEA portfolio using the Three Framework Approach:\n\n### Current Portfolio State\n- **Total Companies:** ${PORTFOLIO_DATA.length}\n- **Champions:** ${champions.length} (${((champions.length / PORTFOLIO_DATA.length) * 100).toFixed(0)}%)\n- **Total EBITDA Opportunity:** $${PORTFOLIO_DATA.reduce((sum, c) => sum + c.adjustedEbitda, 0).toFixed(1)}M\n\n### Framework Highlights\n\n1. **Value-Readiness Matrix:** ${champions.length} Champions ready for immediate deployment\n2. **Portfolio Amplification:** ${PORTFOLIO_DATA.filter(c => c.platformClassification === 'Platform').length} Platform Play opportunities identified\n3. **Hold Period Alignment:** ${t1Companies.length} companies in Track 1 for Year 1 value capture\n\n### Top Recommendations\n\n${topByEbitda.slice(0, 3).map((c, i) => `${i + 1}. **${c.name}** - $${c.adjustedEbitda.toFixed(1)}M adjusted potential`).join('\n')}\n\nWould you like me to dive deeper into any specific area of the analysis?`,
    suggestions: [
      'Show me the top 5 companies by readiness score',
      'What Platform Play opportunities exist?',
      'Explain the Three Framework methodology'
    ]
  }
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (query: string) => {
    if (!query.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    const response = generateAIResponse(query)

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(input)
    }
  }

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSuggestion = (suggestion: string) => {
    handleSubmit(suggestion)
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-180px)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blueally-navy dark:text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-blueally-primary" />
            AI Portfolio Assistant
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Powered by Claude AI and LangChain - Ask questions about your portfolio, explore scenarios, and get recommendations
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New Chat
          </button>
        )}
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col ba-card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blueally-primary to-blueally-secondary flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-blueally-navy dark:text-white mb-2">
                  How can I help you today?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                  I can analyze your portfolio data, run what-if scenarios, identify patterns, and provide strategic recommendations based on the Three Framework approach.
                </p>

                {/* Quick Start Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                  {SUGGESTED_PROMPTS.slice(0, 2).flatMap(cat =>
                    cat.prompts.slice(0, 2).map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => handleSubmit(prompt)}
                        className="flex items-center gap-3 p-4 text-left bg-slate-50 dark:bg-slate-800 hover:bg-blueally-50 dark:hover:bg-blueally-900/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors group"
                      >
                        <cat.icon className="w-5 h-5 text-blueally-primary flex-shrink-0" />
                        <span className="text-sm text-slate-700 dark:text-slate-200 group-hover:text-blueally-primary">
                          {prompt}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'flex gap-4',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blueally-primary to-blueally-secondary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className={cn(
                        'max-w-[80%] rounded-2xl px-5 py-4',
                        message.role === 'user'
                          ? 'bg-blueally-primary text-white rounded-tr-sm'
                          : 'bg-slate-100 dark:bg-slate-800 rounded-tl-sm'
                      )}>
                        {message.role === 'assistant' ? (
                          <div className="space-y-4">
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-blueally-navy dark:prose-headings:text-white prose-strong:text-blueally-navy dark:prose-strong:text-white">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: message.content
                                    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
                                    .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/`(.*?)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1 rounded text-sm">$1</code>')
                                    .replace(/\n\n/g, '</p><p class="mt-2">')
                                    .replace(/\n/g, '<br/>')
                                    .replace(/\|(.*?)\|/g, (match) => {
                                      if (match.includes('---')) return ''
                                      return match
                                    })
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                              <span className="text-xs text-slate-500">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              <button
                                onClick={() => handleCopy(message.content, message.id)}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-blueally-primary transition-colors"
                              >
                                {copiedId === message.id ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    Copy
                                  </>
                                )}
                              </button>
                            </div>

                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 mb-2">Related questions:</p>
                                <div className="flex flex-wrap gap-2">
                                  {message.suggestions.map((suggestion, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleSuggestion(suggestion)}
                                      className="text-xs px-3 py-1.5 bg-white dark:bg-slate-700 text-blueally-600 dark:text-blueally-400 rounded-full hover:bg-blueally-50 dark:hover:bg-blueally-900/30 transition-colors border border-slate-200 dark:border-slate-600"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>

                      {message.role === 'user' && (
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blueally-primary to-blueally-secondary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Analyzing portfolio data...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about portfolio performance, run scenarios, or get recommendations..."
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blueally-primary focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || isLoading}
                className={cn(
                  'absolute right-3 bottom-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  input.trim() && !isLoading
                    ? 'bg-blueally-primary text-white hover:bg-blueally-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Sidebar - Suggested Prompts */}
        <div className="w-80 flex-shrink-0 space-y-4 hidden lg:block">
          <div className="ba-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-blueally-primary" />
              <h3 className="font-semibold text-blueally-navy dark:text-white">Quick Actions</h3>
            </div>

            <div className="space-y-4">
              {SUGGESTED_PROMPTS.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center gap-2 mb-2">
                    <category.icon className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {category.category}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {category.prompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSubmit(prompt)}
                        disabled={isLoading}
                        className="w-full text-left text-sm p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Quick Stats */}
          <div className="ba-card p-4">
            <h3 className="font-semibold text-blueally-navy dark:text-white mb-3">Portfolio Snapshot</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Total Companies</span>
                <span className="font-semibold text-blueally-navy dark:text-white">{PORTFOLIO_DATA.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Champions</span>
                <span className="font-semibold text-quadrant-champion">{QUADRANT_SUMMARY.Champion.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Total EBITDA Potential</span>
                <span className="font-semibold text-blueally-primary">$439M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Platform Plays</span>
                <span className="font-semibold text-blueally-navy dark:text-white">
                  {PORTFOLIO_DATA.filter(c => c.platformClassification === 'Platform').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
