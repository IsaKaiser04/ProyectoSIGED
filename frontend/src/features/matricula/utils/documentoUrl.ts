import { getApiBaseUrl, getAuthToken } from "../../../services/apiClient";

export function buildDocumentoUrl(doc: any): string | null {
  if (!doc) return null;
  const apiBase = getApiBaseUrl();
  const origin = apiBase.replace(/\/api\/?$/, "");
  if (doc.archivo_url) {
    const token = getAuthToken();
    const base = doc.archivo_url.startsWith("http") ? doc.archivo_url : `${origin}${doc.archivo_url}`;
    return `${base}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  }
  if (doc.archivo) {
    if (doc.archivo.startsWith("data:") || doc.archivo.startsWith("http")) return doc.archivo;
    return `${origin}${doc.archivo}`;
  }
  return null;
}