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

export interface Docente extends Usuario {
  correo_institucional: string | null;
  especialidad: string;
  fecha_ingreso: string;            // Formato YYYY-MM-DD
  tipo_contrato: "TIT" | "INV" | "OCA" | "HON" | "EME"; // 💡 Claves reales de Django
  tipo_dedicacion: "TC" | "TP" | "MT";                  // 💡 Claves reales de Django
  anios_experiencia?: number;       
  institucion_nombre?: string;      
}