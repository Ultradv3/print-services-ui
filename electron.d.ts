// src/electron.d.ts

/**
 * Define la estructura de la API expuesta por contextBridge
 * en el proceso principal.
 */
export interface ElectronAPI {
  ping: () => string // Tu función ping que devuelve un string
  getServerConfig: () => Promise<any>
  manageService: (
    serviceName: string,
    operation: 'start' | 'stop' | 'restart'
  ) => Promise<any>

  // Añade aquí cualquier otra función o propiedad que expongas en preload.js
  // Por ejemplo:
  // getSettings: () => Promise<Config>;
}

// Sobreescribe la interfaz global Window para incluir nuestra propiedad 'api'
declare global {
  interface Window {
    api: ElectronAPI
    getServerConfig: () => Promise<any>
    manageService: () => Promise<any>
  }
}
