import { apiDelete, apiGet, apiPost, apiPut } from "../../../services/apiClient";
import { apiEndpoints } from "../../../services/apiEndpoints";
import type {
  EvaluacionCategoria,
  EvaluacionCategoriaPayload
} from "../../../types/entities";

const evaluacionCategoriasEndpoint =
  apiEndpoints.calificaciones.evaluacionCategorias;

export function listEvaluacionCategorias(signal?: AbortSignal) {
  return apiGet<EvaluacionCategoria[]>(evaluacionCategoriasEndpoint.collection, {
    signal
  });
}

export function createEvaluacionCategoria(payload: EvaluacionCategoriaPayload) {
  return apiPost<EvaluacionCategoria>(
    evaluacionCategoriasEndpoint.collection,
    payload
  );
}

export function updateEvaluacionCategoria(
  id: number,
  payload: EvaluacionCategoriaPayload
) {
  return apiPut<EvaluacionCategoria>(
    evaluacionCategoriasEndpoint.detail(id),
    payload
  );
}

export function deleteEvaluacionCategoria(id: number) {
  return apiDelete(evaluacionCategoriasEndpoint.detail(id));
}
