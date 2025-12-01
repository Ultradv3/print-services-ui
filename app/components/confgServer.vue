<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import type { AccordionItem, SelectItem } from '@nuxt/ui'
import { useResource } from '~/composable/useResource'
import { useToast } from '#imports'
import { useServiceManager } from '~/composable/usePrintServiceActions'
import { useServerStatus } from '~/composable/useServerStatus'

const toast = useToast()

/* -------------------------------------------------------------------------------------------------
   NUEVO: ESTADO DEL SERVICIO VIA WEBSOCKET (DESDE EL COMPOSABLE)
------------------------------------------------------------------------------------------------- */

const { isConnected, serverStatus } = useServerStatus()

/* -------------------------------------------------------------------------------------------------
   RESTO DE TU CÓDIGO
------------------------------------------------------------------------------------------------- */

export interface ServerConfigResponse {
  ok: boolean
  message: string
  response: ServerConfig[]
}

export interface PrinterConfigResponse {
  ok: boolean
  message: string
  response: Printer[]
}

export interface ServerConfig {
  id: number
  url: string
  port: number
  defaultPrinterId: number
  defaultPrinter?: Printer
}

export interface Printer {
  id: number
  direccion_Nombre: string
  puerto: number
  modeloImpresora: string | null
  tipoId: number
  tipo: PrinterType
}

export interface PrinterType {
  id: number
  tipo: string
}

const modo = ref<number | undefined>()
const check = ref('tabler:edit')
const isDisable = ref(true)

const iconEdit = computed(() => {
  return isDisable.value ? check.value : 'ci:check-big'
})

const _titleButton = ref('Editar Configuración')
const titleButton = computed(() => {
  return isDisable.value ? _titleButton.value : 'Aplicar Cambios'
})

const _colorButton = ref('neutral')
const colorButton = computed(() => {
  return isDisable.value ? _colorButton.value : 'warning'
})

const serverConfig = ref<ServerConfig>({
  id: 0,
  url: '',
  port: 0,
  defaultPrinterId: 0
})

const response = ref<Printer[]>([])
const items: AccordionItem[] = [
  {
    label: 'Configuración',
    icon: 'mynaui:config'
  }
]

const printers = ref<SelectItem[]>([])

const modos = ref<SelectItem[]>([
  { label: 'USB', value: 1 },
  { label: 'Red', value: 2 }
])

let timeoutId: number | undefined

/* --- Watch para animación de "Cambios aplicados" --- */

watch(isDisable, (newValue) => {
  if (!newValue) {
    check.value = 'ci:check-big'
    _titleButton.value = 'Editar Configuración'
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = undefined
    return
  }

  if (newValue) {
    _titleButton.value = 'Cambios Aplicados'
    check.value = 'ci:check-all'
    _colorButton.value = 'success'

    if (timeoutId) clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      check.value = 'tabler:edit'
      _titleButton.value = 'Editar Configuración'
      _colorButton.value = 'neutral'
      timeoutId = undefined
    }, 4000)
  }
})

const emits = defineEmits(['defaultPrinter'])

/* --- Watch impresora seleccionada --- */
watch(
  () => serverConfig.value.defaultPrinterId,
  (newId) => {
    const printer = response.value.find(p => p.id === newId)
    if (printer) modo.value = printer.tipoId
  },
  { immediate: true }
)

/* --- Actualizar configuración --- */

const APPLY_CHANGES = useResource<ServerConfig>('/service/serverConfig')

async function applyChanges() {
  try {
    isDisable.value = !isDisable.value

    if (isDisable.value) {
      serverStatus.value = 'Aplicando Cambios...'

      const { update } = APPLY_CHANGES

      const dataToUpdate = {
        id: serverConfig.value.id,
        url: serverConfig.value.url,
        port: serverConfig.value.port,
        defaultPrinterId: serverConfig.value.defaultPrinterId
      }

      const result = await update(dataToUpdate)

      if (result?.ok) {
        serverStatus.value = 'Conectado (Config. Actualizada)'
      } else {
        serverStatus.value = 'Error al Guardar'
      }
    }
  } catch (error) {
    console.error('Error aplicando cambios:', error)
    serverStatus.value = 'Error al Guardar'
  }
}

/* --- Cargar impresoras --- */

const PRINTERS = useResource<PrinterConfigResponse>('/service/printConfig')

async function getPrinters() {
  const { getAll } = PRINTERS

  try {
    const data = await getAll()
    const responseData = Array.isArray(data) ? data[0] : data

    if (responseData?.ok && responseData?.response?.length > 0) {
      response.value = responseData.response
      printers.value = response.value.map(p => ({
        label: `${p.direccion_Nombre}`,
        value: p.id
      }))
    }
  } catch (error) {
    console.error('Error al cargar impresoras:', error)
  }
}

/* --- Cargar serverConfig --- */

const SERVER_CONFIG = useResource<ServerConfigResponse>('/service/serverConfig')

async function getServerConfig() {
  const { getAll } = SERVER_CONFIG

  try {
    const data = await getAll()
    const responseData = Array.isArray(data) ? data[0] : data

    if (responseData?.ok && responseData?.response?.length > 0) {
      const config = responseData.response[0]
      serverConfig.value = {
        id: config.id,
        url: config.url,
        port: Number(config.port),
        defaultPrinterId: config.defaultPrinterId
      }
      emits('defaultPrinter', config?.defaultPrinter?.direccion_Nombre)
    }
  } catch (error) {
    console.error('Error al cargar configuración del servidor:', error)
  }
}

/* --- Control del servidor (start/restart/stop) --- */

const controlServer = async (action: 'start' | 'restart' | 'stop') => {
  serverStatus.value = `Ejecutando ${action}...`

  const { startService, restartService, stopService } = useServiceManager('Spooler')

  try {
    if (action === 'start') await startService()
    if (action === 'restart') await restartService()
    if (action === 'stop') await stopService()

    await new Promise(resolve => setTimeout(resolve, 1500))
  } catch (error) {
    console.error(`Error durante '${action}':`, error)
    serverStatus.value = 'Error'
  }
}

/* --- MONTADO --- */

onMounted(() => {
  getServerConfig()
  getPrinters()
})
</script>

<template>
  <UCard class="rounded-2xl shadow-xl h-fit dark:bg-neutral-700">
    <template #header>
      <h2
        class="text-xl font-semibold dark:text-neutral-300 mb-4 flex items-center"
      >
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
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
          <path d="M15 8l-6 8" />
        </svg>
        Gestión del Servicio
      </h2>
    </template>

    <div class="space-y-4">
      <div
        class="flex justify-between items-center p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800"
      >
        <span class="text-sm font-medium text-gray-700 dark:text-neutral-400">Estado Actual:</span>
        <span
          id="server-status-indicator"
          :class="[
            'px-3 py-1 text-xs font-bold uppercase rounded-full',
            serverStatus.includes('Conectado') ? 'text-green-600 bg-green-100 dark:bg-green-800/50 dark:text-green-400'
            : serverStatus.includes('Detenido') ? 'text-red-600 bg-red-100 dark:bg-red-800/50 dark:text-red-400'
              : 'text-yellow-600 bg-yellow-100 dark:bg-yellow-800/50 dark:text-yellow-400'
          ]"
        >
          {{ serverStatus }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full justify-center items-center gap-3">
        <UButton
          label="Iniciar"
          color="primary"
          variant="soft"
          icon="solar:play-bold"
          @click="controlServer('start')"
        />
        <UButton
          label="Reiniciar"
          color="secondary"
          variant="soft"
          icon="mdi:reload"
          @click="controlServer('restart')"
        />
        <UButton
          label="Detener"
          color="error"
          variant="soft"
          icon="material-symbols:stop-rounded"
          @click="controlServer('stop')"
        />
      </div>
    </template>
    <div v-if="true">
      <USeparator class="my-4" />
      <UAccordion :items="items">
        <template #body>
          <div class="flex gap-3 items-end">
            <div>
              <UFormField
                label="URL"
                size="sm"
              >
                <UInput
                  v-model="serverConfig.url"
                  :disabled="isDisable"
                />
              </UFormField>
            </div>
            <div>
              <UFormField
                label="Puerto"
                size="sm"
              >
                <UInput
                  v-model.number="serverConfig.port"
                  type="number"
                  :disabled="isDisable"
                />
              </UFormField>
            </div>
            <div>
              <UFormField
                label="Modo"
                size="sm"
              >
                <USelect
                  v-model="modo"
                  :items="modos"
                  :disabled="true"
                  class="w-48"
                />
              </UFormField>
            </div>
            <div>
              <UFormField
                label="Impresora"
                size="sm"
              >
                <USelect
                  v-model="serverConfig.defaultPrinterId"
                  :items="printers"
                  :disabled="isDisable"
                  class="w-48"
                />
              </UFormField>
            </div>
            <div class="">
              <UButton
                :label="titleButton"
                variant="subtle"
                :color="colorButton"
                :icon="iconEdit"
                class="rounded-xl"
                size="sm"
                @click="applyChanges"
              />
            </div>
          </div>
        </template>
      </UAccordion>
    </div>
  </UCard>
</template>

<style scoped>
</style>
