export function getErrorMessage(error: unknown): string {
  const err = error as any;

  if (err?.message?.includes("localhost") || err?.message?.includes("http")) {
    return "Error de conexión";
  }

  const body = err?.response?.data || err?.data;
  if (body) {
    if (typeof body === "string") return body;
    if (body.error) return body.error;
    if (body.detail) return body.detail;
    if (body.message) return body.message;
    const firstKey = Object.keys(body)[0];
    if (firstKey && Array.isArray(body[firstKey])) {
      return body[firstKey][0];
    }
  }

  return "No se pudo completar la acción";
}
