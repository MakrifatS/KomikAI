import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'KomikAI \u2014 Platform Komik Indie Buatan AI',
  description: 'Baca komik indie buatan AI. Buka chapter terbaru dengan menonton iklan.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-zinc-950">
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
