import type React from "react"
import type { Metadata, Viewport } from "next"
import ClientLayout from "./ClientLayout"
import './globals.css'

export const metadata: Metadata = {
  title: "VoiceReader PWA",
  description: "Aplicación progresiva de lector de pantalla con soporte offline",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}