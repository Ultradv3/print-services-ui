<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import Configuraciones from './configuraciones.vue'

const items = ref<TabsItem[]>([
  {
    label: 'Servicio',
    slot: 'state'
  },
  {
    label: 'Configuraciones',
    slot: 'config'
  }
])
</script>

<template>
  <ClientOnly>
    <UTabs
      color="neutral"
      variant="link"
      :items="items"
      class="w-full"
    >
      <template #state>
        <div class="flex flex-col gap-8 justify-between h-full mt-5">
          <ConfgServer/>
          <UCard class="lg:col-span-1  rounded-2xl shadow-xl min-h-100 dark:bg-neutral-700">
            <h2 class="text-xl font-semibold dark:text-neutral-300 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 mr-2 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ><path d="M12 11v6" /><path d="M12 7h.01" /><path d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10Z" /></svg>
              Consola de Logs
            </h2>
            <div
              id="log-console"
              class="dark:bg-neutral-950 bg-neutral-800 text-green-400 p-3 rounded-xl text-xs font-mono border border-gray-700 h-100"
            >
              [Sistema] Interfaz cargada. Listo para interactuar con la API.
            </div>
          </UCard>
        </div>
      </template>

      <template
        #config
      >
        <Configuraciones />
      </template>
    </UTabs>
  </ClientOnly>
</template>
