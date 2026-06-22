/**
 * Utilidades para manejo centralizado y amigable de errores en la aplicación
 */

export interface ErrorInfo {
  message: string;
  type: "network" | "validation" | "server" | "unknown";
  originalError?: Error;
}

/**
 * Mapea un error a un objeto ErrorInfo con mensajes amigables
 * @param error - El error a procesar
 * @returns Objeto ErrorInfo con tipo y mensaje controlado
 */
export function processError(error: unknown): ErrorInfo {
  // Errores de red
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message: "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.",
      type: "network",
      originalError: error
    };
  }

  // Error personalizado (es nuestra excepción)
  if (error instanceof Error) {
    // Detectar tipo de error por el mensaje
    if (
      error.message.includes("validation") ||
      error.message.includes("validar")
    ) {
      return {
        message: error.message,
        type: "validation",
        originalError: error
      };
    }

    if (
      error.message.includes("server") ||
      error.message.includes("500") ||
      error.message.includes("servidor")
    ) {
      return {
        message: "El servidor está experimentando problemas. Por favor, intenta más tarde.",
        type: "server",
        originalError: error
      };
    }

    // Otro error conocido
    return {
      message: error.message,
      type: "unknown",
      originalError: error
    };
  }

  // Error desconocido (no es un Error)
  return {
    message: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
    type: "unknown",
    originalError: error instanceof Error ? error : undefined
  };
}

/**
 * Envuelve una operación async con manejo de errores centralizado
 * @param operation - Función async a ejecutar
 * @param fallbackMessage - Mensaje por defecto si no se especifica el tipo
 * @returns Promise con los datos o un ErrorInfo
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallbackMessage: string = "No se pudo completar la operación"
): Promise<{ success: true; data: T } | { success: false; error: ErrorInfo }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorInfo = processError(error);
    // Si el mensaje ya es específico, usa ese; si no, usa el fallback
    if (errorInfo.type === "unknown" && errorInfo.message === "Ocurrió un error inesperado. Por favor, intenta de nuevo.") {
      errorInfo.message = fallbackMessage;
    }
    return { success: false, error: errorInfo };
  }
}

/**
 * Valida que una respuesta HTTP sea exitosa
 * @param response - Respuesta del fetch
 * @returns La respuesta si es exitosa
 * @throws Error si la respuesta no es exitosa
 */
export async function validateResponse(response: Response): Promise<Response> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Error desconocido");
    throw new Error(
      `Error del servidor (${response.status}): ${errorText || "No hay detalles disponibles"}`
    );
  }
  return response;
}

/**
 * Realizar un fetch seguro con manejo de errores
 * @param url - URL a consultar
 * @param options - Opciones del fetch
 * @returns Promise con los datos parseados
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  signal?: AbortSignal
): Promise<T> {
  try {
    const response = await fetch(url, { ...options, signal });
    await validateResponse(response);
    return await response.json();
  } catch (error) {
    if (signal?.aborted) {
      throw new Error("Solicitud cancelada");
    }
    throw error;
  }
}
