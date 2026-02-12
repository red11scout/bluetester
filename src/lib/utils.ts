import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, abbreviated = true): string {
  if (abbreviated) {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`
    }
  }
  return `$${value.toLocaleString()}`
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export function formatNumber(value: number, abbreviated = true): string {
  if (abbreviated) {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`
    }
  }
  return value.toLocaleString()
}

// Color utilities for consistent theming
export const quadrantColors = {
  Champion: {
    bg: 'bg-quadrant-champion/10',
    text: 'text-quadrant-champion',
    border: 'border-quadrant-champion',
    fill: '#10B981',
  },
  'Quick Win': {
    bg: 'bg-quadrant-quickwin/10',
    text: 'text-quadrant-quickwin',
    border: 'border-quadrant-quickwin',
    fill: '#3B82F6',
  },
  Strategic: {
    bg: 'bg-quadrant-strategic/10',
    text: 'text-quadrant-strategic',
    border: 'border-quadrant-strategic',
    fill: '#F59E0B',
  },
  Foundation: {
    bg: 'bg-quadrant-foundation/10',
    text: 'text-quadrant-foundation',
    border: 'border-quadrant-foundation',
    fill: '#6B7280',
  },
}

export const trackColors = {
  T1: {
    bg: 'bg-track-t1/10',
    text: 'text-track-t1',
    border: 'border-track-t1',
    fill: '#10B981',
    label: 'EBITDA Accelerators',
  },
  T2: {
    bg: 'bg-track-t2/10',
    text: 'text-track-t2',
    border: 'border-track-t2',
    fill: '#3B82F6',
    label: 'Growth Enablers',
  },
  T3: {
    bg: 'bg-track-t3/10',
    text: 'text-track-t3',
    border: 'border-track-t3',
    fill: '#8B5CF6',
    label: 'Exit Multiplier Plays',
  },
}

export const cohortColors = {
  Industrial: {
    bg: 'bg-cohort-industrial/10',
    text: 'text-cohort-industrial',
    fill: '#6366F1',
  },
  Services: {
    bg: 'bg-cohort-services/10',
    text: 'text-cohort-services',
    fill: '#EC4899',
  },
  Consumer: {
    bg: 'bg-cohort-consumer/10',
    text: 'text-cohort-consumer',
    fill: '#F97316',
  },
  Healthcare: {
    bg: 'bg-cohort-healthcare/10',
    text: 'text-cohort-healthcare',
    fill: '#14B8A6',
  },
  Logistics: {
    bg: 'bg-cohort-logistics/10',
    text: 'text-cohort-logistics',
    fill: '#8B5CF6',
  },
}

// Hemingway-style writing helpers for AI responses
export const hemingwayStyle = {
  greetings: [
    'The numbers tell a clear story.',
    'Here is what matters.',
    'The data speaks plainly.',
    'Consider these facts.',
    'The analysis reveals this.',
  ],
  transitions: [
    'And yet,',
    'Still,',
    'Moreover,',
    'The truth is,',
    'Simply put,',
  ],
  conclusions: [
    'That is the picture.',
    'These are the facts.',
    'The opportunity is clear.',
    'Act accordingly.',
    'The path forward is evident.',
  ],
}

// Generate a random Hemingway-style intro
export function getHemingwayGreeting(): string {
  return hemingwayStyle.greetings[Math.floor(Math.random() * hemingwayStyle.greetings.length)]
}
