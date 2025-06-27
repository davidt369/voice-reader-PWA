"use client"

import { useCallback } from "react"

export function useScreenReaderAnnouncements() {
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const announcementId = priority === "assertive" ? "urgent-announcements" : "announcements"
    const announcementElement = document.getElementById(announcementId)

    if (announcementElement) {
      // Limpiar el contenido anterior
      announcementElement.textContent = ""

      // Añadir el nuevo mensaje después de un breve retraso
      setTimeout(() => {
        announcementElement.textContent = message
      }, 100)

      // Limpiar después de 5 segundos
      setTimeout(() => {
        if (announcementElement.textContent === message) {
          announcementElement.textContent = ""
        }
      }, 5000)
    }
  }, [])

  const announceNavigation = useCallback(
    (location: string) => {
      announce(`Navegando a ${location}`, "polite")
    },
    [announce],
  )

  const announceAction = useCallback(
    (action: string) => {
      announce(action, "polite")
    },
    [announce],
  )

  const announceError = useCallback(
    (error: string) => {
      announce(`Error: ${error}`, "assertive")
    },
    [announce],
  )

  const announceSuccess = useCallback(
    (success: string) => {
      announce(`Éxito: ${success}`, "polite")
    },
    [announce],
  )

  return {
    announce,
    announceNavigation,
    announceAction,
    announceError,
    announceSuccess,
  }
}
