"use client"

import { useEffect } from "react"
import { useScreenReaderStore } from "@/stores/screen-reader-store"
import { useScreenReaderAnnouncements } from "@/hooks/use-screen-reader-announcements"

// Configuración de voces en español por región con prioridades mejoradas
const SPANISH_VOICE_PRIORITIES = [
  { lang: "es-ES", region: "España", priority: 1, keywords: ["spanish", "español", "spain", "castilian"] },
  { lang: "es-MX", region: "México", priority: 2, keywords: ["mexico", "mexican", "mexicano"] },
  { lang: "es-AR", region: "Argentina", priority: 3, keywords: ["argentina", "argentino"] },
  { lang: "es-CO", region: "Colombia", priority: 4, keywords: ["colombia", "colombiano"] },
  { lang: "es-CL", region: "Chile", priority: 5, keywords: ["chile", "chileno"] },
  { lang: "es-PE", region: "Perú", priority: 6, keywords: ["peru", "peruano"] },
  { lang: "es-VE", region: "Venezuela", priority: 7, keywords: ["venezuela", "venezolano"] },
  { lang: "es-EC", region: "Ecuador", priority: 8, keywords: ["ecuador", "ecuatoriano"] },
  { lang: "es", region: "Español", priority: 21, keywords: ["spanish", "español"] },
]

function getVoiceRegion(voice: SpeechSynthesisVoice): string {
  const voiceName = voice.name.toLowerCase()
  const voiceLang = voice.lang.toLowerCase()

  // Buscar por código de idioma exacto
  const exactMatch = SPANISH_VOICE_PRIORITIES.find((config) => voiceLang === config.lang.toLowerCase())
  if (exactMatch) return exactMatch.region

  // Buscar por código de idioma base
  const baseMatch = SPANISH_VOICE_PRIORITIES.find((config) => voiceLang.startsWith(config.lang.toLowerCase()))
  if (baseMatch) return baseMatch.region

  // Buscar por palabras clave en el nombre
  for (const config of SPANISH_VOICE_PRIORITIES) {
    if (config.keywords.some((keyword) => voiceName.includes(keyword))) {
      return config.region
    }
  }

  return "Desconocido"
}

function isSpanishVoice(voice: SpeechSynthesisVoice): boolean {
  const voiceName = voice.name.toLowerCase()
  const voiceLang = voice.lang.toLowerCase()

  return (
    voiceLang.startsWith("es") ||
    voiceName.includes("spanish") ||
    voiceName.includes("español") ||
    voiceName.includes("castilian")
  )
}

function sortVoicesByPriority(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices.sort((a, b) => {
    const aIsSpanish = isSpanishVoice(a)
    const bIsSpanish = isSpanishVoice(b)

    // Priorizar voces en español
    if (aIsSpanish && !bIsSpanish) return -1
    if (!aIsSpanish && bIsSpanish) return 1

    // Si ambas son en español, ordenar por prioridad regional
    if (aIsSpanish && bIsSpanish) {
      const aPriority =
        SPANISH_VOICE_PRIORITIES.find((config) => a.lang.toLowerCase().startsWith(config.lang.toLowerCase()))
          ?.priority || 999

      const bPriority =
        SPANISH_VOICE_PRIORITIES.find((config) => b.lang.toLowerCase().startsWith(config.lang.toLowerCase()))
          ?.priority || 999

      return aPriority - bPriority
    }

    // Para voces no españolas, ordenar alfabéticamente
    return a.name.localeCompare(b.name)
  })
}

export function useScreenReaderInit() {
  const {
    setIsSupported,
    setVoices,
    setSelectedVoice,
    selectedVoice,
    voices,
    setRecognitionRef,
    setTranscript,
    setIsListening,
  } = useScreenReaderStore()

  const { announce, announceError } = useScreenReaderAnnouncements()

  useEffect(() => {
    // Verificar soporte del navegador
    const speechSupported = "speechSynthesis" in window
    const recognitionSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window

    setIsSupported(speechSupported)

    if (!speechSupported) {
      announceError("Tu navegador no soporta síntesis de voz. Por favor, usa Chrome, Firefox o Safari.")
      return
    }

    // Cargar voces con reintentos
    let voicesLoadAttempts = 0
    const maxAttempts = 10

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()

      if (availableVoices.length === 0 && voicesLoadAttempts < maxAttempts) {
        voicesLoadAttempts++
        setTimeout(loadVoices, 100)
        return
      }

      if (availableVoices.length === 0) {
        announceError("No se pudieron cargar las voces del sistema")
        return
      }

      // Filtrar solo voces locales (instaladas en el dispositivo) por defecto
      const localVoices = availableVoices.filter((voice) => voice.localService !== false)

      // Si no hay voces locales, usar todas las disponibles como fallback
      const voicesToUse = localVoices.length > 0 ? localVoices : availableVoices

      // Ordenar voces por prioridad
      const sortedVoices = sortVoicesByPriority(voicesToUse)
      setVoices(sortedVoices)

      // Restaurar voz seleccionada o establecer una por defecto
      if (selectedVoice && voicesToUse.length > 0) {
        const savedVoice = voicesToUse.find(
          (voice) => voice.name === selectedVoice.name && voice.lang === selectedVoice.lang,
        )
        if (savedVoice) {
          setSelectedVoice(savedVoice)
          announce(`Voz restaurada: ${savedVoice.name} - ${getVoiceRegion(savedVoice)}`)
          return
        }
      }

      // Buscar la mejor voz en español entre las locales
      if (sortedVoices.length > 0 && !selectedVoice) {
        const spanishVoice = sortedVoices.find((voice) => isSpanishVoice(voice))

        if (spanishVoice) {
          setSelectedVoice(spanishVoice)
          announce(`Voz local seleccionada automáticamente: ${spanishVoice.name} - ${getVoiceRegion(spanishVoice)}`)
        } else {
          setSelectedVoice(sortedVoices[0])
          announce(`Voz local seleccionada: ${sortedVoices[0].name}`)
        }
      }
    }

    // Cargar voces inmediatamente y cuando cambien
    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)

    // Inicializar reconocimiento de voz
    if (recognitionSupported) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "es-ES"
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        announce("Reconocimiento de voz iniciado")
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript)
          announce(`Texto reconocido: ${finalTranscript}`)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)

        let errorMessage = "Error en el reconocimiento de voz"
        switch (event.error) {
          case "no-speech":
            errorMessage = "No se detectó habla"
            break
          case "audio-capture":
            errorMessage = "No se pudo acceder al micrófono"
            break
          case "not-allowed":
            errorMessage = "Permiso de micrófono denegado"
            break
          case "network":
            errorMessage = "Error de red en el reconocimiento de voz"
            break
        }
        announceError(errorMessage)
      }

      recognition.onend = () => {
        setIsListening(false)
        announce("Reconocimiento de voz finalizado")
      }

      setRecognitionRef(recognition)
    } else {
      announce("Reconocimiento de voz no disponible en este navegador")
    }

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  // Anunciar voces disponibles para debugging
  useEffect(() => {
    if (voices.length > 0) {
      const spanishVoices = voices.filter(isSpanishVoice)
      const localVoices = voices.filter((voice) => voice.localService !== false)
      announce(
        `${spanishVoices.length} voces en español disponibles de ${voices.length} voces locales (${localVoices.length} instaladas)`,
      )
    }
  }, [voices, announce])
}
