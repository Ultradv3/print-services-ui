<script lang="ts" setup>
/**
 * *1. Props y Emit
 */
type Size = 'sm' | 'xs' | 'md' | 'lg' | 'xl' | undefined
const props = defineProps({
  size: {
    type: String as PropType<Size>,
    default: 'sm'
  }
})
/**
 * *2. Stores y Composables
 */

/**
 * *3. Refs y Reactive State
 */

const isDisable = ref(true)
let timeoutId: number | undefined
const check = ref('tabler:edit')
const iconEdit = computed(() => {
  return isDisable.value ? check.value : 'ci:check-big' // 'ci:check-big'
})

const _titleButton = ref('Editar Configuración')
const titleButton = computed(() => {
  return isDisable.value ? _titleButton.value : 'Aplicar Cambios'
})

const _colorButton = ref('neutral')
const colorButton = computed(() => {
  return isDisable.value ? _colorButton.value : 'warning'
})
/**
 * *4. Computed
 */
const emits = defineEmits(['update:isDisable', 'execute'])
/**
 * *5. Watchers
 */
watch(isDisable, (newValue) => {
  if (!newValue) {
    check.value = 'ci:check-big'
    // Reiniciar a estado inicial
    _titleButton.value = 'Editar Configuración'

    // Si había un timeout pendiente, cancelarlo
    if (timeoutId) clearTimeout(timeoutId)
    return
  }

  if (newValue) {
    _titleButton.value = 'Cambios Aplicados'
    check.value = 'ci:check-all'
    _colorButton.value = 'success'

    // Cancelar timeout previo antes de iniciar uno nuevo
    if (timeoutId) clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      check.value = 'tabler:edit'
      _titleButton.value = 'Editar Configuración'
      _colorButton.value = 'neutral'
      timeoutId = undefined
    }, 4000)
  }
})
/**
 * *6. Métodos
 */
function execute() {
  emits('execute')
  emits('update:isDisable', !isDisable.value)
  isDisable.value = !isDisable.value
}
/**
 * *7. Ciclo de vida
 */
</script>

<template>
  <UButton
    :label="titleButton"
    variant="subtle"
    :color="colorButton"
    :icon="iconEdit"
    class="rounded-xl"
    :size="props.size"
    @click="execute()"
  />
</template>

<style scoped>
/* estilos aquí */
</style>
