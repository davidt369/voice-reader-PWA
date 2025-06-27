"use client"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Volume2, Info, BookOpen, FileText, FileSpreadsheet } from "lucide-react"
import { useLoadedDocumentsStore, type LoadedDocument } from "@/stores/loaded-documents-store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface DocumentGalleryProps {
  onLoadDocument: (text: string, title: string, type: "pdf" | "docx", pages: number) => void
}

export function DocumentGallery({ onLoadDocument }: DocumentGalleryProps) {
  const { documents, removeDocument, clearDocuments } = useLoadedDocumentsStore()
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleReadDocument = (doc: LoadedDocument) => {
    // When loading from gallery, we only have the extracted text.
    // The full PDF document object (for visual rendering) is not persisted due to size/serialization limits.
    // If the user needs to view the PDF visually, they must re-upload the original file.
    onLoadDocument(doc.extractedText, doc.name, doc.type, doc.totalPages)
  }

  const handleImageError = (docId: string) => {
    setImageErrors((prev) => new Set(prev).add(docId))
  }

  const getDocumentIcon = (doc: LoadedDocument) => {
    if (doc.type === "pdf") {
      return <FileText className="h-16 w-16 text-red-500" />
    } else {
      return <FileSpreadsheet className="h-16 w-16 text-blue-600" />
    }
  }

  const shouldShowIcon = (doc: LoadedDocument) => {
    return imageErrors.has(doc.id) || !doc.previewUrl || doc.previewUrl.includes("data:image/svg+xml")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mis Documentos Guardados
          </CardTitle>
          <CardDescription>
            Aquí puedes ver y leer los documentos que has cargado previamente.
            <br />
            <span className="text-sm text-orange-500">
              Nota: Para ver PDFs visualmente, deberás volver a cargar el archivo original.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Aún no tienes documentos guardados. Carga un archivo PDF o Word en la pestaña "Documentos" para empezar.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="flex flex-col">
                  <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-muted/50 flex items-center justify-center">
                    {shouldShowIcon(doc) ? (
                      <div className="flex flex-col items-center gap-2">
                        {getDocumentIcon(doc)}
                        <span className="text-xs text-muted-foreground font-medium">
                          {doc.type === "pdf" ? "Documento PDF" : "Documento Word"}
                        </span>
                      </div>
                    ) : (
                      <Image
                        src={doc.previewUrl || "/placeholder.svg"}
                        alt={`Vista previa de ${doc.name}`}
                        width={200}
                        height={150}
                        className="object-contain max-h-full max-w-full"
                        onError={() => handleImageError(doc.id)}
                        onLoad={() => {
                          // Remove from error set if image loads successfully
                          setImageErrors((prev) => {
                            const newSet = new Set(prev)
                            newSet.delete(doc.id)
                            return newSet
                          })
                        }}
                      />
                    )}
                  </div>
                  <CardContent className="flex-grow p-4 space-y-2">
                    <h3 className="font-semibold text-base line-clamp-2" title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {doc.type === "pdf" ? `PDF - ${doc.totalPages} páginas` : "Documento Word"}
                      </p>
                      {doc.type === "pdf" ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleReadDocument(doc)}
                        size="sm"
                        className="gap-1 flex-grow"
                        aria-label={`Leer ${doc.name}`}
                      >
                        <Volume2 className="h-4 w-4" />
                        Leer
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="gap-1" aria-label={`Eliminar ${doc.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará el documento &quot;{doc.name}&quot; de tu biblioteca. No podrás
                              deshacer esta acción.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeDocument(doc.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardContent className="p-4 flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Trash2 className="h-4 w-4" />
                  Limpiar Biblioteca
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro de limpiar la biblioteca?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esto eliminará TODOS los documentos de tu biblioteca. No podrás deshacer esta acción.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={clearDocuments}>Limpiar Todo</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
