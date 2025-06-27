"use client"

import { useEffect, useCallback } from "react"
import { useScreenReaderStore } from "@/stores/screen-reader-store"
import { useDocumentStore } from "@/stores/document-store"
import { useDocumentProcessor } from "@/hooks/use-document-processor"

export function useDocumentReader() {
  const { speak, stop: stopScreenReader, isPlaying, isPaused } = useScreenReaderStore()
  const {
    documentText,
    documentType,
    documentPages,
    currentPage,
    pdfDocument,
    isLoading,
    setDocumentText,
    setCurrentPage,
    setIsLoading,
    isReadingDocument,
    currentReadingPageIndex,
    currentReadingChunkIndex,
    pageTextChunks,
    startReading,
    stopReading,
    setPageTextChunks,
    nextChunk,
    resetReadingProgress,
    setHighlightRange,
    currentWordIndex, // Nuevo estado
    setCurrentWordIndex, // Nueva acción
  } = useDocumentStore()

  const { loadPdfPage } = useDocumentProcessor()

  // Helper para dividir texto en palabras y chunks
  const chunkText = useCallback((text: string): Array<{ text: string; globalStartIndex: number }> => {
    const maxLength = 500
    const chunks: Array<{ text: string; globalStartIndex: number }> = []
    let currentGlobalIndex = 0

    while (currentGlobalIndex < text.length) {
      const endOfChunkCandidate = Math.min(currentGlobalIndex + maxLength, text.length)
      const chunkContent = text.substring(currentGlobalIndex, endOfChunkCandidate)

      let breakIndex = -1
      for (let i = chunkContent.length - 1; i >= 0; i--) {
        if (/\s|[.,!?;:()[\]{}<>"']/.test(chunkContent[i])) {
          breakIndex = i
          break
        }
      }

      let actualEndOfChunk
      if (breakIndex !== -1 && currentGlobalIndex + breakIndex > currentGlobalIndex + maxLength * 0.7) {
        actualEndOfChunk = currentGlobalIndex + breakIndex + 1
      } else {
        actualEndOfChunk = endOfChunkCandidate
      }

      const finalChunkText = text.substring(currentGlobalIndex, actualEndOfChunk).trim()
      if (finalChunkText.length > 0) {
        chunks.push({ text: finalChunkText, globalStartIndex: currentGlobalIndex })
      }

      currentGlobalIndex = actualEndOfChunk
      while (currentGlobalIndex < text.length && /\s/.test(text[currentGlobalIndex])) {
        currentGlobalIndex++
      }
    }
    console.log(`[useDocumentReader] Chunked text into ${chunks.length} chunks.`)
    return chunks
  }, [])

  // Función para convertir índice de carácter a índice de palabra
  const getWordIndexFromCharIndex = useCallback((charIndex: number, text: string): number => {
    if (charIndex <= 0) return 0

    const textUpToIndex = text.substring(0, charIndex)
    const words = textUpToIndex.split(/\s+/).filter((word) => word.length > 0)
    return Math.max(0, words.length - 1)
  }, [])

  // Callback cuando termina una utterance
  const handleUtteranceEnd = useCallback(async () => {
    console.log("[useDocumentReader] handleUtteranceEnd called.")
    if (!isReadingDocument) {
      setHighlightRange(null, null)
      setCurrentWordIndex(null) // Clear word pointer
      return
    }

    if (currentReadingChunkIndex + 1 < pageTextChunks.length) {
      console.log("[useDocumentReader] Advancing to next chunk on current page.")
      nextChunk()
    } else {
      console.log("[useDocumentReader] No more chunks in document. Finished reading.")
      stopReading()
      stopScreenReader()
      setIsLoading(false)
      setHighlightRange(null, null)
      setCurrentWordIndex(null) // Clear word pointer
    }
  }, [
    isReadingDocument,
    currentReadingChunkIndex,
    pageTextChunks,
    nextChunk,
    stopReading,
    stopScreenReader,
    setIsLoading,
    setHighlightRange,
    setCurrentWordIndex,
  ])

  // Callback para boundaries de palabras (puntero de lectura)
  const handleBoundary = useCallback(
    (charIndexInChunk: number) => {
      if (!isReadingDocument || pageTextChunks.length === 0) {
        setCurrentWordIndex(null)
        return
      }

      const currentChunkData = pageTextChunks[currentReadingChunkIndex]
      if (!currentChunkData) {
        setCurrentWordIndex(null)
        return
      }

      const globalCharIndex = currentChunkData.globalStartIndex + charIndexInChunk
      const wordIndex = getWordIndexFromCharIndex(globalCharIndex, documentText)

      console.log(`[useDocumentReader] Word boundary: char ${globalCharIndex} -> word ${wordIndex}`)
      setCurrentWordIndex(wordIndex)

      // También mantener el highlight para compatibilidad
      const fullText = documentText
      let globalWordEndIndex = globalCharIndex
      while (globalWordEndIndex < fullText.length && !/\s|[.,!?;:()[\]{}<>"']/.test(fullText[globalWordEndIndex])) {
        globalWordEndIndex++
      }

      if (globalCharIndex !== globalWordEndIndex) {
        setHighlightRange(globalCharIndex, globalWordEndIndex)
      }
    },
    [
      isReadingDocument,
      pageTextChunks,
      currentReadingChunkIndex,
      documentText,
      setCurrentWordIndex,
      setHighlightRange,
      getWordIndexFromCharIndex,
    ],
  )

  // Función para leer el chunk actual
  const readCurrentChunk = useCallback(() => {
    if (isReadingDocument && pageTextChunks.length > 0 && currentReadingChunkIndex < pageTextChunks.length) {
      const textToSpeak = pageTextChunks[currentReadingChunkIndex].text
      console.log(`[useDocumentReader] Speaking chunk ${currentReadingChunkIndex + 1}/${pageTextChunks.length}`)
      speak(textToSpeak, handleUtteranceEnd, handleBoundary)
    } else if (isReadingDocument) {
      console.log("[useDocumentReader] No more chunks, attempting to advance.")
      handleUtteranceEnd()
    }
  }, [isReadingDocument, pageTextChunks, currentReadingChunkIndex, speak, handleUtteranceEnd, handleBoundary])

  // Effect para iniciar lectura
  useEffect(() => {
    if (isReadingDocument && !isPaused) {
      if (pageTextChunks.length > 0 && currentReadingChunkIndex < pageTextChunks.length) {
        readCurrentChunk()
      } else if (documentText.trim().length > 0) {
        console.log("[useDocumentReader] Initial chunking.")
        setHighlightRange(null, null)
        setCurrentWordIndex(null)
        setPageTextChunks(chunkText(documentText))
      } else {
        console.log("[useDocumentReader] No text to read.")
        stopReading()
        stopScreenReader()
        setHighlightRange(null, null)
        setCurrentWordIndex(null)
      }
    } else if (!isReadingDocument) {
      setHighlightRange(null, null)
      setCurrentWordIndex(null)
    }
  }, [
    isReadingDocument,
    isPaused,
    pageTextChunks,
    currentReadingChunkIndex,
    documentText,
    readCurrentChunk,
    setPageTextChunks,
    chunkText,
    stopReading,
    stopScreenReader,
    setHighlightRange,
    setCurrentWordIndex,
  ])

  // Función para iniciar lectura del documento
  const startReadingDocument = useCallback(() => {
    console.log("[useDocumentReader] startReadingDocument called.")
    if (documentText.trim()) {
      stopScreenReader()
      resetReadingProgress()
      startReading()
      setCurrentPage(1)
      setHighlightRange(null, null)
      setCurrentWordIndex(null)
    } else {
      console.warn("[useDocumentReader] No document text to read.")
    }
  }, [
    documentText,
    startReading,
    resetReadingProgress,
    stopScreenReader,
    setCurrentPage,
    setHighlightRange,
    setCurrentWordIndex,
  ])

  // Detener lectura si el screen reader se detiene externamente
  useEffect(() => {
    if (!isPlaying && isReadingDocument && !isPaused) {
      stopReading()
      setHighlightRange(null, null)
      setCurrentWordIndex(null)
      console.log("[useDocumentReader] Continuous document reading stopped externally.")
    }
  }, [isPlaying, isReadingDocument, isPaused, stopReading, setHighlightRange, setCurrentWordIndex])

  return {
    startReadingDocument,
    isReadingDocument,
    stopReadingDocument: stopReading,
    currentWordIndex, // Exportar para uso en componentes
  }
}
