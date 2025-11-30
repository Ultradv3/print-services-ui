<script lang="ts" setup>
import { ref } from 'vue'
import type { AccordionItem, SelectItem } from '@nuxt/ui'
import { useResource } from '~/composable/useResource'
import type { PrinterConfigResponse } from '~/components/confgServer.vue'
import { useToast } from '#imports'

export interface Printer {
  id?: number
  direccion_Nombre: string
  puerto: number
  modeloImpresora: string | null
  tipoId: number
  tipo?: PrinterType
}

export interface PrinterType {
  id: number
  tipo: string
}

const isDisable = ref(true)
const DEFATULT_PRINTER = ref('nota')
const printSelect = ref<SelectItem>([])
const loading = ref(false)
const ERROR = ref(false)
const toast = useToast()
const items: AccordionItem[] = [
  {
    label: 'Acciones Rápidas de Impresora',
    icon: 'mynaui:config'
  }
]

const agregarPrinter = ref<Printer>({
  direccion_Nombre: '',
  puerto: 9100,
  modeloImpresora: '',
  tipoId: 2
})
const modos = ref<SelectItem[]>([
  {
    label: 'USB',
    value: 1
  },
  {
    label: 'Red',
    value: 2
  }
])

interface IAccordionItem {
  label: string
  icon: string
  content: {
    Direccion: string
    Puerto: number
    Modelo: string | null
    Tipo: {
      id: number
      tipo: string
    }
  }
}

const test = ref<IAccordionItem[]>([])

const saveChanges = (item) => {
  if (!isDisable.value) {
    console.log('Guardando cambios para:', item.label, item.content)
  }
  isDisable.value = !isDisable.value
}

async function crearPrinter() {
  const URL = '/service/printConfig'

  const { create, isError } = useResource(URL)
  loading.value = true
  ERROR.value = isError.value

  try {
    // const data = await $fetch(URL, {
    //   method: 'POST',
    //   body: agregarPrinter.value
    // })
    const data = await create(agregarPrinter.value)
    // Si llegó aquí, todo salió bien.
    console.log('Datos:', data)
    await getPrinters()
    const message = data?.message || 'Error desconocido'
    toast.add({
      title: 'Agregada',
      description: message,
      color: 'success'
    })
  } catch (error: any) {
    console.error('Error al crear impresora:', error)

    ERROR.value = true
  } finally {
    loading.value = false
  }
}

function defaultValuePrinter() {
  // loading.value = false
  agregarPrinter.value = {
    direccion_Nombre: '',
    puerto: 9100,
    modeloImpresora: '',
    tipoId: 2
  }
}

// function printDefault(value?: string) {
//   DEFATULT_PRINTER.value = value
//   console.log(DEFATULT_PRINTER.value)
// }

// Asumiendo que URL y useResource se manejan correctamente
async function getPrinters(defaultValue?: string) {
  const URL = '/service/printConfig'

  const { getAll } = useResource<PrinterConfigResponse>(URL)

  try {
    const apiResponse = await getAll()

    const printers = apiResponse[0]?.response || []
    printSelect.value = printers.map(printer => ({
      label: printer.direccion_Nombre,
      value: printer.id
    }))
    test.value = printers.map(printer => ({
      label: printer.direccion_Nombre === defaultValue
        ? `${printer.direccion_Nombre} (por defecto)`
        : printer.direccion_Nombre,
      icon: 'material-symbols:print-rounded',
      id: printer.id,
      tipo: printer.tipo,
      content: {
        Direccion: printer.direccion_Nombre,
        Puerto: printer.puerto,
        Modelo: printer.modeloImpresora,
        Tipo: printer.tipo
      }
    }))
  } catch (error) {
    console.error('❌ Error al cargar la configuración de impresoras:', error)

    test.value = []
  }
}

async function deletePrinter(id: number) {
  const { remove } = useResource(`/service/printConfig/${id}`)
  await remove()
  getPrinters()
  toast.add({
    title: 'Eliminada',
    description: 'Impresora eliminada',
    color: 'success'
  })
}
onMounted(async () => {
  await getPrinters()
})
</script>

<template>
  <div class="flex flex-col gap-8 justify-between h-full mt-5">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold dark:text-neutral-300 mb-4 flex items-center">
          <UIcon
            name="material-symbols:print-rounded"
            class="size-7 text-error mr-3"
          />
          Administración de impresoras
        </h2>
      </template>

      <section class="flex flex-col justify-start gap-2">
        <div class="flex justify-end">
          <!-- <UButton
            label="Agregar"
            variant="soft"
            color="neutral"
            icon="material-symbols:print-rounded"
            class="rounded"
          /> -->
          <Modal
            title="Agregar nueva impresora"
            button-title="Agregar"
            icon="material-symbols:print-rounded"
            :is-loading="loading"
            :error="ERROR"
            @cancelar="defaultValuePrinter()"
            @aceptar="crearPrinter()"
          >
            <section class="flex flex-col gap-3">
              <div class="flex justify-between gap-2 w-full">
                <UFormField
                  label="Dirección"
                  size="sm"
                  class="w-full"
                  required
                >
                  <UInput
                    v-model="agregarPrinter.direccion_Nombre"
                    :placeholder="`Introduzca la dirección`"
                    class="w-full"
                    required
                  />
                </UFormField>
                <UFormField
                  label="Tipo"
                  size="sm"
                  class="w-full"
                  required
                >
                  <USelect
                    v-model="agregarPrinter.tipoId"
                    :items="modos"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <div class="flex justify-between gap-2 w-full">
                <UFormField
                  label="Puerto"
                  size="sm"
                  class="w-full"
                  required
                >
                  <UInput
                    v-model.number="agregarPrinter.puerto"
                    type="number"
                    :placeholder="`Introduzca el puerto`"
                    class="w-full"
                  />
                </UFormField>
                <UFormField
                  label="Modelo"
                  size="sm"
                  class="w-full"
                >
                  <UInput
                    v-model="agregarPrinter.modeloImpresora"
                    :placeholder="`Introduzca el modelo`"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </section>
          </Modal>
        </div>

        <UAccordion
          :items="test"
          :ui="{ item: { padding: 'py-3 px-0' } }"
        >
          <template #body="{ item }">
            <div class="space-y-4 p-4 flex justify-between gap-3 items-center">
              <div
                v-for="(value, key) in item.content"
                :key="key"
                class="flex flex-col space-y-2"
              >
                <UFormField
                  v-if="key ==='Tipo'"
                  :label="key"
                  size="sm"
                  class="w-fit"
                >
                  <USelect
                    v-model="item.content[key].tipo"
                    :items="modos"
                    :disabled="isDisable"
                    class="w-20"
                  />
                </UFormField>
                <UFormField
                  v-else
                  :label="key"
                  size="sm"
                >
                  <UInput
                    :id="`${item.label}-${key}`"
                    v-model="item.content[key]"
                    :placeholder="`Introduzca el ${key}`"
                    class="w-full"
                    :disabled="isDisable"
                  />
                </UFormField>
              </div>
              <div class="flex gap-3 items-center justify-between">
                <StateButton
                  :is-disable="isDisable"
                  size="sm"
                  @execute="saveChanges(item)"
                />

                <UIcon
                  name="carbon:close-filled"
                  class="size-5 text-error cursor-pointer"
                  @click="deletePrinter(item.id)"
                />
              </div>
            </div>
          </template>
        </UAccordion>
      </section>
      <USeparator class="my-4" />
      <UAccordion :items="items">
        <template #body>
          <print-test />
        </template>
      </UAccordion>
    </UCard>
    <ConfgServer @default-printer="getPrinters($event)" />
  </div>
</template>

<style scoped>
</style>
