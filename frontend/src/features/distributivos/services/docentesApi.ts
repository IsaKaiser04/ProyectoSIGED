import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  buildModulePath,
} from "../../../services/apiClient";
import type { Docente } from "../../../types/entities/actoresAcademicos";

export async function obtenerDocentes() {
  return apiGet<Docente[]>(buildModulePath("actoresAcademicos", "docentes"));
}

export async function crearDocente(data: any) {
  return apiPost(buildModulePath("actoresAcademicos", "docentes"), data);
}

export async function actualizarDocente(id: number, data: any) {
  return apiPatch(
    buildModulePath("actoresAcademicos", "docentes") + `${id}/`,
    data
  );
}

export async function toggleActivoDocente(cuentaId: number, esActivo: boolean) {
  return apiPatch(
    `/actoresAcademicos/cuentas/${cuentaId}/`,
    { es_activo: esActivo }
  );
}
