import {
  apiGet, apiDelete, apiUpload, apiUploadPatch, buildModulePath, getApiBaseUrl, getAuthToken,
} from "../../../services/apiClient";
import type { Gobernanza } from "../../../types/entities/gobernanza";

const MODULE = "gobernanza";
const ENDPOINT = "gobernanzas";

export async function obtenerGobernanzas() {
  return apiGet<Gobernanza[]>(buildModulePath(MODULE, ENDPOINT));
}

export async function obtenerGobernanza(id: number) {
  return apiGet<Gobernanza>(`${buildModulePath(MODULE, ENDPOINT)}${id}/`);
}

export async function obtenerGobernanzasPorAnio(anioLectivoId: number) {
  return apiGet<Gobernanza[]>(
    `${buildModulePath(MODULE, ENDPOINT)}por_anio_lectivo/?anio_lectivo_id=${anioLectivoId}`
  );
}

export async function crearGobernanza(formData: FormData) {
  return apiUpload<Gobernanza>(buildModulePath(MODULE, ENDPOINT), formData);
}

export async function actualizarGobernanza(id: number, formData: FormData) {
  return apiUploadPatch<Gobernanza>(`${buildModulePath(MODULE, ENDPOINT)}${id}/`, formData);
}

export async function eliminarGobernanza(id: number) {
  return apiDelete(`${buildModulePath(MODULE, ENDPOINT)}${id}/`);
}

/** Documentos de la institución del usuario en su año lectivo activo (US-074). */
export async function obtenerGobernanzasAnioActual() {
  return apiGet<{ anio_lectivo: { id: number; nombre: string } | null; documentos: Gobernanza[] }>(
    `${buildModulePath(MODULE, ENDPOINT)}anio-actual/`
  );
}

/** Pide el PDF al endpoint protegido (token en la cabecera, no en la URL). */
async function obtenerArchivoGobernanza(id: number, descargar: boolean) {
  const token = getAuthToken();
  const query = descargar ? "?descargar=1" : "";
  const response = await fetch(`${getApiBaseUrl()}${buildModulePath(MODULE, ENDPOINT)}${id}/archivo/${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || body?.detail || `Error ${response.status} al obtener el documento`);
  }
  const disposition = response.headers.get("Content-Disposition") || "";
  const nombre = /filename="?([^"]+)"?/.exec(disposition)?.[1] ?? `documento_${id}.pdf`;
  return { blob: await response.blob(), nombre };
}

/** Abre el PDF en una pestaña nueva. */
export async function abrirArchivoGobernanza(id: number) {
  // La pestaña se abre antes del fetch para que el navegador no la bloquee.
  const ventana = window.open("", "_blank");
  try {
    const { blob } = await obtenerArchivoGobernanza(id, false);
    const url = URL.createObjectURL(blob);
    if (ventana) ventana.location.href = url;
    else window.location.assign(url);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    ventana?.close();
    throw error;
  }
}

/** Descarga el PDF con el nombre que envía el backend. */
export async function descargarArchivoGobernanza(id: number) {
  const { blob, nombre } = await obtenerArchivoGobernanza(id, true);
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
