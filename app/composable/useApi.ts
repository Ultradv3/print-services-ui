// composables/useApi.ts (Nuevo archivo)

/**
 * Lee la URL base actual (de localStorage si existe, o del fallback).
 * Esta función es la fuente de verdad reactiva.
 */
export const useApi = () => {
  // Obtenemos los fallbacks que el plugin nos proporciona
  const { $apiBaseFallback } = useNuxtApp()

  // 🛑 Lógica para obtener la URL base actual:
  const getCurrentBaseUrl = () => {
    // 1. Siempre verificar en el lado del cliente
    if (import.meta.client) {
      // 2. Prioridad: localStorage > Fallback de runtimeConfig
      return localStorage.getItem('apiUrl') || $apiBaseFallback
    }
    // En SSR o si no es cliente, usar el fallback
    return $apiBaseFallback
  }

  // Retornamos la URL base actual (string)
  return getCurrentBaseUrl()
}
