<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'
import Configuraciones from './configuraciones.vue'
import { useServerStatus } from '~/composable/useServerStatus'
import { useResource } from '~/composable/useResource'
import { useFormatDate } from '../composable/useFormatDate'

const { logs } = useServerStatus()

const dataLog = ref<any[]>([])
const items = ref<TabsItem[]>([
  { label: 'Servicio', slot: 'state' },
  { label: 'Configuraciones', slot: 'config' }
])

// --- GET LOGS FROM API ---
const GET_LOGS = useResource(`/service/logs?limit=${50}`)

async function getLogs() {
  const { getAll } = GET_LOGS
  dataLog.value = await getAll()
}

watch(logs, (newValue) => {
  dataLog.value.unshift(...newValue)
}, { deep: true })
// --- COLORS AND BADGES BY LEVEL (Sin cambios) ---
const getLogColor = (level?: string) => {
  const lvl = level?.toUpperCase() || 'DEFAULT'

  switch (lvl) {
    case 'INFO':
      return 'text-blue-400'
    case 'WARN':
    case 'WARNING':
      return 'text-yellow-400'
    case 'ERROR':
      return 'text-red-500'
    case 'DEBUG':
      return 'text-purple-400'
    default:
      return 'text-neutral-300'
  }
}

const getLevelBadgeColor = (level?: string) => {
  const lvl = level?.toUpperCase() || 'DEFAULT'
  switch (lvl) {
    case 'INFO':
      return 'bg-blue-600/20 text-blue-300 border-blue-600'
    case 'WARN':
    case 'WARNING':
      return 'bg-yellow-600/20 text-yellow-300 border-yellow-600'
    case 'ERROR':
      return 'bg-red-600/20 text-red-300 border-red-600'
    case 'DEBUG':
      return 'bg-purple-600/20 text-purple-300 border-purple-600'
    default:
      return 'bg-neutral-600/20 text-neutral-300 border-neutral-600'
  }
}

onMounted(async () => {
  await getLogs()
})
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
          <ConfgServer />

          <UCard class="lg:col-span-1 rounded-2xl shadow-xl min-h-100 dark:bg-neutral-700">
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
              >
                <path d="M12 11v6" />
                <path d="M12 7h.01" />
                <path d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10Z" />
              </svg>
              Consola de Logs
            </h2>

            <div
              id="log-console"
              class="dark:bg-neutral-900 bg-neutral-800 p-3 rounded-xl text-xs font-mono border border-gray-700 h-96 overflow-auto custom-scrollbar"
            >
              <div
                v-for="(log, index) in dataLog"
                :key="log.id || index"
                class="py-2"
              >
                <div class="flex items-start space-x-3">
                  <span class="flex-shrink-0 text-neutral-500 min-w-[150px]">{{ useFormatDate(log.createdAt) }}</span>

                  <span
                    :class="[getLevelBadgeColor(log.level), 'px-2 py-0.5 rounded-full text-xs font-bold uppercase flex-shrink-0 border']"
                  >
                    {{ log.level }}
                  </span>

                  <span class="flex-grow dark:text-neutral-200">
                    <span class="text-neutral-400 mr-2">{{ log.service }} →</span>
                    <strong :class="getLogColor(log.level)">{{ log.message }}</strong>
                  </span>
                </div>

                <div
                  v-if="log.metadata"
                  class="ml-[150px] pl-[10px] pt-1 text-neutral-500 text-[10px] italic border-l-2 border-neutral-700"
                >
                  Dirección: {{ log.metadata.direccion }} | Tipo: {{ log.metadata.tipo }}
                </div>

                <hr
                  v-if="index < logs.length - 1"
                  class="border-neutral-700/50 mt-2 mb-0"
                >
              </div>

              <div
                v-if="!logs || logs.length === 0"
                class="text-neutral-500 text-center py-10"
              >
                No hay logs disponibles.
              </div>
            </div>
          </UCard>
        </div>
      </template>

      <template #config>
        <Configuraciones />
      </template>
    </UTabs>
  </ClientOnly>
</template>

<style scoped>
/* Ajustamos el min-width del timestamp para acomodar el nuevo formato más largo */
.log-console .flex-shrink-0.min-w-\[150px\] {
    min-width: 150px;
}

/* Estilos para el scrollbar (opcional, para una apariencia más limpia) */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #27272a;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #52525b;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #71717a;
}
</style>
