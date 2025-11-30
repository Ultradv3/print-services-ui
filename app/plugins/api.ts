// plugins/api.ts

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  let mainBaseURL: string = config.public.apiBase // ⬅️ Usamos el valor de runtimeConfig como fallback en SSR
  const printBaseURL: string = config.public.printApiBase // ⬅️ Usamos el valor de runtimeConfig para el servicio de impresión

  if (import.meta.client) {
    // 🛑 Lógica para API PRINCIPAL (REACTIVA):
    // En el cliente, lee localStorage, si está vacío, usa el valor de runtimeConfig
    mainBaseURL = localStorage.getItem('apiUrl') || config.public.apiBase
  } // Provee las URLs base al contexto de Nuxt
  // Nota: printBaseURL se mantiene fijo con el valor de runtimeConfig para todos.

  return {
    provide: {
      // 1. Para el composable useApi (el reactivo)
      apiBaseFallback: mainBaseURL, // 2. Para el composable del servicio de impresión (el fijo)

      printApiBaseUrl: printBaseURL
    }
  }
})
