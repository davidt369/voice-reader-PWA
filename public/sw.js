const CACHE_NAME = "screen-reader-pwa-v10";
const PDFJS_VERSION = "3.11.174";

// URLs esenciales para funcionalidad offline
const urlsToCache = [
  "/",
  "/reader",
  "/manifest.json",
  "/placeholder-logo.png",
];

// Recursos opcionales que se cachean si están disponibles
const optionalCache = ["/pdf-icon.png", "/docx-icon.png"];

// Install event - Cachear recursos esenciales
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando...");
  
  // Forzar activación inmediata
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        // Cachear recursos esenciales uno por uno para evitar fallos
        for (const url of urlsToCache) {
          try {
            await cache.add(url);
            console.log(`Service Worker: Cacheado ${url}`);
          } catch (error) {
            console.warn(`Service Worker: No se pudo cachear ${url}:`, error);
          }
        }

        // Intentar cachear recursos opcionales
        for (const url of optionalCache) {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn(`Service Worker: No se pudo cachear recurso opcional: ${url}`);
          }
        }

        console.log("Service Worker: Instalación completada");
        return Promise.resolve();
      } catch (error) {
        console.error("Service Worker: Error durante instalación:", error);
        return Promise.resolve(); // No fallar completamente
      }
    }),
  );

  // Activar inmediatamente el nuevo Service Worker
  self.skipWaiting();
});

// Activate event - Limpiar cachés antiguos
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activando...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Eliminando caché antigua:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("Service Worker: Activado y tomando control");
        // Tomar control de todas las pestañas inmediatamente
        return self.clients.claim();
      }),
  );
});

// Fetch event - Estrategia de caché
self.addEventListener("fetch", (event) => {
  // Solo interceptar requests HTTP/HTTPS
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // Ignorar requests del Service Worker mismo
  if (event.request.url.includes("blob:")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si está en caché, devolverlo
      if (cachedResponse) {
        console.log(`Service Worker: Sirviendo desde caché: ${event.request.url}`);
        return cachedResponse;
      }

      // Si no está en caché, intentar fetch
      return fetch(event.request)
        .then((response) => {
          // Solo cachear respuestas exitosas
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clonar la respuesta para poder usarla y cachearla
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // Cachear dinámicamente recursos útiles
            if (event.request.method === "GET" && !event.request.url.includes("chrome-extension")) {
              cache.put(event.request, responseToCache).catch((error) => {
                console.warn("Service Worker: Error al cachear:", error);
              });
            }
          });

          return response;
        })
        .catch((error) => {
          console.log(`Service Worker: Fetch falló para ${event.request.url}:`, error);
          
          // Si falla el fetch y es una navegación, devolver la página principal
          if (event.request.mode === "navigate") {
            return caches.match("/").then((cachedPage) => {
              return (
                cachedPage ||
                new Response(
                  `<!DOCTYPE html>
                  <html lang="es">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Offline - VoiceReader PWA</title>
                    <style>
                      body { font-family: system-ui, sans-serif; padding: 2rem; text-align: center; }
                      .offline-message { max-width: 500px; margin: 0 auto; }
                      .icon { font-size: 4rem; margin-bottom: 1rem; }
                    </style>
                  </head>
                  <body>
                    <div class="offline-message">
                      <div class="icon">📱</div>
                      <h1>Modo Offline</h1>
                      <p>Esta página no está disponible sin conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.</p>
                      <p>La funcionalidad básica de lectura de pantalla sigue disponible.</p>
                    </div>
                  </body>
                  </html>`,
                  { 
                    headers: { 
                      "Content-Type": "text/html; charset=utf-8" 
                    } 
                  },
                )
              );
            });
          }

          // Para otros recursos, devolver error
          return new Response("Recurso no disponible offline", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
    }),
  );
});

// Message event - Comunicación con la aplicación
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_CACHE_STATUS") {
    caches.keys().then((cacheNames) => {
      event.ports[0].postMessage({
        type: "CACHE_STATUS",
        caches: cacheNames,
        currentCache: CACHE_NAME,
      });
    });
  }
});

// Background sync para funcionalidad futura
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Service Worker: Background sync ejecutado");
  }
});

console.log("Service Worker: Script cargado correctamente");
