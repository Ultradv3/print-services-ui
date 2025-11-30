<script lang="ts" setup>
/**
 * *1. Props
 */
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  buttonTitle: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
})

/**
 * *2. Emits
 */
const emit = defineEmits(['aceptar', 'cancelar', 'close'])

/**
 * *3. State
 */
const open = ref(false)

/**
 * *4. Computed
 */
const loading = computed(() => props.isLoading)
const hasError = computed(() => props.error)

/**
 * *5. Watchers
 */
watch(loading, (newVal) => {
  if (!newVal && !hasError.value) {
    isClose()
  }
})

watch(open, (newValue) => {
  if (!newValue) {
    emit('cancelar', false)
  }
})

/**
 * *6. Métodos
 */
function isClose() {
  open.value = false
  emit('cancelar', false)
}
function aceptar() {
  emit('aceptar', true)
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.title"
    description="El puerto pueda variar dependiendo el tipo de impresora"
    :close="{ onClick: () => emit('close', false) }"
  >
    <UButton
      :icon="props.icon"
      :label="props.buttonTitle"
      color="neutral"
      variant="subtle"
    />

    <template #body>
      <slot />
    </template>
    <template #footer>
      <div class="flex justify-between w-full gap-2">
        <UButton
          color="neutral"
          label="Cancelar"
          variant="subtle"
          @click="isClose()"
        />
        <UButton
          label="Aceptar"
          color="primary"
          :loading="loading"
          @click="aceptar()"
        />
      </div>
    </template>
  </UModal>
</template>

<style scoped>
/* estilos aquí */
</style>
