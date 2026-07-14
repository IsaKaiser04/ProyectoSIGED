import type { LoginCredentials, LoginResponse } from "../types/auth";
import { apiPost } from "../../../services/apiClient";

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiPost<LoginCredentials, LoginResponse>(
    "/actoresAcademicos/login/",
    credentials
  );
}
