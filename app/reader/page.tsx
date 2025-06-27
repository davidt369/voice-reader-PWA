"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Play,
  Mic,
  MicOff,
  Accessibility,
  Headphones,
  FileText,
  Wifi,
  WifiOff,
  Upload,
  File,
  FileSpreadsheet,
  FilePlus,
  Volume2,
  BookOpen,
  Pause,
  Square,
  Info,
} from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { DocumentFallback } from "@/app/document-fallback"
import { VoiceControlsLayout } from "@/components/voice-controls-layout"
import { useScreenReaderStore } from "@/stores/screen-reader-store"
import { useDocumentStore } from "@/stores/document-store"
import { useAppStore } from "@/stores/app-store"
import { useScreenReaderInit } from "@/hooks/use-screen-reader-init"
import { useDocumentProcessor } from "@/hooks/use-document-processor"
import { PDFViewer } from "@/components/pdf-viewer"
import { DocumentGallery } from "@/components/document-gallery"
import { useDocumentReader } from "@/hooks/use-document-reader"
import { useScreenReaderAnnouncements } from "@/hooks/use-screen-reader-announcements"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function ScreenReaderPWA() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Inicializar screen reader
  useScreenReaderInit()

  // Anuncios para lectores de pantalla
  const { announce, announceAction, announceError, announceSuccess } = useScreenReaderAnnouncements()

  // Estados de las stores
  const {
    isPlaying,
    isPaused,
    isListening,
    transcript,
    isSupported,
    speak,
    pause,
    resume,
    stop: stopScreenReader,
    startListening,
    stopListening,
    readPageContent,
    highlightText,
  } = useScreenReaderStore()

  const {
    documentText,
    documentTitle,
    documentType,
    documentPages,
    currentPage,
    isLoading,
    pdfDocument,
    setDocumentTitle,
    setDocumentText,
    setDocumentType,
    setDocumentPages,
    setCurrentPage,
    setPdfDocument,
    isReadingDocument,
    stopReading,
    highlightStartIndex,
    highlightEndIndex,
    currentWordIndex, // Nuevo estado para el puntero de palabra
  } = useDocumentStore()

  const { isOnline, selectedText, customText, activeTab, setIsOnline, setSelectedText, setCustomText, setActiveTab } =
    useAppStore()

  const { loadDocument, nextPage, prevPage, goToPage, MAX_FILE_SIZE_MB, MAX_PDF_PAGES, MAX_WORD_PAGES_ESTIMATE } =
    useDocumentProcessor()

  const { startReadingDocument, currentWordIndex: readerWordIndex } = useDocumentReader()

  // Monitorear estado de conexión con anuncios
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      announceSuccess("Conexión restaurada")
    }
    const handleOffline = () => {
      setIsOnline(false)
      announce("Modo offline activado. Funcionalidad básica disponible", "assertive")
    }

    const initialCheckTimeout = setTimeout(() => {
      setIsOnline(navigator.onLine)
    }, 100)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearTimeout(initialCheckTimeout)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [setIsOnline, announce, announceSuccess])

  // Detectar texto seleccionado con anuncios
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString()
        setSelectedText(selectedText)
        announce(`Texto seleccionado: ${selectedText.substring(0, 50)}${selectedText.length > 50 ? "..." : ""}`)
      }
    }

    document.addEventListener("mouseup", handleSelection)
    document.addEventListener("keyup", handleSelection)

    return () => {
      document.removeEventListener("mouseup", handleSelection)
      document.removeEventListener("keyup", handleSelection)
    }
  }, [setSelectedText, announce])

  // Anunciar cambios de pestaña
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const tabNames = {
      text: "Texto",
      documents: "Documentos",
      library: "Biblioteca",
    }
    announce(`Pestaña ${tabNames[value as keyof typeof tabNames]} seleccionada`)
  }

  const handleSpeakText = (text: string) => {
    if (text.trim()) {
      speak(text)
      highlightText(text)
      announceAction(`Reproduciendo texto de ${text.length} caracteres`)
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      if (isPaused) {
        resume()
        announceAction("Reproducción reanudada")
      } else {
        pause()
        announceAction("Reproducción pausada")
      }
    } else {
      if (customText.trim()) {
        handleSpeakText(customText)
      }
    }
  }

  const handleStop = () => {
    stopScreenReader()
    if (isReadingDocument) {
      stopReading()
    }
    announceAction("Reproducción detenida")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      announceAction(`Cargando documento: ${file.name}`)
      loadDocument(file)
      setActiveTab("documents")
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
    announceAction("Selector de archivos abierto")
  }

  const handleStartListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const loadDocumentFromGallery = (text: string, title: string, type: "pdf" | "docx", pages: number) => {
    setDocumentText(text)
    setDocumentTitle(title)
    setDocumentType(type)
    setDocumentPages(pages)
    setCurrentPage(1)
    setPdfDocument(null)
    stopScreenReader()
    stopReading()
    setActiveTab("documents")
    announceSuccess(`Documento cargado desde biblioteca: ${title}`)
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md" role="alert">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Navegador No Compatible</CardTitle>
            <CardDescription>
              Tu navegador no soporta Web Speech API. Por favor, usa un navegador moderno como Chrome, Firefox o Safari
              para acceder a todas las funcionalidades de lectura de pantalla.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link mejorado */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:p-3 focus:rounded-md focus:shadow-lg"
        onFocus={() => announce("Enlace para saltar al contenido principal enfocado")}
      >
        Saltar al contenido principal
      </a>

      {/* Header con landmarks mejorados */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link className="p-2 bg-primary rounded-lg" aria-hidden="true" href="/">
                <img 
                  src="/placeholder-logo.png" 
                  alt="VoiceReader PWA Logo" 
                  className="h-6 w-6" 
                />
              </Link>
              <div>
                <h1 className="text-xl font-bold">VoiceReader PWA</h1>
                <p className="text-sm text-muted-foreground">Accesibilidad avanzada</p>
              </div>
            </div>

            <div className="flex items-center gap-2" role="group" aria-label="Controles de estado y configuración">
              <Badge
                variant={isOnline ? "default" : "destructive"}
                className="gap-1"
                role="status"
                aria-label={`Estado de conexión: ${isOnline ? "En línea" : "Sin conexión"}`}
              >
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isOnline ? "Online" : "Offline"}
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-4 py-6 space-y-6 max-w-7xl" role="main">
        {/* Controles de reproducción globales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Controles de Reproducción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2" role="group" aria-label="Controles de reproducción">
              <Button
                onClick={handlePlayPause}
                size="lg"
                className="gap-2"
                aria-label={
                  isPlaying ? (isPaused ? "Reanudar reproducción" : "Pausar reproducción") : "Iniciar reproducción"
                }
              >
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

              <Button
                onClick={handleStop}
                disabled={!isPlaying && !isReadingDocument}
                variant="outline"
                size="lg"
                aria-label="Detener reproducción"
              >
                <Square className="h-4 w-4" />
                Detener
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4" role="tablist" aria-label="Secciones principales">
            <TabsTrigger value="text" className="flex items-center gap-2" role="tab">
              <FileText className="h-4 w-4" />
              Texto
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2" role="tab">
              <File className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2" role="tab">
              <BookOpen className="h-4 w-4" />
              Biblioteca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6" role="tabpanel" aria-labelledby="text-tab">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="grid grid-cols-1 md:grid-cols-3 gap-3"
                  role="group"
                  aria-label="Acciones rápidas de lectura"
                >
                  <Button
                    onClick={() => {
                      readPageContent()
                      announceAction("Leyendo contenido completo de la página")
                    }}
                    className="justify-start gap-2"
                    variant="outline"
                    aria-label="Leer todo el contenido de la página actual"
                  >
                    <FileText className="h-4 w-4" />
                    Leer Página Completa
                  </Button>

                  <Button
                    onClick={() => {
                      if (selectedText) {
                        handleSpeakText(selectedText)
                      }
                    }}
                    disabled={!selectedText}
                    className="justify-start gap-2"
                    variant="outline"
                    aria-label={
                      selectedText
                        ? `Leer texto seleccionado: ${selectedText.substring(0, 30)}...`
                        : "No hay texto seleccionado"
                    }
                  >
                    <Headphones className="h-4 w-4" />
                    Leer Selección
                  </Button>

                  <Button
                    onClick={() => handleSpeakText(customText)}
                    className="justify-start gap-2"
                    variant="outline"
                    disabled={!customText.trim()}
                    aria-label="Leer texto personalizado"
                  >
                    <Volume2 className="h-4 w-4" />
                    Leer Texto Personalizado
                  </Button>
                </div>

                {selectedText && (
                  <div className="p-3 bg-muted rounded-lg" role="region" aria-label="Texto seleccionado">
                    <Label className="text-sm font-medium">Texto Seleccionado:</Label>
                    <p className="text-sm mt-1 line-clamp-2">{selectedText}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Controls */}
              <VoiceControlsLayout currentText={customText} onPlayText={handleSpeakText} />

              {/* Text Input & Speech Recognition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Texto y Reconocimiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom Text */}
                  <div className="space-y-2">
                    <Label htmlFor="custom-text">Texto Personalizado</Label>
                    <Textarea
                      id="custom-text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Escribe el texto que quieres escuchar..."
                      className="min-h-[120px]"
                      aria-describedby="custom-text-help"
                    />
                    <p id="custom-text-help" className="text-sm text-muted-foreground">
                      Escribe o pega aquí el texto que deseas que sea leído por el sintetizador de voz
                    </p>
                  </div>

                  {/* Speech Recognition */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Reconocimiento de Voz</Label>
                      <Button
                        onClick={handleStartListening}
                        variant={isListening ? "destructive" : "default"}
                        size="sm"
                        className="gap-2"
                        aria-label={isListening ? "Detener reconocimiento de voz" : "Iniciar reconocimiento de voz"}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {isListening ? "Detener" : "Escuchar"}
                      </Button>
                    </div>

                    {transcript && (
                      <div className="p-3 bg-muted rounded-lg" role="region" aria-label="Texto reconocido">
                        <p className="text-sm">{transcript}</p>
                        <Button
                          onClick={() => {
                            setCustomText(transcript)
                            announceSuccess("Texto reconocido añadido al área de texto personalizado")
                          }}
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          aria-label="Usar texto reconocido como texto personalizado"
                        >
                          Usar como texto
                        </Button>
                      </div>
                    )}
                  </div>

                  {isListening && (
                    <div
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></div>
                      Escuchando...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6" role="tabpanel" aria-labelledby="documents-tab">
            {/* Información de límites */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Límites del sistema:</strong>
                <br />• Tamaño máximo de archivo: <strong>{MAX_FILE_SIZE_MB}MB</strong>
                <br />• PDFs: máximo <strong>{MAX_PDF_PAGES} páginas</strong>
                <br />• Documentos Word: máximo <strong>{MAX_WORD_PAGES_ESTIMATE} páginas estimadas</strong>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePlus className="h-5 w-5" />
                  Cargar Documento
                </CardTitle>
                <CardDescription>
                  Carga archivos PDF o documentos Word (.docx) para leerlos con el sintetizador de voz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    aria-label="Seleccionar archivo de documento"
                  />
                  <Button onClick={triggerFileUpload} className="gap-2 w-full max-w-xs">
                    <Upload className="h-4 w-4" />
                    Seleccionar Archivo
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Formatos soportados: PDF, Word (.docx, .doc)
                    <br />
                    Máximo: {MAX_FILE_SIZE_MB}MB, {MAX_PDF_PAGES} páginas (PDF)
                  </p>
                </div>
              </CardContent>
            </Card>

            {isLoading && (
              <div className="flex justify-center py-8" role="status" aria-live="polite">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
                    aria-hidden="true"
                  ></div>
                  <p className="text-sm text-muted-foreground">Procesando documento...</p>
                </div>
              </div>
            )}

            {documentText && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {documentType === "pdf" ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <FileSpreadsheet className="h-5 w-5" />
                        )}
                        {documentTitle || "Documento"}
                      </CardTitle>
                      {documentPages > 1 && (
                        <CardDescription>
                          Página {currentPage} de {documentPages}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (isReadingDocument) {
                            stopReading()
                            announceAction("Lectura de documento detenida")
                          } else {
                            startReadingDocument()
                            announceAction("Iniciando lectura continua del documento")
                          }
                        }}
                        variant="outline"
                        className="gap-2"
                        aria-label={
                          isReadingDocument ? "Detener lectura del documento" : "Iniciar lectura del documento"
                        }
                      >
                        <Volume2 className="h-4 w-4" />
                        {isReadingDocument ? "Detener Lectura" : "Leer Documento"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documentType === "pdf" && pdfDocument ? (
                      <PDFViewer
                        pdfDocument={pdfDocument}
                        currentPage={currentPage}
                        totalPages={documentPages}
                        onNextPage={nextPage}
                        onPrevPage={prevPage}
                        onGoToPage={goToPage}
                      />
                    ) : (
                      <DocumentViewer
                        text={documentText}
                        currentPage={currentPage}
                        totalPages={documentPages}
                        onNextPage={nextPage}
                        onPrevPage={prevPage}
                        onGoToPage={goToPage}
                        highlightStartIndex={highlightStartIndex}
                        highlightEndIndex={highlightEndIndex}
                        currentWordIndex={currentWordIndex} // Pasar el puntero de palabra
                      />
                    )}
                  </CardContent>
                </Card>

                <VoiceControlsLayout currentText={documentText} onPlayText={handleSpeakText} />
              </div>
            )}

            {!documentText && !isLoading && (
              <DocumentFallback
                onTextExtracted={(text) => {
                  setDocumentTitle("Texto Manual")
                  setDocumentText(text)
                  setDocumentType("docx")
                  setDocumentPages(1)
                  setCurrentPage(1)
                  announceSuccess("Texto manual cargado correctamente")
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="library" className="space-y-6" role="tabpanel" aria-labelledby="library-tab">
            <DocumentGallery onLoadDocument={loadDocumentFromGallery} />
          </TabsContent>
        </Tabs>

        {/* Accessibility Features */}
        <Card>
          <CardHeader>
            <CardTitle>Características de Accesibilidad</CardTitle>
            <CardDescription>
              Esta PWA está optimizada para trabajar con lectores de pantalla nativos como NVDA y VoiceOver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Compatibilidad con Lectores de Pantalla</h4>
                <ul className="text-sm text-muted-foreground space-y-1" role="list">
                  <li>• NVDA (Windows) - Completamente compatible</li>
                  <li>• VoiceOver (macOS/iOS) - Optimizado</li>
                  <li>• JAWS (Windows) - Soporte completo</li>
                  <li>• TalkBack (Android) - Funcionalidad completa</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Funciones PWA Offline</h4>
                <ul className="text-sm text-muted-foreground space-y-1" role="list">
                  <li>• Síntesis de voz local sin conexión</li>
                  <li>• Configuraciones guardadas localmente</li>
                  <li>• Documentos en caché para acceso offline</li>
                  <li>• Interfaz completamente funcional sin internet</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
