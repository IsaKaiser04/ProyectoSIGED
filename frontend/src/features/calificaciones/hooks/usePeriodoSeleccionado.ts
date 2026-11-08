import { useEffect, useMemo, useState } from "react";
import type { MatrizPeriodo } from "../../../types/entities";
import { estadoPeriodo, periodoPorDefecto, type EstadoPeriodo } from "../utils/calculos";

/** Periodo elegido en la matriz. Por defecto, el que contiene la fecha de hoy. */
export function usePeriodoSeleccionado(periodos: MatrizPeriodo[]) {
  const [periodoId, setPeriodoId] = useState<number | null>(null);

  useEffect(() => {
    // Se conserva la elección del docente mientras el periodo siga existiendo.
    if (periodoId != null && periodos.some((p) => p.id === periodoId)) return;
    setPeriodoId(periodoPorDefecto(periodos)?.id ?? null);
  }, [periodos, periodoId]);

  const periodo = useMemo(
    () => periodos.find((p) => p.id === periodoId) ?? null,
    [periodos, periodoId]
  );
  const estado: EstadoPeriodo | null = periodo ? estadoPeriodo(periodo) : null;

  return { periodoId, setPeriodoId, periodo, estado };
}
