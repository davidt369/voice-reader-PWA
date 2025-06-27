"use client"

import type React from "react"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accessibility,
  Wifi,
  BookOpen,
  MenuIcon,
  FileText,
  Mic,
  Volume2,
  Eye,
  Users,
  GraduationCap,
  Briefcase,
  Heart,
  Zap,
  Shield,
  Smartphone,
  Globe,
  Download,
  Play,
  Settings,
  CheckCircle,
  ArrowRight,
  Languages,
  Clock,
  Target,
  Lightbulb,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button-aria"
import { Menu, MenuItem, MenuTrigger } from "@/components/ui/menu-aria"
import { useState } from "react"

export default function LandingPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus("idle")
    setErrorMessage("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string

    if (!name || !email || !message) {
      setFormStatus("error")
      setErrorMessage("Por favor, rellena todos los campos obligatorios.")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormStatus("error")
      setErrorMessage("Por favor, introduce un correo electrónico válido.")
      return
    }

    try {
      console.log("Form submitted:", { name, email, message })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setFormStatus("success")
      e.currentTarget.reset()
    } catch (error) {
      console.error("Form submission error:", error)
      setFormStatus("error")
      setErrorMessage("Hubo un error al enviar tu mensaje. Inténtalo de nuevo más tarde.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:p-2 focus:rounded-md"
      >
        Saltar al contenido principal
      </a>

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none">
              <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                <img 
                  src="/placeholder-logo.png" 
                  alt="VoiceReader PWA Logo" 
                  className="h-6 w-6 sm:h-8 sm:w-8" 
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">VoiceReader PWA</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Lector de Pantalla Inteligente</p>
              </div>
            </div>

            <nav className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Navigation */}
              <ul className="hidden md:flex items-center gap-4">
                <li>
                  <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#use-cases" className="text-sm font-medium hover:text-primary transition-colors">
                    Casos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">
                    Beneficios
                  </Link>
                </li>
                <li>
                  <Button variant="ghost" asChild>
                    <Link href="/reader" className="text-sm font-medium">
                      Usar Ahora
                    </Link>
                  </Button>
                </li>
              </ul>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <MenuTrigger>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    aria-label="Abrir menú de navegación"
                    className="h-10 w-10 relative z-50"
                  >
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                  <Menu className="w-56 min-w-[200px] bg-background border shadow-lg">
                    <MenuItem href="#features" className="px-4 py-3 hover:bg-accent">
                      <span className="font-medium">Características</span>
                    </MenuItem>
                    <MenuItem href="#use-cases" className="px-4 py-3 hover:bg-accent">
                      <span className="font-medium">Casos de Uso</span>
                    </MenuItem>
                    <MenuItem href="#benefits" className="px-4 py-3 hover:bg-accent">
                      <span className="font-medium">Beneficios</span>
                    </MenuItem>
                    <MenuItem href="/reader" className="px-4 py-3 hover:bg-accent">
                      <span className="font-medium text-primary">Usar Ahora</span>
                    </MenuItem>
                  </Menu>
                </MenuTrigger>
              </div>

              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-grow container mx-auto px-4 py-12 space-y-16 max-w-7xl">
        {/* Hero Section */}
        <section className="text-center space-y-8 py-12 md:py-20">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Tecnología de Vanguardia en Accesibilidad
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              VoiceReader PWA
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
              La aplicación web progresiva más avanzada para síntesis de voz y lectura de documentos. Diseñada para la
              inclusión digital y la accesibilidad universal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button variant="default" size="lg" asChild className="flex-1">
              <Link href="/reader" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Comenzar Gratis
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="flex-1 bg-transparent">
              <Link href="#features" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Explorar Funciones
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Gratuito</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50MB</div>
              <div className="text-sm text-muted-foreground">Archivos Grandes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Páginas PDF</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Offline</div>
              <div className="text-sm text-muted-foreground">Sin Internet</div>
            </div>
          </div>
        </section>

        {/* Funcionalidades Principales */}
        <section id="features" className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">Funcionalidades Avanzadas</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Tecnología de última generación para una experiencia de lectura sin precedentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Síntesis de Voz Avanzada */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Volume2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Síntesis de Voz Avanzada</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      Inteligencia Artificial
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Voces naturales con tecnología neural. Soporte para múltiples idiomas y acentos regionales.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Control de velocidad, tono y volumen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Voces de alta calidad de Microsoft y Google
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Seguimiento palabra por palabra
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Procesamiento de Documentos */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle>Documentos Inteligentes</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      Hasta 3000 Páginas
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Procesamiento avanzado de PDFs y documentos Word con extracción inteligente de texto.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    PDFs hasta 100 páginas y 50MB
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Documentos Word (.docx, .doc)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Vista previa y navegación
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Reconocimiento de Voz */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Mic className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle>Reconocimiento de Voz</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      Tiempo Real
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Convierte tu voz en texto instantáneamente con precisión profesional.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Reconocimiento continuo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Múltiples idiomas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Integración automática
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Accesibilidad Universal */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Accessibility className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>Accesibilidad WCAG 2.1</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      Certificado AA
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Diseñado siguiendo los estándares internacionales de accesibilidad web.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Compatible con NVDA, JAWS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Navegación por teclado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Alto contraste y zoom
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* PWA Offline */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Wifi className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle>Funcionalidad Offline</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      PWA Avanzada
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">Aplicación web progresiva que funciona sin conexión a internet.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Instalable como app nativa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Caché inteligente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Sincronización automática
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Biblioteca Personal */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <CardTitle>Biblioteca Personal</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      Almacenamiento Local
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">Guarda y organiza tus documentos favoritos para acceso rápido.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Almacenamiento ilimitado local
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Vistas previas inteligentes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Gestión de favoritos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Casos de Uso */}
        <section id="use-cases" className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">¿Para Quién es VoiceReader?</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Una herramienta versátil que se adapta a diferentes necesidades y contextos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Estudiantes */}
            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="mb-3">Estudiantes</CardTitle>
              <CardContent className="p-0 space-y-3">
                <p className="text-muted-foreground">
                  Ideal para estudiar libros de texto, artículos académicos y material de investigación.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>Lectura de PDFs académicos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>Multitarea mientras estudias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span>Mejor retención auditiva</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profesionales */}
            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="mb-3">Profesionales</CardTitle>
              <CardContent className="p-0 space-y-3">
                <p className="text-muted-foreground">
                  Perfecto para revisar documentos, informes y presentaciones durante desplazamientos.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>Informes y documentos corporativos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>Productividad en viajes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>Revisión de contratos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personas con Discapacidad Visual */}
            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
              <CardTitle className="mb-3">Accesibilidad Visual</CardTitle>
              <CardContent className="p-0 space-y-3">
                <p className="text-muted-foreground">
                  Herramienta esencial para personas con discapacidad visual o dificultades de lectura.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span>Compatible con lectores de pantalla</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span>Navegación por teclado completa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span>Estándares WCAG 2.1 AA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adultos Mayores */}
            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-orange-500" />
              </div>
              <CardTitle className="mb-3">Adultos Mayores</CardTitle>
              <CardContent className="p-0 space-y-3">
                <p className="text-muted-foreground">
                  Interfaz simple y clara para disfrutar de la lectura sin esfuerzo visual.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span>Interfaz intuitiva y grande</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span>Velocidad ajustable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span>Libros y noticias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personas Ocupadas */}
            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="mb-3">Personas Ocupadas</CardTitle>
              <CardContent className="p-0 space-y-3">
                <p className="text-muted-foreground">
                  Maximiza tu tiempo escuchando mientras realizas otras actividades.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-500" />
                    <span>Multitarea eficiente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-500" />
                    <span>Ejercicio + lectura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-500" />
                    <span>Viajes productivos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educadores */}
            <Card className="text-center p-6">
              <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-indigo-500" />
              </div>
              <CardTitle className="mb-3">Educadores</CardTitle>
              <CardContent className="p-0 space-y-3">
                <p className="text-muted-foreground">
                  Herramienta pedagógica para crear contenido accesible y dinámico.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span>Material educativo accesible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span>Diferentes estilos de aprendizaje</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span>Inclusión educativa</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Beneficios y Aplicaciones */}
        <section id="benefits" className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">¿Por Qué Elegir VoiceReader?</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Ventajas únicas que marcan la diferencia en tu experiencia de lectura
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Beneficios Técnicos */}
            <div className="space-y-6">
              <h4 className="text-2xl font-semibold flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                Ventajas Técnicas
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Zap className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold">Rendimiento Optimizado</h5>
                    <p className="text-sm text-muted-foreground">
                      Procesamiento rápido de documentos grandes con tecnología de chunking inteligente.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold">Privacidad Total</h5>
                    <p className="text-sm text-muted-foreground">
                      Todos los documentos se procesan localmente. Tus datos nunca salen de tu dispositivo.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold">Multiplataforma</h5>
                    <p className="text-sm text-muted-foreground">
                      Funciona en cualquier dispositivo: móvil, tablet, desktop. Una sola aplicación para todo.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <Globe className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold">Sin Instalación</h5>
                    <p className="text-sm text-muted-foreground">
                      Acceso inmediato desde cualquier navegador web moderno. No requiere descargas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficios de Usuario */}
            <div className="space-y-6">
              <h4 className="text-2xl font-semibold flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-primary" />
                Beneficios de Uso
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold">Ahorro de Tiempo</h5>
                    <p className="text-sm text-muted-foreground">
                      Escucha mientras haces ejercicio, cocinas o viajas. Multiplica tu productividad.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold">Descanso Visual</h5>
                    <p className="text-sm text-muted-foreground">
                      Reduce la fatiga ocular y el estrés visual, especialmente útil para largas sesiones de lectura.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Languages className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold">Mejora del Idioma</h5>
                    <p className="text-sm text-muted-foreground">
                      Perfecciona pronunciación y comprensión auditiva con voces nativas de calidad.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold">Inclusión Digital</h5>
                    <p className="text-sm text-muted-foreground">
                      Democratiza el acceso a la información para personas con diferentes capacidades.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Casos de Uso Específicos */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">Aplicaciones Prácticas</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Descubre cómo VoiceReader puede transformar tu día a día
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3">
                  <GraduationCap className="h-6 w-6 text-blue-500" />
                  Educación y Estudio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Estudiantes universitarios:</strong> Lectura de papers académicos y libros de texto
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Oposiciones:</strong> Repaso de temarios mientras realizas otras actividades
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Idiomas:</strong> Mejora de pronunciación y comprensión auditiva
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Investigación:</strong> Revisión rápida de múltiples documentos
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3">
                  <Briefcase className="h-6 w-6 text-green-500" />
                  Ámbito Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Ejecutivos:</strong> Revisión de informes durante desplazamientos
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Abogados:</strong> Análisis de contratos y documentos legales
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Consultores:</strong> Preparación de presentaciones y propuestas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Médicos:</strong> Actualización con literatura médica
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-red-500" />
                  Uso Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Lectura recreativa:</strong> Disfruta de libros mientras haces ejercicio
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Noticias diarias:</strong> Mantente informado durante el commute
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Recetas de cocina:</strong> Escucha instrucciones mientras cocinas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Manuales técnicos:</strong> Aprende mientras trabajas con las manos
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3">
                  <Accessibility className="h-6 w-6 text-purple-500" />
                  Accesibilidad Especializada
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Discapacidad visual:</strong> Acceso completo a documentos digitales
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Dislexia:</strong> Alternativa auditiva para mejorar comprensión
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Fatiga visual:</strong> Descanso para ojos cansados
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Movilidad reducida:</strong> Navegación completamente por voz
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">Especificaciones Técnicas</h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Tecnología de vanguardia para una experiencia superior
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Documentos</CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>PDFs hasta 100 páginas</p>
                <p>Word (.docx, .doc)</p>
                <p>Archivos hasta 50MB</p>
                <p>Extracción inteligente</p>
              </div>
            </Card>

            <Card className="text-center p-6">
              <Volume2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Síntesis de Voz</CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Voces neurales avanzadas</p>
                <p>Múltiples idiomas</p>
                <p>Control total de parámetros</p>
                <p>Seguimiento palabra a palabra</p>
              </div>
            </Card>

            <Card className="text-center p-6">
              <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Compatibilidad</CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Todos los navegadores modernos</p>
                <p>iOS, Android, Windows, macOS</p>
                <p>Responsive design</p>
                <p>PWA instalable</p>
              </div>
            </Card>

            <Card className="text-center p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-lg mb-2">Seguridad</CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Procesamiento local</p>
                <p>Sin envío de datos</p>
                <p>Almacenamiento seguro</p>
                <p>Privacidad total</p>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center space-y-6 py-12 bg-primary/5 rounded-lg">
          <h3 className="text-3xl md:text-4xl font-bold">¿Listo para Transformar tu Experiencia de Lectura?</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Únete a miles de usuarios que ya disfrutan de una forma más inteligente y accesible de consumir contenido.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Button variant="default" size="lg" asChild className="flex-1">
              <Link href="/reader" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Comenzar Ahora
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="flex-1 bg-transparent">
              <Link href="#features" className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Instalar PWA
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            100% gratuito • Sin registro • Funciona offline • Privacidad garantizada
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/placeholder-logo.png" 
                  alt="VoiceReader PWA Logo" 
                  className="h-6 w-6" 
                />
                <span className="font-bold">VoiceReader PWA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La aplicación de síntesis de voz más avanzada y accesible del mercado.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#use-cases" className="hover:text-primary">
                    Casos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="#benefits" className="hover:text-primary">
                    Beneficios
                  </Link>
                </li>
                <li>
                  <Link href="/reader" className="hover:text-primary">
                    Usar Aplicación
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Guía de Usuario
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Accesibilidad
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Licencias
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} VoiceReader PWA. Todos los derechos reservados.</p>
            <p className="mt-2">Hecho con ❤️ para la accesibilidad universal</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
