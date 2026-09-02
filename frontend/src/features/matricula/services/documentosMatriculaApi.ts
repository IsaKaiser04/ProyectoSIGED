import { apiGet } from "../../../services/apiClient";

export interface DocumentoMatricula {
  id: number;
  solicitud_numero: number;
  solicitante_nombre_completo: string;
  aspirante_identificacion: string;
  aspirante_celular: string;
  paralelo_nombre: string;
  anio_lectivo_nombre: string;
  fecha_registro: string | null;
  matricula_estado: string;
  matricula_estado_display: string;
  documento_nombre: string;
  estado: string;
  estado_display: string;
  observacion: string;
  fecha_revision: string | null;
  revisado_por: number | null;
  revisado_por_nombre: string | null;
  archivo: string | null;
  archivo_url: string | null;
}

export interface FiltrosDocumentosMatricula {
  solicitudNumero?: number | string;
  estado?: string;
  texto?: string;
}

export async function obtenerDocumentosMatricula(
  filtros: FiltrosDocumentosMatricula = {}
): Promise<DocumentoMatricula[]> {
  const params = new URLSearchParams();
  if (filtros.solicitudNumero) params.set("matricula_id", String(filtros.solicitudNumero));
  if (filtros.estado) params.set("estado", filtros.estado);
  if (filtros.texto?.trim()) params.set("texto", filtros.texto.trim());
  const qs = params.toString();
  return apiGet<DocumentoMatricula[]>(`/matricula/documentos/${qs ? `?${qs}` : ""}`);
}