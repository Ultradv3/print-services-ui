/* eslint-disable @typescript-eslint/no-explicit-any */
// composables/useServiceManager.js

/**
 * Composable para gestionar servicios de Windows a través de IPC de Electron.
 * Permite inicializarlo con un nombre de servicio.
 */
export function useServiceManager(serviceName: string) {
  if (!serviceName) {
    throw new Error(
      '❌ Debes proporcionar un nombre de servicio al usar useServiceManager()'
    )
  }

  /**
   * Ejecuta una operación sobre un servicio de Windows.
   * @param {'start' | 'stop' | 'restart'} operation
   */
  const manageService = async (operation: 'start' | 'stop' | 'restart') => {
    if (typeof window.api?.manageService !== 'function') {
      console.warn(
        '⚠️ La API de servicios no está disponible. ¿Estás fuera de Electron?'
      )
      return {
        success: false,
        message: 'Función no disponible fuera del entorno Electron.'
      }
    }

    try {
      const result = await window.api.manageService(serviceName, operation)

      if (result.success) {
        console.log(`✅ Servicio '${serviceName}' → ${operation} OK`)
        return {
          success: true,
          message:
            result.message
            || `Servicio '${serviceName}' ${operation} correctamente.`
        }
      }

      return {
        success: false,
        message: result.message || 'Error desconocido al operar el servicio.'
      }
    } catch (error: any) {
      console.error(`❌ Error al gestionar ${serviceName}:`, error)
      return {
        success: false,
        message: `Error del sistema (¿Permisos de Administrador?): ${
          error.message || error
        }`
      }
    }
  }

  // Métodos pre-configurados para este servicio
  const startService = () => manageService('start')
  const stopService = () => manageService('stop')
  const restartService = () => manageService('restart')

  return {
    manageService, // por si quieres usarlo manualmente
    startService,
    stopService,
    restartService
  }
}
