"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Settings, Download } from "lucide-react"
import { useScreenReaderStore } from "@/stores/screen-reader-store"
import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VoiceControlsLayoutProps {
  currentText?: string
  onPlayText?: (text: string) => void
}

// Función para obtener la región de una voz
function getVoiceRegion(voice: SpeechSynthesisVoice): string {
  const langRegionMap: { [key: string]: string } = {
    "es-ES": "España",
    "es-MX": "México",
    "es-AR": "Argentina",
    "es-CO": "Colombia",
    "es-CL": "Chile",
    "es-PE": "Perú",
    "es-VE": "Venezuela",
    "es-EC": "Ecuador",
    "es-GT": "Guatemala",
    "es-UY": "Uruguay",
    "es-PY": "Paraguay",
    "es-BO": "Bolivia",
    "es-CR": "Costa Rica",
    "es-DO": "República Dominicana",
    "es-SV": "El Salvador",
    "es-HN": "Honduras",
    "es-NI": "Nicaragua",
    "es-PA": "Panamá",
    "es-PR": "Puerto Rico",
    "es-CU": "Cuba",
    es: "Español",
  }

  // Buscar por código exacto
  if (langRegionMap[voice.lang]) {
    return langRegionMap[voice.lang]
  }

  // Buscar por código base
  const baseLang = voice.lang.split("-")[0]
  if (langRegionMap[baseLang]) {
    return langRegionMap[baseLang]
  }

  // Buscar por palabras clave en el nombre
  const voiceName = voice.name.toLowerCase()
  if (voiceName.includes("mexico") || voiceName.includes("mexican")) return "México"
  if (voiceName.includes("argentina") || voiceName.includes("argentino")) return "Argentina"
  if (voiceName.includes("colombia") || voiceName.includes("colombiano")) return "Colombia"
  if (voiceName.includes("chile") || voiceName.includes("chileno")) return "Chile"
  if (voiceName.includes("peru") || voiceName.includes("peruano")) return "Perú"
  if (voiceName.includes("venezuela") || voiceName.includes("venezolano")) return "Venezuela"
  if (voiceName.includes("ecuador") || voiceName.includes("ecuatoriano")) return "Ecuador"
  if (voiceName.includes("guatemala") || voiceName.includes("guatemalteco")) return "Guatemala"
  if (voiceName.includes("uruguay") || voiceName.includes("uruguayo")) return "Uruguay"
  if (voiceName.includes("paraguay") || voiceName.includes("paraguayo")) return "Paraguay"
  if (voiceName.includes("bolivia") || voiceName.includes("boliviano")) return "Bolivia"
  if (voiceName.includes("costa rica") || voiceName.includes("costarricense")) return "Costa Rica"
  if (voiceName.includes("dominican") || voiceName.includes("dominicano")) return "República Dominicana"
  if (voiceName.includes("salvador") || voiceName.includes("salvadoreño")) return "El Salvador"
  if (voiceName.includes("honduras") || voiceName.includes("hondureño")) return "Honduras"
  if (voiceName.includes("nicaragua") || voiceName.includes("nicaraguense")) return "Nicaragua"
  if (voiceName.includes("panama") || voiceName.includes("panameño")) return "Panamá"
  if (voiceName.includes("puerto rico") || voiceName.includes("puertorriqueño")) return "Puerto Rico"
  if (voiceName.includes("cuba") || voiceName.includes("cubano")) return "Cuba"
  if (voiceName.includes("spanish") || voiceName.includes("español")) return "España"

  return voice.lang || "Desconocido"
}

// Función para verificar si una voz es en español
function isSpanishVoice(voice: SpeechSynthesisVoice): boolean {
  return (
    voice.lang.toLowerCase().startsWith("es") ||
    voice.name.toLowerCase().includes("spanish") ||
    voice.name.toLowerCase().includes("español")
  )
}

// Función para evaluar la calidad de una voz
function getVoiceQuality(voice: SpeechSynthesisVoice): "advanced" | "standard" | "basic" {
  const voiceName = voice.name.toLowerCase()

  // Voces avanzadas conocidas
  const advancedVoices = [
    "helena",
    "sabina",
    "mónica",
    "monica",
    "paulina",
    "jorge",
    "microsoft",
    "google",
    "neural",
    "wavenet",
    "premium",
  ]

  // Voces estándar
  const standardVoices = ["spanish", "español", "castilian"]

  if (advancedVoices.some((advanced) => voiceName.includes(advanced))) {
    return "advanced"
  }

  if (standardVoices.some((standard) => voiceName.includes(standard))) {
    return "standard"
  }

  return "basic"
}

// Función para obtener el emoji de la bandera
function getRegionFlag(region: string): string {
  const flagMap: { [key: string]: string } = {
    España: "🇪🇸",
    México: "🇲🇽",
    Argentina: "🇦🇷",
    Colombia: "🇨🇴",
    Chile: "🇨🇱",
    Perú: "🇵🇪",
    Venezuela: "🇻🇪",
    Ecuador: "🇪🇨",
    Guatemala: "🇬🇹",
    Uruguay: "🇺🇾",
    Paraguay: "🇵🇾",
    "Costa Rica": "🇨🇷",
    "República Dominicana": "🇩🇴",
    "El Salvador": "🇸🇻",
    Honduras: "🇭🇳",
    Nicaragua: "🇳🇮",
    Panamá: "🇵🇦",
    "Puerto Rico": "🇵🇷",
    Cuba: "🇨🇺",
  }
  return flagMap[region] || "🌍"
}

// Función para obtener el emoji de calidad
function getQualityEmoji(quality: "advanced" | "standard" | "basic"): string {
  switch (quality) {
    case "advanced":
      return "⭐"
    case "standard":
      return "🔵"
    case "basic":
      return "⚪"
  }
}

export function VoiceControlsLayout({ currentText, onPlayText }: VoiceControlsLayoutProps) {
  const {
    isPlaying,
    isPaused,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    speak,
    pause,
    resume,
    stop,
    setSelectedVoice,
    setRate,
    setPitch,
    setVolume,
  } = useScreenReaderStore()

  // Estado para controlar si mostrar todas las voces o solo las locales
  const [showAllVoices, setShowAllVoices] = useState(false)

  const handlePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      if (onPlayText && currentText) {
        onPlayText(currentText)
      } else if (currentText) {
        speak(currentText)
      }
    }
  }

  // Filtrar voces según la preferencia del usuario
  const filteredVoices = showAllVoices ? voices : voices.filter((voice) => voice.localService !== false)

  // Agrupar voces por tipo y calidad
  const spanishVoices = filteredVoices
    .filter((voice) => isSpanishVoice(voice))
    .sort((a, b) => {
      const aQuality = getVoiceQuality(a)
      const bQuality = getVoiceQuality(b)
      const qualityOrder = { advanced: 0, standard: 1, basic: 2 }
      return qualityOrder[aQuality] - qualityOrder[bQuality]
    })

  const otherVoices = filteredVoices.filter((voice) => !isSpanishVoice(voice))

  const advancedSpanishVoices = spanishVoices.filter((voice) => getVoiceQuality(voice) === "advanced")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Controles de Voz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información sobre voces avanzadas */}
        {advancedSpanishVoices.length === 0 && (
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <strong>¿Quieres voces más naturales?</strong>
              <br />
              <span className="text-sm">
                • <strong>Windows:</strong> Configuración → Hora e idioma → Voz → Agregar voces (Helena, Sabina)
                <br />• <strong>macOS:</strong> Preferencias → Accesibilidad → Contenido hablado (Mónica, Paulina,
                Jorge)
                <br />• <strong>Android:</strong> Configuración → Accesibilidad → Síntesis de voz de Google
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2">
          <Button onClick={handlePlay} size="lg" className="gap-2" disabled={!currentText}>
            {isPlaying ? (
              isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isPlaying ? (isPaused ? "Reanudar" : "Pausar") : "Reproducir"}
          </Button>

          <Button onClick={stop} disabled={!isPlaying} variant="outline" size="lg">
            <Square className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Voice Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Voz</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="show-all-voices" className="text-xs text-muted-foreground">
                Mostrar todas
              </Label>
              <input
                id="show-all-voices"
                type="checkbox"
                checked={showAllVoices}
                onChange={(e) => setShowAllVoices(e.target.checked)}
                className="w-4 h-4"
              />
            </div>
          </div>

          {selectedVoice && (
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                {getRegionFlag(getVoiceRegion(selectedVoice))} {getVoiceRegion(selectedVoice)}
              </Badge>
              {selectedVoice.localService !== false && (
                <Badge variant="outline" className="text-xs">
                  Local
                </Badge>
              )}
              <Badge variant="outline" className="text-xs gap-1">
                {getQualityEmoji(getVoiceQuality(selectedVoice))}
                {getVoiceQuality(selectedVoice) === "advanced"
                  ? "Avanzada"
                  : getVoiceQuality(selectedVoice) === "standard"
                    ? "Estándar"
                    : "Básica"}
              </Badge>
            </div>
          )}

          <Select
            value={selectedVoice?.name || ""}
            onValueChange={(value) => {
              const voice = voices.find((v) => v.name === value)
              if (voice) setSelectedVoice(voice)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar voz" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] w-[calc(100vw-2rem)] sm:w-auto min-w-[280px]">
              {!showAllVoices && filteredVoices.length < voices.length && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground bg-muted/50">
                  📱 Mostrando solo voces instaladas localmente
                </div>
              )}

              {spanishVoices.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">🇪🇸 Voces en Español</div>
                  {spanishVoices.map((voice) => {
                    const region = getVoiceRegion(voice)
                    const flag = getRegionFlag(region)
                    const quality = getVoiceQuality(voice)
                    const qualityEmoji = getQualityEmoji(quality)
                    const isLocal = voice.localService !== false
                    return (
                      <SelectItem 
                        key={`${voice.name}-${voice.voiceURI}`} 
                        value={voice.name}
                        className="focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 w-full pr-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="shrink-0">{flag}</span>
                            <span className="shrink-0">{qualityEmoji}</span>
                            <span className={cn(
                              "truncate flex-1",
                              quality === "advanced" ? "font-medium" : ""
                            )}>
                              {voice.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 ml-6 sm:ml-auto">
                            <Badge 
                              variant="outline" 
                              className="h-5 text-[10px] px-1 truncate max-w-[100px]"
                            >
                              {region}
                            </Badge>
                            {isLocal && (
                              <Badge 
                                variant="secondary" 
                                className="h-5 text-[10px] px-1 shrink-0"
                              >
                                Local
                              </Badge>
                            )}
                            {quality === "advanced" && (
                              <Badge 
                                variant="default" 
                                className="h-5 text-[10px] px-1 shrink-0"
                              >
                                Avanzada
                              </Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </>
              )}

              {otherVoices.length > 0 && (
                <>
                  {spanishVoices.length > 0 && <Separator className="my-2" />}
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">🌍 Otros Idiomas</div>
                  {otherVoices.map((voice) => {
                    const quality = getVoiceQuality(voice)
                    const qualityEmoji = getQualityEmoji(quality)
                    const isLocal = voice.localService !== false
                    return (
                      <SelectItem key={`${voice.name}-${voice.voiceURI}`} value={voice.name}>
                        <div className="flex items-center gap-2">
                          <span>🌍</span>
                          <span>{qualityEmoji}</span>
                          <span className={quality === "advanced" ? "font-medium" : ""}>{voice.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {voice.lang}
                          </Badge>
                          {isLocal && (
                            <Badge variant="secondary" className="text-xs">
                              Local
                            </Badge>
                          )}
                          {quality === "advanced" && (
                            <Badge variant="default" className="text-xs">
                              Avanzada
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </>
              )}

              {filteredVoices.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No hay voces {showAllVoices ? "disponibles" : "locales instaladas"}
                </div>
              )}
            </SelectContent>
          </Select>

          {!showAllVoices && (
            <p className="text-xs text-muted-foreground">
              💡 Activa "Mostrar todas" para ver voces en línea (requieren conexión)
            </p>
          )}
        </div>

        {/* Configuración optimizada para mejor calidad */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">Configuración Optimizada</div>

          {/* Rate Control */}
          <div className="space-y-2">
            <Label>Velocidad: {rate.toFixed(1)}x</Label>
            <Slider
              value={[rate]}
              onValueChange={(value) => setRate(value[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Recomendado: 0.8-1.2x para mejor comprensión</p>
          </div>

          {/* Pitch Control */}
          <div className="space-y-2">
            <Label>Tono: {pitch.toFixed(1)}</Label>
            <Slider
              value={[pitch]}
              onValueChange={(value) => setPitch(value[0])}
              min={0.8}
              max={1.2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Recomendado: 0.9-1.1 para sonido más natural</p>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <Label>Volumen: {Math.round(volume * 100)}%</Label>
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
