export interface LoginCredentials {
  correo_institucional: string;
  contrasena: string;
}

export interface UsuarioAutenticado {
  id: number;
  nombre_usuario: string;
  correo_institucional: string;
  rol: string;
  es_activo: boolean;
  datos_personales?: {
    nombres: string;
    apellidos: string;
  };
  institucion_id?: number | null;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAutenticado;
}

export type FrontendRol = "admin" | "autoridad" | "secretaria" | "dece" | "docente" | "estudiante";

export const ROL_MAP: Record<string, FrontendRol> = {
  ADMINISTRADOR: "admin",
  AUTORIDAD: "autoridad",
  SECRETARIA: "secretaria",
  DECE: "dece",
  DOCENTE: "docente",
  ESTUDIANTE: "estudiante",
};
