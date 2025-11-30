/* eslint-disable @typescript-eslint/no-explicit-any */
import { useToast } from '#imports'
import { useApi } from './useApi'

// Define la interfaz de las operaciones que devolverá el composable
interface ApiOperations<T> {
  get: (query?: Record<string, any>) => Promise<T | null>
  post: (body: any) => Promise<T | null>
  put: (body: any) => Promise<T | null>
  delete: (query?: Record<string, any>) => Promise<boolean>
}

let globalCountError = 0

/**
 * 💡 Genera un conjunto de operaciones CRUD usando fetch() nativo.
 * @param endpointPath La ruta relativa al endpoint (ej: '/usuarios', '/productos').
 */
export function ApiService<T>(endpointPath: string): ApiOperations<T> {
  const getFullUrl = (path: string, query?: Record<string, any>): string => {
    // 🛑 LLAMAR A useApi() PARA OBTENER EL VALOR ACTUALIZADO DE localStorage
    const apiBaseUrl = useApi() // <-- Lectura reactiva

    let url = `${apiBaseUrl}${path}`
    if (query) {
      const params = new URLSearchParams(query).toString()
      url += `?${params}`
    }
    return url
  }

  const handleFetchResponse = async (response: Response): Promise<T | null> => {
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = {
          message: `HTTP Error: ${response.status} ${response.statusText}`
        }
      }
      throw errorData
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return (await response.json()) as T
    }

    return null
  }

  const handleError = (error: any, showError: boolean = false) => {
    const toast = useToast()
    globalCountError++

    if (showError && globalCountError <= 3) {
      toast.add({
        title: 'Error de API',
        description: error.message || String(error),
        color: 'error'
      })
    }

    console.error(`API Error en ${endpointPath}:`, error)
    throw error
  }

  // --- GET ---
  const get = async (query?: Record<string, any>): Promise<T | null> => {
    try {
      const url = getFullUrl(endpointPath, query)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return await handleFetchResponse(response)
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  // --- POST ---
  const post = async (body: any): Promise<T | null> => {
    try {
      const url = getFullUrl(endpointPath)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      return await handleFetchResponse(response)
    } catch (error) {
      handleError(error, true)
      return null
    }
  }

  // --- PUT ---
  const put = async (body: any): Promise<T | null> => {
    try {
      const url = getFullUrl(endpointPath)

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      return await handleFetchResponse(response)
    } catch (error) {
      handleError(error, true)
      return null
    }
  }

  // --- DELETE ---
  const del = async (query?: Record<string, any>): Promise<boolean> => {
    try {
      const url = getFullUrl(endpointPath, query)

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      await handleFetchResponse(response)
      return true
    } catch (error) {
      handleError(error, true)
      return false
    }
  }

  return {
    get,
    post,
    put,
    delete: del
  }
}
