export const useFormatDate = (isoString?: string): string => {
  const TIME_ZONE = 'America/Santo_Domingo'

  // 1. Verificación de seguridad
  if (!isoString || typeof isoString !== 'string') {
    return 'N/A'
  }

  // Opciones de formato de fecha/hora para DD/MM/YYYY y H:MM AM/PM
  const options: Intl.DateTimeFormatOptions = {
    // Parte de fecha (DD/MM/YYYY)
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',

    // Parte de hora (H:MM AM/PM)
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,

    // Zona horaria
    timeZone: TIME_ZONE
  }

  try {
    // ⚠️ USO DE FORMATTER DIRECTO PARA MAYOR CONTROL ⚠️
    // Usamos 'es-ES' para asegurar el orden de fecha (DD/MM/YYYY)
    // y 'en-US' para asegurar el formato de hora (AM/PM)
    // El formato 'es-ES' en sí mismo a menudo no da el formato exacto de AM/PM,
    // así que lo construiremos manualmente, pero usaremos el Intl API como base.

    // 1. Formatear la fecha (DD/MM/YYYY)
    const datePart = new Date(isoString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: TIME_ZONE
    })

    // 2. Formatear la hora (H:MM AM/PM)
    // Usamos 'en-US' para garantizar el sufijo AM/PM, que es crucial aquí.
    const timePart = new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: TIME_ZONE
    })

    // 3. Verificación de Invalidez (Si new Date falló)
    if (timePart === 'Invalid Date' || datePart === 'Invalid Date') {
      throw new Error('Invalid Date Object')
    }

    // Juntar el formato: 30/11/2025 5:50 PM
    return `${datePart} ${timePart}`
  } catch (e) {
    console.error('Error de Formato:', e)
    // Retorna un mensaje de error claro en caso de fallo.
    return `Error (${isoString.substring(0, 19)})`
  }
}
