<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Servicios',
    to: '/',
    active: route.path.startsWith('/')
  },
  {
    label: 'Configuraciones',
    to: '/configuraciones',
    active: route.path.startsWith('/configuraciones')
  }

])
</script>

<template>
  <div class="flex flex-col w-screen h-screen">
    <!-- <UHeader>
      <template #title>
        <Logo class="h-6 w-auto" />
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UColorModeButton />
        <h1>login</h1>
      </template>
    </UHeader> -->

    <main class="px-10  xl:px-80 ">
      <slot />
    </main>
  </div>
</template>
