// En tu archivo de tipos (ej. usuario.ts o instituciones.ts)
export interface ParroquiaDetalle {
  parroquia: string;
  canton: string;
  provincia: string;
  pais: string;
}

export interface Direccion {
  id?: number; // Opcional porque al crear aún no tiene ID
  calle_principal: string;
  calle_secundaria: string;
  numero_casa: string;
  referencia: string;
  
  // ──► LA CLAVE DE DOBLE VÍA:
  parroquia?: number | null; // Se usa en el POST para enviar el ID numérico al Backend
  parroquia_detalle?: ParroquiaDetalle; // Se usa en el GET para pintar País, Provincia, Cantón
}

export interface Institucion {
  id: number;
  nombre: string;
  codigo_amie: string;
  ruc: string;
  direccion?: Direccion;
  zona_coordinacion_display?: string;
  regimen_display?: string;
  sostenimiento_display?: string;
  modalidad_display?: string;
  jornada_display?: string;
  zona_coordinacion?: string;
  regimen?: string;
  sostenimiento?: string;
  modalidad?: string;
  jornada?: string;
}

export interface Cuenta {
  id: number;
  nombre_usuario: string;
  correo_institucional: string;
  rol: string;
  es_activo: boolean;
}

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  tipo_identificacion: string;
  fecha_nacimiento: string;
  celular: string;
  correo_personal: string;
  direccion_domicilio?: Direccion;
  cuenta?: Cuenta;
  // La base puede ser opcional u omitirse si se maneja estrictamente en las extensiones
  institucion?: Institucion; 
}