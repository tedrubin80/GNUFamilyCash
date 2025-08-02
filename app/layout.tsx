import './globals.css'
import { Providers } from './providers'
import { Navigation } from '@/components/Navigation'

export const metadata = {
  title: 'Family GnuCash',
  description: 'Family accounting and financial management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-4 py-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}