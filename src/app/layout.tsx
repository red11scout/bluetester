import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'BlueAlly × AEA | AI Portfolio Value Acceleration Dashboard',
  description: 'Comprehensive AI assessment dashboard for American Enterprise Associates portfolio companies. Built with Intelligent Choice Architecture.',
  keywords: ['BlueAlly', 'AEA', 'AI', 'Portfolio', 'Private Equity', 'EBITDA', 'Value Creation'],
  authors: [{ name: 'BlueAlly Technology Solutions' }],
  openGraph: {
    title: 'BlueAlly × AEA AI Portfolio Dashboard',
    description: 'Accelerate AI adoption across 54 portfolio companies',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-deep-900`}>
        <Providers>
          <div className="ambient-bg dark:block hidden" aria-hidden="true" />
          <div className="relative z-0">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
