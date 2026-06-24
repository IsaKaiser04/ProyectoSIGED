export interface Gobernanza {
  id: number;
  archivo: string;
  vigenteDesde: string;
  vigenteHasta: string;
  gobernanzaTipo: string;
  gobernanzaTipoDisplay: string;
  institucion: number;
  institucionNombre: string;
  anioLectivo: number;
  anioLectivoNombre: string;
  es_activo: boolean;
}
