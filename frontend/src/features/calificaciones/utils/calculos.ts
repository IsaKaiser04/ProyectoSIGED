// Cálculos puros del registro de notas. Sin React ni HTTP.
// Replican PromedioService (backend) solo para feedback inmediato; la respuesta
// del servidor reemplaza siempre lo calculado aquí.
import type {
  AsignaturaDocente,
  EstadoFinalAsignatura,
  MatrizActividad,
  MatrizPeriodo,
} from "../../../types/entities";
import {
  ESCALA_CUALITATIVA,
  NOTA_MAXIMA,
  NOTA_MINIMA,
  NOTA_MINIMA_APROBACION_DEFECTO,
  TOLERANCIA_PESOS,
} from "./constantes";

export type EstadoPeriodo = "ABIERTO" | "CERRADO" | "NO_INICIADO";

/** Redondeo a centésimas con mitad hacia arriba (ROUND_HALF_UP del backend). */
export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function formatearNota(valor: number | null | undefined): string {
  return valor == null ? "—" : valor.toFixed(2);
}

/** Etiqueta cualitativa. Cadena vacía si no hay nota, igual que el backend. */
export function cualitativa(valor: number | null | undefined): string {
  if (valor == null || Number.isNaN(valor)) return "";
  for (const { desde, etiqueta } of ESCALA_CUALITATIVA) {
    if (valor >= desde) return etiqueta;
  }
  return ESCALA_CUALITATIVA[ESCALA_CUALITATIVA.length - 1].etiqueta;
}

/** Valida que el texto de una celda sea una nota entre 0 y 10. */
export function parsearNota(texto: string): { ok: true; valor: number } | { ok: false; error: string } {
  const limpio = texto.trim().replace(",", ".");
  if (limpio === "") return { ok: false, error: "Ingresa una nota." };
  const valor = Number(limpio);
  if (!Number.isFinite(valor)) return { ok: false, error: "La nota debe ser numérica." };
  if (valor < NOTA_MINIMA || valor > NOTA_MAXIMA) {
    return { ok: false, error: `La nota debe estar entre ${NOTA_MINIMA} y ${NOTA_MAXIMA}.` };
  }
  return { ok: true, valor: redondear2(valor) };
}

/** Suma de pesos (fracciones) y si cuadra con 1.0 dentro de la tolerancia. */
export function validarPesos(pesos: number[]): { suma: number; cuadra: boolean } {
  const suma = pesos.reduce((acc, p) => acc + p, 0);
  return { suma, cuadra: Math.abs(suma - 1) <= TOLERANCIA_PESOS };
}

/** Convierte porcentaje (0–100) a fracción con 4 decimales, como espera el backend. */
export function porcentajeAFraccion(porcentaje: number): number {
  return Math.round(porcentaje * 100) / 10000;
}

export function fraccionAPorcentaje(fraccion: number | null): number {
  return fraccion == null ? 0 : Math.round(fraccion * 10000) / 100;
}

/**
 * Promedio de un periodo para un estudiante (calcular_promedio_periodo).
 * Una actividad sin nota cuenta como 0. null si no hay actividades o la
 * configuración no es válida (tipos mezclados o pesos que no suman 100 %).
 */
export function calcularPromedioPeriodo(
  actividades: MatrizActividad[],
  notas: Record<string, number | undefined>
): number | null {
  if (actividades.length === 0) return null;
  const tipos = new Set(actividades.map((a) => a.tipo_calculo));
  if (tipos.size > 1) return null;

  if (tipos.has("PONDERADO")) {
    const pesos = actividades.map((a) => a.peso);
    if (pesos.some((p) => p == null)) return null;
    if (!validarPesos(pesos as number[]).cuadra) return null;
    const total = actividades.reduce((acc, a) => acc + (notas[String(a.id)] ?? 0) * (a.peso as number), 0);
    return redondear2(total);
  }

  const total = actividades.reduce((acc, a) => acc + (notas[String(a.id)] ?? 0), 0);
  return redondear2(total / actividades.length);
}

/**
 * Nota final del año (calcular_nota_final).
 * La guía pedía "suma de promedios"; el backend usa el PROMEDIO de los promedios
 * de periodo porque con 3 periodos sobre 10 la suma nunca bajaría de 7 y el
 * supletorio no se habilitaría. Se replica el backend.
 */
export function calcularNotaFinal(
  promediosPeriodo: Array<number | null>,
  totalPeriodos: number
): { valor: number | null; completa: boolean } {
  const calculados = promediosPeriodo.filter((p): p is number => p != null);
  if (calculados.length === 0) return { valor: null, completa: false };
  const valor = redondear2(calculados.reduce((a, b) => a + b, 0) / calculados.length);
  return { valor, completa: calculados.length === totalPeriodos };
}

export function supletorioHabilitado(
  notaFinal: number | null,
  completa: boolean,
  notaMinima: number = NOTA_MINIMA_APROBACION_DEFECTO
): boolean {
  return completa && notaFinal != null && notaFinal < notaMinima;
}

/** Estado final de la asignatura (estado_final del backend). */
export function estadoFinal(
  notaFinal: number | null,
  completa: boolean,
  supletorio: number | null,
  notaMinima: number = NOTA_MINIMA_APROBACION_DEFECTO
): EstadoFinalAsignatura {
  if (!completa || notaFinal == null) return "EN_CURSO";
  if (notaFinal >= notaMinima) return "APROBADO";
  if (supletorio == null) return "SUPLETORIO";
  return supletorio >= notaMinima ? "APROBADO" : "REPROBADO";
}

// ─── Fechas ────────────────────────────────────────────────────────────────
// Las fechas del backend son "YYYY-MM-DD" (DateField). Se comparan como texto
// para no pasar por Date y evitar corrimientos de zona horaria.

/** Fecha local de hoy en formato YYYY-MM-DD. */
export function hoyISO(ahora: Date = new Date()): string {
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, "0");
  const d = String(ahora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fechaEnPeriodo(fecha: string, periodo: Pick<MatrizPeriodo, "fecha_inicio" | "fecha_fin">): boolean {
  return fecha >= periodo.fecha_inicio && fecha <= periodo.fecha_fin;
}

/**
 * Estado del periodo para la UI. "cerrado" viene del backend; "no iniciado" se
 * deduce de la fecha de inicio porque el backend no lo marca.
 */
export function estadoPeriodo(periodo: MatrizPeriodo, hoy: string = hoyISO()): EstadoPeriodo {
  if (periodo.cerrado || hoy > periodo.fecha_fin) return "CERRADO";
  if (hoy < periodo.fecha_inicio) return "NO_INICIADO";
  return "ABIERTO";
}

/** Periodo que contiene hoy; si no hay, el último ya iniciado; si no, el primero. */
export function periodoPorDefecto(periodos: MatrizPeriodo[], hoy: string = hoyISO()): MatrizPeriodo | null {
  if (periodos.length === 0) return null;
  const actual = periodos.find((p) => fechaEnPeriodo(hoy, p));
  if (actual) return actual;
  const iniciados = periodos.filter((p) => p.fecha_inicio <= hoy);
  return iniciados.length > 0 ? iniciados[iniciados.length - 1] : periodos[0];
}

export function formatearFecha(fecha: string | null): string {
  if (!fecha) return "Sin fecha";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

/** "Décimo EGB · Paralelo A · Año lectivo 2026-2027" */
export function subtituloAsignatura(a: AsignaturaDocente): string {
  return [
    a.grado.nombre,
    a.paralelo.nombre && `Paralelo ${a.paralelo.nombre}`,
    a.anio_lectivo && `Año lectivo ${a.anio_lectivo.nombre}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Mensaje legible de un error del cliente HTTP (DRF devuelve { campo: [msg] } o { detail }). */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (typeof error !== "object" || error === null) return porDefecto;
  const data = (error as { data?: unknown }).data;
  if (data && typeof data === "object") {
    const partes: string[] = [];
    for (const valor of Object.values(data as Record<string, unknown>)) {
      if (typeof valor === "string") partes.push(valor);
      else if (Array.isArray(valor)) partes.push(...valor.filter((v): v is string => typeof v === "string"));
    }
    if (partes.length > 0) return partes.join(" ");
  }
  const mensaje = (error as { message?: unknown }).message;
  if (typeof mensaje === "string" && mensaje.includes("403")) {
    return "El periodo está cerrado; ya no se pueden registrar cambios.";
  }
  return typeof mensaje === "string" && mensaje ? mensaje : porDefecto;
}
