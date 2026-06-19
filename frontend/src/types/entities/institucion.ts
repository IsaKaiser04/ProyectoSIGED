//types/entities/institucion.ts
export interface Institucion {
  id: number;

  nombre: string;
  codigo_amie: string;
  ruc: string;

  zona_coordinacion: string;
  regimen: string;
  sostenimiento: string;
  modalidad: string;
  jornada: string;

  zona_coordinacion_display: string;
  regimen_display: string;
  sostenimiento_display: string;
  modalidad_display: string;
  jornada_display: string;

  direccion: {
    id: number;

    calle_principal: string;
    calle_secundaria: string;
    numero_casa: string;
    referencia: string;

    parroquia_detalle: {
      parroquia: string;
      canton: string;
      provincia: string;
      pais: string;
    };
  };
}