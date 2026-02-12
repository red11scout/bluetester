'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, X, Send, Loader2, ArrowRight,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  overview: [
    'Which companies have the highest AI opportunity?',
    'Show me the top Champions by EBITDA impact',
    'What is the total portfolio AI value?',
  ],
  workflow: [
    'Compare current vs AI workflow for this use case',
    'What are the biggest bottlenecks?',
    'How much time could AI save in this process?',
  ],
  usecases: [
    'Which use cases have the highest ROI?',
    'Suggest better assumptions for this use case',
    'What friction points should we focus on?',
  ],
  assessment: [
    'Help me fill out this assessment',
    'What industries benefit most from AI?',
    'What data do I need for a good assessment?',
  ],
  landing: [
    'What can this dashboard do?',
    'How does the AI assessment work?',
    'Show me a demo of the workflow comparison',
  ],
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { activeTab } = useDashboardStore()

  // Listen for toggle events from sidebar
  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev)
    window.addEventListener('toggle-ai-assistant', handler)
    return () => window.removeEventListener('toggle-ai-assistant', handler)
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const suggestions = SUGGESTED_PROMPTS[activeTab] || SUGGESTED_PROMPTS.overview

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context: { activeTab },
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-reply`,
        role: 'assistant',
        content: data.response || data.message || 'I can help you analyze the portfolio data. Try asking about specific companies, use cases, or AI opportunities.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'I can help analyze portfolio data, compare workflows, and identify AI opportunities. Try asking a specific question about the portfolio.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 bg-gradient-to-br from-blueally-primary to-blueally-accent rounded-2xl flex items-center justify-center text-white shadow-glow-blue hover:shadow-[0_0_30px_rgba(0,102,204,0.5)] transition-shadow animate-glow-pulse"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] z-50 bg-white dark:bg-deep-800 border-l border-slate-200 dark:border-glass-border shadow-elevated flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-glass-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blueally-primary to-blueally-accent rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Assistant</h3>
                    <p className="text-[10px] text-slate-400">Powered by Claude</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 ba-scrollbar">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blueally-50 dark:bg-blueally-500/10 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blueally-primary dark:text-blueally-accent" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                      Ask me anything
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                      I can analyze portfolio data, suggest improvements, and help with workflow comparisons.
                    </p>

                    <div className="space-y-2">
                      {suggestions.map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => handleSend(prompt)}
                          className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-glass-border text-sm text-slate-600 dark:text-slate-300 hover:border-blueally-300 dark:hover:border-blueally-accent/30 transition-colors group"
                        >
                          {prompt}
                          <ArrowRight className="w-3.5 h-3.5 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blueally-primary" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blueally-primary text-white'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-white/5 rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-blueally-primary" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 dark:border-glass-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Ask about the portfolio..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-glass-light border border-transparent dark:border-glass-border-light text-sm focus:outline-none focus:ring-2 focus:ring-blueally-primary text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-blueally-primary text-white flex items-center justify-center hover:bg-blueally-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
