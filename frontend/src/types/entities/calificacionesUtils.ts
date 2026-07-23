import type { Calificacion, Trimestre } from "./calificaciones";

export function calcularTotalTrimestre(trimestre: Trimestre): number {
  return (trimestre.ef || 0) + (trimestre.es || 0);
}

export function calcularPromedioFinal(cal: Calificacion): number {
  const t1 = calcularTotalTrimestre(cal.primer_trimestre || { ef: 0, es: 0 });
  const t2 = calcularTotalTrimestre(cal.segundo_trimestre || { ef: 0, es: 0 });
  const t3 = calcularTotalTrimestre(cal.tercer_trimestre || { ef: 0, es: 0 });
  return (t1 + t2 + t3) / 3;
}

export function calcularEquivalenciaCualitativa(promedio: number): string {
  if (promedio >= 9) return "Excelente";
  if (promedio >= 8) return "Muy Buena";
  if (promedio >= 7) return "Buena";
  if (promedio >= 5) return "Suficiente";
  return "Insuficiente";
}

export function calcularEstadoFinal(cal: Calificacion): string {
  const promedio = calcularPromedioFinal(cal);
  if (promedio >= 7) return "Aprobado";
  const conSupletorio = (promedio * 3 + (cal.supletorio || 0)) / 4;
  if (conSupletorio >= 7) return "Aprobado";
  return "Reprobado";
}
