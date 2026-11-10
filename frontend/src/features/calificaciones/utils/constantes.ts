// Constantes del registro de notas del docente.
// Copian los valores de apps/calificaciones/services/promedio_service.py para dar
// feedback mientras se edita. Si el backend devuelve otra cosa, gana el backend.

export const NOTA_MINIMA = 0;
export const NOTA_MAXIMA = 10;

/** Respaldo: la matriz trae `nota_minima_aprobacion` y es la que se usa. */
export const NOTA_MINIMA_APROBACION_DEFECTO = 7;

/** Misma tolerancia que TOLERANCIA_PESOS del backend (fracción). */
export const TOLERANCIA_PESOS = 0.0001;

/**
 * Escala provisional del backend (ESCALA_CUALITATIVA): límite inferior inclusivo.
 * El backend marca un TODO para confirmar etiquetas con la institución.
 */
export const ESCALA_CUALITATIVA: ReadonlyArray<{ desde: number; etiqueta: string }> = [
  { desde: 9, etiqueta: "Excelente" },
  { desde: 7, etiqueta: "Muy bueno" },
  { desde: 4.01, etiqueta: "Regular" },
  { desde: 0, etiqueta: "Insuficiente" },
];

/** Franjas del reporte de notas: verde, amarillo, naranja y rojo, por nivel. */
export const COLORES_NIVEL: Record<string, { fondo: string; color: string }> = {
  Excelente: { fondo: "#dcfce7", color: "#15803d" },
  "Muy bueno": { fondo: "#fef9c3", color: "#a16207" },
  Regular: { fondo: "#ffedd5", color: "#c2410c" },
  Insuficiente: { fondo: "#fee2e2", color: "#b91c1c" },
};

export const ETIQUETA_ESTADO_FINAL = {
  EN_CURSO: "En curso",
  APROBADO: "Aprobado",
  SUPLETORIO: "Supletorio",
  REPROBADO: "Reprobado",
} as const;
