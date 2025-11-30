<script setup lang="ts">
import { es } from '@nuxt/ui/locale'
import { NuxtPage } from '#components'
import { useElectron } from './composable/useElectron'

onMounted(async () => {
  // 1. Ejecutar la función que guarda la URL en localStorage
  const config = await useElectron()

  if (config) {
    console.log('Configuración de servidor cargada:', config)

    // 2. 🛑 EL CAMBIO ES INSTANTÁNEO EN MEMORIA:
    // No necesitas forzar una recarga. El siguiente composable/componente
    // que llame a useResource/ApiService ya usará la nueva URL.
  }
})
</script>

<template>
  <NuxtLayout>
    <UApp :locale="es">
      <NuxtPage />
    </UApp>
  </NuxtLayout>
</template>
