// types/nuxt-api-plugin.d.ts

declare module '#app' {
  interface NuxtApp {
    // 💡 Valor usado por useApi (el que puede cambiar en runtime)
    $apiBaseFallback: string

    // 💡 Valor usado para el servicio de impresión (el fijo/configurable)
    $printApiBaseUrl: string
  }
}
