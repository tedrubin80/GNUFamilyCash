// File: app/layout.tsx

import './globals.css'
import { Providers } from './providers'
import { Navigation } from '@/components/Navigation'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Family GnuCash - Family Accounting System',
  description: 'Complete family accounting and financial management system with budgets, transactions, and reporting.',
  keywords: 'accounting, finance, family, budget, transactions, gnucash',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </div>
            </main>
            <footer className="bg-white border-t border-gray-200 py-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-sm text-gray-500">
                  <p>&copy; 2025 Family GnuCash. Built with Next.js and Prisma.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}