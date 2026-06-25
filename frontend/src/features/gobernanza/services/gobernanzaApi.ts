import { apiGet, apiDelete, apiUpload, apiUploadPatch, buildModulePath } from "../../../services/apiClient";
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
