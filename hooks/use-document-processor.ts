"use client"

import { useCallback } from "react"
import { useDocumentStore } from "@/stores/document-store"
import { useLoadedDocumentsStore } from "@/stores/loaded-documents-store"
import mammoth from "mammoth"
import { v4 as uuidv4 } from "uuid"

// Configuración de límites
const MAX_FILE_SIZE_MB = 50 // Máximo 50MB
const MAX_PDF_PAGES = 3000 // Máximo 3000 páginas para PDFs
const MAX_WORD_PAGES_ESTIMATE = 50 // Estimación máxima para documentos Word

// Usar una versión estable y conocida de PDF.js
const PDFJS_VERSION = "3.11.174"

// Variable global para PDF.js
let pdfjs: any = null
let pdfjsLoaded = false

// Función para cargar PDF.js de manera segura
const loadPDFJS = async () => {
  if (pdfjsLoaded && pdfjs) {
    return pdfjs
  }

  try {
    if (typeof window !== "undefined" && !pdfjsLoaded) {
      const script = document.createElement("script")
      script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`
      script.async = true

      await new Promise((resolve, reject) => {
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })

      if ((window as any).pdfjsLib) {
        pdfjs = (window as any).pdfjsLib
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`
        pdfjsLoaded = true
        return pdfjs
      }
    }
  } catch (error) {
    console.error("Error loading PDF.js:", error)
    throw new Error("No se pudo cargar el procesador de PDF")
  }

  return null
}

// Función para formatear tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Función para validar archivo
const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tamaño
  const fileSizeInMB = file.size / (1024 * 1024)
  if (fileSizeInMB > MAX_FILE_SIZE_MB) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande (${formatFileSize(file.size)}). El tamaño máximo permitido es ${MAX_FILE_SIZE_MB}MB.`,
    }
  }

  // Validar tipo de archivo
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  const isWord =
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx") ||
    file.name.toLowerCase().endsWith(".doc")

  if (!isPdf && !isWord) {
    return {
      isValid: false,
      error: "Formato de archivo no soportado. Solo se permiten archivos PDF y Word (.docx, .doc).",
    }
  }

  return { isValid: true }
}

// Función para generar icono SVG de PDF
const generatePdfIcon = (): string => {
  const svgContent = `
    <svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="150" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
      <rect x="40" y="30" width="120" height="90" fill="#dc3545" rx="8"/>
      <text x="100" y="65" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">PDF</text>
      <text x="100" y="85" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">Documento</text>
      <circle cx="170" cy="30" r="8" fill="#28a745"/>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svgContent)}`
}

// Función para generar icono SVG de Word
const generateWordIcon = (): string => {
  const svgContent = `
    <svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="150" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
      <rect x="40" y="30" width="120" height="90" fill="#2b579a" rx="8"/>
      <text x="100" y="65" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Word</text>
      <text x="100" y="85" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">Documento</text>
      <circle cx="170" cy="30" r="8" fill="#28a745"/>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svgContent)}`
}

export function useDocumentProcessor() {
  const {
    documentText,
    documentTitle,
    documentType,
    documentPages,
    currentPage,
    isLoading,
    pdfDocument,
    setDocumentText,
    setDocumentTitle,
    setDocumentType,
    setDocumentPages,
    setCurrentPage,
    setIsLoading,
    setPdfDocument,
  } = useDocumentStore()

  const { addDocument } = useLoadedDocumentsStore()

  const generatePdfThumbnail = useCallback(async (file: File): Promise<string> => {
    let canvas: HTMLCanvasElement | null = null;
    let renderTask: any = null;
    let pdf: any = null;

    try {
      const pdfjsLib = await loadPDFJS()
      if (!pdfjsLib) {
        console.warn("PDF.js not loaded for thumbnail generation, using default icon.")
        return generatePdfIcon()
      }

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      pdf = await loadingTask.promise
      const page = await pdf.getPage(1)

      const viewport = page.getViewport({ scale: 0.5 })
      
      // Create a new canvas
      canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      if (!context) {
        console.warn("Could not get canvas context, using default PDF icon.")
        return generatePdfIcon()
      }

      canvas.height = viewport.height
      canvas.width = viewport.width

      // Create and wait for render task
      renderTask = page.render({
        canvasContext: context,
        viewport,
      })

      await renderTask.promise
      
      const dataURL = canvas.toDataURL("image/png")
      return dataURL
      
    } catch (error) {
      console.error("Error generating PDF thumbnail:", error)
      return generatePdfIcon()
    } finally {
      // Clean up resources
      if (renderTask) {
        try {
          renderTask.cancel()
        } catch (e) {
          console.warn('Error canceling render task:', e)
        }
      }
      
      if (canvas) {
        // Clear the canvas
        const context = canvas.getContext('2d')
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height)
        }
        canvas.width = 0
        canvas.height = 0
      }
      
      if (pdf) {
        try {
          pdf.destroy()
        } catch (e) {
          console.warn('Error destroying PDF document:', e)
        }
      }
    }
  }, [])

  const loadDocument = useCallback(
    async (file: File, initialPage: number = 1) => {
      // Validar archivo antes de procesarlo
      const validation = validateFile(file)
      if (!validation.isValid) {
        setDocumentText(`Error de validación: ${validation.error}`)
        setDocumentTitle("Error de validación")
        setDocumentType(null)
        setDocumentPages(0)
        setCurrentPage(1)
        setPdfDocument(null)
        return
      }

      setIsLoading(true)
      setDocumentTitle(file.name)
      setDocumentText("")

      let extractedText = ""
      let docType: "pdf" | "docx" | null = null
      let totalPages = 0
      let previewUrl = ""
      let currentPdfDoc = null

      try {
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
          docType = "pdf"
          const pdfjsLib = await loadPDFJS()
          if (!pdfjsLib) {
            throw new Error("No se pudo cargar el procesador de PDF. Intenta recargar la página.")
          }

          const arrayBuffer = await file.arrayBuffer()
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
          const pdf = await loadingTask.promise

          currentPdfDoc = pdf
          totalPages = pdf.numPages

          // Validar número de páginas
          if (totalPages > MAX_PDF_PAGES) {
            // Limpiar recursos antes del error
            pdf.destroy()
            throw new Error(
              `El PDF tiene demasiadas páginas (${totalPages}). El máximo permitido es ${MAX_PDF_PAGES} páginas. Por favor, divide el documento en archivos más pequeños.`,
            )
          }

          // Validar y ajustar initialPage
          if (initialPage < 1) initialPage = 1
          if (initialPage > totalPages) initialPage = totalPages

          // Cargar solo la página inicial seleccionada
          try {
            const page = await pdf.getPage(initialPage)
            const textContent = await page.getTextContent()

            let pageText = ""
            let lastY = null

            for (const item of textContent.items) {
              if (item.str) {
                if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
                  pageText += "\n"
                }
                pageText += item.str + " "
                lastY = item.transform[5]
              }
            }
            extractedText = pageText.trim()
            
            if (!extractedText) {
              extractedText = "No se pudo extraer texto de la página seleccionada."
            }

            setCurrentPage(initialPage)
          } catch (pageError) {
            console.error(`Error procesando página ${initialPage}:`, pageError)
            extractedText = `Error al procesar la página ${initialPage}`
          }

          previewUrl = await generatePdfThumbnail(file)
        } else if (
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.toLowerCase().endsWith(".docx") ||
          file.name.toLowerCase().endsWith(".doc")
        ) {
          docType = "docx"
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })

          extractedText = result.value.trim()
          if (!extractedText) {
            throw new Error("No se pudo extraer texto del documento Word.")
          }

          // Estimar páginas basado en caracteres (aproximadamente 2000 caracteres por página)
          const estimatedPages = Math.ceil(extractedText.length / 2000)
          if (estimatedPages > MAX_WORD_PAGES_ESTIMATE) {
            throw new Error(
              `El documento Word es demasiado largo (aproximadamente ${estimatedPages} páginas). El máximo recomendado es ${MAX_WORD_PAGES_ESTIMATE} páginas.`,
            )
          }

          totalPages = 1
          previewUrl = generateWordIcon()
        } else {
          throw new Error("Formato de archivo no soportado. Por favor, usa archivos PDF o Word (.docx, .doc)")
        }

        setDocumentText(extractedText)
        setDocumentType(docType)
        setDocumentPages(totalPages)
        setCurrentPage(1)
        setPdfDocument(currentPdfDoc)

        // Add to loaded documents store
        addDocument({
          id: uuidv4(),
          name: file.name,
          type: docType,
          previewUrl: previewUrl,
          extractedText: extractedText,
          totalPages: totalPages,
        })

        console.log(
          `Document loaded successfully: ${file.name}, pages: ${totalPages}, text length: ${extractedText.length}, size: ${formatFileSize(file.size)}`,
        )
      } catch (error) {
        console.error("Error al procesar el documento:", error)
        const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar el documento"
        setDocumentText(
          `Error: ${errorMessage}\n\nPor favor, intenta con otro archivo o usa la opción de entrada manual de texto.`,
        )
        setDocumentTitle("Error al cargar")
        setDocumentType(null)
        setDocumentPages(0)
        setCurrentPage(1)
        setPdfDocument(null)
      } finally {
        setIsLoading(false)
      }
    },
    [
      setIsLoading,
      setDocumentTitle,
      setDocumentText,
      setDocumentType,
      setDocumentPages,
      setCurrentPage,
      setPdfDocument,
      addDocument,
      generatePdfThumbnail,
    ],
  )

  const loadPdfPage = useCallback(
    async (pageNumber: number): Promise<string> => {
      if (!pdfDocument || pageNumber < 1 || pageNumber > documentPages) {
        console.warn(`Attempted to load invalid page: ${pageNumber}. Total pages: ${documentPages}`)
        return ""
      }

      try {
        const page = await pdfDocument.getPage(pageNumber)
        const textContent = await page.getTextContent()

        let text = ""
        let lastY = null

        for (const item of textContent.items) {
          if (item.str) {
            if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
              text += "\n"
            }
            text += item.str + " "
            lastY = item.transform[5]
          }
        }
        const cleanText = text.trim()
        console.log(`Loaded page ${pageNumber}. Text length: ${cleanText.length}`)
        return cleanText
      } catch (error) {
        console.error(`Error al cargar la página ${pageNumber}:`, error)
        return `Error al cargar la página ${pageNumber}`
      }
    },
    [pdfDocument, documentPages],
  )

  const nextPage = useCallback(async () => {
    if (currentPage < documentPages && documentType === "pdf") {
      const nextPageNum = currentPage + 1
      setCurrentPage(nextPageNum)
      const text = await loadPdfPage(nextPageNum)
      setDocumentText(text)
    }
  }, [currentPage, documentPages, documentType, setCurrentPage, loadPdfPage, setDocumentText])

  const prevPage = useCallback(async () => {
    if (currentPage > 1 && documentType === "pdf") {
      const prevPageNum = currentPage - 1
      setCurrentPage(prevPageNum)
      const text = await loadPdfPage(prevPageNum)
      setDocumentText(text)
    }
  }, [currentPage, documentType, setCurrentPage, loadPdfPage, setDocumentText])

  const goToPage = useCallback(
    async (page: number) => {
      if (page >= 1 && page <= documentPages && documentType === "pdf") {
        setCurrentPage(page)
        const text = await loadPdfPage(page)
        setDocumentText(text)
      }
    },
    [documentPages, documentType, setCurrentPage, loadPdfPage, setDocumentText],
  )

  return {
    documentText,
    documentTitle,
    documentType,
    documentPages,
    currentPage,
    isLoading,
    pdfDocument,
    loadDocument,
    nextPage,
    prevPage,
    goToPage,
    setDocumentTitle,
    setDocumentText,
    setDocumentType,
    setDocumentPages,
    setCurrentPage,
    loadPdfPage,
    // Exportar constantes de validación para mostrar en la UI
    MAX_FILE_SIZE_MB,
    MAX_PDF_PAGES,
    MAX_WORD_PAGES_ESTIMATE,
  }
}
