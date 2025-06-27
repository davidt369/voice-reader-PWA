const CACHE_NAME = "screen-reader-pwa-v11";
const PDFJS_VERSION = "3.11.174";

// URLs esenciales para funcionalidad offline
const urlsToCache = [
  "/",
  "/reader",
  "/manifest.json",
  "/placeholder-logo.png",
  "/_next/static/css/app/layout.css", // CSS crítico
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main.js",
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
        return Promise.resolve();
      }
    }),
  );

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
        return self.clients.claim();
      }),
  );
});

// Fetch event - Estrategia de caché mejorada
self.addEventListener("fetch", (event) => {
  // Solo interceptar requests HTTP/HTTPS
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // Ignorar requests problemáticos
  if (event.request.url.includes("blob:") || 
      event.request.url.includes("chrome-extension") ||
      event.request.method !== "GET") {
    return;
  }

  // Para recursos estáticos de Next.js, usar cache-first
  if (event.request.url.includes("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Para páginas HTML, usar network-first con fallback
  if (event.request.mode === "navigate" || 
      event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback offline page
            return caches.match("/").then((cachedPage) => {
              return cachedPage || new Response(
                `<!DOCTYPE html>
                <html lang="es">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - VoiceReader PWA</title>
                  <style>
                    body { 
                      font-family: system-ui, sans-serif; 
                      padding: 2rem; 
                      text-align: center; 
                      background: #f5f5f5;
                      margin: 0;
                    }
                    .offline-message { 
                      max-width: 500px; 
                      margin: 2rem auto; 
                      background: white;
                      padding: 2rem;
                      border-radius: 8px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .icon { font-size: 4rem; margin-bottom: 1rem; }
                    .retry-btn {
                      background: #007bff;
                      color: white;
                      border: none;
                      padding: 0.75rem 1.5rem;
                      border-radius: 4px;
                      cursor: pointer;
                      margin-top: 1rem;
                    }
                  </style>
                </head>
                <body>
                  <div class="offline-message">
                    <div class="icon">📱</div>
                    <h1>Modo Offline</h1>
                    <p>Esta página no está disponible sin conexión.</p>
                    <button class="retry-btn" onclick="window.location.reload()">
                      Reintentar
                    </button>
                  </div>
                </body>
                </html>`,
                { 
                  headers: { 
                    "Content-Type": "text/html; charset=utf-8" 
                  } 
                }
              );
            });
          });
        })
    );
    return;
  }

  // Para otros recursos, usar cache-first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache).catch((error) => {
            console.warn("Service Worker: Error al cachear:", error);
          });
        });

        return response;
      }).catch(() => {
        return new Response("Recurso no disponible offline", {
          status: 503,
          statusText: "Service Unavailable",
        });
      });
    })
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
