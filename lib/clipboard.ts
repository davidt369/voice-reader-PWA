/**
 * Función segura para copiar texto al portapapeles que funciona en todos los navegadores
 * @param text El texto a copiar
 * @returns Promise que resuelve a true si se copió exitosamente, false si no
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Si no hay texto que copiar, retornar false
  if (!text) return false;

  try {
    // Intentar usar la API moderna de Clipboard
    if (navigator.clipboard) {
      // Verificar si necesitamos permisos (solo en contextos seguros)
      if (window.isSecureContext) {
        try {
          // Intentar copiar directamente
          await navigator.clipboard.writeText(text);
          return true;
        } catch (permissionError) {
          // Si falla, podría ser por falta de permisos
          try {
            // Solicitar permisos explícitamente
            const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
            if (permission.state === 'granted' || permission.state === 'prompt') {
              await navigator.clipboard.writeText(text);
              return true;
            }
          } catch (permError) {
            // Si falla la solicitud de permisos, continuar con el fallback
            console.debug('Fallback: Permisos de clipboard no disponibles');
          }
        }
      }
    }

    // Fallback mejorado para navegadores más antiguos o contextos no seguros
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Hacer el elemento invisible pero accesible
    textArea.style.cssText = 'position:fixed;pointer-events:none;opacity:0;';
    
    // Mantener el scroll position
    const scrollPos = {
      top: window.pageYOffset || document.documentElement.scrollTop,
      left: window.pageXOffset || document.documentElement.scrollLeft,
    };
    
    document.body.appendChild(textArea);
    
    // En iOS necesitamos un rango de selección específico
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
    }

    try {
      // Intentar copiar con el comando del sistema
      const success = document.execCommand('copy');
      textArea.remove();
      
      // Restaurar scroll position
      window.scrollTo(scrollPos.left, scrollPos.top);
      
      return success;
    } catch (err) {
      console.debug('Fallback: execCommand falló', err);
      textArea.remove();
      // Restaurar scroll position
      window.scrollTo(scrollPos.left, scrollPos.top);
      return false;
    }
  } catch (err) {
    console.warn('Error al copiar al portapapeles:', err);
    return false;
  }
}

/**
 * Hook personalizado para manejar el copiado al portapapeles de manera segura
 * @param text El texto a copiar
 * @param onSuccess Callback opcional cuando el copiado es exitoso
 * @param onError Callback opcional cuando hay un error
 */
import { useState, useEffect, useCallback } from 'react';

export interface CopyToClipboardState {
  error: Error | null;
  copied: boolean;
  isSupported: boolean;
}

export function useCopyToClipboard(
  text: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const [state, setState] = useState<CopyToClipboardState>({
    error: null,
    copied: false,
    isSupported: true
  });

  // Verificar soporte al montar el componente
  useEffect(() => {
    const checkSupport = async () => {
      try {
        if (!navigator.clipboard && !document.execCommand) {
          setState(prev => ({ ...prev, isSupported: false }));
        }
      } catch (err) {
        console.warn('Error checking clipboard support:', err);
      }
    };
    checkSupport();
  }, []);

  const resetCopiedState = useCallback(() => {
    if (state.copied) {
      setState(prev => ({ ...prev, copied: false, error: null }));
    }
  }, [state.copied]);

  // Limpiar el estado copied después de 2 segundos
  useEffect(() => {
    if (state.copied) {
      const timer = setTimeout(resetCopiedState, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.copied, resetCopiedState]);

  const copy = useCallback(async () => {
    if (!state.isSupported) {
      const error = new Error('Copying to clipboard is not supported in this browser');
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    try {
      const success = await copyToClipboard(text);
      if (success) {
        setState(prev => ({ ...prev, copied: true, error: null }));
        onSuccess?.();
      } else {
        const error = new Error('Failed to copy text to clipboard');
        setState(prev => ({ ...prev, error, copied: false }));
        onError?.(error);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error copying to clipboard');
      setState(prev => ({ ...prev, error, copied: false }));
      onError?.(error);
    }
  }, [text, state.isSupported, onSuccess, onError]);

  return { copy, ...state };
}
