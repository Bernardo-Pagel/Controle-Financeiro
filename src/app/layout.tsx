import './globals.css'
import { Inter } from 'next/font/google'
import Header from './components/Header'
import { AuthProvider } from './context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Financial Management System',
  description: 'Track your income and expenses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="container mx-auto mt-8 px-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}

