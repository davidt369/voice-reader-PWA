"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { useEffect, useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOnline, setIsOnline] = useState(true)
  const [swRegistered, setSwRegistered] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Capturar evento beforeinstallprompt para promover la instalación
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      console.log('PWA es instalable')
    })

    // Registrar Service Worker usando un archivo estático
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: '/',
          type: 'module',
          updateViaCache: 'none'
        })
        .then((registration) => {
          console.log("Service Worker registrado exitosamente con scope:", registration.scope)
          setSwRegistered(true)

          // Forzar actualización del service worker
          registration.update()

          // Escuchar actualizaciones del Service Worker
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("Nueva versión de la PWA disponible")
                  // Opcional: Mostrar notificación de actualización
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("Fallo en el registro del Service Worker:", error)
          // La aplicación seguirá funcionando sin funcionalidad offline
        })
    } else {
      console.warn("Service Workers no son soportados en este navegador")
    }

    // Monitorear estado de conexión
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Anunciar estado inicial a lectores de pantalla
    const announceAppReady = () => {
      const announcement = document.createElement("div")
      announcement.setAttribute("aria-live", "polite")
      announcement.setAttribute("aria-atomic", "true")
      announcement.className = "sr-only"
      announcement.textContent = `VoiceReader PWA cargado. ${isOnline ? "Conectado" : "Modo offline"}. ${swRegistered ? "Funcionalidad offline disponible" : "Cargando funcionalidad offline"}.`
      document.body.appendChild(announcement)

      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement)
        }
      }, 3000)
    }

    const timer = setTimeout(announceAppReady, 1500)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearTimeout(timer)
    }
  }, [])

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lector PWA" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
        <link rel="icon" type="image/png" href="/placeholder-logo.png" />
        <link rel="icon" type="image/png" sizes="72x72" href="/placeholder-logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/placeholder-logo.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/placeholder-logo.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Región de anuncios para lectores de pantalla */}
          <div id="announcements" aria-live="polite" aria-atomic="true" className="sr-only"></div>
          <div id="urgent-announcements" aria-live="assertive" aria-atomic="true" className="sr-only"></div>

          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
