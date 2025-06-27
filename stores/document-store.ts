"use client"

import { create } from "zustand"

interface DocumentState {
  documentText: string
  documentTitle: string
  documentType: "pdf" | "docx" | null
  documentPages: number
  currentPage: number
  isLoading: boolean
  pdfDocument: any

  // Estados para lectura continua
  isReadingDocument: boolean
  currentReadingPageIndex: number
  currentReadingChunkIndex: number
  pageTextChunks: Array<{ text: string; globalStartIndex: number }>

  // Estados para highlighting
  highlightStartIndex: number | null
  highlightEndIndex: number | null

  // Nuevo estado para el puntero de palabra
  currentWordIndex: number | null

  // Acciones
  setDocumentText: (text: string) => void
  setDocumentTitle: (title: string) => void
  setDocumentType: (type: "pdf" | "docx" | null) => void
  setDocumentPages: (pages: number) => void
  setCurrentPage: (page: number) => void
  setIsLoading: (loading: boolean) => void
  setPdfDocument: (doc: any) => void
  resetDocument: () => void

  // Acciones para lectura continua
  startReading: () => void
  stopReading: () => void
  setPageTextChunks: (chunks: Array<{ text: string; globalStartIndex: number }>) => void
  nextChunk: () => void
  resetReadingProgress: () => void

  // Acciones para highlighting
  setHighlightRange: (start: number | null, end: number | null) => void

  // Nueva acción para el puntero de palabra
  setCurrentWordIndex: (index: number | null) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documentText: "",
  documentTitle: "",
  documentType: null,
  documentPages: 0,
  currentPage: 1,
  isLoading: false,
  pdfDocument: null,

  // Estados iniciales para lectura continua
  isReadingDocument: false,
  currentReadingPageIndex: 1,
  currentReadingChunkIndex: 0,
  pageTextChunks: [],

  // Estados iniciales para highlighting
  highlightStartIndex: null,
  highlightEndIndex: null,

  // Estado inicial para puntero de palabra
  currentWordIndex: null,

  setDocumentText: (text) => set({ documentText: text }),
  setDocumentTitle: (title) => set({ documentTitle: title }),
  setDocumentType: (type) => set({ documentType: type }),
  setDocumentPages: (pages) => set({ documentPages: pages }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setPdfDocument: (doc) => set({ pdfDocument: doc }),
  resetDocument: () =>
    set({
      documentText: "",
      documentTitle: "",
      documentType: null,
      documentPages: 0,
      currentPage: 1,
      pdfDocument: null,
      isReadingDocument: false,
      currentReadingPageIndex: 1,
      currentReadingChunkIndex: 0,
      pageTextChunks: [],
      highlightStartIndex: null,
      highlightEndIndex: null,
      currentWordIndex: null, // Reset word pointer
    }),

  // Acciones para lectura continua
  startReading: () => set({ isReadingDocument: true }),
  stopReading: () => set({ isReadingDocument: false, currentWordIndex: null }), // Clear word pointer when stopping
  setPageTextChunks: (chunks) => set({ pageTextChunks: chunks, currentReadingChunkIndex: 0 }),
  nextChunk: () => set((state) => ({ currentReadingChunkIndex: state.currentReadingChunkIndex + 1 })),
  resetReadingProgress: () =>
    set({ currentReadingPageIndex: 1, currentReadingChunkIndex: 0, pageTextChunks: [], currentWordIndex: null }),

  // Acciones para highlighting
  setHighlightRange: (start, end) => set({ highlightStartIndex: start, highlightEndIndex: end }),

  // Nueva acción para puntero de palabra
  setCurrentWordIndex: (index) => set({ currentWordIndex: index }),
}))
