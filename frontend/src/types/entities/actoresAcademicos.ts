import type { Usuario, Cuenta, Institucion } from "./usuario";

export interface Autoridad extends Usuario {
  correo_institucional: string | null;
  institucion: Institucion; // Ahora es un objeto Institucion completo
  cuenta?: Cuenta;
}

export interface Secretaria extends Usuario {
  correo_institucional: string | null;
  institucion: Institucion;
  cuenta?: Cuenta;
}

export interface Dece extends Usuario {
  correo_institucional: string | null;
  institucion: Institucion;
  cuenta?: Cuenta;
}

export interface Administrador extends Usuario {
  rol_administrado?: string;
  institucion?: undefined; // El administrador explícitamente no posee institución
  cuenta?: Cuenta;
}