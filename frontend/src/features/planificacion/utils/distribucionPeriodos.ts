/**
 * Reglas del régimen académico ecuatoriano (200 días laborables / 40 semanas lectivas).
 * Debe mantenerse sincronizado con:
 *   backend/apps/planificacion/services/distribucion_periodos.py
 */

export const DIAS_POR_SEMANA = 5;
export const DIAS_LABORABLES_ANIO = 200;
export const TOLERANCIA_DIAS = 5;

/** Semanas lectivas por período, según el orden del régimen. */
export const DISTRIBUCION_REGLEMENTARIA: Record<string, number[]> = {
  TRIMESTRE: [13, 13, 14],      // 65 + 65 + 70 = 200 días
  QUIMESTRE: [20, 20],          // 100 + 100    = 200 días
  BIMESTRE: [10, 10, 10, 10],   // 50 x 4       = 200 días
};

export const diasEsperados = (periodoTipo: string): number[] =>
  (DISTRIBUCION_REGLEMENTARIA[periodoTipo] ?? []).map(s => s * DIAS_POR_SEMANA);

export const contarDiasLaborables = (fechaInicio: string, fechaFin: string): number => {
  if (!fechaInicio || !fechaFin) return 0;
  const cursor = new Date(`${fechaInicio}T00:00:00`);
  const fin = new Date(`${fechaFin}T00:00:00`);
  let dias = 0;
  while (cursor <= fin) {
    const dia = cursor.getDay(); // 0=Domingo ... 6=Sábado
    if (dia >= 1 && dia <= 5) dias++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
};

/** Texto resumen del régimen, ej: "3 períodos · 65 + 65 + 70 días". */
export const resumenRegimen = (periodoTipo: string): string => {
  const semanas = DISTRIBUCION_REGLEMENTARIA[periodoTipo];
  if (!semanas) return '';
  const dias = semanas.map(s => s * DIAS_POR_SEMANA);
  return `${semanas.length} períodos · ${dias.join(' + ')} días`;
};
