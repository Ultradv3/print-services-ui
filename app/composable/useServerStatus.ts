import { ref, onMounted, onUnmounted } from 'vue'
import { useFormatDate } from './useFormatDate'
import { useApi } from './useApi'

function formatLog(raw: any) {
  const createdAt = new Date().toISOString()
  // const dateField = raw.createdAt || raw.timestamp || null
  return {
    createdAt,
    // timestamp: raw.timestamp,
    level: raw.level?.toUpperCase() ?? 'INFO',
    service: raw.service ?? 'system',
    message: raw.message ?? '',
    details: raw.metadata
      ? {
          ip: raw.metadata.direccion,
          connection: raw.metadata.tipo
        }
      : null
  }
}

export function useServerStatus() {
  const serverStatus = ref<
    | 'Conectado'
    | 'Detenido'
    | 'Aplicando Cambios...'
    | 'Conectado (Config. Actualizada)'
    | 'Error al Guardar'
    | 'Error al Aplicar Cambios'
    | 'Error'
    | 'Ejecutando start...'
    | 'Ejecutando stop...'
    | 'Ejecutando restart...'
    | 'Ejecutando'
  >('Detenido')

  const isConnected = ref(false)

  // 🟦 NUEVO: Lista reactiva de logs
  const logs = ref<any[]>([])

  let socket: WebSocket | null = null
  let reconnectTimer: number | null = null

  let reconnectInterval = 2000 // Backoff progresivo

  const connect = () => {
    if (socket && socket.readyState === WebSocket.OPEN) return
    const URL = useApi() as string
    console.log('🔌 Conectando WebSocket...')

    // ⚠️ IMPORTANTE → WebSocket usa ws:// no http://
    socket = new WebSocket(URL.replace('http', 'ws'))

    socket.onopen = () => {
      console.log('🟢 WS conectado')
      serverStatus.value = 'Conectado'
      isConnected.value = true
      reconnectInterval = 2000
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'log') {
          const formatted = formatLog(data.data) // ← aquí el fix
          logs.value.unshift(formatted)
          return
        }
        if (data.status === 'Conectado') {
          serverStatus.value = 'Conectado'
        }
      } catch (err: unknown) {
        console.warn('Mensaje WS no válido:', event.data)
      }
    }

    socket.onerror = () => {
      console.log('🔴 WS error')
      serverStatus.value = 'Detenido'
      isConnected.value = false
    }

    socket.onclose = () => {
      console.log('🔴 WS desconectado')
      serverStatus.value = 'Detenido'
      isConnected.value = false

      reconnectTimer = window.setTimeout(() => {
        reconnectInterval = Math.min(reconnectInterval * 2, 10000)
        connect()
      }, reconnectInterval)
    }
  }

  onMounted(connect)

  onUnmounted(() => {
    socket?.close()
    if (reconnectTimer) clearTimeout(reconnectTimer)
  })

  return {
    serverStatus,
    isConnected,
    logs // 🟦 NUEVO: exportar logs al frontend
  }
}
