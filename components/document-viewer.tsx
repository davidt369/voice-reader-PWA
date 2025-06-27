"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"

interface DocumentViewerProps {
  text: string
  currentPage: number
  totalPages: number
  onNextPage: () => void
  onPrevPage: () => void
  onGoToPage: (page: number) => void
  highlightStartIndex?: number | null
  highlightEndIndex?: number | null
  currentWordIndex?: number | null // Nueva prop para el puntero de palabra
}

export function DocumentViewer({
  text,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
  onGoToPage,
  highlightStartIndex = null,
  highlightEndIndex = null,
  currentWordIndex = null, // Nueva prop
}: DocumentViewerProps) {
  const [pageInput, setPageInput] = React.useState(currentPage.toString())
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setPageInput(currentPage.toString())
  }, [currentPage])

  // Scroll to highlighted word or current word pointer
  React.useEffect(() => {
    if (contentRef.current) {
      const targetElement = contentRef.current.querySelector(".current-word, .highlighted-word") as HTMLElement
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [highlightStartIndex, highlightEndIndex, currentWordIndex, text])

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pageNumber = Number.parseInt(pageInput)
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onGoToPage(pageNumber)
    } else {
      setPageInput(currentPage.toString())
    }
  }

  const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length
  const estimatedReadingTime = Math.ceil(wordCount / 200)

  const renderTextWithPointers = () => {
    if (!text) return null

    // Dividir el texto en palabras manteniendo espacios y puntuación
    const words = text.split(/(\s+)/)
    let wordIndex = 0

    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {words.map((segment, segmentIndex) => {
          // Si es un espacio o salto de línea, renderizar tal como está
          if (/^\s+$/.test(segment)) {
            return <span key={segmentIndex}>{segment}</span>
          }

          // Es una palabra
          const currentWordIdx = wordIndex
          wordIndex++

          // Determinar si esta palabra debe ser resaltada
          let className = ""
          let isHighlighted = false
          let isCurrentWord = false

          // Verificar si es la palabra actual (puntero de lectura)
          if (currentWordIndex !== null && currentWordIdx === currentWordIndex) {
            className = "current-word bg-blue-200 dark:bg-blue-800 rounded px-1 py-0.5 font-medium"
            isCurrentWord = true
          }

          // Verificar si está en el rango de highlight (selección)
          if (highlightStartIndex !== null && highlightEndIndex !== null) {
            const segmentStart = text.indexOf(
              segment,
              segmentIndex > 0 ? text.indexOf(words[segmentIndex - 1]) + words[segmentIndex - 1].length : 0,
            )
            const segmentEnd = segmentStart + segment.length

            if (segmentStart >= highlightStartIndex && segmentEnd <= highlightEndIndex) {
              className = "highlighted-word bg-yellow-200 dark:bg-yellow-700 rounded px-1 py-0.5"
              isHighlighted = true
            }
          }

          // Si es tanto palabra actual como highlighted, priorizar el highlight
          if (isHighlighted && isCurrentWord) {
            className =
              "highlighted-word current-word bg-orange-200 dark:bg-orange-700 rounded px-1 py-0.5 font-medium border-2 border-blue-400"
          }

          return (
            <span key={segmentIndex} className={className}>
              {segment}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* Información del documento */}
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="gap-1">
          <FileText className="h-3 w-3" />
          {wordCount} palabras
        </Badge>
        <Badge variant="secondary">~{estimatedReadingTime} min de lectura</Badge>
        {currentWordIndex !== null && (
          <Badge variant="outline" className="gap-1">
            📍 Palabra {currentWordIndex + 1} de {wordCount}
          </Badge>
        )}
      </div>

      {/* Contenido del documento */}
      <div className="w-full">
        <div
          ref={contentRef}
          className="bg-muted/30 p-4 sm:p-6 rounded-lg border overflow-y-auto text-sm leading-relaxed"
          style={{ maxHeight: "70vh" }}
        >
          <div className="max-w-none prose prose-sm dark:prose-invert">{renderTextWithPointers()}</div>
        </div>
      </div>

      {/* Leyenda de colores */}
      {(currentWordIndex !== null || (highlightStartIndex !== null && highlightEndIndex !== null)) && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {currentWordIndex !== null && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded"></div>
              <span>Palabra actual</span>
            </div>
          )}
          {highlightStartIndex !== null && highlightEndIndex !== null && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-700 rounded"></div>
              <span>Texto resaltado</span>
            </div>
          )}
        </div>
      )}

      {/* Controles de navegación para PDFs multipágina */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
            className="gap-2 w-full sm:w-auto bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Página</span>
            <Input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              className="w-16 text-center"
              aria-label="Número de página"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">de {totalPages}</span>
          </form>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage >= totalPages}
            aria-label="Página siguiente"
            className="gap-2 w-full sm:w-auto"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
