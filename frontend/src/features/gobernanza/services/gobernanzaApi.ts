import { apiGet, apiDelete, apiPostFormData, apiPatchFormData, buildModulePath } from "../../../services/apiClient";
import type { Gobernanza } from "../../../types/entities/gobernanza";

// Se usa apiPostFormData / apiPatchFormData únicamente cuando se envían archivos (PDF),
// ya que requiere multipart/form-data para que el backend reciba el archivo.
// Las entidades que solo envían texto o IDs utilizan apiPost / apiPatch (application/json).
const MODULE = "gobernanza";
const ENDPOINT = "gobernanzas";

export async function obtenerGobernanzas() {
  return apiGet<Gobernanza[]>(buildModulePath(MODULE, ENDPOINT));
}

export async function crearGobernanza(formData: FormData) {
  return apiPostFormData<Gobernanza>(buildModulePath(MODULE, ENDPOINT), formData);
}

export async function actualizarGobernanza(id: number, formData: FormData) {
  return apiPatchFormData<Gobernanza>(`${buildModulePath(MODULE, ENDPOINT)}${id}/`, formData);
}

export async function eliminarGobernanza(id: number) {
  return apiDelete(`${buildModulePath(MODULE, ENDPOINT)}${id}/`);
}
