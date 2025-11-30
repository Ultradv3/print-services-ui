export async function useElectron() {
  try {
    const serverConfig = await window.api.getServerConfig()
    const URL = `http://${serverConfig.url}:${serverConfig.port}`
    localStorage.setItem('apiUrl', URL)

    return serverConfig
  } catch (error) {
    console.error('Error al obtener la configuración del servidor:', error)

    return null
  }
}
