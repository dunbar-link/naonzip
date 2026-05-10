import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://naonzip.vercel.app'),
  title: '나온집 - 부산 방송맛집',
  description: '부산에서 방송·유튜브에 나온 맛집을 보고, 공유하고, 길찾기까지',
  keywords: '부산 맛집, 방송 맛집, 유튜브 맛집, 부산 나온집',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${geist.className} bg-gray-50 max-w-[430px] mx-auto min-h-screen`}>
        <Header />
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
