import { apiGet, apiPost } from "../../../services/apiClient";

export interface PrimerAdminStatus {
  primer_inicio: boolean;
}

interface PrimerAdminResponse {
  mensaje: string;
  admin_id: number;
}

export async function checkPrimerAdmin(): Promise<PrimerAdminStatus> {
  return apiGet<PrimerAdminStatus>("/actoresAcademicos/primer-admin/");
}

export async function crearPrimerAdmin(data: {
  admin: Record<string, unknown>;
}): Promise<PrimerAdminResponse> {
  return apiPost<typeof data, PrimerAdminResponse>(
    "/actoresAcademicos/primer-admin/",
    data
  );
}
